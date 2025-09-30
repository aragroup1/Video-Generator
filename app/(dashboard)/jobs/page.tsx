import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function JobsPage() {
  await requireAuth();

  const jobs = await prisma.videoJob.findMany({
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
    take: 50,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'PROCESSING':
        return <Badge variant="warning">Processing</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Job Queue</h1>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{job.product.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.project.name} • {job.jobType.replace('_', ' ')} • {job.provider}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(job.status)}
                    {job.progress > 0 && job.progress < 100 && (
                      <span className="text-sm text-gray-500">{job.progress}%</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              {job.errorMessage && (
                <CardContent>
                  <p className="text-sm text-red-600">{job.errorMessage}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
