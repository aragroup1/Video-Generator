'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  shopifyUrl: string | null;
  shopifyToken: string | null;
  replicateKey: string | null;
  lumaKey: string | null;
  runwayKey: string | null;
  pikaKey: string | null;
}

interface SettingsFormProps {
  project: Project;
}

export default function SettingsForm({ project }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    shopifyUrl: project.shopifyUrl || '',
    shopifyToken: project.shopifyToken || '',
    replicateKey: project.replicateKey || '',
    lumaKey: project.lumaKey || '',
    runwayKey: project.runwayKey || '',
    pikaKey: project.pikaKey || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('💾 Saving settings...', formData);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      console.log('✅ Settings saved successfully');
      toast.success('Settings saved successfully!');
      router.refresh();
    } catch (error: any) {
      console.error('❌ Save error:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Project"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shopify Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shopifyUrl">Store URL</Label>
            <Input
              id="shopifyUrl"
              value={formData.shopifyUrl}
              onChange={(e) => setFormData({ ...formData, shopifyUrl: e.target.value })}
              placeholder="mystore.myshopify.com"
            />
          </div>
          <div>
            <Label htmlFor="shopifyToken">Admin API Token</Label>
            <Input
              id="shopifyToken"
              type="password"
              value={formData.shopifyToken}
              onChange={(e) => setFormData({ ...formData, shopifyToken: e.target.value })}
              placeholder="shpat_..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Provider API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="replicateKey">Replicate API Key</Label>
            <Input
              id="replicateKey"
              type="password"
              value={formData.replicateKey}
              onChange={(e) => setFormData({ ...formData, replicateKey: e.target.value })}
              placeholder="r8_..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from replicate.com
            </p>
          </div>

          <div>
            <Label htmlFor="lumaKey">Luma AI API Key (Optional)</Label>
            <Input
              id="lumaKey"
              type="password"
              value={formData.lumaKey}
              onChange={(e) => setFormData({ ...formData, lumaKey: e.target.value })}
              placeholder="luma_..."
            />
          </div>

          <div>
            <Label htmlFor="runwayKey">Runway API Key (Optional)</Label>
            <Input
              id="runwayKey"
              type="password"
              value={formData.runwayKey}
              onChange={(e) => setFormData({ ...formData, runwayKey: e.target.value })}
              placeholder="runway_..."
            />
          </div>

          <div>
            <Label htmlFor="pikaKey">Pika Labs API Key (Optional)</Label>
            <Input
              id="pikaKey"
              type="password"
              value={formData.pikaKey}
              onChange={(e) => setFormData({ ...formData, pikaKey: e.target.value })}
              placeholder="pika_..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[150px]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </form>
  );
}
