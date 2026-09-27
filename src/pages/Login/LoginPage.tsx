import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { Mail, Lock, AlertCircle } from 'lucide-react';

import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const LoginPage: React.FC = () => {
  useDocumentTitle('Đăng nhập');
  const { setAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.login({
        identifier: identifier.trim(),
        password,
      });

      if (res.token && res.user) {
        setAuth(res.token, res.user);
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập không thành công, vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-surface-border p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Đăng Nhập</h1>
          <p className="text-xs text-gray-400">
            Truy cập thư viện phim, đồng bộ lịch sử xem và danh sách yêu thích
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email hoặc Tên người dùng"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Nhập email hoặc tên tài khoản"
            leftIcon={<Mail className="w-4 h-4" />}
          />

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
            className="w-full font-semibold"
            isLoading={isLoading}
          >
            Đăng nhập
          </Button>
        </form>

        <div className="space-y-4 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-surface-border w-full" />
            <span className="bg-surface px-3 text-[11px] text-gray-500 uppercase tracking-wider shrink-0">
              Hoặc
            </span>
            <div className="border-t border-surface-border w-full" />
          </div>

          <GoogleSignInButton
            text="Đăng nhập bằng Google"
            onSuccess={() => navigate(from, { replace: true })}
            onError={(errMsg) => setError(errMsg)}
          />
        </div>

        <div className="text-center text-xs text-gray-400 pt-2 border-t border-surface-border">
          Chưa có tài khoản YoxTube?{' '}
          <Link to="/register" className="font-semibold text-brand-accent hover:underline">
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </div>
  );
};
