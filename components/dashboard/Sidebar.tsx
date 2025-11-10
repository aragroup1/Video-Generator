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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Bulk Generate', href: '/dashboard/bulk-generate', icon: Zap }, // Add this
  { name: 'Videos', href: '/dashboard/videos', icon: Video },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Clock },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-luxury backdrop-blur-xl border border-slate-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200/60 transition-all duration-300 shadow-luxury',
          collapsed ? 'w-20' : 'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200/60">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="gradient-brand p-2 rounded-xl">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Studio
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="gradient-brand p-2 rounded-xl mx-auto">
              <Video className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  collapsed ? 'justify-center' : 'gap-3',
                  isActive
                    ? 'gradient-brand text-white shadow-lg shadow-purple-500/30'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon
                  className={cn(
                    'flex-shrink-0',
                    isActive ? 'text-white' : 'text-slate-500'
                  )}
                  size={20}
                />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/60">
          {!collapsed && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900">Upgrade</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Get unlimited AI video generations
              </p>
              <button className="w-full text-xs py-2 px-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Go Premium
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
