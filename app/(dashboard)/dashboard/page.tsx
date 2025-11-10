export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentActivity from '@/components/dashboard/RecentActivity';
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
    prisma.video.count({ where: { project: { userId: user.id } } }),
    prisma.videoJob.count({ where: { project: { userId: user.id }, status: 'PROCESSING' } }),
    prisma.videoJob.count({ where: { project: { userId: user.id }, status: 'COMPLETED' } }),
    prisma.videoJob.count({ where: { project: { userId: user.id } } }),
  ]);

  const successRate = stats[3] > 0 ? (stats[2] / stats[3]) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 lg:p-12 text-white shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating Orbs */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-400 opacity-20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 opacity-20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider bg-white bg-opacity-20 px-3 py-1 rounded-full backdrop-blur-sm">
              AI Video Studio
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Welcome back, {user.name || 'Creator'}!
          </h1>
          <p className="text-lg lg:text-xl text-purple-100 max-w-2xl leading-relaxed">
            Transform your products into stunning videos with AI-powered automation
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white border-opacity-20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-sm text-purple-100">Active Jobs</span>
              </div>
              <div className="text-2xl font-bold">{stats[1]}</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white border-opacity-20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-sm text-purple-100">Success Rate</span>
              </div>
              <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalVideos={stats[0]}
        activeJobs={stats[1]}
        successRate={successRate}
        totalProjects={projects.length}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Suspense fallback={
            <div className="h-96 bg-white rounded-2xl shadow-xl animate-pulse" />
          }>
            <RecentActivity userId={user.id} />
          </Suspense>
        </div>
        
        <div className="xl:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Performance Chart */}
      <Suspense fallback={
        <div className="h-80 bg-white rounded-2xl shadow-xl animate-pulse" />
      }>
        <PerformanceChart userId={user.id} />
      </Suspense>

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
                Use bulk generation to create videos for your best-selling products first. This maximizes ROI!
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
                Sync your Shopify products first, then use Bulk Generate to create multiple videos at once!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
