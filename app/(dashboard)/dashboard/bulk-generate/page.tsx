'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Package, Video, DollarSign, Zap, Flag, TrendingUp,
  CheckCircle, AlertCircle, Clock, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { VideoStyle, BudgetLevel } from '@/lib/ai-providers/replicate';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  isFlagged: boolean;
  priority: number;
  salesCount: number;
  viewCount: number;
  _count: {
    videos: number;
  };
}

interface GenerationJob {
  productId: string;
  productTitle: string;
  style: VideoStyle;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  cost?: number;
  error?: string;
}

export default function BulkVideoGenerator({ projectId }: { projectId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedStyles, setSelectedStyles] = useState<VideoStyle[]>([]);
  const [budget, setBudget] = useState<BudgetLevel>(BudgetLevel.STANDARD);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  // Load prioritized products
  useEffect(() => {
    loadProducts();
  }, [projectId]);

  const loadProducts = async () => {
    const response = await fetch(`/api/products?projectId=${projectId}&prioritized=true`);
    const data = await response.json();
    setProducts(data);
  };

  const handleProductSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    updateCostEstimate(newSelected, selectedStyles);
  };

  const handleStyleToggle = (style: VideoStyle) => {
    const newStyles = selectedStyles.includes(style)
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style];
    setSelectedStyles(newStyles);
    updateCostEstimate(selectedProducts, newStyles);
  };

  const updateCostEstimate = async (products: Set<string>, styles: VideoStyle[]) => {
    if (products.size === 0 || styles.length === 0) {
      setTotalCost(0);
      return;
    }

    const response = await fetch('/api/videos/estimate-cost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productCount: products.size,
        styles,
        budget,
      }),
    });

    const { estimatedCost } = await response.json();
    setTotalCost(estimatedCost);
  };

  const startBulkGeneration = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select at least one product');
      return;
    }

    if (selectedStyles.length === 0) {
      toast.error('Please select at least one video style');
      return;
    }

    setIsGenerating(true);
    const newJobs: GenerationJob[] = [];

    // Create jobs for each product-style combination
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId)!;
      selectedStyles.forEach(style => {
        newJobs.push({
          productId,
          productTitle: product.title,
          style,
          status: 'pending',
          progress: 0,
        });
      });
    });

    setJobs(newJobs);

    // Process jobs in batches
    const batchSize = 3;
    for (let i = 0; i < newJobs.length; i += batchSize) {
      const batch = newJobs.slice(i, i + batchSize);
      await Promise.all(batch.map(job => processJob(job)));
    }

    setIsGenerating(false);
    toast.success('Bulk generation completed!');
  };

  const processJob = async (job: GenerationJob) => {
    try {
      // Update job status
      updateJobStatus(job.productId, job.style, 'processing', 10);

      const product = products.find(p => p.id === job.productId)!;
      
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          productId: job.productId,
          videoType: job.style,
          provider: 'REPLICATE',
          settings: {
            style: job.style,
            budget,
            productTitle: product.title,
            productDescription: product.description,
            duration: 5,
            aspectRatio: '9:16', // Mobile optimized
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create job');

      const data = await response.json();
      
      // Poll for completion
      await pollJobStatus(data.id, job);
      
      updateJobStatus(job.productId, job.style, 'completed', 100, data.cost);
    } catch (error: any) {
      updateJobStatus(job.productId, job.style, 'failed', 0, 0, error.message);
    }
  };

  const updateJobStatus = (
    productId: string,
    style: VideoStyle,
    status: GenerationJob['status'],
    progress: number,
    cost?: number,
    error?: string
  ) => {
    setJobs(prev => prev.map(job => {
      if (job.productId === productId && job.style === style) {
        return { ...job, status, progress, cost, error };
      }
      return job;
    }));
  };

  const pollJobStatus = async (jobId: string, job: GenerationJob) => {
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      
      updateJobStatus(job.productId, job.style, 'processing', data.progress || 50);
      
      if (data.status === 'COMPLETED') {
        return data;
      } else if (data.status === 'FAILED') {
        throw new Error(data.errorMessage || 'Job failed');
      }
      
      attempts++;
    }
    
    throw new Error('Job timeout');
  };

  const getStyleIcon = (style: VideoStyle) => {
    const icons: Record<VideoStyle, any> = {
      [VideoStyle.ROTATION_360]: '🔄',
      [VideoStyle.LIFESTYLE_CASUAL]: '🏠',
      [VideoStyle.LIFESTYLE_PREMIUM]: '💎',
      [VideoStyle.AD_TESTIMONIAL]: '💬',
      [VideoStyle.AD_FEATURE_FOCUS]: '🎯',
      [VideoStyle.AD_PROBLEM_SOLUTION]: '💡',
      [VideoStyle.HOW_TO_USE]: '📖',
    };
    return icons[style];
  };

  const totalVideos = selectedProducts.size * selectedStyles.length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bulk Video Generation</h2>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <DollarSign className="w-4 h-4 mr-1" />
            Est. Cost: ${totalCost.toFixed(2)}
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Video className="w-4 h-4 mr-1" />
            {totalVideos} Videos
          </Badge>
        </div>
      </div>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Products</CardTitle>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const flagged = products.filter(p => p.isFlagged).map(p => p.id);
                setSelectedProducts(new Set(flagged));
              }}
            >
              <Flag className="w-4 h-4 mr-1" />
              Select Flagged
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const bestSellers = products
                  .sort((a, b) => b.salesCount - a.salesCount)
                  .slice(0, 10)
                  .map(p => p.id);
                setSelectedProducts(new Set(bestSellers));
              }}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Top 10 Sellers
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const highTraffic = products
                  .sort((a, b) => b.viewCount - a.viewCount)
                  .slice(0, 10)
                  .map(p => p.id);
                setSelectedProducts(new Set(highTraffic));
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              High Traffic
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {products.map(product => (
              <div
                key={product.id}
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  selectedProducts.has(product.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleProductSelect(product.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm line-clamp-2">{product.title}</h4>
                  {product.isFlagged && <Flag className="w-4 h-4 text-orange-500" />}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{product.salesCount} sales</span>
                  <span>{product.viewCount} views</span>
                  <Badge variant="secondary">{product._count.videos} videos</Badge>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(product.priority, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Style Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Video Styles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(VideoStyle).map(style => (
              <button
                key={style}
                onClick={() => handleStyleToggle(style)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedStyles.includes(style)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{getStyleIcon(style)}</div>
                <div className="text-sm font-medium">
                  {style.replace(/_/g, ' ').toLowerCase()}
                </div>
              </button>
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
          <div className="grid grid-cols-3 gap-4">
            {Object.values(BudgetLevel).map(level => (
              <button
                key={level}
                onClick={() => setBudget(level)}
                className={`p-4 rounded-lg border-2 transition ${
                  budget === level
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium mb-1 capitalize">{level}</div>
                <div className="text-xs text-gray-500">
                  {level === BudgetLevel.ECONOMY && '$0.01-0.05/video'}
                  {level === BudgetLevel.STANDARD && '$0.05-0.15/video'}
                  {level === BudgetLevel.PREMIUM && '$0.15-0.50/video'}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Progress</CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="success">
                <CheckCircle className="w-4 h-4 mr-1" />
                {completedJobs} Completed
              </Badge>
              {failedJobs > 0 && (
                <Badge variant="destructive">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {failedJobs} Failed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={(completedJobs / jobs.length) * 100} className="mb-4" />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {jobs.map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{job.productTitle}</div>
                    <div className="text-xs text-gray-500">{job.style.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'processing' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    )}
                    {job.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {job.status === 'failed' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    {job.cost && (
                      <span className="text-xs font-medium">${job.cost.toFixed(3)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedProducts(new Set());
            setSelectedStyles([]);
            setJobs([]);
          }}
          disabled={isGenerating}
        >
          Clear Selection
        </Button>
        <Button
          onClick={startBulkGeneration}
          disabled={isGenerating || selectedProducts.size === 0 || selectedStyles.length === 0}
          className="gradient-brand"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate {totalVideos} Videos
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
