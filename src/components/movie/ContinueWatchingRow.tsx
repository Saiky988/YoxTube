import React from 'react';
import { Link } from 'react-router-dom';
import { WatchHistoryItem } from '@/types/movie';
import { Play, Clock } from 'lucide-react';
import { formatSecondsToTime } from '@/lib/utils/formatters';

interface ContinueWatchingRowProps {
  items: WatchHistoryItem[];
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4 my-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-accent" />
          <span>Tiếp tục xem</span>
        </h2>
        <Link
          to="/history"
          className="text-xs font-semibold text-brand-accent hover:text-brand-hover transition-colors"
        >
          Xem lịch sử
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {items.slice(0, 6).map((item) => {
          const percent = item.durationSeconds > 0
            ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
            : 0;

          return (
            <Link
              key={item.historyId}
              to={`/watch/${item.movie.slug}${item.episode?.slug ? `?ep=${item.episode.slug}` : ''}`}
              className="group relative flex flex-col rounded-lg overflow-hidden bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <div className="relative aspect-poster w-full bg-surface-subtle overflow-hidden">
                <img
                  src={item.movie.posterUrl || item.movie.thumbUrl}
                  alt={item.movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-10 h-10 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                  <div
                    className="h-full bg-brand-accent transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5">
                <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-brand-accent transition-colors">
                  {item.movie.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                  <span>{item.episode?.name ? `Tập ${item.episode.name}` : 'Đang xem'}</span>
                  <span>{formatSecondsToTime(item.progressSeconds)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
