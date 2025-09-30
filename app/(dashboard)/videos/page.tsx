import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Clock, Eye } from 'lucide-react';
import { formatBytes, formatDuration } from '@/lib/utils';

export default async function VideosPage() {
  await requireAuth();

  const videos = await prisma.video.findMany({
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Videos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No videos generated yet</p>
            </CardContent>
          </Card>
        ) : (
          videos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="aspect-video bg-gray-100 relative">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm line-clamp-1">{video.product.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{video.project.name}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {video.views}
                  </div>
                  {video.fileSize && (
                    <span>{formatBytes(video.fileSize)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
