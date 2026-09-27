import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useDebounce } from '@/hooks/useDebounce';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { Button } from '@/components/ui/Button';
import { Search as SearchIcon, X, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || searchParams.get('keyword') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [inputVal, setInputVal] = useState(urlQuery);
  const debouncedQuery = useDebounce(inputVal, 300);

  useDocumentTitle(urlQuery ? `Tìm kiếm "${urlQuery}"` : 'Tìm kiếm');

  // Cập nhật URL khi người dùng gõ tìm kiếm trên trang
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (trimmed) {
      nextParams.set('q', trimmed);
    } else {
      nextParams.delete('q');
      nextParams.delete('keyword');
    }
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  }, [debouncedQuery]);

  // Đồng bộ giá trị input khi URL thay đổi (ví dụ: gõ từ header search)
  useEffect(() => {
    setInputVal(urlQuery);
  }, [urlQuery]);

  // Tìm kiếm kết quả chính thức
  const { data: searchRes, isLoading, isError } = useQuery({
    queryKey: ['movies', 'search', { query: urlQuery, page }],
    queryFn: () => moviesApi.searchMovies(urlQuery, page, 24),
    enabled: Boolean(urlQuery.trim()),
    staleTime: 1000 * 60 * 2,
  });

  // Gợi ý phim phổ biến khi chưa nhập từ khóa
  const { data: trendingRes, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['movies', 'search-trending'],
    queryFn: () => moviesApi.getMovies({ sort_field: 'view_count', sort_type: 'desc', limit: 18 }),
    enabled: !urlQuery.trim(),
    staleTime: 1000 * 60 * 10,
  });

  const movies = searchRes?.data || [];
  const trendingMovies = trendingRes?.data || [];
  const pagination = searchRes?.pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="max-w-2xl mx-auto space-y-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white text-center tracking-tight flex items-center justify-center gap-2">
          <SearchIcon className="w-6 h-6 text-brand-accent" />
          <span>Tìm Kiếm Phim</span>
        </h1>

        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Nhập tên phim, diễn viên, đạo diễn hoặc tên gốc..."
            autoFocus
            className="w-full h-12 pl-12 pr-12 bg-surface border border-surface-border rounded-xl text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors shadow-lg"
          />

          <div className="absolute right-3.5 flex items-center gap-1.5">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-brand-accent animate-spin" />
            )}
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-surface-subtle transition-colors"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {urlQuery && (
          <p className="text-xs text-gray-400 text-center">
            {isLoading
              ? 'Đang tìm kiếm trên hệ thống...'
              : pagination
              ? `Tìm thấy ${pagination.total} kết quả cho "${urlQuery}"`
              : `Kết quả tìm kiếm cho "${urlQuery}"`}
          </p>
        )}
      </div>

      {/* Khi chưa nhập từ khóa: Hiển thị gợi ý phim phổ biến */}
      {!urlQuery.trim() ? (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-200 border-b border-surface-border/50 pb-2">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <span>Phim Đang Thịnh Hành & Được Xem Nhiều</span>
          </div>
          <MovieGrid
            movies={trendingMovies}
            isLoading={isTrendingLoading}
          />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-surface rounded-xl border border-surface-border text-red-400 text-xs">
          Đã có sự cố khi kết nối với máy chủ tìm kiếm. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="space-y-6">
          <MovieGrid
            movies={movies}
            isLoading={isLoading}
            emptyTitle={`Không tìm thấy kết quả cho "${urlQuery}"`}
            emptyDescription="Thử kiểm tra lại chính tả hoặc tìm kiếm bằng từ khóa ngắn gọn hơn."
          />

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Trước</span>
              </Button>

              <span className="text-xs text-gray-400 px-3 font-medium">
                Trang <strong className="text-white">{page}</strong> / {pagination.totalPages}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
