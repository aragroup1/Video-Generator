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

export default async function BulkGeneratePage() {
  const user = await requireAuth();
  
  const defaultProject = await getDefaultProject(user.id);

  if (!defaultProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please create a project first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Video Generation</h1>
          <p className="text-gray-600 mt-2">Generate videos for multiple products at once</p>
        </div>
      </div>

      <BulkVideoGenerator projectId={defaultProject.id} />
    </div>
  );
}
