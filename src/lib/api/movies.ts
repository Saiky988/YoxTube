import { apiClient } from './client';
import { ApiResponse } from '@/types/api';
import {
  Country,
  FavoriteToggleData,
  Genre,
  MovieDetail,
  MovieFilterParams,
  MovieItem,
  WatchHistoryItem,
  WatchProgressPayload,
  YearItem
} from '@/types/movie';

export const moviesApi = {
  async getMovies(params: MovieFilterParams = {}): Promise<ApiResponse<MovieItem[]>> {
    return apiClient<ApiResponse<MovieItem[]>>('/api/movies', {
      method: 'GET',
      params: {
        page: params.page,
        limit: params.limit,
        type: params.type,
        status: params.status,
        category: params.category,
        country: params.country,
        year: params.year,
        sort_field: params.sort_field,
        sort_type: params.sort_type,
      },
    });
  },

  async searchMovies(keyword: string, page = 1, limit = 20): Promise<ApiResponse<MovieItem[]>> {
    return apiClient<ApiResponse<MovieItem[]>>('/api/movies/search', {
      method: 'GET',
      params: {
        keyword,
        page,
        limit,
      },
    });
  },

  async getMovieBySlug(slug: string): Promise<ApiResponse<MovieDetail>> {
    return apiClient<ApiResponse<MovieDetail>>(`/api/movies/${encodeURIComponent(slug)}`, {
      method: 'GET',
    });
  },

  async getGenres(): Promise<ApiResponse<Genre[]>> {
    return apiClient<ApiResponse<Genre[]>>('/api/genres', {
      method: 'GET',
    });
  },

  async getCountries(): Promise<ApiResponse<Country[]>> {
    return apiClient<ApiResponse<Country[]>>('/api/countries', {
      method: 'GET',
    });
  },

  async getYears(): Promise<ApiResponse<YearItem[]>> {
    return apiClient<ApiResponse<YearItem[]>>('/api/years', {
      method: 'GET',
    });
  },

  async toggleFavorite(movieId: number): Promise<ApiResponse<FavoriteToggleData>> {
    return apiClient<ApiResponse<FavoriteToggleData>>(`/api/movies/${movieId}/favorite`, {
      method: 'POST',
    });
  },

  async getFavorites(page = 1, limit = 24): Promise<ApiResponse<MovieItem[]>> {
    return apiClient<ApiResponse<MovieItem[]>>('/api/me/favorites', {
      method: 'GET',
      params: { page, limit },
    });
  },

  async saveWatchProgress(payload: WatchProgressPayload): Promise<ApiResponse<any>> {
    return apiClient<ApiResponse<any>>('/api/movies/watch-progress', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getWatchHistory(page = 1, limit = 24): Promise<ApiResponse<WatchHistoryItem[]>> {
    return apiClient<ApiResponse<WatchHistoryItem[]>>('/api/me/watch-history', {
      method: 'GET',
      params: { page, limit },
    });
  },

  async deleteWatchHistory(movieId: number): Promise<ApiResponse<any>> {
    return apiClient<ApiResponse<any>>(`/api/me/watch-history/${movieId}`, {
      method: 'DELETE',
    });
  },
};
