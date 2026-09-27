import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  onSearchSubmit?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  autoFocus = false,
  onSearchSubmit,
  placeholder = 'Tìm phim, diễn viên, thể loại...',
}) => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('keyword') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const currentQ = searchParams.get('q') || searchParams.get('keyword') || '';
    setQuery(currentQ);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      onSearchSubmit?.();
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative flex items-center w-full', className)}>
      <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 bg-surface-subtle border border-surface-border rounded-full text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 rounded-full text-gray-400 hover:text-white hover:bg-surface transition-colors"
          aria-label="Xóa nội dung tìm kiếm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
};
