'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Package } from 'lucide-react';
import VideoGenerationModal from './VideoGenerationModal';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  description: string | null;
  images: any;
  price: any;
  currency: string;
  _count: {
    videos: number;
    videoJobs: number;
  };
}

interface ProductListProps {
  products: Product[];
  projectId: string;
}

export default function ProductList({ products, projectId }: ProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleGenerateVideo = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          const images = product.images as string[];
          const hasImage = images && images.length > 0;

          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="aspect-square relative bg-gray-100">
                {hasImage ? (
                  <Image
                    src={images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
                {product._count.videos > 0 && (
                  <Badge className="absolute top-2 right-2" variant="success">
                    {product._count.videos} videos
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {formatCurrency(product.price || 0, product.currency)}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Video size={16} className="mr-1" />
                    {product._count.videos} videos
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateVideo(product)}
                    disabled={!hasImage}
                  >
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedProduct && (
        <VideoGenerationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={selectedProduct}
          projectId={projectId}
        />
      )}
    </>
  );
}
