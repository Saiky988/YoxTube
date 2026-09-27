import { User } from './user';

export interface LoginParams {
  identifier: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}

export interface GoogleAuthParams {
  credential: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
