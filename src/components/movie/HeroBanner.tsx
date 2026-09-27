import React from 'react';
import { Link } from 'react-router-dom';
import { MovieItem } from '@/types/movie';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Play, Info, Bookmark, Calendar, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { getValidImageUrl } from '@/lib/utils/formatters';

interface HeroBannerProps {
  movie?: MovieItem;
  isLoading?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movie, isLoading = false }) => {
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUIStore();
  const queryClient = useQueryClient();

  const toggleFavMutation = useMutation({
    mutationFn: (movieId: number) => moviesApi.toggleFavorite(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (movie) {
      toggleFavMutation.mutate(movie.id);
    }
  };

  if (isLoading || !movie) {
    return (
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] bg-surface overflow-hidden rounded-2xl border border-surface-border">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-10 left-6 sm:left-10 max-w-xl space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    );
  }

  const backdropImage = getValidImageUrl(movie.thumbUrl) || getValidImageUrl(movie.posterUrl) || '';

  return (
    <div className="relative w-full min-h-[380px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[540px] rounded-2xl overflow-hidden border border-surface-border/60 bg-surface flex items-end">
      {backdropImage && (
        <div className="absolute inset-0">
          <img
            src={backdropImage}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-90 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/70 to-transparent" />
        </div>
      )}

      <div className="relative z-10 max-w-2xl p-6 sm:p-10 lg:p-12 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {movie.quality && (
            <Badge variant="accent" size="sm">
              {movie.quality}
            </Badge>
          )}

          {movie.type === 'series' ? (
            <Badge variant="default" size="sm">
              Phim Bộ
            </Badge>
          ) : (
            <Badge variant="default" size="sm">
              Phim Lẻ
            </Badge>
          )}

          {movie.currentEpisode && (
            <Badge variant="outline" size="sm" className="normal-case">
              {movie.currentEpisode}
            </Badge>
          )}

          {movie.releaseYear && (
            <span className="flex items-center gap-1 text-xs text-gray-300 font-medium ml-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {movie.releaseYear}
            </span>
          )}

          {movie.duration && (
            <span className="flex items-center gap-1 text-xs text-gray-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {movie.duration}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {movie.title}
          </h1>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-sm sm:text-base font-normal text-gray-300 mt-1">
              {movie.originalTitle}
            </p>
          )}
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-300">
            {movie.genres.slice(0, 4).map((g) => (
              <span
                key={g.id}
                className="px-2 py-0.5 rounded bg-surface-subtle/80 border border-surface-border text-gray-300"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link to={`/watch/${movie.slug}`}>
            <Button variant="primary" size="md" className="gap-2 font-semibold">
              <Play className="w-4 h-4 fill-current" />
              <span>Xem ngay</span>
            </Button>
          </Link>

          <Link to={`/movie/${movie.slug}`}>
            <Button variant="secondary" size="md" className="gap-2">
              <Info className="w-4 h-4" />
              <span>Chi tiết</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            isLoading={toggleFavMutation.isPending}
            className="border border-surface-border hover:bg-surface-subtle"
            title="Thêm vào danh sách yêu thích"
            aria-label="Thêm vào danh sách yêu thích"
          >
            <Bookmark className="w-4 h-4 text-gray-300" />
          </Button>
        </div>
      </div>
    </div>
  );
};
