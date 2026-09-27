import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ServerSelector } from '@/components/player/ServerSelector';
import { EpisodeList } from '@/components/player/EpisodeList';
import { MovieSection } from '@/components/movie/MovieSection';
import {
  Play,
  Bookmark,
  Calendar,
  Clock,
  Globe,
  Film,
  Star,
  Users,
  Eye,
  Share2,
  Check
} from 'lucide-react';
import { formatViewCount } from '@/lib/utils/formatters';

export const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUIStore();

  const [copied, setCopied] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<number | undefined>();

  const { data: movieRes, isLoading, isError } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => moviesApi.getMovieBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });

  const movie = movieRes?.data;

  const activeServer =
    movie?.servers?.find((s) => s.id === selectedServerId) || movie?.servers?.[0];

  const primaryGenreSlug = movie?.genres?.[0]?.slug;
  const { data: relatedRes } = useQuery({
    queryKey: ['movies', 'related', primaryGenreSlug],
    queryFn: () => moviesApi.getMovies({ category: primaryGenreSlug, limit: 12 }),
    enabled: Boolean(primaryGenreSlug),
  });

  const relatedMovies = (relatedRes?.data || []).filter((m) => m.id !== movie?.id);

  const favoriteMutation = useMutation({
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
      favoriteMutation.mutate(movie.id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Xem phim ${movie?.title} trên YoxTube`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="relative h-[360px] md:h-[480px] rounded-2xl overflow-hidden bg-surface border border-surface-border">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Film className="w-16 h-16 text-gray-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Không tìm thấy thông tin phim</h2>
        <p className="text-xs text-gray-400">
          Bộ phim này có thể đã bị xóa hoặc đường dẫn không hợp lệ.
        </p>
        <Link to="/browse">
          <Button variant="primary" size="md">
            Khám phá phim khác
          </Button>
        </Link>
      </div>
    );
  }

  const backdropUrl = movie.thumbUrl || movie.posterUrl || '';
  const firstEpisodeSlug = activeServer?.episodes?.[0]?.slug;
  const watchUrl = `/watch/${movie.slug}${firstEpisodeSlug ? `?ep=${firstEpisodeSlug}` : ''}`;

  return (
    <div className="space-y-10 pb-12">
      <div className="relative min-h-[440px] md:min-h-[520px] bg-surface overflow-hidden flex items-end">
        {backdropUrl && (
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover filter brightness-[0.45] transform scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end">
          <div className="w-36 sm:w-48 md:w-56 aspect-poster shrink-0 rounded-xl overflow-hidden shadow-2xl border border-surface-border bg-surface-subtle">
            <img
              src={movie.posterUrl || movie.thumbUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {movie.quality && (
                <Badge variant="accent" size="md">
                  {movie.quality}
                </Badge>
              )}
              {movie.type === 'series' ? (
                <Badge variant="default" size="md">
                  Phim Bộ
                </Badge>
              ) : (
                <Badge variant="default" size="md">
                  Phim Lẻ
                </Badge>
              )}
              {movie.currentEpisode && (
                <Badge variant="outline" size="md" className="normal-case">
                  {movie.currentEpisode}
                </Badge>
              )}
              {movie.tmdb?.voteAverage && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{movie.tmdb.voteAverage}</span>
                  <span className="text-gray-400 font-normal">/ 10</span>
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {movie.title}
              </h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-base sm:text-lg text-gray-400 font-medium mt-1">
                  {movie.originalTitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 font-medium">
              {movie.releaseYear && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{movie.releaseYear}</span>
                </span>
              )}
              {movie.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{movie.duration}</span>
                </span>
              )}
              {movie.language && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>{movie.language}</span>
                </span>
              )}
              {movie.viewCount !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>{formatViewCount(movie.viewCount)}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {movie.genres?.map((g) => (
                <Link
                  key={g.id}
                  to={`/browse?category=${g.slug}`}
                  className="px-2.5 py-1 rounded-md bg-surface-subtle text-xs text-gray-300 hover:text-white hover:bg-surface-hover border border-surface-border transition-colors"
                >
                  {g.name}
                </Link>
              ))}
              {movie.countries?.map((c) => (
                <Link
                  key={c.id}
                  to={`/browse?country=${c.slug}`}
                  className="px-2.5 py-1 rounded-md bg-surface-subtle text-xs text-gray-400 hover:text-white border border-surface-border transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link to={watchUrl}>
                <Button variant="primary" size="lg" className="gap-2 font-bold px-8">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Xem phim</span>
                </Button>
              </Link>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleFavoriteClick}
                isLoading={favoriteMutation.isPending}
                className="gap-2"
                aria-label="Thêm vào danh sách yêu thích"
              >
                <Bookmark className="w-4 h-4 text-brand-accent" />
                <span>Yêu thích</span>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handleShare}
                className="gap-2 border border-surface-border"
                aria-label="Chia sẻ phim"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép liên kết' : 'Chia sẻ'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {movie.description && (
          <div className="p-6 rounded-xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-base font-bold text-white tracking-wide">Nội dung phim</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-normal">
              {movie.description}
            </p>
          </div>
        )}

        {movie.servers && movie.servers.length > 0 && (
          <div className="p-6 rounded-xl bg-surface border border-surface-border space-y-6">
            <h2 className="text-base font-bold text-white tracking-wide">Chọn tập phim</h2>

            {movie.servers.length > 1 && (
              <ServerSelector
                servers={movie.servers}
                activeServerId={activeServer?.id}
                onSelectServer={(s) => setSelectedServerId(s.id)}
              />
            )}

            {activeServer && (
              <EpisodeList
                episodes={activeServer.episodes}
                onSelectEpisode={(ep) => {
                  navigate(`/watch/${movie.slug}?ep=${ep.slug}&server=${activeServer.id}`);
                }}
              />
            )}
          </div>
        )}

        {((movie.actors && movie.actors.length > 0) || (movie.directors && movie.directors.length > 0)) && (
          <div className="p-6 rounded-xl bg-surface border border-surface-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-accent" />
              <span>Diễn viên & Đạo diễn</span>
            </h2>

            {movie.directors && movie.directors.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400">Đạo diễn:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {movie.directors.map((dir, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-surface-subtle border border-surface-border text-xs text-gray-200"
                    >
                      {dir}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.actors && movie.actors.length > 0 && (
              <div className="space-y-1 pt-2">
                <span className="text-xs font-semibold text-gray-400">Diễn viên chính:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {movie.actors.map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-surface-subtle border border-surface-border text-xs text-gray-200"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {relatedMovies.length > 0 && (
          <MovieSection
            title="Phim Cùng Thể Loại"
            subtitle="Khám phá thêm các bộ phim tương tự có thể bạn quan tâm"
            movies={relatedMovies}
          />
        )}
      </div>
    </div>
  );
};
