import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useAuth } from '@/hooks/useAuth';
import { MovieCard } from '@/components/movie/MovieCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Bookmark, ChevronLeft, ChevronRight, Compass, Trash2 } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const FavoritesPage: React.FC = () => {
  useDocumentTitle('Phim yêu thích');
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data: favRes, isLoading } = useQuery({
    queryKey: ['favorites', page],
    queryFn: () => moviesApi.getFavorites(page, 24),
    enabled: isAuthenticated,
  });

  const removeFavMutation = useMutation({
    mutationFn: (movieId: number) => moviesApi.toggleFavorite(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const favorites = favRes?.data || [];
  const pagination = favRes?.pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-accent fill-brand-accent" />
            <span>Danh Sách Phim Yêu Thích</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {pagination ? `${pagination.total} bộ phim đã lưu` : 'Các bộ phim bạn đã lưu để xem lại'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-lg overflow-hidden bg-surface border border-surface-border">
              <Skeleton className="aspect-poster w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-surface/50 border border-surface-border">
          <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-brand-accent mb-4 border border-surface-border">
            <Bookmark className="w-8 h-8" />
          </div>
          <h2 className="text-base font-semibold text-white mb-1">
            Chưa có phim trong danh sách yêu thích
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mb-6">
            Bấm vào biểu tượng dấu trang khi duyệt phim để lưu các tác phẩm bạn yêu thích vào đây.
          </p>
          <Link to="/browse">
            <Button variant="primary" size="md" className="gap-2">
              <Compass className="w-4 h-4" />
              <span>Khám phá phim ngay</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {favorites.map((movie) => (
            <div key={movie.id} className="relative group">
              <MovieCard movie={movie} />

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFavMutation.mutate(movie.id);
                }}
                disabled={removeFavMutation.isPending}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-gray-300 hover:text-red-400 hover:bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Bỏ khỏi yêu thích"
                aria-label="Bỏ khỏi danh sách yêu thích"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
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
  );
};
