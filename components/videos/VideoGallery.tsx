'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Download, Play, Trash2 } from 'lucide-react';

interface Video {
  id: string;
  videoType: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  product: {
    title: string;
    images: any;
  };
  job: {
    provider: string;
  } | null;
}

interface VideoGalleryProps {
  videos: Video[];
  projectId: string;
}

export default function VideoGallery({ videos, projectId }: VideoGalleryProps) {
  const [filters, setFilters] = useState({
    videoType: 'all',
    publishStatus: 'all',
    sortBy: 'newest',
  });

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const filteredVideos = videos.filter((video) => {
    if (filters.videoType !== 'all' && video.videoType !== filters.videoType) {
      return false;
    }
    if (filters.publishStatus === 'published' && !video.isPublished) {
      return false;
    }
    if (filters.publishStatus === 'draft' && video.isPublished) {
      return false;
    }
    return true;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (filters.sortBy === 'views') {
      return b.views - a.views;
    }
    return 0;
  });

  const handleDownload = async (videoId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/download`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { downloadUrl, filename } = await response.json();

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download video');
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete video');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="text-sm font-medium mb-2 block">Video Type</label>
              <Select
                value={filters.videoType}
                onValueChange={(value) => setFilters({ ...filters, videoType: value })}
              >
                <option value="all">All Types</option>
                <option value="PRODUCT_DEMO">Product Demo</option>
                <option value="LIFESTYLE">Lifestyle</option>
                <option value="TESTIMONIAL">Testimonial</option>
                <option value="ROTATION_360">360° Rotation</option>
                <option value="INFLUENCER_SHOWCASE">Influencer</option>
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.publishStatus}
                onValueChange={(value) => setFilters({ ...filters, publishStatus: value })}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedVideos.map((video) => {
          const productImages = video.product.images as string[];
          const thumbnail = video.thumbnailUrl || (productImages && productImages[0]);

          return (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-100">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={video.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {video.isPublished && (
                    <Badge className="bg-green-500">Published</Badge>
                  )}
                  {video.job && (
                    <Badge variant="outline">{video.job.provider}</Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2">{video.product.title}</h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Badge variant="secondary">{video.videoType}</Badge>
                  <span>•</span>
                  <span>{video.views} views</span>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Created {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(video.fileUrl, '_blank')}
                    className="flex-1"
                  >
                    <Play size={16} className="mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(video.id)}
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(video.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedVideos.length === 0 && (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-600">
            {videos.length === 0 
              ? 'Generate your first video to get started!'
              : 'Try adjusting your filters'}
          </p>
        </div>
      )}
    </div>
  );
}
