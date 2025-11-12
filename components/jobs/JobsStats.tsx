import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, AlertCircle, Loader2, BarChart3 } from 'lucide-react';

interface JobsStatsProps {
  stats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export default function JobsStats({ stats }: JobsStatsProps) {
  const statCards = [
    {
      label: 'Total Jobs',
      value: stats.total,
      icon: BarChart3,
      color: 'from-purple-500 to-blue-500',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'from-gray-500 to-gray-600',
    },
    {
      label: 'Processing',
      value: stats.processing,
      icon: Loader2,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: AlertCircle,
      color: 'from-red-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
