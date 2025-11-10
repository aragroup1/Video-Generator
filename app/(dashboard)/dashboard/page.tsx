export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ProjectSelector from '@/components/dashboard/ProjectSelector';
import QuickActions from '@/components/dashboard/QuickActions';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';

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
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 lg:p-12 text-white shadow-2xl mb-8">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-400"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  AI Video Studio
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                Welcome back, {user.name || 'Creator'}!
              </h1>
              <p className="text-lg lg:text-xl text-purple-100 max-w-2xl leading-relaxed">
                Transform your products into stunning videos with AI-powered automation
              </p>
              
              {/* Quick Stats in Hero */}
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm text-purple-100">Active Jobs</span>
                  </div>
                  <div className="text-2xl font-bold">{stats[1]}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-300" />
                    <span className="text-sm text-purple-100">Success Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Project Selector */}
            <div className="lg:min-w-[300px]">
              <ProjectSelector projects={projects} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <StatsCards
          totalVideos={stats[0]}
          activeJobs={stats[1]}
          successRate={successRate}
          totalProjects={projects.length}
        />
      </div>

      {/* Main Content Grid - 2 Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Recent Activity - Takes 2 columns */}
        <div className="xl:col-span-2">
          <Suspense fallback={
            <div className="animate-pulse bg-white rounded-2xl h-96 shadow-xl"></div>
          }>
            <RecentActivity userId={user.id} />
          </Suspense>
        </div>
        
        {/* Quick Actions - Takes 1 column */}
        <div className="xl:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Performance Chart - Full Width */}
      <div className="mb-8">
        <Suspense fallback={
          <div className="animate-pulse bg-white rounded-2xl h-80 shadow-xl"></div>
        }>
          <PerformanceChart userId={user.id} />
        </Suspense>
      </div>

      {/* Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Use bulk generation to create videos for your best-selling products first. This maximizes ROI and gets your store video-ready faster!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">🚀 Quick Start</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sync your Shopify products first, then use the Bulk Generate feature to create multiple videos at once with different styles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
