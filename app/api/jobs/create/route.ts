import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { addVideoJob } from '@/lib/queue';
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
    budget: z.string().optional(),
    productTitle: z.string().optional(),
    productDescription: z.string().optional(),
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

    // Add to Redis queue with correct structure
    try {
      await addVideoJob({
        jobId: videoJob.id,  // This is the database job ID
        productId: data.productId,
        projectId: data.projectId,
        settings: data.settings,
      });

      console.log('✅ Job queued:', videoJob.id);
    } catch (queueError: any) {
      console.warn('⚠️ Failed to queue job:', queueError.message);
      // Job is still created in DB, just not queued
    }

    return NextResponse.json({
      success: true,
      jobId: videoJob.id,
      message: 'Job created successfully.',
    });
  } catch (error: any) {
    console.error('❌ Create job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 400 }
    );
  }
}
