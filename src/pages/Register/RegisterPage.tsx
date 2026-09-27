import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { setAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.register({
        email: email.trim(),
        password,
        username: username.trim() || undefined,
        displayName: displayName.trim() || undefined,
      });

      if (res.token && res.user) {
        setAuth(res.token, res.user);
        navigate('/', { replace: true });
      } else {
        setError(res.message || 'Đăng ký không thành công.');
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra trong quá trình đăng ký tài khoản.');
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Tạo Tài Khoản</h1>
          <p className="text-xs text-gray-400">
            Trải nghiệm toàn bộ tiện ích xem phim điện ảnh chất lượng cao
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
            placeholder="Ví dụ: Nguyễn Văn A"
            leftIcon={<UserIcon className="w-4 h-4" />}
          />

          <Input
            label="Tên người dùng (Tùy chọn)"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ví dụ: username_123"
            leftIcon={<UserIcon className="w-4 h-4" />}
          />

          <Input
            label="Mật khẩu (Tối thiểu 6 ký tự)"
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
            className="w-full font-semibold mt-2"
            isLoading={isLoading}
          >
            Đăng ký tài khoản
          </Button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2 border-t border-surface-border">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-brand-accent hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
