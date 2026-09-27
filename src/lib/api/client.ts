import { ApiError } from '@/types/api';
import { getStoredToken, removeStoredToken } from '@/lib/storage/token';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.yoxtube.xyz').replace(/\/+$/, '');

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

type AuthCallback = () => void;
const unauthorizedListeners: Set<AuthCallback> = new Set();

export const onUnauthorized = (cb: AuthCallback): (() => void) => {
  unauthorizedListeners.add(cb);
  return () => unauthorizedListeners.delete(cb);
};

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, body, ...restOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const query = searchParams.toString();
    if (query) {
      url += (url.includes('?') ? '&' : '?') + query;
    }
  }

  const token = getStoredToken();
  const headers = new Headers(customHeaders);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type') && body) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      body,
      headers,
      credentials: 'omit',
    });

    if (response.status === 401) {
      removeStoredToken();
      unauthorizedListeners.forEach((cb) => cb());
    }

    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.message ||
        responseData?.error?.message ||
        `Yêu cầu thất bại với mã lỗi HTTP ${response.status}`;
      throw new ApiError(errorMessage, response.status);
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message || 'Lỗi kết nối mạng, vui lòng thử lại.');
    }
    throw new ApiError('Lỗi không xác định khi kết nối với máy chủ.');
  }
}
