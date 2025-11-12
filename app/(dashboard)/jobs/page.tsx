export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import JobsTable from '@/components/jobs/JobsTable';
import JobsStats from '@/components/jobs/JobsStats';

export default async function JobsPage() {
  const user = await requireAuth();

  const jobs = await prisma.videoJob.findMany({
    where: {
      project: {
        userId: user.id,
      },
    },
    include: {
      product: {
        select: {
          title: true,
          images: true,
        },
      },
      project: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  // Calculate stats
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'PENDING').length,
    processing: jobs.filter(j => j.status === 'PROCESSING').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
    failed: jobs.filter(j => j.status === 'FAILED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Queue</h1>
          <p className="text-gray-600 mt-2">Manage your video generation jobs</p>
        </div>
      </div>

      <JobsStats stats={stats} />
      <JobsTable initialJobs={jobs} />
    </div>
  );
}
