'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { VideoStyle, BudgetLevel } from '@/lib/ai-providers/types';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description: string | null;
  images: any;
}

interface BulkVideoGeneratorProps {
  products: Product[];
  projectId: string;
}

interface GenerationJob {
  id: string;
  productId: string;
  productTitle: string;
  style: VideoStyle;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
}

export default function BulkVideoGenerator({ products, projectId }: BulkVideoGeneratorProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedStyles, setSelectedStyles] = useState<VideoStyle[]>([]);
  const [budget, setBudget] = useState<BudgetLevel>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  // Video styles options
  const videoStyles: { value: VideoStyle; label: string; description: string }[] = [
    { value: '360_rotation', label: '360° Rotation', description: 'Smooth product rotation' },
    { value: 'lifestyle_casual', label: 'Lifestyle Casual', description: 'Everyday usage scenes' },
    { value: 'lifestyle_premium', label: 'Lifestyle Premium', description: 'Luxury lifestyle shots' },
    { value: 'ad_testimonial', label: 'Testimonial', description: 'Customer reviews style' },
    { value: 'ad_feature_focus', label: 'Feature Focus', description: 'Highlight key features' },
    { value: 'ad_problem_solution', label: 'Problem-Solution', description: 'Before/after format' },
    { value: 'how_to_use', label: 'How-To', description: 'Tutorial demonstration' },
    { value: 'influencer_showcase', label: 'Influencer', description: 'Social media POV' },
  ];

  // Budget options
  const budgetOptions: { value: BudgetLevel; label: string; cost: string }[] = [
    { value: 'economy', label: 'Economy', cost: '$1.00-3.00' },
    { value: 'standard', label: 'Standard', cost: '$2.50-6.00' },
    { value: 'premium', label: 'Premium', cost: '$5.00-12.00' },
  ];

  // Calculate total estimated cost
  useEffect(() => {
    const cost = selectedProducts.size * selectedStyles.length * getCostForBudget(budget);
    setTotalCost(cost);
  }, [selectedProducts, selectedStyles, budget]);

  const getCostForBudget = (budgetLevel: BudgetLevel): number => {
    const costs: Record<BudgetLevel, number> = {
      economy: 1.50,
      standard: 4.00,
      premium: 8.00,
    };
    return costs[budgetLevel];
  };

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleStyleToggle = (style: VideoStyle) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleGenerate = async () => {
    if (selectedProducts.size === 0 || selectedStyles.length === 0) {
      toast.error('Please select at least one product and one video style');
      return;
    }

    setIsGenerating(true);
    const newJobs: GenerationJob[] = [];

    try {
      for (const productId of Array.from(selectedProducts)) {
        for (const style of selectedStyles) {
          const product = products.find(p => p.id === productId);
          if (!product) continue;

          const job: GenerationJob = {
            id: `${productId}-${style}`,
            productId,
            productTitle: product.title,
            style,
            status: 'pending',
          };

          newJobs.push(job);
          setJobs(prev => [...prev, job]);

          // Create the job via API
          const response = await fetch('/api/jobs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              productId,
              videoType: 'AI_GENERATED',
              provider: 'REPLICATE',
              settings: {
                style,
                budget,
                productTitle: product.title,
                productDescription: product.description,
              },
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create job');
          }

          // Update job status
          setJobs(prev =>
            prev.map(j =>
              j.id === job.id ? { ...j, status: 'queued' } : j
            )
          );
        }
      }

      toast.success(`Successfully queued ${newJobs.length} video generation jobs!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create jobs');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Products ({selectedProducts.size} selected)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleProductToggle(product.id)}
              >
                <Checkbox
                  checked={selectedProducts.has(product.id)}
                  onCheckedChange={() => handleProductToggle(product.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Style Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Video Styles ({selectedStyles.length} selected)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videoStyles.map(style => (
              <div
                key={style.value}
                className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleStyleToggle(style.value)}
              >
                <Checkbox
                  checked={selectedStyles.includes(style.value)}
                  onCheckedChange={() => handleStyleToggle(style.value)}
                />
                <div className="flex-1">
                  <p className="font-medium">{style.label}</p>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Budget Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {budgetOptions.map(option => (
              <div
                key={option.value}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  budget === option.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setBudget(option.value)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  <Badge variant={budget === option.value ? 'default' : 'outline'}>
                    {option.cost}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary & Generate */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-2xl font-bold">{selectedProducts.size}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Styles</p>
              <p className="text-2xl font-bold">{selectedStyles.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold">
                {selectedProducts.size * selectedStyles.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Cost</p>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedProducts.size === 0 || selectedStyles.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generating...' : 'Generate Videos'}
          </Button>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{job.productTitle}</p>
                    <p className="text-sm text-gray-600">{job.style}</p>
                  </div>
                  <Badge
                    variant={
                      job.status === 'completed'
                        ? 'default'
                        : job.status === 'failed'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
