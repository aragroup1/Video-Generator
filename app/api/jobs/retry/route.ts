import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { addVideoJob } from '@/lib/queue';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const job = await prisma.videoJob.findFirst({
      where: {
        id,
        project: { userId: user.id },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'Only failed jobs can be retried' },
        { status: 400 }
      );
    }

    // Update job status
    await prisma.videoJob.update({
      where: { id },
      data: {
        status: 'PENDING',
        errorMessage: null,
        progress: 0,
      },
    });

    // Try to re-queue
    try {
      await addVideoJob({
        jobId: job.id,
        productId: job.productId,
        projectId: job.projectId,
        settings: job.settings,
      });
    } catch (queueError: any) {
      console.warn('Failed to add to queue:', queueError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
