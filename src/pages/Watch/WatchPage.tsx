import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { ServerSelector } from '@/components/player/ServerSelector';
import { EpisodeList } from '@/components/player/EpisodeList';
import { MovieSection } from '@/components/movie/MovieSection';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Check,
  Film,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { Episode, MovieServer, VideoSource } from '@/types/movie';

export const WatchPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUIStore();

  const [copied, setCopied] = useState(false);

  const { data: movieRes, isLoading, isError } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => moviesApi.getMovieBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });

  const movie = movieRes?.data;

  const serverParam = searchParams.get('server');
  const epParam = searchParams.get('ep');

  const activeServer: MovieServer | undefined = useMemo(() => {
    if (!movie?.servers?.length) return undefined;
    if (serverParam) {
      const found = movie.servers.find((s) => String(s.id) === serverParam);
      if (found) return found;
    }
    return movie.servers[0];
  }, [movie?.servers, serverParam]);

  const activeEpisode: Episode | undefined = useMemo(() => {
    if (!activeServer?.episodes?.length) return undefined;
    if (epParam) {
      const found = activeServer.episodes.find((e) => e.slug === epParam);
      if (found) return found;
    }
    return activeServer.episodes[0];
  }, [activeServer?.episodes, epParam]);

  const [selectedSourceId, setSelectedSourceId] = useState<number | undefined>();

  const activeSource: VideoSource | undefined = useMemo(() => {
    if (!activeEpisode?.sources?.length) return undefined;
    if (selectedSourceId) {
      const found = activeEpisode.sources.find((s) => s.id === selectedSourceId);
      if (found) return found;
    }
    return activeEpisode.sources.find((s) => s.isDefault) || activeEpisode.sources[0];
  }, [activeEpisode?.sources, selectedSourceId]);

  const currentEpIndex = activeServer?.episodes?.findIndex((e) => e.id === activeEpisode?.id) ?? -1;
  const prevEpisode = currentEpIndex > 0 ? activeServer?.episodes[currentEpIndex - 1] : null;
  const nextEpisode =
    currentEpIndex >= 0 && activeServer?.episodes && currentEpIndex < activeServer.episodes.length - 1
      ? activeServer.episodes[currentEpIndex + 1]
      : null;

  const handleSelectServer = (server: MovieServer) => {
    setSelectedSourceId(undefined);
    const next = new URLSearchParams(searchParams);
    next.set('server', String(server.id));
    if (server.episodes?.length) {
      next.set('ep', server.episodes[0].slug);
    }
    setSearchParams(next);
  };

  const handleSelectEpisode = (episode: Episode) => {
    setSelectedSourceId(undefined);
    const next = new URLSearchParams(searchParams);
    next.set('ep', episode.slug);
    if (activeServer) {
      next.set('server', String(activeServer.id));
    }
    setSearchParams(next);
  };

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
        text: `Đang xem ${movie?.title} trên YoxTube`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const primaryGenreSlug = movie?.genres?.[0]?.slug;
  const { data: relatedRes } = useQuery({
    queryKey: ['movies', 'related', primaryGenreSlug],
    queryFn: () => moviesApi.getMovies({ category: primaryGenreSlug, limit: 12 }),
    enabled: Boolean(primaryGenreSlug),
  });
  const relatedMovies = (relatedRes?.data || []).filter((m) => m.id !== movie?.id);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Film className="w-16 h-16 text-gray-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Không thể phát nội dung</h2>
        <p className="text-xs text-gray-400">
          Không tìm thấy nguồn phim hoặc thông tin phim không khả dụng.
        </p>
        <Link to="/browse">
          <Button variant="primary" size="md">
            Khám phá phim khác
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <div className="w-full">
        <VideoPlayer
          source={activeSource}
          movieId={movie.id}
          episodeId={activeEpisode?.id}
          title={`${movie.title}${activeEpisode?.name ? ` - Tập ${activeEpisode.name}` : ''}`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-surface-border">
        <div className="flex items-center gap-2">
          {prevEpisode && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSelectEpisode(prevEpisode)}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tập trước ({prevEpisode.name})</span>
            </Button>
          )}

          {nextEpisode && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSelectEpisode(nextEpisode)}
              className="gap-1 text-xs font-semibold"
            >
              <span>Tập tiếp ({nextEpisode.name})</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {activeEpisode && (
            <span className="text-xs font-semibold text-gray-300 ml-2">
              Đang phát: <span className="text-brand-accent">Tập {activeEpisode.name}</span>
            </span>
          )}
        </div>

        {activeEpisode?.sources && activeEpisode.sources.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="text-[11px] font-medium hidden sm:inline">Chất lượng:</span>
            {activeEpisode.sources.map((src) => (
              <button
                key={src.id}
                onClick={() => setSelectedSourceId(src.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeSource?.id === src.id
                    ? 'bg-brand-accent text-white font-bold'
                    : 'bg-surface-subtle text-gray-300 hover:text-white'
                }`}
              >
                {src.quality} ({src.language})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-surface-border">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {movie.quality && <Badge variant="accent">{movie.quality}</Badge>}
            {movie.releaseYear && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {movie.releaseYear}
              </span>
            )}
            {movie.duration && (
              <span className="text-xs text-gray-400">
                • {movie.duration}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {movie.title}
          </h1>

          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              {movie.originalTitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFavoriteClick}
            isLoading={favoriteMutation.isPending}
            className="gap-1.5 text-xs"
          >
            <Bookmark className="w-4 h-4 text-brand-accent" />
            <span>Yêu thích</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
          </Button>

          <Link to={`/movie/${movie.slug}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs border border-surface-border">
              <Info className="w-4 h-4" />
              <span>Thông tin</span>
            </Button>
          </Link>
        </div>
      </div>

      {movie.servers && movie.servers.length > 0 && (
        <div className="p-5 rounded-xl bg-surface border border-surface-border space-y-5">
          {movie.servers.length > 1 && (
            <ServerSelector
              servers={movie.servers}
              activeServerId={activeServer?.id}
              onSelectServer={handleSelectServer}
            />
          )}

          {activeServer && (
            <EpisodeList
              episodes={activeServer.episodes}
              activeEpisodeId={activeEpisode?.id}
              onSelectEpisode={handleSelectEpisode}
            />
          )}
        </div>
      )}

      {movie.description && (
        <div className="p-5 rounded-xl bg-surface border border-surface-border space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-accent" />
            <span>Tóm tắt nội dung</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
            {movie.description}
          </p>
        </div>
      )}

      {relatedMovies.length > 0 && (
        <div className="pt-4">
          <MovieSection
            title="Đề Xuất Cho Bạn"
            subtitle="Những bộ phim có nội dung tương tự"
            movies={relatedMovies}
          />
        </div>
      )}
    </div>
  );
};
