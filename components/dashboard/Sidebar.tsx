'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  Menu,
  X,
  Sparkles,
  Zap,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Bulk Generate', href: '/dashboard/bulk-generate', icon: Zap },
  { name: 'Videos', href: '/dashboard/videos', icon: Video },
  { name: 'Video Gallery', href: '/dashboard/videos/gallery', icon: LayoutGrid },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Clock },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200/60 transition-all duration-300 shadow-xl',
          collapsed ? 'w-20' : 'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between h-20 px-6 border-b border-gray-200/60 bg-gradient-to-br from-purple-50 to-blue-50",
          collapsed && "px-4"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="gradient-brand p-2.5 rounded-xl shadow-lg">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gradient-purple-blue">
                  AI Studio
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Premium
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="gradient-brand p-2.5 rounded-xl mx-auto shadow-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto scrollbar-thin">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                  collapsed ? 'justify-center' : 'gap-3',
                  isActive
                    ? 'gradient-brand text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon
                  className={cn(
                    'flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'
                  )}
                  size={20}
                />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Upgrade Card */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200/60">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-bold">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-purple-100 mb-4 leading-relaxed">
                  Unlock unlimited video generations and premium features
                </p>
                <button className="w-full text-sm py-2.5 px-4 bg-white text-purple-600 rounded-xl hover:shadow-xl transition-all duration-200 font-semibold">
                  Go Premium →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
