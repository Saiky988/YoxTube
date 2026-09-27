import React from 'react';
import { MovieItem } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Film } from 'lucide-react';

interface MovieGridProps {
  movies?: MovieItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies = [],
  isLoading = false,
  skeletonCount = 12,
  emptyTitle = 'Không tìm thấy phim',
  emptyDescription = 'Hiện chưa có nội dung nào phù hợp với yêu cầu của bạn.',
  emptyAction,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-lg overflow-hidden bg-surface border border-surface-border">
            <Skeleton className="aspect-poster w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl bg-surface/50 border border-surface-border my-6">
        <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center text-gray-500 mb-4">
          <Film className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">{emptyTitle}</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-4">{emptyDescription}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
