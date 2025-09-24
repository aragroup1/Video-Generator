import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Clock, TrendingUp, Briefcase } from 'lucide-react';

interface StatsCardsProps {
  totalVideos: number;
  activeJobs: number;
  successRate: number;
  totalProjects: number;
}

export default function StatsCards({
  totalVideos,
  activeJobs,
  successRate,
  totalProjects,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Videos',
      value: totalVideos.toLocaleString(),
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Jobs',
      value: activeJobs.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Projects',
      value: totalProjects.toLocaleString(),
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
