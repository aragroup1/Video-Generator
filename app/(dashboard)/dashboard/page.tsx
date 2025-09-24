import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ProjectSelector from '@/components/dashboard/ProjectSelector';

export default async function DashboardPage() {
  const user = await requireAuth();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: {
          products: true,
          videos: true,
          videoJobs: true,
        },
      },
    },
  });

  const stats = await prisma.$transaction([
    prisma.video.count({
      where: {
        project: {
          userId: user.id,
        },
      },
    }),
    prisma.videoJob.count({
      where: {
        project: {
          userId: user.id,
        },
        status: 'PROCESSING',
      },
    }),
    prisma.videoJob.count({
      where: {
        project: {
          userId: user.id,
        },
        status: 'COMPLETED',
      },
    }),
    prisma.videoJob.count({
      where: {
        project: {
          userId: user.id,
        },
      },
    }),
  ]);

  const successRate = stats[3] > 0 ? (stats[2] / stats[3]) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <ProjectSelector projects={projects} />
      </div>

      <StatsCards
        totalVideos={stats[0]}
        activeJobs={stats[1]}
        successRate={successRate}
        totalProjects={projects.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<div>Loading...</div>}>
          <RecentActivity userId={user.id} />
        </Suspense>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/dashboard/products"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium">Sync Products</div>
              <div className="text-sm text-gray-600">Import products from Shopify</div>
            </a>
            <a
              href="/dashboard/videos"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium">Generate Videos</div>
              <div className="text-sm text-gray-600">Create AI videos for products</div>
            </a>
            <a
              href="/dashboard/settings"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium">Configure APIs</div>
              <div className="text-sm text-gray-600">Set up AI provider keys</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
