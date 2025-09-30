import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SettingsPage() {
  await requireAuth();

  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              {project.description && (
                <p className="text-sm text-gray-500">{project.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Shopify Store URL</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="mystore.myshopify.com"
                    defaultValue={project.shopifyUrl || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shopify Access Token</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="shpat_..."
                    defaultValue={project.shopifyToken || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Luma API Key</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="luma_..."
                    defaultValue={project.lumaKey || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Runway API Key</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="rw_..."
                    defaultValue={project.runwayKey || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pika API Key</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="pika_..."
                    defaultValue={project.pikaKey || ''}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
