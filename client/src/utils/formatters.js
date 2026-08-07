/**
 * Định dạng thời gian theo chuẩn tiếng Việt
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Trích xuất tên file không kèm phần mở rộng (.jpg, .png...)
 * @param {string} fileName 
 * @returns {string}
 */
export const cleanFileName = (fileName) => {
  if (!fileName) return '';
  const parts = fileName.split('.');
  if (parts.length > 1) {
    return parts.slice(0, -1).join('.');
  }
  return fileName;
};

/**
 * Lấy Public URL chuẩn hóa (tự động loại bỏ suffix team/preview Vercel để link luôn công khai, không bắt đăng nhập)
 */
export const getPublicBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;

  // Loại bỏ các suffix team / preview như -lenhans-projects.vercel.app -> .vercel.app
  // Ví dụ: https://chiasehinhanhchup-lenhans-projects.vercel.app -> https://chiasehinhanhchup.vercel.app
  origin = origin.replace(/-[a-zA-Z0-9_-]+-projects\.vercel\.app$/i, '.vercel.app');
  origin = origin.replace(/-git-[a-zA-Z0-9_-]+\.vercel\.app$/i, '.vercel.app');
  
  return origin;
};
