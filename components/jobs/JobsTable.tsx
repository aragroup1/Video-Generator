'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, RotateCcw, Play, Pause, Trash2, 
  CheckCircle, Clock, Loader2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Job {
  id: string;
  status: string;
  progress: number;
  jobType: string;
  provider: string;
  errorMessage: string | null;
  createdAt: Date;
  product: {
    title: string;
    images: any;
  };
  project: {
    name: string;
  };
}

interface JobsTableProps {
  initialJobs: Job[];
}

export default function JobsTable({ initialJobs }: JobsTableProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [systemPaused, setSystemPaused] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
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

  const handleCancelJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    
    setActionLoading(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to cancel job');

      toast.success('Job cancelled');
      router.refresh();
    } catch (error) {
      toast.error('Failed to cancel job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/retry`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to retry job');

      toast.success('Job requeued');
      router.refresh();
    } catch (error) {
      toast.error('Failed to retry job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    setActionLoading(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete job');

      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success('Job deleted');
    } catch (error) {
      toast.error('Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleSystem = async () => {
    try {
      const response = await fetch('/api/jobs/system/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused: !systemPaused }),
      });

      if (!response.ok) throw new Error('Failed to toggle system');

      setSystemPaused(!systemPaused);
      toast.success(systemPaused ? 'System resumed' : 'System paused');
    } catch (error) {
      toast.error('Failed to toggle system');
    }
  };

  const handleClearCompleted = async () => {
    if (!confirm('Delete all completed jobs?')) return;
    
    try {
      const response = await fetch('/api/jobs/clear-completed', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to clear jobs');

      toast.success('Completed jobs cleared');
      router.refresh();
    } catch (error) {
      toast.error('Failed to clear jobs');
    }
  };

  return (
    <div className="space-y-4">
      {/* System Controls */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleToggleSystem}
                className={systemPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}
              >
                {systemPaused ? (
                  <>
                    <Play size={16} className="mr-2" />
                    Resume System
                  </>
                ) : (
                  <>
                    <Pause size={16} className="mr-2" />
                    Pause System
                  </>
                )}
              </Button>
              
              {systemPaused && (
                <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  System Paused
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleClearCompleted}
            >
              <Trash2 size={16} className="mr-2" />
              Clear Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => {
            const images = job.product.images as string[];
            const hasImage = images && images.length > 0;

            return (
              <Card key={job.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {hasImage ? (
                        <img
                          src={images[0]}
                          alt={job.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-gray-400" />
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
                        <span>{job.project.name}</span>
                        <span>•</span>
                        <span className="capitalize">{job.jobType.replace('_', ' ').toLowerCase()}</span>
                        <span>•</span>
                        <span>{job.provider}</span>
                        <span>•</span>
                        <span>{new Date(job.createdAt).toLocaleString()}</span>
                      </div>
                      {job.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{job.errorMessage}</p>
                      )}
                    </div>

                    {/* Status & Progress */}
                    <div className="flex-shrink-0 text-center min-w-[120px]">
                      {getStatusBadge(job.status)}
                      {job.status === 'PROCESSING' && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">{job.progress}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {(job.status === 'PENDING' || job.status === 'PROCESSING') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelJob(job.id)}
                          disabled={actionLoading === job.id}
                        >
                          <X size={16} />
                        </Button>
                      )}
                      
                      {job.status === 'FAILED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryJob(job.id)}
                          disabled={actionLoading === job.id}
                        >
                          <RotateCcw size={16} />
                        </Button>
                      )}

                      {(job.status === 'COMPLETED' || job.status === 'FAILED') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={actionLoading === job.id}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
