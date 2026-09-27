import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  text?: string;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  className?: string;
}

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '238086181189-l4tfj0akn1crofdjlmr508ai8955lsmo.apps.googleusercontent.com';

// Đảm bảo chỉ initialize GIS 1 lần duy nhất trên toàn app
let gsiInitialized = false;
let gsiCallbackRef: ((response: any) => void) | null = null;

function ensureGsiInitialized() {
  const g = (window as any).google;
  if (!g?.accounts?.id || gsiInitialized) return;

  g.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: any) => {
      // Gọi callback mới nhất (component hiện tại đang mount)
      gsiCallbackRef?.(response);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  gsiInitialized = true;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = 'Đăng nhập bằng Google',
  onSuccess,
  onError,
  className = '',
}) => {
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  // Callback xử lý khi Google trả về credential
  const handleCredential = useCallback(
    async (response: any) => {
      if (!response?.credential || !mountedRef.current) return;

      setIsLoading(true);
      try {
        const authRes = await authApi.loginWithGoogle({
          credential: response.credential,
        });
        if (!mountedRef.current) return;

        if (authRes.token && authRes.user) {
          setAuth(authRes.token, authRes.user);
          onSuccess?.();
        } else {
          onError?.(authRes.message || 'Đăng nhập Google thất bại');
        }
      } catch (err: any) {
        if (!mountedRef.current) return;
        onError?.(err?.message || 'Lỗi khi xác thực tài khoản Google');
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [setAuth, onSuccess, onError],
  );

  // Cập nhật callback ref mỗi khi handleCredential thay đổi
  useEffect(() => {
    gsiCallbackRef = handleCredential;
    return () => {
      if (gsiCallbackRef === handleCredential) {
        gsiCallbackRef = null;
      }
    };
  }, [handleCredential]);

  // Poll chờ GIS SDK sẵn sàng
  useEffect(() => {
    mountedRef.current = true;

    const check = () => {
      if ((window as any).google?.accounts?.id) {
        ensureGsiInitialized();
        return true;
      }
      return false;
    };

    if (!check()) {
      const interval = setInterval(() => {
        if (check()) clearInterval(interval);
      }, 200);

      const timeout = setTimeout(() => clearInterval(interval), 10000);

      return () => {
        mountedRef.current = false;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Khi click nút → mở Google Account Chooser popup
  const handleClick = () => {
    if (isLoading) return;

    const g = (window as any).google;
    if (!g?.accounts?.id) {
      // GIS chưa load — có thể bị ad-blocker chặn
      onError?.(
        'Không thể tải Google Sign-In. Kiểm tra kết nối mạng hoặc tắt trình chặn quảng cáo rồi thử lại.',
      );
      return;
    }

    ensureGsiInitialized();

    // Dùng prompt() để mở One Tap / Account Chooser
    g.accounts.id.prompt((notification: any) => {
      // Nếu prompt bị dismiss hoặc skip, không báo lỗi
      // Google sẽ gọi callback nếu user chọn tài khoản
      if (notification?.isSkippedMoment?.() || notification?.isDismissedMoment?.()) {
        // Prompt bị ẩn — fallback: mở popup OAuth2 thủ công
        openGoogleOAuthPopup();
      }
    });
  };

  // Fallback: mở popup OAuth2 authorization thủ công
  const openGoogleOAuthPopup = () => {
    const redirectUri = window.location.origin;
    const nonce = Math.random().toString(36).substring(2, 15);

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce,
      prompt: 'select_account',
    });

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      'google-auth',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`,
    );

    if (!popup) {
      onError?.('Popup bị chặn. Vui lòng cho phép popup từ trang này.');
      return;
    }

    // Lắng nghe redirect callback từ popup
    const checkInterval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkInterval);
          return;
        }

        // Khi popup redirect về origin, đọc hash fragment
        if (popup.location.origin === window.location.origin) {
          const hash = popup.location.hash;
          popup.close();
          clearInterval(checkInterval);

          if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const idToken = params.get('id_token');
            if (idToken) {
              handleCredential({ credential: idToken });
            }
          }
        }
      } catch {
        // Cross-origin — popup chưa redirect về, bỏ qua
      }
    }, 300);

    // Timeout sau 2 phút
    setTimeout(() => {
      clearInterval(checkInterval);
      if (popup && !popup.closed) popup.close();
    }, 120000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full h-11 px-4 rounded-xl flex items-center justify-center gap-3 bg-[#13151b] hover:bg-[#1a1d27] active:bg-[#202330] border border-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium text-white/90 hover:text-white shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
          <span className="text-gray-300">Đang xác thực Google...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{text}</span>
        </>
      )}
    </button>
  );
};
