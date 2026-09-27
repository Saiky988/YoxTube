import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MovieItem } from '@/types/movie';
import { Badge } from '@/components/ui/Badge';
import { Play, Film } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MovieCardProps {
  movie: MovieItem;
  className?: string;
  progressPercent?: number;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  className = '',
  progressPercent,
  priority = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = movie.posterUrl || movie.thumbUrl || '';

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'series':
        return 'Phim bộ';
      case 'single':
        return 'Phim lẻ';
      case 'hoat-hinh':
        return 'Hoạt hình';
      case 'tv-shows':
        return 'TV Show';
      default:
        return null;
    }
  };

  const typeLabel = getTypeLabel(movie.type);

  return (
    <Link
      to={`/movie/${movie.slug}`}
      className={cn(
        'group relative flex flex-col rounded-lg overflow-hidden bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
        className
      )}
    >
      <div className="relative aspect-poster w-full bg-surface-subtle overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-shimmer" />
        )}

        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={movie.title}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-gray-500 bg-surface-subtle">
            <Film className="w-8 h-8 mb-2 opacity-50 text-gray-400" />
            <span className="text-xs line-clamp-2">{movie.title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          {movie.quality ? (
            <Badge variant="accent" size="sm" className="bg-[#0b0c10]/80 backdrop-blur-sm">
              {movie.quality}
            </Badge>
          ) : <span />}

          {movie.currentEpisode && (
            <Badge variant="default" size="sm" className="bg-black/75 backdrop-blur-sm text-[10px] normal-case truncate max-w-[120px]">
              {movie.currentEpisode}
            </Badge>
          )}
        </div>

        <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-brand-accent/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {progressPercent !== undefined && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-subtle">
            <div
              className="h-full bg-brand-accent"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col flex-1 justify-between bg-surface border-t border-surface-border/40">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-100 line-clamp-1 group-hover:text-brand-accent transition-colors">
            {movie.title}
          </h3>

          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5 font-normal">
              {movie.originalTitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400 font-medium">
          {movie.releaseYear && <span>{movie.releaseYear}</span>}
          {movie.releaseYear && typeLabel && <span className="text-gray-600">•</span>}
          {typeLabel && <span>{typeLabel}</span>}
        </div>
      </div>
    </Link>
  );
};
