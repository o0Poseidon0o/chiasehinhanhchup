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
 * Lấy Public URL chuẩn hóa (loại bỏ hash preview của Vercel để khách không bị bắt login)
 */
export const getPublicBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  
  // project-commitHash-team.vercel.app -> project-team.vercel.app
  const previewRegex = /^https:\/\/([a-zA-Z0-9_-]+)-[a-zA-Z0-9]{8,12}-([a-zA-Z0-9_-]+)\.vercel\.app$/;
  if (previewRegex.test(origin)) {
    return origin.replace(previewRegex, 'https://$1-$2.vercel.app');
  }

  // project-git-branch-team.vercel.app -> project-team.vercel.app
  const gitBranchRegex = /^https:\/\/([a-zA-Z0-9_-]+)-git-[a-zA-Z0-9_-]+-([a-zA-Z0-9_-]+)\.vercel\.app$/;
  if (gitBranchRegex.test(origin)) {
    return origin.replace(gitBranchRegex, 'https://$1-$2.vercel.app');
  }

  return origin;
};
