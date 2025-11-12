import { videoQueue } from '../queue';
import prisma from '../prisma';
import { JobStatus } from '@prisma/client';

export async function retryFailedJob(jobId: string) {
  const job = await prisma.videoJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.status !== 'FAILED') {
    throw new Error('Job not found or not in failed state');
  }

  if (!videoQueue) {
    throw new Error('Redis not configured');
  }

  // Add job back to queue
  await videoQueue.add('generate-video', {
    jobId: job.id,
    productId: job.productId,
    projectId: job.projectId,
    settings: job.settings,
  });

  // Update job status
  await prisma.videoJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.PENDING,
      errorMessage: null,
      progress: 0,
    },
  });

  return job;
}

export async function cancelJob(jobId: string) {
  const job = await prisma.videoJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.status !== 'PENDING' && job.status !== 'PROCESSING') {
    throw new Error('Can only cancel pending or processing jobs');
  }

  // Update job status to failed
  await prisma.videoJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.FAILED,
      errorMessage: 'Cancelled by user',
      completedAt: new Date(),
    },
  });

  return job;
}
