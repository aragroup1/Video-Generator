import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { TrendingUp, Activity } from 'lucide-react';

interface PerformanceChartProps {
  userId: string;
}

export default async function PerformanceChart({ userId }: PerformanceChartProps) {
  // Get video generation stats for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentVideos = await prisma.video.findMany({
    where: {
      project: {
        userId,
      },
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      createdAt: true,
    },
  });

  // Group by day
  const dailyStats = recentVideos.reduce((acc, video) => {
    const date = video.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const days = Object.keys(dailyStats).sort();
  const maxVideos = Math.max(...Object.values(dailyStats), 1);

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Video Generation Activity
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Last 7 Days</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {days.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No videos generated in the last 7 days</p>
            <p className="text-sm text-gray-400 mt-1">Start generating to see your activity!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48">
              {days.map((day) => {
                const count = dailyStats[day];
                const height = (count / maxVideos) * 100;
                const date = new Date(day);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex-1 flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-blue-600 group cursor-pointer shadow-lg"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {count} video{count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{dayName}</div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {recentVideos.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {(recentVideos.length / 7).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Avg per Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {Math.max(...Object.values(dailyStats))}
                </div>
                <div className="text-xs text-gray-500 mt-1">Peak Day</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
