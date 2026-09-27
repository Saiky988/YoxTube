import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { Button } from '@/components/ui/Button';
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Film
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const country = searchParams.get('country') || '';
  const year = searchParams.get('year') || '';
  const sortField = searchParams.get('sort_field') || 'created_at';
  const sortType = (searchParams.get('sort_type') as 'asc' | 'desc') || 'desc';

  useDocumentTitle('Khám phá');

  const { data: genresRes } = useQuery({
    queryKey: ['genres'],
    queryFn: () => moviesApi.getGenres(),
    staleTime: 1000 * 60 * 30,
  });

  const { data: countriesRes } = useQuery({
    queryKey: ['countries'],
    queryFn: () => moviesApi.getCountries(),
    staleTime: 1000 * 60 * 30,
  });

  const { data: yearsRes } = useQuery({
    queryKey: ['years'],
    queryFn: () => moviesApi.getYears(),
    staleTime: 1000 * 60 * 30,
  });

  const { data: moviesRes, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['movies', 'browse', { page, type, status, category, country, year, sortField, sortType }],
    queryFn: () =>
      moviesApi.getMovies({
        page,
        limit: 24,
        type: type || undefined,
        status: status || undefined,
        category: category || undefined,
        country: country || undefined,
        year: year || undefined,
        sort_field: sortField || undefined,
        sort_type: sortType || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const genres = genresRes?.data || [];
  const countries = countriesRes?.data || [];
  const years = yearsRes?.data || [];
  const movies = moviesRes?.data || [];
  const pagination = moviesRes?.pagination;

  const updateFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(type || status || category || country || year || searchParams.get('sort_field'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-brand-accent" />
            <span>Khám Phá Danh Mục Phim</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {pagination ? `Tìm thấy ${pagination.total} bộ phim` : 'Lọc phim theo sở thích'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="text-xs text-gray-400 hover:text-white gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt lại</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden text-xs gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-accent" />
            <span>Bộ lọc</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'p-4 rounded-xl bg-surface border border-surface-border space-y-4 transition-all',
          mobileFilterOpen ? 'block' : 'hidden md:block'
        )}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Định dạng
            </label>
            <select
              value={type}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full h-9 px-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs text-gray-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="">Tất cả định dạng</option>
              <option value="single">Phim lẻ</option>
              <option value="series">Phim bộ</option>
              <option value="hoat-hinh">Hoạt hình / Anime</option>
              <option value="tv-shows">TV Shows</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Thể loại
            </label>
            <select
              value={category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full h-9 px-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs text-gray-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="">Tất cả thể loại</option>
              {genres.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Quốc gia
            </label>
            <select
              value={country}
              onChange={(e) => updateFilter('country', e.target.value)}
              className="w-full h-9 px-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs text-gray-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="">Tất cả quốc gia</option>
              {countries.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Năm phát hành
            </label>
            <select
              value={year}
              onChange={(e) => updateFilter('year', e.target.value)}
              className="w-full h-9 px-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs text-gray-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="">Tất cả các năm</option>
              {years.map((y) => (
                <option key={y.slug} value={y.slug}>
                  {y.name} {y.totalMovies ? `(${y.totalMovies})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full h-9 px-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs text-gray-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="completed">Hoàn tất</option>
              <option value="ongoing">Đang chiếu</option>
              <option value="trailer">Trailer</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Sắp xếp
            </label>
            <select
              value={`${sortField}_${sortType}`}
              onChange={(e) => {
                const [f, t] = e.target.value.split('_');
                const next = new URLSearchParams(searchParams);
                next.set('sort_field', f);
                next.set('sort_type', t);
                next.delete('page');
                setSearchParams(next);
              }}
              className="w-full h-9 px-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs text-gray-200 focus:outline-none focus:border-brand-accent"
            >
              <option value="created_at_desc">Mới cập nhật</option>
              <option value="view_count_desc">Lượt xem nhiều</option>
              <option value="release_year_desc">Năm phát hành mới nhất</option>
              <option value="release_year_asc">Năm phát hành cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      <MovieGrid
        movies={movies}
        isLoading={isLoading && !isPlaceholderData}
        emptyTitle="Không có phim phù hợp"
        emptyDescription="Thử bỏ bớt điều kiện lọc hoặc chọn thể loại khác."
        emptyAction={
          hasActiveFilters ? (
            <Button variant="secondary" size="sm" onClick={resetAllFilters} className="mt-2">
              Xóa bộ lọc
            </Button>
          ) : undefined
        }
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            aria-label="Trang trước"
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
            aria-label="Trang sau"
          >
            <span>Sau</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
