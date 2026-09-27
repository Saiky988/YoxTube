import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, Bookmark, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const navItems = [
    { label: 'Trang chủ', to: '/', icon: Home, end: true },
    { label: 'Khám phá', to: '/browse', icon: Compass },
    { label: 'Tìm kiếm', to: '/search', icon: Search },
    {
      label: 'Thư viện',
      to: isAuthenticated ? '/favorites' : '/login',
      icon: Bookmark,
    },
    {
      label: 'Tài khoản',
      to: isAuthenticated ? '/profile' : '/login',
      icon: UserIcon,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0c10]/95 backdrop-blur-lg border-t border-surface-border safe-pb"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors select-none',
                  isActive
                    ? 'text-brand-accent font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                )
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
