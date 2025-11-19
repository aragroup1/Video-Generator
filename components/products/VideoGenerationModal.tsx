'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description: string | null;
  images: any;
}

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  projectId: string;
}

const videoStyles = [
  { value: '360_rotation', label: '360° Rotation', needsAudio: false },
  { value: 'lifestyle_casual', label: 'Lifestyle Casual', needsAudio: false },
  { value: 'lifestyle_premium', label: 'Lifestyle Premium', needsAudio: false },
  { value: 'ad_testimonial', label: 'Testimonial', needsAudio: true },
  { value: 'ad_feature_focus', label: 'Feature Focus', needsAudio: true },
  { value: 'ad_problem_solution', label: 'Problem-Solution', needsAudio: true },
  { value: 'how_to_use', label: 'How-To Guide', needsAudio: true },
  { value: 'influencer_showcase', label: 'Influencer Style', needsAudio: true },
];

const aiModels = [
  { 
    value: 'kling-1.5', 
    label: 'Kling AI', 
    description: 'Fast, affordable, high quality',
    price: '$0.25',
    badge: 'Recommended',
  },
  { 
    value: 'veo-3.1', 
    label: 'Google Veo 3.1', 
    description: 'Premium quality from Google',
    price: '$2.50',
  },
  { 
    value: 'sora-2', 
    label: 'OpenAI Sora 2', 
    description: 'Highest quality, cinematic',
    price: '$6.00',
    badge: 'Premium',
  },
];

export default function VideoGenerationModal({
  isOpen,
  onClose,
  product,
  projectId,
}: VideoGenerationModalProps) {
  const [style, setStyle] = useState('influencer_showcase');
  const [model, setModel] = useState('kling-1.5');
  const [generateAudio, setGenerateAudio] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedStyle = videoStyles.find(s => s.value === style);
  const selectedModel = aiModels.find(m => m.value === model);
  
  const audioCost = (generateAudio && selectedStyle?.needsAudio) ? 0.05 : 0;
  const totalCost = (parseFloat(selectedModel?.price.replace('$', '') || '0') + audioCost).toFixed(2);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          productId: product.id,
          videoType: 'PRODUCT_DEMO',
          provider: 'REPLICATE',
          settings: {
            style,
            model,
            generateAudio: selectedStyle?.needsAudio ? generateAudio : false,
            productTitle: product.title,
            productDescription: product.description,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job');
      }

      toast.success('Video generation started! Check the Jobs page for progress.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start video generation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate AI Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {product.images && (product.images as string[])[0] && (
                <img
                  src={(product.images as string[])[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{product.title}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {product.description.replace(/<[^>]*>/g, '')}
                </p>
              )}
            </div>
          </div>

          {/* Video Style */}
          <div className="space-y-2">
            <Label>Video Style</Label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {videoStyles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} {s.needsAudio ? '🎤' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              {selectedStyle?.needsAudio && '🎤 This style includes AI voiceover'}
            </p>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <Label>AI Model</Label>
            <div className="grid grid-cols-1 gap-3">
              {aiModels.map((m) => (
                <div
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    model === m.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{m.label}</span>
                        {m.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            m.badge === 'Recommended' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{m.description}</div>
                    </div>
                    <div className="text-xl font-bold text-purple-600 ml-4">
                      {m.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Option */}
          {selectedStyle?.needsAudio && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="generateAudio"
                  checked={generateAudio}
                  onChange={(e) => setGenerateAudio(e.target.checked)}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="generateAudio" className="font-semibold text-blue-900 cursor-pointer">
                    Generate AI Voiceover (+$0.05)
                  </label>
                  <p className="text-sm text-blue-700 mt-1">
                    Natural-sounding voiceover with ElevenLabs AI. Voice automatically selected based on your product.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cost Summary */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-purple-900">Total Cost</div>
                <div className="text-sm text-purple-700">
                  {selectedModel?.label}
                  {selectedStyle?.needsAudio && generateAudio && ' + AI Voiceover'}
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-900">
                ${totalCost}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </span>
              ) : (
                'Generate Video'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
