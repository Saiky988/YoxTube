import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useAuth } from '@/hooks/useAuth';
import { HeroBanner } from '@/components/movie/HeroBanner';
import { MovieSection } from '@/components/movie/MovieSection';
import { ContinueWatchingRow } from '@/components/movie/ContinueWatchingRow';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const { data: trendingRes, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: () => moviesApi.getMovies({ sort_field: 'view_count', sort_type: 'desc', limit: 12 }),
  });

  const { data: latestRes, isLoading: isLatestLoading } = useQuery({
    queryKey: ['movies', 'latest'],
    queryFn: () => moviesApi.getMovies({ sort_field: 'created_at', sort_type: 'desc', limit: 12 }),
  });

  const { data: seriesRes, isLoading: isSeriesLoading } = useQuery({
    queryKey: ['movies', 'series'],
    queryFn: () => moviesApi.getMovies({ type: 'series', limit: 12 }),
  });

  const { data: actionRes, isLoading: isActionLoading } = useQuery({
    queryKey: ['movies', 'action'],
    queryFn: () => moviesApi.getMovies({ category: 'hanh-dong', limit: 12 }),
  });

  const { data: animeRes, isLoading: isAnimeLoading } = useQuery({
    queryKey: ['movies', 'hoat-hinh'],
    queryFn: () => moviesApi.getMovies({ type: 'hoat-hinh', limit: 12 }),
  });

  const { data: historyRes } = useQuery({
    queryKey: ['watchHistory', 'recent'],
    queryFn: () => moviesApi.getWatchHistory(1, 6),
    enabled: isAuthenticated,
  });

  const trendingMovies = trendingRes?.data || [];
  const latestMovies = latestRes?.data || [];
  const seriesMovies = seriesRes?.data || [];
  const actionMovies = actionRes?.data || [];
  const animeMovies = animeRes?.data || [];
  const historyItems = historyRes?.data || [];

  const heroMovie = trendingMovies[0] || latestMovies[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <HeroBanner movie={heroMovie} isLoading={isTrendingLoading && isLatestLoading} />

      {isAuthenticated && historyItems.length > 0 && (
        <ContinueWatchingRow items={historyItems} />
      )}

      <MovieSection
        title="Thịnh Hành & Xem Nhiều"
        subtitle="Những bộ phim đang được xem nhiều nhất trên YoxTube"
        viewAllLink="/browse?sort_field=view_count&sort_type=desc"
        movies={trendingMovies}
        isLoading={isTrendingLoading}
      />

      <MovieSection
        title="Phim Mới Cập Nhật"
        subtitle="Cập nhật bản đẹp, phụ đề và thuyết minh mới nhất"
        viewAllLink="/browse?sort_field=created_at&sort_type=desc"
        movies={latestMovies}
        isLoading={isLatestLoading}
      />

      <MovieSection
        title="Phim Bộ Đặc Sắc"
        subtitle="Hấp dẫn từng tập với cốt truyện lôi cuốn"
        viewAllLink="/browse?type=series"
        movies={seriesMovies}
        isLoading={isSeriesLoading}
      />

      {actionMovies.length > 0 && (
        <MovieSection
          title="Phim Hành Động Kịch Tính"
          subtitle="Những pha hành động nghẹt thở và gay cấn"
          viewAllLink="/browse?category=hanh-dong"
          movies={actionMovies}
          isLoading={isActionLoading}
        />
      )}

      {animeMovies.length > 0 && (
        <MovieSection
          title="Hoạt Hình & Anime"
          subtitle="Thế giới hoạt hình đặc sắc đủ mọi thể loại"
          viewAllLink="/browse?type=hoat-hinh"
          movies={animeMovies}
          isLoading={isAnimeLoading}
        />
      )}
    </div>
  );
};
