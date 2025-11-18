import Replicate from 'replicate';
import { AIProvider, VideoGenerationRequest, VideoGenerationResponse, VideoStyle, BudgetLevel } from './types';

export class ReplicateProvider implements AIProvider {
  private client: Replicate;
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
    this.client = new Replicate({
      auth: config.apiKey,
    });
  }

  private selectModel(style: VideoStyle, budget: BudgetLevel): string {
    // Using Stable Video Diffusion for all styles
    // You can expand this to use different models based on style
    const models: Record<string, Record<BudgetLevel, string>> = {
      '360_rotation': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
      'lifestyle_casual': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
      'lifestyle_premium': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
      'ad_testimonial': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
      'ad_feature_focus': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
      'ad_problem_solution': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
      'how_to_use': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
      'influencer_showcase': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
      'default': {
        economy: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        standard: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        premium: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
      },
    };

    const styleModels = models[style] || models.default;
    return styleModels[budget];
  }

  async generateVideo(request: VideoGenerationRequest & {
    style: VideoStyle;
    budget: BudgetLevel;
    productTitle: string;
    productDescription: string;
  }): Promise<VideoGenerationResponse> {
    try {
      const model = this.selectModel(request.style, request.budget);

      console.log('🎬 Starting Replicate video generation...');
      console.log('📦 Model:', model);
      console.log('🖼️ Image URL:', request.imageUrl);
      console.log('🎨 Style:', request.style);
      console.log('💰 Budget:', request.budget);

      const output = await this.client.run(model as any, {
        input: {
          input_image: request.imageUrl,
          cond_aug: 0.02,
          decoding_t: 14,
          video_length: "14_frames_with_svd",
          sizing_strategy: "maintain_aspect_ratio",
          motion_bucket_id: 127,
          frames_per_second: 6,
        },
      });

      console.log('✅ Video generated successfully');
      console.log('📹 Output:', output);

      const videoUrl = Array.isArray(output) ? output[0] : output;

      return {
        videoUrl: videoUrl as string,
        estimatedCost: this.calculateCost(request.budget),
      };
    } catch (error: any) {
      console.error('❌ Replicate generation failed:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  private calculateCost(budget: BudgetLevel): number {
    const costs: Record<BudgetLevel, number> = {
      economy: 0.03,
      standard: 0.10,
      premium: 0.35,
    };
    return costs[budget];
  }
}
