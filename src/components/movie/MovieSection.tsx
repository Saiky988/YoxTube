import React from 'react';
import { Link } from 'react-router-dom';
import { MovieItem } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronRight } from 'lucide-react';

interface MovieSectionProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  movies?: MovieItem[];
  isLoading?: boolean;
}

export const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  subtitle,
  viewAllLink,
  movies = [],
  isLoading = false,
}) => {
  if (!isLoading && movies.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 my-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-xs font-semibold text-brand-accent hover:text-brand-hover transition-colors shrink-0 group"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-lg overflow-hidden bg-surface border border-surface-border">
              <Skeleton className="aspect-poster w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {movies.slice(0, 12).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
};
