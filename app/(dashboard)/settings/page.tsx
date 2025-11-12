export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import SettingsForm from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const user = await requireAuth();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your API keys and integrations</p>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <SettingsForm key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
