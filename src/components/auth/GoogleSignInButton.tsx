import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  text?: string;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = 'Đăng nhập bằng Google',
  onSuccess,
  onError,
  className = '',
}) => {
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '238086181189-l4tfj0akn1crofdjlmr508ai8955lsmo.apps.googleusercontent.com';

  useEffect(() => {
    if (!clientId) return;

    let isMounted = true;

    const handleGoogleCallback = async (response: any) => {
      if (!response?.credential) return;

      setIsLoading(true);
      try {
        const authRes = await authApi.loginWithGoogle({ credential: response.credential });
        if (!isMounted) return;

        if (authRes.token && authRes.user) {
          setAuth(authRes.token, authRes.user);
          onSuccess?.();
        } else {
          onError?.(authRes.message || 'Đăng nhập Google thất bại');
        }
      } catch (err: any) {
        if (!isMounted) return;
        onError?.(err?.message || 'Lỗi khi xác thực tài khoản Google');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const renderGsiButton = () => {
      if (!(window as any).google?.accounts?.id || !containerRef.current) {
        return false;
      }

      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Xóa nội dung cũ nếu re-render
        containerRef.current.innerHTML = '';

        (window as any).google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 380,
          text: 'continue_with',
        });

        return true;
      } catch (e) {
        console.error('Failed to render Google Sign-In button', e);
        return false;
      }
    };

    // Kiểm tra xem SDK đã sẵn sàng chưa, nếu chưa thì poll ngắn
    if (!renderGsiButton()) {
      const interval = setInterval(() => {
        if (renderGsiButton()) {
          clearInterval(interval);
        }
      }, 150);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 5000);

      return () => {
        isMounted = false;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, setAuth, onSuccess, onError]);

  const handleWrapperClick = () => {
    if (isLoading) return;
    if (!(window as any).google?.accounts?.id) {
      onError?.('Đang kết nối đến Google Identity Services. Vui lòng thử lại sau giây lát.');
    }
  };

  return (
    <div
      onClick={handleWrapperClick}
      className={`relative w-full overflow-hidden rounded-xl group ${className}`}
    >
      {/* Nút giao diện trực quan chuẩn dark theme YoxTube */}
      <button
        type="button"
        disabled={isLoading}
        className="w-full h-11 px-4 rounded-xl flex items-center justify-center gap-3 bg-[#13151b] group-hover:bg-[#1a1d27] active:bg-[#202330] border border-white/10 group-hover:border-white/20 transition-all duration-200 text-sm font-medium text-white/90 group-hover:text-white shadow-sm pointer-events-none select-none"
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

      {/* Lớp phủ iframe Google Identity Services hoàn toàn trong suốt đè lên trên để bắt click */}
      <div
        ref={containerRef}
        className={`absolute inset-0 w-full h-full opacity-[0.001] overflow-hidden flex items-center justify-center cursor-pointer ${
          isLoading ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        style={{ transform: 'scale(1.25)', transformOrigin: 'center center' }}
        aria-hidden="true"
        title={text}
      />
    </div>
  );
};
