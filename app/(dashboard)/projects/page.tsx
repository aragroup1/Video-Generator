export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Video, Clock } from 'lucide-react';

export default async function ProjectsPage() {
  await requireAuth();

  const projects = await prisma.project.findMany({
    include: {
      _count: {
        select: {
          products: true,
          videos: true,
          videoJobs: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <Button>
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              {project.description && (
                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{project._count.products} products</span>
                </div>
                <div className="flex items-center">
                  <Video className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{project._count.videos} videos</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{project._count.videoJobs} jobs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
