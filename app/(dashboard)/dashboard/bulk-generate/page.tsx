export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import BulkVideoGenerator from '@/components/bulk-generate/BulkVideoGenerator';

async function getDefaultProject(userId: string) {
  const project = await prisma.project.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return project;
}

async function getProducts(projectId: string) {
  const products = await prisma.product.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return products;
}

export default async function BulkGeneratePage() {
  const user = await requireAuth();
  const defaultProject = await getDefaultProject(user.id);

  if (!defaultProject) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">No Project Found</h2>
        <p className="text-gray-600 mt-2">Please create a project first.</p>
      </div>
    );
  }

  const products = await getProducts(defaultProject.id);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">No Products Found</h2>
        <p className="text-gray-600 mt-2">Please sync products from Shopify first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Video Generation</h1>
        <p className="text-gray-600 mt-2">
          Generate videos for multiple products at once
        </p>
      </div>

      <BulkVideoGenerator 
        products={products} 
        projectId={defaultProject.id} 
      />
    </div>
  );
}
