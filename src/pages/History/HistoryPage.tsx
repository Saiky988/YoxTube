import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatSecondsToTime, formatDate } from '@/lib/utils/formatters';
import {
  Clock,
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const HistoryPage: React.FC = () => {
  useDocumentTitle('Lịch sử xem');
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: historyRes, isLoading } = useQuery({
    queryKey: ['watchHistory', page],
    queryFn: () => moviesApi.getWatchHistory(page, 24),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (movieId: number) => moviesApi.deleteWatchHistory(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
      setDeleteId(null);
    },
  });

  const historyItems = historyRes?.data || [];
  const pagination = historyRes?.pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = (movieId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa bộ phim này khỏi lịch sử xem?')) {
      setDeleteId(movieId);
      deleteMutation.mutate(movieId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-accent" />
            <span>Lịch Sử Xem Phim</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {pagination ? `${pagination.total} mục đã xem` : 'Danh sách các tập phim bạn đã xem gần đây'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface border border-surface-border">
              <Skeleton className="w-24 h-32 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : historyItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-surface/50 border border-surface-border">
          <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-brand-accent mb-4 border border-surface-border">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-base font-semibold text-white mb-1">
            Lịch sử xem đang trống
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mb-6">
            Khi bạn xem bất kỳ bộ phim nào trên YoxTube, tiến trình xem sẽ tự động được ghi lại tại đây.
          </p>
          <Link to="/browse">
            <Button variant="primary" size="md" className="gap-2">
              <Compass className="w-4 h-4" />
              <span>Khám phá phim ngay</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {historyItems.map((item) => {
            const percent =
              item.durationSeconds > 0
                ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
                : 0;

            const watchUrl = `/watch/${item.movie.slug}${
              item.episode?.slug ? `?ep=${item.episode.slug}` : ''
            }`;

            return (
              <div
                key={item.historyId}
                className="group relative flex gap-3.5 p-3 rounded-xl bg-surface border border-surface-border hover:border-surface-border-hover transition-all"
              >
                <Link
                  to={watchUrl}
                  className="relative w-24 sm:w-28 aspect-poster rounded-lg overflow-hidden shrink-0 bg-surface-subtle"
                >
                  <img
                    src={item.movie.posterUrl || item.movie.thumbUrl}
                    alt={item.movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                    <div className="h-full bg-brand-accent" style={{ width: `${percent}%` }} />
                  </div>
                </Link>

                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <Link
                      to={watchUrl}
                      className="text-xs sm:text-sm font-semibold text-white line-clamp-1 hover:text-brand-accent transition-colors"
                    >
                      {item.movie.title}
                    </Link>

                    {item.episode?.name && (
                      <p className="text-[11px] font-medium text-brand-accent">
                        Tập {item.episode.name}{' '}
                        {item.episode.serverName && (
                          <span className="text-gray-400">({item.episode.serverName.trim()})</span>
                        )}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
                      {item.completed ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã xem xong
                        </span>
                      ) : (
                        <span>
                          {formatSecondsToTime(item.progressSeconds)} /{' '}
                          {formatSecondsToTime(item.durationSeconds)} ({percent}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-border/40 text-[10px] text-gray-500">
                    <span>{formatDate(item.lastWatchedAt)}</span>

                    <button
                      onClick={() => handleDeleteItem(item.movie.id)}
                      disabled={deleteId === item.movie.id && deleteMutation.isPending}
                      className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-surface-subtle transition-colors"
                      title="Xóa khỏi lịch sử"
                      aria-label="Xóa khỏi lịch sử xem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
