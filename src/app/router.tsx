import React from 'react';
import { createBrowserRouter, Navigate, useLocation, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/Home/HomePage';
import { BrowsePage } from '@/pages/Browse/BrowsePage';
import { SearchPage } from '@/pages/Search/SearchPage';
import { MovieDetailPage } from '@/pages/Movie/MovieDetailPage';
import { WatchPage } from '@/pages/Watch/WatchPage';
import { LoginPage } from '@/pages/Login/LoginPage';
import { RegisterPage } from '@/pages/Register/RegisterPage';
import { FavoritesPage } from '@/pages/Favorites/FavoritesPage';
import { HistoryPage } from '@/pages/History/HistoryPage';
import { ProfilePage } from '@/pages/Profile/ProfilePage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent mb-2" />
        <span className="text-xs text-gray-400">Đang kiểm tra phiên đăng nhập...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-brand-accent border border-surface-border">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">404 - Không tìm thấy trang</h1>
      <p className="text-xs text-gray-400 max-w-sm">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn khác.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Về trang chủ YoxTube
        </Button>
      </Link>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'browse',
        element: <BrowsePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'movie/:slug',
        element: <MovieDetailPage />,
      },
      {
        path: 'watch/:slug',
        element: <WatchPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
