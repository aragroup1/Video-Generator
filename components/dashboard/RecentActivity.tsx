import { formatDistanceToNow } from 'date-fns';
import prisma from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface RecentActivityProps {
  userId: string;
}

export default async function RecentActivity({ userId }: RecentActivityProps) {
  const recentJobs = await prisma.videoJob.findMany({
    where: {
      project: {
        userId,
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
    take: 10,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'PROCESSING':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Recent Activity
          </CardTitle>
          <span className="text-sm text-gray-500">{recentJobs.length} jobs</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {recentJobs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Start generating videos to see activity here</p>
            </div>
          ) : (
            recentJobs.map((job) => {
              const images = job.product.images as string[];
              const hasImage = images && images.length > 0;

              return (
                <div
                  key={job.id}
                  className="group relative flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                    {hasImage ? (
                      <img
                        src={images[0]}
                        alt={job.product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                      </div>
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(job.status)}
                      <h3 className="font-semibold text-gray-900 truncate">
                        {job.product.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="truncate">{job.project.name}</span>
                      <span>•</span>
                      <span className="capitalize">{job.jobType.replace('_', ' ').toLowerCase()}</span>
                      <span>•</span>
                      <span>{job.provider}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(job.status)}
                  </div>

                  {/* Progress bar for processing */}
                  {job.status === 'PROCESSING' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-xl overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
