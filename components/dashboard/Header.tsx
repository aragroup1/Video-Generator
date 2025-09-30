'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPayload } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ChevronDown, LogOut, User, Bell, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface HeaderProps {
  user: UserPayload;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects, videos, products..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-3 ml-4">
            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-medium text-slate-900">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div className="text-xs text-slate-500">Premium Plan</div>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-luxury-lg z-20 border border-slate-200 overflow-hidden">
                    {/* User Info */}
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">
                            {user.name || 'User'}
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                        <User size={16} className="text-slate-400" />
                        <span>Profile Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
