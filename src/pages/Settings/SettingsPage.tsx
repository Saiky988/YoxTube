import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { ThemeOption, LanguageOption } from '@/types/user';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Laptop,
  Check,
  Globe,
  PlaySquare,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const SettingsPage: React.FC = () => {
  useDocumentTitle('Cài đặt');
  const { settings, setSettings } = useAuth();

  const [theme, setTheme] = useState<ThemeOption>(settings?.theme || 'system');
  const [language, setLanguage] = useState<LanguageOption>(settings?.language || 'vi-VN');
  const [autoplay, setAutoplay] = useState<boolean>(settings?.autoplay ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (
    newTheme = theme,
    newLang = language,
    newAutoplay = autoplay
  ) => {
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await authApi.updateSettings({
        theme: newTheme,
        language: newLang,
        autoplay: newAutoplay,
      });

      if (res.success && res.data?.settings) {
        setSettings(res.data.settings);
        setSuccessMsg('Đã lưu cấu hình cài đặt!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.message || 'Không thể lưu cài đặt');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
    { value: 'dark', label: 'Tối (Mặc định)', icon: <Moon className="w-4 h-4 text-brand-accent" /> },
    { value: 'light', label: 'Sáng', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { value: 'system', label: 'Theo hệ thống', icon: <Laptop className="w-4 h-4 text-gray-400" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-accent" />
          <span>Cài Đặt Ứng Dụng</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Tùy chỉnh giao diện hiển thị, ngôn ngữ và tùy chọn phát lại video của bạn
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
          <h2 className="text-sm font-bold text-white tracking-wide">
            Giao diện (Theme)
          </h2>
          <p className="text-xs text-gray-400">
            Chọn chủ đề hiển thị phù hợp. YoxTube được tối ưu hóa tốt nhất cho nền tối (Dark mode).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  handleSave(opt.value, language, autoplay);
                }}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold transition-all text-left select-none',
                  theme === opt.value
                    ? 'bg-surface-subtle border-brand-accent text-white shadow-md shadow-brand-accent/10'
                    : 'bg-surface-subtle/50 border-surface-border text-gray-300 hover:bg-surface-hover hover:border-surface-border-hover'
                )}
              >
                {opt.icon}
                <span className="flex-1">{opt.label}</span>
                {theme === opt.value && <Check className="w-4 h-4 text-brand-accent" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-accent" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Ngôn ngữ hiển thị (Language)
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Chọn ngôn ngữ cho giao diện người dùng và nội dung mô tả.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              { code: 'vi-VN' as LanguageOption, label: 'Tiếng Việt (vi-VN)' },
              { code: 'en-US' as LanguageOption, label: 'English (en-US)' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  handleSave(theme, lang.code, autoplay);
                }}
                className={cn(
                  'flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all select-none',
                  language === lang.code
                    ? 'bg-surface-subtle border-brand-accent text-white'
                    : 'bg-surface-subtle/50 border-surface-border text-gray-300 hover:bg-surface-hover'
                )}
              >
                <span>{lang.label}</span>
                {language === lang.code && <Check className="w-4 h-4 text-brand-accent" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <PlaySquare className="w-4 h-4 text-brand-accent" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Tùy chọn phát lại (Playback)
            </h2>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-semibold text-white">Tự động phát tập tiếp theo (Autoplay)</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tự động chuyển sang tập kế tiếp khi video hiện tại kết thúc
              </p>
            </div>

            <button
              onClick={() => {
                const nextVal = !autoplay;
                setAutoplay(nextVal);
                handleSave(theme, language, nextVal);
              }}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent',
                autoplay ? 'bg-brand-accent' : 'bg-gray-700'
              )}
              role="switch"
              aria-checked={autoplay}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                  autoplay ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => handleSave()}
            isLoading={isSaving}
            className="font-semibold"
          >
            Lưu tất cả thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};
