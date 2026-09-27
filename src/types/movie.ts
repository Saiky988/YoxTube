export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Country {
  id: number;
  name: string;
  slug: string;
}

export interface YearItem {
  _id: string;
  name: string;
  slug: string;
  totalMovies?: number;
}

export interface VideoSource {
  id: number;
  quality: string;
  language: string;
  sourceType: 'embed' | 'm3u8' | 'mp4' | string;
  videoUrl: string;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface Episode {
  id: number;
  name: string;
  slug: string;
  filename?: string;
  sortOrder?: number;
  sources?: VideoSource[];
}

export interface MovieServer {
  id: number;
  name: string;
  provider?: string;
  sortOrder?: number;
  episodes: Episode[];
}

export interface MovieItem {
  id: number;
  title: string;
  originalTitle?: string;
  slug: string;
  thumbUrl?: string;
  posterUrl?: string;
  type: 'single' | 'series' | 'hoat-hinh' | 'tv-shows' | string;
  status?: 'completed' | 'ongoing' | 'trailer' | string;
  duration?: string;
  currentEpisode?: string;
  totalEpisodes?: string;
  quality?: string;
  language?: string;
  releaseYear?: number;
  viewCount?: number;
  isTheatrical?: boolean;
  isExclusiveSubtitle?: boolean;
  createdAt?: string;
  updatedAt?: string;
  genres?: Genre[];
  countries?: Country[];
}

export interface MovieDetail extends MovieItem {
  description?: string;
  trailerUrl?: string | null;
  notify?: string | null;
  showtimes?: string | null;
  tmdb?: {
    id: string;
    type?: string;
    season?: number;
    voteAverage?: string | number;
    voteCount?: number;
  };
  imdb?: {
    id: string;
  };
  actors?: string[];
  directors?: string[];
  keywords?: string[];
  servers: MovieServer[];
}

export interface WatchProgressPayload {
  movieId: number;
  episodeId?: number | null;
  progressSeconds: number;
  durationSeconds: number;
  completed?: boolean;
}

export interface WatchHistoryItem {
  historyId: number;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
  movie: {
    id: number;
    title: string;
    originalTitle?: string;
    slug: string;
    thumbUrl?: string;
    posterUrl?: string;
    type?: string;
    quality?: string;
    releaseYear?: number;
  };
  episode?: {
    id: number;
    name: string;
    slug: string;
    serverName?: string;
  };
}

export interface FavoriteToggleData {
  isFavorited: boolean;
  movieId: number;
  message?: string;
}

export interface MovieFilterParams {
  page?: number;
  limit?: number;
  type?: 'single' | 'series' | 'hoat-hinh' | 'tv-shows' | string;
  status?: 'completed' | 'ongoing' | 'trailer' | string;
  category?: string;
  country?: string;
  year?: string | number;
  sort_field?: 'created_at' | 'view_count' | 'release_year' | 'updated_at' | string;
  sort_type?: 'desc' | 'asc';
  keyword?: string;
}
