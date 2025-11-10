export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import VideoGallery from '@/components/videos/VideoGallery';

async function getDefaultProject(userId: string) {
  const project = await prisma.project.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return project;
}

export default async function VideoGalleryPage() {
  const user = await requireAuth();
  
  const defaultProject = await getDefaultProject(user.id);

  if (!defaultProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please create a project first.</p>
      </div>
    );
  }

  const videos = await prisma.video.findMany({
    where: {
      projectId: defaultProject.id,
    },
    include: {
      product: {
        select: {
          title: true,
          price: true,
          shopifyId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Gallery</h1>
          <p className="text-gray-600 mt-2">Browse and manage your AI-generated videos</p>
        </div>
      </div>

      <VideoGallery projectId={defaultProject.id} initialVideos={videos} />
    </div>
  );
}
