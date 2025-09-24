'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  images: any;
}

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  projectId: string;
}

export default function VideoGenerationModal({
  isOpen,
  onClose,
  product,
  projectId,
}: VideoGenerationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    videoType: 'PRODUCT_DEMO',
    provider: 'LUMA',
    prompt: '',
    duration: 5,
    aspectRatio: '16:9',
    quality: 'medium',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          productId: product.id,
          videoType: formData.videoType,
          provider: formData.provider,
          settings: {
            prompt: formData.prompt || `Create a stunning video showcasing ${product.title}`,
            duration: formData.duration,
            aspectRatio: formData.aspectRatio,
            quality: formData.quality,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      toast.success('Video generation started!');
      onClose();
    } catch (error) {
      toast.error('Failed to start video generation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Generate Video</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">{product.title}</h3>
            {product.images && product.images[0] && (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-48 object-cover rounded-lg mt-2"
              />
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Video Type
              </label>
              <Select
                value={formData.videoType}
                onChange={(e) =>
                  setFormData({ ...formData, videoType: e.target.value })
                }
              >
                <option value="PRODUCT_DEMO">Product Demo</option>
                <option value="LIFESTYLE">Lifestyle</option>
                <option value="TESTIMONIAL">Testimonial</option>
                <option value="ROTATION_360">360° Rotation</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                AI Provider
              </label>
              <Select
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
              >
                <option value="LUMA">Luma Dream Machine</option>
                <option value="RUNWAY">Runway ML</option>
                <option value="PIKA">Pika Labs</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Prompt (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe how you want the video to look..."
                value={formData.prompt}
                onChange={(e) =>
                  setFormData({ ...formData, prompt: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (seconds)
                </label>
                <Input
                  type="number"
                  min="3"
                  max="10"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Aspect Ratio
                </label>
                <Select
                  value={formData.aspectRatio}
                  onChange={(e) =>
                    setFormData({ ...formData, aspectRatio: e.target.value })
                  }
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quality
              </label>
              <Select
                value={formData.quality}
                onChange={(e) =>
                  setFormData({ ...formData, quality: e.target.value })
                }
              >
                <option value="low">Low (Fast)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Best)</option>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Starting...' : 'Generate Video'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
