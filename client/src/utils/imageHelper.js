/**
 * Utility xử lý và chuẩn hóa link ảnh đại diện (Avatar) và ảnh bìa:
 * 1. Tự động chuyển đổi link xem Google Drive (drive.google.com/file/d/ID/view...) sang link ảnh trực tiếp (lh3.googleusercontent.com/d/ID).
 * 2. Cung cấp avatar mặc định cao cấp nếu link rỗng hoặc bị lỗi.
 * 3. Bắt sự kiện onError để tự động thay thế ảnh hỏng bằng avatar dự phòng, không bao giờ để lộ icon ảnh vỡ.
 */

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
];

/**
 * Trả về link Avatar mặc định theo tên hoặc ảnh chân dung
 */
export const getDefaultAvatar = (name = '') => {
  if (name && typeof name === 'string' && name.trim()) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=181d2a&color=f59e0b&size=256&bold=true&font-size=0.42`;
  }
  return DEFAULT_AVATARS[0];
};

/**
 * Chuẩn hóa URL ảnh (Google Drive, Facebook hết hạn, etc.)
 */
export const formatAvatarUrl = (url = '', name = '') => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return getDefaultAvatar(name);
  }

  const trimmed = url.trim();

  // Tự động chuyển link Google Drive sang direct image link
  if (trimmed.includes('drive.google.com')) {
    const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  return trimmed;
};

/**
 * Hàm xử lý onError cho thẻ <img> để không bao giờ bị lỗi icon ảnh vỡ
 */
export const handleImageError = (e, name = '') => {
  if (!e || !e.currentTarget) return;
  e.currentTarget.onerror = null; // Chống lặp vô tận
  e.currentTarget.src = getDefaultAvatar(name);
};
