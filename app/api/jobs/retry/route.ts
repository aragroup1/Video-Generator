import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { retryJob } from '@/lib/queue/jobs';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Verify job ownership
    const job = await prisma.videoJob.findFirst({
      where: {
        id: id,
        project: {
          userId: user.id,
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'Only failed jobs can be retried' },
        { status: 400 }
      );
    }

    // Retry the job
    await retryJob('video-generation', id);

    // Update job status
    await prisma.videoJob.update({
      where: { id: id },
      data: {
        status: 'PENDING',
        errorMessage: null,
        progress: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retry job' },
      { status: 400 }
    );
  }
}
