'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
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

const VIDEO_STYLES = [
  { value: '360_rotation', label: '🔄 360° Rotation', description: 'Smooth product rotation' },
  { value: 'lifestyle_casual', label: '🏠 Lifestyle Casual', description: 'Everyday use scene' },
  { value: 'lifestyle_premium', label: '💎 Lifestyle Premium', description: 'Luxury setting' },
  { value: 'ad_testimonial', label: '💬 Testimonial', description: 'Customer reaction' },
  { value: 'ad_feature_focus', label: '🎯 Feature Focus', description: 'Highlight key features' },
  { value: 'ad_problem_solution', label: '💡 Problem/Solution', description: 'Before and after' },
  { value: 'how_to_use', label: '📖 How to Use', description: 'Step-by-step demo' },
  { value: 'influencer_showcase', label: '✨ Influencer Style', description: 'Social media ready' },
];

const BUDGET_LEVELS = [
  { value: 'economy', label: 'Economy', cost: '$0.01-0.05', description: 'Fast and affordable' },
  { value: 'standard', label: 'Standard', cost: '$0.05-0.15', description: 'Best quality/price' },
  { value: 'premium', label: 'Premium', cost: '$0.15-0.50', description: 'Highest quality' },
];

export default function VideoGenerationModal({
  isOpen,
  onClose,
  product,
  projectId,
}: VideoGenerationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    videoType: 'PRODUCT_DEMO',
    style: '360_rotation',
    budget: 'standard',
    duration: 5,
    aspectRatio: '9:16',
    customPrompt: '',
    autoSelect: true,
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
          provider: 'REPLICATE',
          settings: {
            style: formData.style,
            budget: formData.budget,
            prompt: formData.customPrompt || undefined,
            duration: formData.duration,
            aspectRatio: formData.aspectRatio,
            productTitle: product.title,
            productDescription: product.description || '',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create job');
      }

      toast.success('Video generation started! Check the Jobs page for progress.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start video generation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Generate AI Video
              </h2>
              <p className="text-gray-600 mt-1">Create a stunning video for your product</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Product Preview */}
          <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
            <div className="flex items-center gap-4">
              {product.images && product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{product.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI Model Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <label className="text-sm font-semibold text-gray-900">AI Model Selection</label>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="autoSelect"
                  checked={formData.autoSelect}
                  onChange={(e) => setFormData({ ...formData, autoSelect: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="autoSelect" className="text-sm text-gray-700 flex-1">
                  <span className="font-semibold">Auto-select best model</span>
                  <span className="block text-xs text-gray-600 mt-0.5">
                    Automatically choose the optimal AI model based on your video style and budget
                  </span>
                </label>
              </div>

              {!formData.autoSelect && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Manual model selection coming soon. Using auto-select for now.
                  </p>
                </div>
              )}
            </div>

            {/* Video Style */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Video Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {VIDEO_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, style: style.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.style === style.value
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{style.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Level */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Quality & Budget
              </label>
              <div className="grid grid-cols-3 gap-3">
                {BUDGET_LEVELS.map((budget) => (
                  <button
                    key={budget.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, budget: budget.value })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.budget === budget.value
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="font-semibold text-sm">{budget.label}</div>
                    <div className="text-xs text-purple-600 font-medium mt-1">{budget.cost}</div>
                    <div className="text-xs text-gray-600 mt-1">{budget.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <Select
                  value={formData.duration.toString()}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                >
                  <option value="3">3 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                <Select
                  value={formData.aspectRatio}
                  onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                >
                  <option value="9:16">9:16 (TikTok/Reels)</option>
                  <option value="16:9">16:9 (YouTube)</option>
                  <option value="1:1">1:1 (Instagram)</option>
                </Select>
              </div>
            </div>

            {/* Custom Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom Prompt (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                rows={3}
                placeholder="Add specific instructions for the AI (optional)..."
                value={formData.customPrompt}
                onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use AI-generated prompt based on your style selection
              </p>
            </div>

            {/* Cost Estimate */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">Estimated Cost</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Based on {formData.budget} quality • {formData.duration}s duration
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  ${formData.budget === 'economy' ? '0.03' : formData.budget === 'standard' ? '0.10' : '0.35'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[150px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} />
                    Generate Video
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
