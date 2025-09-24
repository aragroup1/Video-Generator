import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import ProductList from '@/components/products/ProductList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default async function ProductsPage() {
  const user = await requireAuth();
  const cookieStore = cookies();
  const currentProjectId = cookieStore.get('current-project')?.value;

  if (!currentProjectId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select or create a project first.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/dashboard/projects'}>
          Go to Projects
        </Button>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      projectId: currentProjectId,
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
        <ProductList products={products} projectId={currentProjectId} />
      </Suspense>
    </div>
  );
}
