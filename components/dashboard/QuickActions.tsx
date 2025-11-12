'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, Package, Video, Settings, Sparkles, 
  ArrowRight, TrendingUp 
} from 'lucide-react';

const actions = [
  {
    title: 'Bulk Generate',
    description: 'Generate videos for multiple products at once',
    icon: Zap,
    href: '/dashboard/bulk-generate',
    gradient: 'from-purple-500 to-blue-500',
    badge: 'Popular',
  },
  {
    title: 'Sync Products',
    description: 'Import products from Shopify',
    icon: Package,
    href: '/products',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Video Gallery',
    description: 'View and manage all your videos',
    icon: Video,
    href: '/videos',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    title: 'Configure APIs',
    description: 'Set up AI provider keys',
    icon: Settings,
    href: '/settings',
    gradient: 'from-orange-500 to-red-500',
  },
];

export default function QuickActions() {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Quick Actions
          </CardTitle>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group block relative overflow-hidden rounded-xl border-2 border-gray-100 bg-white p-4 transition-all duration-300 hover:border-purple-200 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {action.title}
                    </h3>
                    {action.badge && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {action.description}
                  </p>
                </div>

                <ArrowRight className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Pro tip */}
        <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-1">Pro Tip</h4>
              <p className="text-xs text-gray-600">
                Use bulk generation to create videos for your best-selling products first!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
