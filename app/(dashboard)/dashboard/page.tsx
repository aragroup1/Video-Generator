export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ProjectSelector from '@/components/dashboard/ProjectSelector';
import QuickActions from '@/components/dashboard/QuickActions';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import { Sparkles } from 'lucide-react';

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
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">AI Video Studio</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name || 'Creator'}!</h1>
              <p className="text-lg text-purple-100 max-w-2xl">
                Transform your products into stunning videos with AI-powered automation
              </p>
            </div>
            <ProjectSelector projects={projects} />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <StatsCards
        totalVideos={stats[0]}
        activeJobs={stats[1]}
        successRate={successRate}
        totalProjects={projects.length}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="animate-pulse bg-white/50 rounded-2xl h-96"></div>}>
            <RecentActivity userId={user.id} />
          </Suspense>
        </div>
        
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Performance Chart */}
      <Suspense fallback={<div className="animate-pulse bg-white/50 rounded-2xl h-80"></div>}>
        <PerformanceChart userId={user.id} />
      </Suspense>
    </div>
  );
}
