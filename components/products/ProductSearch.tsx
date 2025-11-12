'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

export default function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const handleSearch = (value: string) => {
    setSearch(value);
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('search', value);
        params.delete('page'); // Reset to page 1 on search
      } else {
        params.delete('search');
      }
      router.push(`/products?${params.toString()}`);
    });
  };

  const clearSearch = () => {
    setSearch('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      params.delete('page');
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        type="text"
        placeholder="Search products by name, description, or tags..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-12 pr-12 h-12 text-base"
      />
      {search && (
        <button
          onClick={clearSearch}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      )}
      {isPending && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  );
}
