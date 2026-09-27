import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useDebounce } from '@/hooks/useDebounce';
import { getValidImageUrl } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { Search, X, Loader2, Film, ChevronRight } from 'lucide-react';
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
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('keyword') || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce tìm kiếm 300ms sau khi người dùng ngừng gõ
  const debouncedQuery = useDebounce(query.trim(), 300);

  // Đồng bộ với URL query khi đổi trang
  useEffect(() => {
    const currentQ = searchParams.get('q') || searchParams.get('keyword') || '';
    setQuery(currentQ);
  }, [searchParams]);

  // Nếu đang ở trang /search: tự động cập nhật URL và kết quả trên trang ngay khi gõ trên header
  useEffect(() => {
    if (location.pathname === '/search') {
      const urlQ = searchParams.get('q') || searchParams.get('keyword') || '';
      if (debouncedQuery !== urlQ) {
        const nextParams = new URLSearchParams(searchParams);
        if (debouncedQuery) {
          nextParams.set('q', debouncedQuery);
        } else {
          nextParams.delete('q');
          nextParams.delete('keyword');
        }
        nextParams.delete('page');
        navigate(`/search?${nextParams.toString()}`, { replace: true });
      }
    }
  }, [debouncedQuery, location.pathname]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lắng nghe phím Escape để đóng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Gọi API tìm kiếm trực tiếp trên Header
  const { data: searchRes, isLoading, isFetching } = useQuery({
    queryKey: ['movies', 'live-header-search', debouncedQuery],
    queryFn: () => moviesApi.searchMovies(debouncedQuery, 1, 6),
    enabled: Boolean(debouncedQuery.length >= 1),
    staleTime: 1000 * 60 * 2,
  });

  const liveResults = searchRes?.data || [];
  const totalResults = searchRes?.pagination?.total || 0;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      onSearchSubmit?.();
    }
  };

  const handleSelectMovie = (slug: string) => {
    setIsOpen(false);
    navigate(`/movie/${slug}`);
    onSearchSubmit?.();
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
    if (location.pathname === '/search') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('q');
      nextParams.delete('keyword');
      nextParams.delete('page');
      navigate(`/search?${nextParams.toString()}`, { replace: true });
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'series':
        return 'Phim bộ';
      case 'single':
        return 'Phim lẻ';
      case 'animation':
      case 'hoat-hinh':
        return 'Hoạt hình';
      case 'tv-shows':
        return 'TV Show';
      default:
        return null;
    }
  };

  const showDropdown = isOpen && query.trim().length >= 1;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 1) setIsOpen(true);
          }}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full h-9 pl-9 pr-8 bg-surface-subtle border border-surface-border rounded-full text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {isFetching && (
            <Loader2 className="w-3.5 h-3.5 text-brand-accent animate-spin" />
          )}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full text-gray-400 hover:text-white hover:bg-surface transition-colors"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Card Dropdown hiển thị kết quả trực tiếp dưới Header */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 sm:w-[400px] mt-2 bg-[#12141a]/95 backdrop-blur-xl border border-surface-border rounded-xl shadow-2xl z-[100] overflow-hidden divide-y divide-surface-border/60 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header kết quả */}
          <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-gray-400 bg-surface/40">
            <span className="truncate pr-2">Gợi ý trực tiếp cho "{debouncedQuery}"</span>
            {totalResults > 0 && (
              <span className="text-gray-400 font-medium whitespace-nowrap">{totalResults} kết quả</span>
            )}
          </div>

          {/* Danh sách card phim */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-border/30 custom-scrollbar">
            {isLoading ? (
              // Skeletons shimmer
              <div className="p-3 space-y-2.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 items-center animate-pulse">
                    <div className="w-12 h-16 bg-surface-subtle rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-surface-subtle rounded w-3/4" />
                      <div className="h-2.5 bg-surface-subtle rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : liveResults.length > 0 ? (
              // Kết quả phim
              liveResults.map((m) => {
                const img = getValidImageUrl(m.thumbUrl) || getValidImageUrl(m.posterUrl) || '';
                const typeLabel = getTypeLabel(m.type);

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMovie(m.slug)}
                    className="flex items-center gap-3 p-2.5 hover:bg-surface-subtle/80 cursor-pointer transition-colors group"
                  >
                    <div className="relative w-12 h-16 rounded-md overflow-hidden bg-surface-subtle flex-shrink-0 border border-surface-border/50">
                      {img ? (
                        <img
                          src={img}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-semibold text-gray-100 group-hover:text-brand-accent truncate transition-colors">
                        {m.title}
                      </h4>
                      {m.originalTitle && m.originalTitle !== m.title && (
                        <p className="text-[11px] text-gray-400 truncate">
                          {m.originalTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {typeLabel && (
                          <Badge variant="subtle" size="sm" className="text-[9px] px-1 py-0">
                            {typeLabel}
                          </Badge>
                        )}
                        {m.releaseYear && (
                          <span className="text-[10px] text-gray-400">
                            {m.releaseYear}
                          </span>
                        )}
                        {m.quality && (
                          <Badge variant="accent" size="sm" className="text-[9px] px-1 py-0">
                            {m.quality}
                          </Badge>
                        )}
                        {m.currentEpisode && (
                          <span className="text-[10px] text-gray-400 truncate max-w-[90px]">
                            {m.currentEpisode}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                );
              })
            ) : (
              // Không tìm thấy
              <div className="p-6 text-center text-gray-400 space-y-1">
                <Film className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <p className="text-xs font-medium text-gray-300">
                  Không tìm thấy kết quả cho "{debouncedQuery}"
                </p>
                <p className="text-[11px] text-gray-500">
                  Hệ thống đang tiếp tục tìm kiếm trên nguồn phim, nhấn Enter để mở trang kết quả
                </p>
              </div>
            )}
          </div>

          {/* Footer: Xem tất cả kết quả */}
          {liveResults.length > 0 && (
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full px-3.5 py-2.5 text-center text-xs font-medium text-brand-accent hover:text-brand-accent-hover hover:bg-surface-subtle transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Xem tất cả kết quả cho "{query}"</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
