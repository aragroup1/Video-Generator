import { Worker, Job } from 'bullmq';
import prisma from './lib/prisma';
import redis, { getRedisConnection } from './lib/redis';
import { ReplicateProvider } from './lib/ai-providers/replicate';
import { ElevenLabsProvider } from './lib/audio/elevenlabs';
import { ScriptGenerator } from './lib/audio/script-generator';
import { VideoProcessor } from './lib/video/ffmpeg';
import { uploadVideoToS3 } from './lib/storage/s3';
import { JobStatus, VideoType } from '@prisma/client';
import axios from 'axios';

interface VideoJobData {
  jobId: string;
  productId: string;
  projectId: string;
  settings: {
    style: string;
    model?: string;
    generateAudio?: boolean;
    productTitle: string;
    productDescription: string;
  };
}

// Styles that need audio
const AUDIO_REQUIRED_STYLES = [
  'ad_testimonial',
  'influencer_showcase',
  'ad_feature_focus',
  'ad_problem_solution',
  'how_to_use',
];

async function processVideoGeneration(job: Job<VideoJobData>) {
  const { jobId, productId, projectId, settings } = job.data;

  console.log(`🔄 Processing job ${job.id}: generate-video`);
  console.log('📦 Job data:', { jobId, productId, projectId, model: settings.model });

  try {
    const videoJob = await prisma.videoJob.findUnique({
      where: { id: jobId },
      include: {
        product: true,
        project: true,
      },
    });

    if (!videoJob) {
      throw new Error('Job not found');
    }

    await prisma.videoJob.update({
      where: { id: jobId },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
      },
    });

    const images = videoJob.product.images as string[];
    if (!images || images.length === 0) {
      throw new Error('Product has no images');
    }

    const apiKey = videoJob.project.replicateKey;
    if (!apiKey) {
      throw new Error('Replicate API key not configured');
    }

    // Generate video
    const provider = new ReplicateProvider({ apiKey });
    console.log('🎬 Starting video generation...');
    
    const result = await provider.generateVideo({
      imageUrl: images[0],
      style: settings.style as any,
      budget: 'standard' as any,
      productTitle: settings.productTitle,
      productDescription: settings.productDescription || '',
      preferredModel: settings.model as any,
    });

    console.log('✅ Video generated:', result.videoUrl);

    // Download video
    console.log('📥 Downloading video...');
    const videoResponse = await axios.get(result.videoUrl, {
      responseType: 'arraybuffer',
      timeout: 300000,
    });
    let videoBuffer = Buffer.from(videoResponse.data);
    console.log(`📦 Video downloaded: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    let totalCost = result.estimatedCost;
    let finalVideoBuffer = videoBuffer;

    // Generate audio if needed
    const needsAudio = AUDIO_REQUIRED_STYLES.includes(settings.style) && 
                       (settings.generateAudio !== false);

    if (needsAudio) {
      console.log('🎤 Generating audio...');
      
      const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenlabsKey) {
        console.warn('⚠️ ElevenLabs API key not configured, skipping audio');
      } else {
        try {
          // Analyze product for voice selection
          const voiceSelection = ScriptGenerator.analyzeProductForVoice({
            title: settings.productTitle,
            description: settings.productDescription || '',
          });
          
          console.log(`🎭 Voice selection: ${voiceSelection.gender} ${voiceSelection.age} - ${voiceSelection.reason}`);
          
          // Get video duration
          const videoDuration = await VideoProcessor.getVideoDuration(videoBuffer);
          console.log(`⏱️ Video duration: ${videoDuration}s`);
          
          // Generate script
          const script = ScriptGenerator.generateScript({
            style: settings.style,
            duration: videoDuration,
            productInfo: {
              title: settings.productTitle,
              description: settings.productDescription || '',
            },
          });
          
          console.log('📝 Generated script:', script);
          
          if (script) {
            // Generate voiceover
            const elevenLabs = new ElevenLabsProvider(elevenlabsKey);
            const voiceId = ElevenLabsProvider.getVoiceId(
              voiceSelection.gender,
              voiceSelection.age
            );
            
            const audioBuffer = await elevenLabs.generateVoice({
              text: script,
              voiceId,
            });
            
            console.log(`🎵 Audio generated: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
            
            // Merge video and audio
            const outputPath = `/tmp/final-${jobId}.mp4`;
            await VideoProcessor.mergeVideoAudio({
              videoBuffer,
              audioBuffer,
              outputPath,
            });
            
            finalVideoBuffer = await require('fs/promises').readFile(outputPath);
            await require('fs/promises').unlink(outputPath);
            
            totalCost += 0.05; // Add ElevenLabs cost
            console.log('✅ Audio merged with video');
          }
        } catch (audioError: any) {
          console.error('❌ Audio generation failed:', audioError.message);
          console.log('📹 Continuing with video-only');
        }
      }
    }

    // Upload to S3
    console.log('☁️ Uploading to AWS S3...');
    const s3Url = await uploadVideoToS3({
      buffer: finalVideoBuffer,
      productId,
      projectId,
      jobId,
      contentType: 'video/mp4',
    });

    console.log('✅ Video uploaded to S3:', s3Url);

    // Create video record
    const video = await prisma.video.create({
      data: {
        projectId,
        productId,
        jobId,
        videoType: VideoType.PRODUCT_DEMO,
        fileUrl: s3Url,
        fileSize: BigInt(finalVideoBuffer.length),
        metadata: {
          ...settings,
          originalUrl: result.videoUrl,
          model: settings.model || 'kling-1.5',
          hasAudio: needsAudio,
          uploadedToS3: true,
        } as any,
      },
    });

    // Update job
    await prisma.videoJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        resultUrl: s3Url,
        costCredits: Math.round(totalCost * 100),
      },
    });

    console.log(`✅ Job ${jobId} completed successfully`);
    return { success: true, videoId: video.id, s3Url };
    
  } catch (error: any) {
    console.error(`❌ Job ${jobId} failed:`, error.message);

    try {
      await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });
    } catch (updateError) {
      console.error('Failed to update job status:', updateError);
    }

    throw error;
  }
}

async function startWorker() {
  if (!redis) {
    console.error('❌ Redis is not available. Worker cannot start.');
    process.exit(1);
  }

  const connection = getRedisConnection();
  if (!connection) {
    console.error('❌ Redis connection details not available. Worker cannot start.');
    process.exit(1);
  }

  const worker = new Worker(
    'video-generation',
    async (job: Job<VideoJobData>) => {
      return await processVideoGeneration(job);
    },
    {
      connection,
      concurrency: 2,
      limiter: {
        max: 10,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('❌ Worker error:', err);
  });

  console.log('🚀 Worker started and listening for jobs...');

  process.on('SIGTERM', async () => {
    console.log('⏹️ Shutting down worker...');
    await worker.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('⏹️ Shutting down worker...');
    await worker.close();
    process.exit(0);
  });
}

startWorker().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});
