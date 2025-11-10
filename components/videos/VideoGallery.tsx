'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Video, Download, Play, Search,
  Calendar, Eye, Share2, X
} from 'lucide-react';
import { formatBytes, formatDuration, formatDistanceToNow } from '@/lib/utils';
import toast from 'react-hot-toast';

interface VideoData {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;  // CHANGED from string | undefined
  duration: number | null;       // CHANGED from number | undefined
  fileSize: bigint | null;       // CHANGED from bigint | undefined
  videoType: string;
  createdAt: Date;
  views: number;
  isPublished: boolean;
  product: {
    title: string;
    price: any;  // Can be Decimal or number
    shopifyId: string;
  };
  metadata?: any;  // CHANGED to any since it's Json type
}

interface VideoGalleryProps {
  projectId: string;
  initialVideos?: any[];  // Accept any[] from server and transform
}

export default function VideoGallery({ projectId, initialVideos = [] }: VideoGalleryProps) {
  // Transform the videos to ensure proper types
  const [videos, setVideos] = useState<VideoData[]>(
    initialVideos.map(v => ({
      ...v,
      createdAt: new Date(v.createdAt),
      metadata: v.metadata || {},
    }))
  );
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    videoType: 'all',
    status: 'all',
    sortBy: 'newest'
  });
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (filters.search || filters.videoType !== 'all' || filters.status !== 'all' || filters.sortBy !== 'newest') {
      loadVideos();
    }
  }, [filters]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        projectId,
        search: filters.search,
        videoType: filters.videoType,
        status: filters.status,
        sortBy: filters.sortBy,
      });

      const response = await fetch(`/api/videos?${params}`);
      const data = await response.json();
      setVideos(data.videos.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt),
        metadata: v.metadata || {},
      })));
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (video: VideoData) => {
    try {
      setDownloadingIds(new Set([...downloadingIds, video.id]));
      
      const response = await fetch(`/api/videos/${video.id}/download`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to get download URL');
      
      const { downloadUrl, filename } = await response.json();
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `${video.product.title.replace(/\s+/g, '_')}_${video.videoType}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download video');
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(video.id);
        return next;
      });
    }
  };

  const copyShareLink = async (video: VideoData) => {
    const shareUrl = `${window.location.origin}/share/${video.id}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const getVideoTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'ROTATION_360': 'bg-purple-100 text-purple-700',
      'LIFESTYLE': 'bg-blue-100 text-blue-700',
      'TESTIMONIAL': 'bg-green-100 text-green-700',
      'PRODUCT_DEMO': 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by product name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select
            value={filters.videoType}
            onChange={(e) => setFilters({ ...filters, videoType: e.target.value })}
            className="w-[180px]"
          >
            <option value="all">All Types</option>
            <option value="ROTATION_360">360° Rotation</option>
            <option value="LIFESTYLE">Lifestyle</option>
            <option value="TESTIMONIAL">Testimonial</option>
            <option value="PRODUCT_DEMO">Product Demo</option>
          </Select>

          <Select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-[150px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_viewed">Most Viewed</option>
          </Select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500">No videos found</p>
          </div>
        ) : (
          videos.map((video) => (
            <Card 
              key={video.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Video Preview */}
              <div className="aspect-[9/16] relative bg-gray-900">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={video.fileUrl}
                    className="w-full h-full object-cover"
                    muted
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                )}
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium">
                        {formatDuration(video.duration || 0)}
                      </span>
                      <span className="text-sm">
                        {formatBytes(video.fileSize || BigInt(0))}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        onClick={() => setPreviewVideo(video.fileUrl)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        onClick={() => handleDownload(video)}
                        disabled={downloadingIds.has(video.id)}
                      >
                        {downloadingIds.has(video.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        onClick={() => copyShareLink(video)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="absolute top-2 left-2 right-2 flex justify-between">
                  <Badge className={getVideoTypeColor(video.videoType)}>
                    {video.videoType.replace(/_/g, ' ')}
                  </Badge>
                  {video.isPublished && (
                    <Badge className="bg-green-100 text-green-700">
                      Published
                    </Badge>
                  )}
                </div>
              </div>

              {/* Video Info */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">
                    {video.product.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    SKU: {video.product.shopifyId}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{video.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDistanceToNow(video.createdAt)}</span>
                  </div>
                </div>

                {video.metadata && video.metadata.model && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Model: {video.metadata.model}</span>
                      {video.metadata.cost && (
                        <span className="font-semibold text-purple-600">
                          ${Number(video.metadata.cost).toFixed(3)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <video
              src={previewVideo}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
