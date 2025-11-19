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

async function getVideos(projectId: string) {
  const videos = await prisma.video.findMany({
    where: { projectId },
    include: {
      product: {
        select: {
          title: true,
          images: true,
        },
      },
      job: {
        select: {
          provider: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return videos;
}

export default async function VideoGalleryPage() {
  const user = await requireAuth();
  const defaultProject = await getDefaultProject(user.id);

  if (!defaultProject) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">No Project Found</h2>
        <p className="text-gray-600 mt-2">Please create a project first.</p>
      </div>
    );
  }

  const videos = await getVideos(defaultProject.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Video Gallery</h1>
        <p className="text-gray-600 mt-2">View and manage your generated videos</p>
      </div>

      <VideoGallery projectId={defaultProject.id} videos={videos} />
    </div>
  );
}
