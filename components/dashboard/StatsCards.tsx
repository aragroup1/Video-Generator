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
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Active Jobs',
      value: activeJobs.toLocaleString(),
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Projects',
      value: totalProjects.toLocaleString(),
      icon: Briefcase,
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title}
          className="relative overflow-hidden border-0 shadow-luxury hover-lift bg-white"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Gradient background accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className={`w-full h-1.5 bg-gradient-to-r ${stat.bgGradient} rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500`}
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
