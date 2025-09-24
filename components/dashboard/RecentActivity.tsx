import { formatDistanceToNow } from 'date-fns';
import prisma from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'PROCESSING':
        return <Badge variant="warning">Processing</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentJobs.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {job.product.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {job.project.name} • {job.jobType.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(job.status)}
                  <span className="text-xs text-gray-500">
                    {job.provider}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
