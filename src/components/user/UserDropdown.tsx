import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from './Avatar';
import {
  Bookmark,
  Clock,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';

export const UserDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-surface-subtle hover:bg-surface-hover border border-surface-border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
        aria-expanded={isOpen}
        aria-label="Menu tài khoản"
      >
        <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="sm" />
        <span className="text-xs font-medium text-gray-200 hidden md:inline-block max-w-[120px] truncate">
          {user.displayName || user.username}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-surface-border shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 border-b border-surface-border mb-1">
            <p className="text-sm font-semibold text-white truncate">
              {user.displayName || user.username}
            </p>
            <p className="text-xs text-gray-400 truncate">@{user.username}</p>
          </div>

          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-200 hover:bg-surface-subtle hover:text-white transition-colors"
          >
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span>Hồ sơ cá nhân</span>
          </Link>

          <Link
            to="/favorites"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-200 hover:bg-surface-subtle hover:text-white transition-colors"
          >
            <Bookmark className="w-4 h-4 text-gray-400" />
            <span>Phim yêu thích</span>
          </Link>

          <Link
            to="/history"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-200 hover:bg-surface-subtle hover:text-white transition-colors"
          >
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Lịch sử xem</span>
          </Link>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-200 hover:bg-surface-subtle hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>Cài đặt</span>
          </Link>

          <div className="my-1 border-t border-surface-border" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};
