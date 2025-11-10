'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Package, Video, Settings, ChevronLeft, ChevronRight,
  Briefcase, Clock, Menu, X, Sparkles, Zap, LayoutGrid
} from 'lucide-react';

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
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 ${
          collapsed ? 'px-4 justify-center' : ''
        }`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} className="text-gray-600" /> : <ChevronLeft size={18} className="text-gray-600" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700'
                }`}
              >
                <item.icon
                  size={20}
                  className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'}
                />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Card */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-5 text-white shadow-xl">
              {/* Decorative Blobs */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl" />
              <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-bold">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-purple-100 mb-4 leading-relaxed">
                  Unlock unlimited video generations and premium features
                </p>
                <button className="w-full py-2.5 px-4 bg-white text-purple-600 rounded-xl text-sm font-semibold hover:shadow-xl transition-all duration-200">
                  Go Premium →
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
