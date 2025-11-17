export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import SettingsForm from '@/components/settings/SettingsForm';

async function getDefaultProject(userId: string) {
  const project = await prisma.project.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return project;
}

export default async function SettingsPage() {
  const user = await requireAuth();
  const project = await getDefaultProject(user.id);

  if (!project) {
    // Create default project if none exists
    const newProject = await prisma.project.create({
      data: {
        userId: user.id,
        name: 'Default Project',
      },
    });

    return <SettingsForm project={newProject} />;
  }

  return <SettingsForm project={project} />;
}
