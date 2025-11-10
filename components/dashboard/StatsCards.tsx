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
      iconBg: 'from-purple-500 to-purple-600',
      change: '+12.5%',
      changePositive: true,
    },
    {
      title: 'Active Jobs',
      value: activeJobs.toLocaleString(),
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'from-blue-500 to-blue-600',
      change: activeJobs > 0 ? 'Processing' : 'Idle',
      changePositive: activeJobs > 0,
    },
    {
      title: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'from-emerald-500 to-emerald-600',
      change: successRate > 95 ? 'Excellent' : successRate > 80 ? 'Good' : 'Fair',
      changePositive: successRate > 80,
    },
    {
      title: 'Projects',
      value: totalProjects.toLocaleString(),
      icon: Briefcase,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      iconBg: 'from-orange-500 to-orange-600',
      change: 'Active',
      changePositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title}
          className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-xl"
          style={{ 
            animationDelay: `${index * 100}ms`,
            animation: 'fadeInUp 0.5s ease-out forwards',
            opacity: 0,
          }}
        >
          {/* Gradient accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>
          
          {/* Hover gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
            <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
              {stat.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative pb-6">
            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                stat.changePositive 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {stat.change}
              </span>
              {stat.changePositive && (
                <TrendingUp className="w-3 h-3 text-emerald-600" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
