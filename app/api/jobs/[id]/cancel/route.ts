import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    if (job.status !== 'PENDING' && job.status !== 'PROCESSING') {
      return NextResponse.json(
        { error: 'Only pending or processing jobs can be cancelled' },
        { status: 400 }
      );
    }

    await prisma.videoJob.update({
      where: { id },
      data: {
        status: 'FAILED',
        errorMessage: 'Cancelled by user',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
