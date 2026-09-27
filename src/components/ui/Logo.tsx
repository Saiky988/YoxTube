import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 font-bold tracking-tight select-none group transition-opacity hover:opacity-95 ${className}`}
      aria-label="YoxTube Home"
    >
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg overflow-hidden ${sizeClasses[size]}`}>
        <img
          src="/assets/apple-touch-icon.png"
          alt="YoxTube Icon"
          className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <span className={`font-extrabold tracking-tight text-white flex items-center leading-none ${textClasses[size]}`}>
          <span>Yox</span>
          <span className="text-brand-accent">Tube</span>
        </span>
      )}
    </Link>
  );
};
