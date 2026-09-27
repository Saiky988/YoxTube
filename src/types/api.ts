export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  error?: {
    code: number;
    message: string;
  };
}

export class ApiError extends Error {
  code: number;
  constructor(message: string, code: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}
