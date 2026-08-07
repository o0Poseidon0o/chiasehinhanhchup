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
