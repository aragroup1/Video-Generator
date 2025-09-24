import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createVideoGenerationJob } from '@/lib/queue/jobs';
import { VideoType, AIProvider, JobStatus } from '@prisma/client';

const createJobSchema = z.object({
  projectId: z.string(),
  productId: z.string(),
  videoType: z.nativeEnum(VideoType),
  provider: z.nativeEnum(AIProvider),
  settings: z.object({
    prompt: z.string().optional(),
    duration: z.number().optional(),
    aspectRatio: z.string().optional(),
    quality: z.string().optional(),
    style: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = createJobSchema.parse(body);

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get product with images
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
        projectId: data.projectId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const images = product.images as string[];
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'Product has no images' },
        { status: 400 }
      );
    }

    // Create job record
    const videoJob = await prisma.videoJob.create({
      data: {
        projectId: data.projectId,
        productId: data.productId,
        jobType: data.videoType,
        provider: data.provider,
        status: JobStatus.PENDING,
        settings: data.settings,
        prompt: data.settings.prompt,
      },
    });

    // Queue the job
    await createVideoGenerationJob({
      jobId: videoJob.id,
      projectId: data.projectId,
      productId: data.productId,
      provider: data.provider,
      videoType: data.videoType,
      settings: data.settings,
      images,
    });

    return NextResponse.json(videoJob);
  } catch (error: any) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 400 }
    );
  }
}
