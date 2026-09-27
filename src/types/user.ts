export interface User {
  id: number;
  email: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export type ThemeOption = 'system' | 'light' | 'dark';
export type LanguageOption = 'vi-VN' | 'en-US';

export interface UserSettings {
  theme: ThemeOption;
  language: LanguageOption;
  autoplay: boolean;
  updatedAt?: string;
}

export interface MeData {
  user: User;
  settings: UserSettings;
}

export interface UpdateProfileParams {
  displayName?: string;
  username?: string;
}

export interface UpdateSettingsParams {
  theme?: ThemeOption;
  language?: LanguageOption;
  autoplay?: boolean;
}
