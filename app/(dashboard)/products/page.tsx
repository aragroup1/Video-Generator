export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ProductList from '@/components/products/ProductList';
import SyncButton from '@/components/products/SyncButton';
import ProductSearch from '@/components/products/ProductSearch';
import Pagination from '@/components/products/Pagination';

async function getDefaultProject(userId: string) {
  const project = await prisma.project.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return project;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const pageSize = 20;

  const defaultProject = await getDefaultProject(user.id);

  if (!defaultProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please create a project first.</p>
      </div>
    );
  }

  // Build where clause for search
  const where: any = {
    projectId: defaultProject.id,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } },
    ];
  }

  // Get total count and products
  const [totalProducts, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
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
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">
            {totalProducts} products • Page {page} of {totalPages}
          </p>
        </div>
        <SyncButton projectId={defaultProject.id} />
      </div>

      {/* Search */}
      <ProductSearch />

      {/* Product List */}
      <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">
              {search ? `No products found matching "${search}"` : 'No products yet'}
            </p>
            {!search && <SyncButton projectId={defaultProject.id} />}
          </div>
        ) : (
          <ProductList products={products} projectId={defaultProject.id} />
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
