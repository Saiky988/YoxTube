import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { SearchBar } from '@/components/search/SearchBar';
import { UserDropdown } from '@/components/user/UserDropdown';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Search, Film, Home, Compass, Bookmark, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const Header: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileSearchActive, setMobileSearchActive] = useState(false);

  const navLinks = [
    { label: 'Trang chủ', to: '/', icon: Home },
    { label: 'Khám phá', to: '/browse', icon: Compass },
    { label: 'Phim lẻ', to: '/browse?type=single', icon: Film },
    { label: 'Phim bộ', to: '/browse?type=series', icon: Film },
    { label: 'Yêu thích', to: '/favorites', icon: Bookmark, authRequired: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0c10]/95 backdrop-blur-md border-b border-surface-border safe-pt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {mobileSearchActive ? (
          <div className="flex items-center w-full gap-2 py-2">
            <SearchBar
              autoFocus
              className="flex-1"
              onSearchSubmit={() => setMobileSearchActive(false)}
            />
            <button
              onClick={() => setMobileSearchActive(false)}
              className="p-2 text-gray-400 hover:text-white"
              aria-label="Đóng tìm kiếm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-8">
              <Logo size="md" />

              <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
                {navLinks.map((link) => {
                  if (link.authRequired && !isAuthenticated) return null;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          isActive
                            ? 'text-white bg-surface-subtle font-semibold border border-surface-border'
                            : 'text-gray-300 hover:text-white hover:bg-surface-subtle/60'
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-56 md:w-72 lg:w-80">
                <SearchBar />
              </div>

              <button
                onClick={() => setMobileSearchActive(true)}
                className="sm:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-surface-subtle transition-colors"
                aria-label="Tìm kiếm phim"
              >
                <Search className="w-5 h-5" />
              </button>

              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <UserDropdown />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link to="/login">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Đăng nhập
                        </Button>
                      </Link>
                      <Link to="/register" className="hidden sm:inline-block">
                        <Button variant="primary" size="sm" className="text-xs">
                          Đăng ký
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};
