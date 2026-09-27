import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { useUIStore } from '@/stores/uiStore';
import { Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal } = useUIStore();
  const { setAuth } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = authModalMode === 'login';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  React.useEffect(() => {
    if (!googleClientId || !isAuthModalOpen) return;

    const handleGoogleCallback = async (response: any) => {
      if (response.credential) {
        setIsLoading(true);
        setError(null);
        try {
          const authRes = await authApi.loginWithGoogle({ credential: response.credential });
          if (authRes.token && authRes.user) {
            setAuth(authRes.token, authRes.user);
            handleClose();
          } else {
            setError(authRes.message || 'Đăng nhập Google thất bại');
          }
        } catch (err: any) {
          setError(err?.message || 'Lỗi khi xác thực Google');
        } finally {
          setIsLoading(false);
        }
      }
    };

    const renderBtn = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
        });
        const btnDiv = document.getElementById('googleModalSignInBtn');
        if (btnDiv) {
          btnDiv.innerHTML = '';
          (window as any).google.accounts.id.renderButton(btnDiv, {
            theme: 'filled_black',
            size: 'large',
            width: 280,
            text: isLogin ? 'signin_with' : 'signup_with',
          });
        }
      }
    };

    if (!(window as any).google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = renderBtn;
      document.body.appendChild(script);
    } else {
      setTimeout(renderBtn, 100);
    }
  }, [googleClientId, isAuthModalOpen, isLogin]);

  const resetForm = () => {
    setIdentifier('');
    setEmail('');
    setUsername('');
    setDisplayName('');
    setPassword('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!identifier.trim() || !password) {
          setError('Vui lòng nhập tài khoản và mật khẩu.');
          setIsLoading(false);
          return;
        }

        const res = await authApi.login({
          identifier: identifier.trim(),
          password,
        });

        if (res.token && res.user) {
          setAuth(res.token, res.user);
          handleClose();
        } else {
          setError(res.message || 'Đăng nhập không thành công.');
        }
      } else {
        if (!email.trim() || !password) {
          setError('Vui lòng nhập email và mật khẩu.');
          setIsLoading(false);
          return;
        }

        const res = await authApi.register({
          email: email.trim(),
          password,
          username: username.trim() || undefined,
          displayName: displayName.trim() || undefined,
        });

        if (res.token && res.user) {
          setAuth(res.token, res.user);
          handleClose();
        } else {
          setError(res.message || 'Đăng ký không thành công.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={handleClose}
      title={isLogin ? 'Đăng nhập YoxTube' : 'Đăng ký tài khoản'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isLogin ? (
          <Input
            label="Email hoặc Tên người dùng"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Nhập email hoặc username"
            leftIcon={<Mail className="w-4 h-4" />}
          />
        ) : (
          <>
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@yoxtube.xyz"
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Tên hiển thị (Tùy chọn)"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nguyễn Văn A"
              leftIcon={<UserIcon className="w-4 h-4" />}
            />
            <Input
              label="Tên người dùng (Tùy chọn)"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username_123"
              leftIcon={<UserIcon className="w-4 h-4" />}
            />
          </>
        )}

        <Input
          label="Mật khẩu"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
        </Button>

        {googleClientId && (
          <div className="space-y-3 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-gray-400">Hoặc tiếp tục với</span>
              </div>
            </div>
            <div id="googleModalSignInBtn" className="flex justify-center" />
          </div>
        )}

        <div className="text-center text-xs text-gray-400 pt-2">
          {isLogin ? (
            <span>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('register');
                }}
                className="font-semibold text-brand-accent hover:underline"
              >
                Đăng ký ngay
              </button>
            </span>
          ) : (
            <span>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal('login');
                }}
                className="font-semibold text-brand-accent hover:underline"
              >
                Đăng nhập
              </button>
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
};
