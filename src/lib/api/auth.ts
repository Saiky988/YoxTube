import { apiClient } from './client';
import {
  AuthResponse,
  GoogleAuthParams,
  LoginParams,
  RegisterParams
} from '@/types/auth';
import {
  MeData,
  UpdateProfileParams,
  UpdateSettingsParams,
  User,
  UserSettings
} from '@/types/user';
import { ApiResponse } from '@/types/api';

export const authApi = {
  async register(params: RegisterParams): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async login(params: LoginParams): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async loginWithGoogle(params: GoogleAuthParams): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getMe(): Promise<ApiResponse<MeData>> {
    return apiClient<ApiResponse<MeData>>('/api/auth/me', {
      method: 'GET',
    });
  },

  async updateProfile(params: UpdateProfileParams): Promise<ApiResponse<{ user: User }>> {
    return apiClient<ApiResponse<{ user: User }>>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  },

  async updateSettings(params: UpdateSettingsParams): Promise<ApiResponse<{ settings: UserSettings }>> {
    return apiClient<ApiResponse<{ settings: UserSettings }>>('/api/auth/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string; user: User }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiClient<ApiResponse<{ avatarUrl: string; user: User }>>('/api/auth/me/avatar', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteAvatar(): Promise<ApiResponse<{ avatarUrl: null; user: User }>> {
    return apiClient<ApiResponse<{ avatarUrl: null; user: User }>>('/api/auth/me/avatar', {
      method: 'DELETE',
    });
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiClient<ApiResponse<void>>('/api/auth/logout', {
      method: 'POST',
    });
  },
};
