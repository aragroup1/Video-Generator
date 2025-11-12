'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  description: string | null;
  shopifyUrl: string | null;
  shopifyToken: string | null;
  replicateKey: string | null;
  runwayKey: string | null;
  lumaKey: string | null;
  pikaKey: string | null;
}

interface SettingsFormProps {
  project: Project;
}

export default function SettingsForm({ project }: SettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showKeys, setShowKeys] = useState({
    shopifyToken: false,
    replicateKey: false,
    runwayKey: false,
    lumaKey: false,
    pikaKey: false,
  });

  const [formData, setFormData] = useState({
    shopifyUrl: project.shopifyUrl || '',
    shopifyToken: project.shopifyToken || '',
    replicateKey: project.replicateKey || '',
    runwayKey: project.runwayKey || '',
    lumaKey: project.lumaKey || '',
    pikaKey: project.pikaKey || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleShowKey = (key: keyof typeof showKeys) => {
    setShowKeys({ ...showKeys, [key]: !showKeys[key] });
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl">{project.name}</CardTitle>
        {project.description && (
          <CardDescription>{project.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Shopify Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Shopify Integration</h3>
              <p className="text-sm text-gray-500">Connect your Shopify store to import products</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Shopify Store URL</label>
              <Input
                type="text"
                placeholder="your-store.myshopify.com"
                value={formData.shopifyUrl}
                onChange={(e) => setFormData({ ...formData, shopifyUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Shopify Access Token</label>
              <div className="relative">
                <Input
                  type={showKeys.shopifyToken ? 'text' : 'password'}
                  placeholder="shpat_..."
                  value={formData.shopifyToken}
                  onChange={(e) => setFormData({ ...formData, shopifyToken: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('shopifyToken')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.shopifyToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Providers Section */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Video Providers</h3>
              <p className="text-sm text-gray-500">Configure API keys for video generation services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Replicate */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Replicate API Key
                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                  Recommended
                </span>
              </label>
              <div className="relative">
                <Input
                  type={showKeys.replicateKey ? 'text' : 'password'}
                  placeholder="r8_..."
                  value={formData.replicateKey}
                  onChange={(e) => setFormData({ ...formData, replicateKey: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('replicateKey')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.replicateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">~$0.01-0.50 per video • Best quality/price ratio</p>
            </div>

            {/* Luma */}
            <div>
              <label className="block text-sm font-medium mb-2">Luma API Key</label>
              <div className="relative">
                <Input
                  type={showKeys.lumaKey ? 'text' : 'password'}
                  placeholder="luma_..."
                  value={formData.lumaKey}
                  onChange={(e) => setFormData({ ...formData, lumaKey: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('lumaKey')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.lumaKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Premium quality • Higher cost</p>
            </div>

            {/* Runway */}
            <div>
              <label className="block text-sm font-medium mb-2">Runway API Key</label>
              <div className="relative">
                <Input
                  type={showKeys.runwayKey ? 'text' : 'password'}
                  placeholder="rw_..."
                  value={formData.runwayKey}
                  onChange={(e) => setFormData({ ...formData, runwayKey: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('runwayKey')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.runwayKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Professional grade • Gen-3 Alpha</p>
            </div>

            {/* Pika */}
            <div>
              <label className="block text-sm font-medium mb-2">Pika API Key</label>
              <div className="relative">
                <Input
                  type={showKeys.pikaKey ? 'text' : 'password'}
                  placeholder="pika_..."
                  value={formData.pikaKey}
                  onChange={(e) => setFormData({ ...formData, pikaKey: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('pikaKey')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys.pikaKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Fast generation • Good for testing</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="min-w-[150px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={16} />
                Save Settings
              </span>
            )}
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-6 border-t border-gray-100">
          <div className={`flex items-center gap-2 text-sm ${formData.shopifyUrl && formData.shopifyToken ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle size={16} />
            <span>Shopify</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${formData.replicateKey ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle size={16} />
            <span>Replicate</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${formData.lumaKey ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle size={16} />
            <span>Luma</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${formData.runwayKey ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle size={16} />
            <span>Runway</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${formData.pikaKey ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle size={16} />
            <span>Pika</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
