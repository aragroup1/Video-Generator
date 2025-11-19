'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  { value: '360_rotation', label: '360° Rotation' },
  { value: 'lifestyle_casual', label: 'Lifestyle Casual' },
  { value: 'lifestyle_premium', label: 'Lifestyle Premium' },
  { value: 'ad_testimonial', label: 'Testimonial' },
  { value: 'ad_feature_focus', label: 'Feature Focus' },
  { value: 'ad_problem_solution', label: 'Problem-Solution' },
  { value: 'how_to_use', label: 'How-To Guide' },
  { value: 'influencer_showcase', label: 'Influencer Style' },
];

const budgetLevels = [
  { value: 'economy', label: 'Economy', veoPrice: '$1.00', soraPrice: '$3.00' },
  { value: 'standard', label: 'Standard', veoPrice: '$2.50', soraPrice: '$6.00' },
  { value: 'premium', label: 'Premium', veoPrice: '$5.00', soraPrice: '$12.00' },
];

const aiModels = [
  { value: 'veo-3.1', label: 'Google Veo 3.1', description: 'Fast, affordable, high quality' },
  { value: 'sora-2', label: 'OpenAI Sora 2', description: 'Premium quality, cinematic' },
];

export default function VideoGenerationModal({
  isOpen,
  onClose,
  product,
  projectId,
}: VideoGenerationModalProps) {
  const [style, setStyle] = useState('lifestyle_casual');
  const [budget, setBudget] = useState('standard');
  const [model, setModel] = useState('veo-3.1');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedBudget = budgetLevels.find(b => b.value === budget);
  const selectedModel = aiModels.find(m => m.value === model);
  const estimatedCost = model === 'veo-3.1' 
    ? selectedBudget?.veoPrice 
    : selectedBudget?.soraPrice;

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
            budget,
            model,
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
      <DialogContent className="max-w-2xl">
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
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {videoStyles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <Label>AI Model</Label>
            <div className="grid grid-cols-2 gap-3">
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
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{m.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Level */}
          <div className="space-y-2">
            <Label>Quality Level</Label>
            <div className="grid grid-cols-3 gap-3">
              {budgetLevels.map((b) => (
                <div
                  key={b.value}
                  onClick={() => setBudget(b.value)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    budget === b.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{b.label}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {model === 'veo-3.1' ? b.veoPrice : b.soraPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-blue-900">Estimated Cost</div>
                <div className="text-sm text-blue-700">
                  {selectedModel?.label} • {selectedBudget?.label}
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {estimatedCost}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isGenerating ? 'Generating...' : 'Generate Video'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
