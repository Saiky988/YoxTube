import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-surface-border bg-[#0b0c10] text-gray-400 text-xs py-10 mt-16 pb-24 md:pb-12 safe-pb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 space-y-3">
            <Logo size="md" />
            <p className="text-gray-400 text-xs leading-relaxed">
              Trải nghiệm điện ảnh đỉnh cao với kho phim phong phú, cập nhật liên tục, tốc độ truyền tải mượt mà.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white tracking-wide">Danh Mục</h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/browse?type=single" className="hover:text-white transition-colors">
                  Phim lẻ mới nhất
                </Link>
              </li>
              <li>
                <Link to="/browse?type=series" className="hover:text-white transition-colors">
                  Phim bộ thịnh hành
                </Link>
              </li>
              <li>
                <Link to="/browse?type=hoat-hinh" className="hover:text-white transition-colors">
                  Hoạt hình / Anime
                </Link>
              </li>
              <li>
                <Link to="/browse?type=tv-shows" className="hover:text-white transition-colors">
                  Chương trình TV
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white tracking-wide">Quốc Gia</h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/browse?country=han-quoc" className="hover:text-white transition-colors">
                  Phim Hàn Quốc
                </Link>
              </li>
              <li>
                <Link to="/browse?country=trung-quoc" className="hover:text-white transition-colors">
                  Phim Trung Quốc
                </Link>
              </li>
              <li>
                <Link to="/browse?country=au-my" className="hover:text-white transition-colors">
                  Phim Âu Mỹ
                </Link>
              </li>
              <li>
                <Link to="/browse?country=nhat-ban" className="hover:text-white transition-colors">
                  Phim Nhật Bản
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white tracking-wide">Về YoxTube</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tất cả nội dung đều được tổng hợp tự động từ các nguồn truyền thông mở trên internet. YoxTube không lưu trữ bất kỳ tệp video nào trên máy chủ của mình.
            </p>
            <div className="pt-2 text-[11px] text-gray-500">
              Phiên bản Web & PWA v2.0
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>© 2026 YoxTube. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/browse" className="hover:text-gray-300">Khám phá</Link>
            <Link to="/search" className="hover:text-gray-300">Tìm kiếm</Link>
            <Link to="/settings" className="hover:text-gray-300">Cài đặt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
