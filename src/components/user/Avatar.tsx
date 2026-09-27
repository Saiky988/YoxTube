import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const getInitials = (text?: string | null) => {
    if (!text) return 'Y';
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  if (src && !imageError) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden shrink-0 border border-surface-border bg-surface-subtle',
          sizeClasses[size],
          className
        )}
      >
        <img
          src={src}
          alt={name || 'Avatar người dùng'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-full shrink-0 flex items-center justify-center bg-brand-accent/20 border border-brand-accent/40 text-brand-accent select-none',
        sizeClasses[size],
        className
      )}
    >
      {name ? getInitials(name) : <UserIcon className="w-1/2 h-1/2" />}
    </div>
  );
};
