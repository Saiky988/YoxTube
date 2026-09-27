import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { Avatar } from '@/components/user/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils/formatters';
import {
  User as UserIcon,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Mail
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    setIsUpdatingProfile(true);

    try {
      const res = await authApi.updateProfile({
        displayName: displayName.trim() || undefined,
        username: username.trim() || undefined,
      });

      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setProfileSuccessMsg('Cập nhật hồ sơ thành công!');
        setTimeout(() => setProfileSuccessMsg(null), 3500);
      } else {
        setProfileErrorMsg(res.message || 'Không thể cập nhật hồ sơ');
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarErrorMsg('Dung lượng ảnh không được vượt quá 2MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarErrorMsg('Định dạng ảnh không hợp lệ. Vui lòng chọn JPG, PNG hoặc WebP.');
      return;
    }

    setAvatarErrorMsg(null);
    setIsUploadingAvatar(true);

    try {
      const res = await authApi.uploadAvatar(file);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setAvatarErrorMsg(res.message || 'Upload ảnh đại diện thất bại');
      }
    } catch (err: any) {
      setAvatarErrorMsg(err?.message || 'Lỗi khi tải ảnh đại diện lên máy chủ');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user.avatarUrl) return;
    if (!window.confirm('Bạn có chắc muốn xóa ảnh đại diện hiện tại?')) return;

    setAvatarErrorMsg(null);
    setIsUploadingAvatar(true);

    try {
      const res = await authApi.deleteAvatar();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err: any) {
      setAvatarErrorMsg(err?.message || 'Lỗi khi xóa ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-brand-accent" />
          <span>Hồ Sơ Cá Nhân</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Quản lý thông tin tài khoản và hình ảnh đại diện của bạn trên YoxTube
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <Avatar
              src={user.avatarUrl}
              name={user.displayName || user.username}
              size="xl"
              className="border-2 border-surface-border shadow-xl"
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-white">
              {user.displayName || user.username}
            </h2>
            <p className="text-xs text-gray-400">@{user.username}</p>
          </div>

          {avatarErrorMsg && (
            <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {avatarErrorMsg}
            </p>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <div className="flex flex-col w-full gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploadingAvatar}
              className="w-full gap-2 text-xs"
            >
              <Upload className="w-3.5 h-3.5 text-brand-accent" />
              <span>Đổi ảnh đại diện</span>
            </Button>

            {user.avatarUrl && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteAvatar}
                disabled={isUploadingAvatar}
                className="w-full gap-2 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ảnh</span>
              </Button>
            )}
          </div>

          <p className="text-[11px] text-gray-500">
            Hỗ trợ PNG, JPG, WebP tối đa 2MB
          </p>
        </div>

        <div className="md:col-span-2 p-6 rounded-2xl bg-surface border border-surface-border space-y-6">
          <h2 className="text-base font-bold text-white tracking-wide border-b border-surface-border pb-3">
            Thông tin tài khoản
          </h2>

          {profileSuccessMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Tên hiển thị"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nhập tên hiển thị"
            />

            <Input
              label="Tên người dùng (Username)"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
            />

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Địa chỉ Email
              </label>
              <div className="flex items-center gap-2 h-11 px-3.5 bg-surface-subtle/50 border border-surface-border rounded-lg text-xs text-gray-400">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{user.email}</span>
                {user.isVerified && (
                  <span className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Đã xác minh
                  </span>
                )}
              </div>
            </div>

            {user.createdAt && (
              <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Tham gia ngày: {formatDate(user.createdAt)}</span>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUpdatingProfile}
                className="font-semibold"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
