export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ProductList from '@/components/products/ProductList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

async function getDefaultProject(userId: string) {
  const project = await prisma.project.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return project;
}

export default async function ProductsPage() {
  const user = await requireAuth();
  
  const defaultProject = await getDefaultProject(user.id);

  if (!defaultProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please create a project first.</p>
        <Button 
          className="mt-4"
        >
          Create Project
        </Button>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      projectId: defaultProject.id,
    },
    include: {
      _count: {
        select: {
          videos: true,
          videoJobs: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Button>
          <RefreshCw size={16} className="mr-2" />
          Sync from Shopify
        </Button>
      </div>

      <Suspense fallback={<div>Loading products...</div>}>
        <ProductList products={products} projectId={defaultProject.id} />
      </Suspense>
    </div>
  );
}
