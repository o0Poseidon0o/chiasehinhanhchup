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
 * Lấy Public URL chuẩn hóa cho Album
 * - Ưu tiên cấu hình VITE_APP_URL nếu có trong file .env hoặc Vercel Environment Variables.
 * - Tự động lấy window.location.origin tương thích 100% với tên miền Vercel demo cũng như tên miền riêng sau này.
 */
export const getPublicBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const envUrl = import.meta.env?.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }

  return window.location.origin.replace(/\/$/, '');
};

/**
 * Tạo nội dung tin nhắn chuẩn Studio để gửi nhanh cho khách qua Zalo / SMS / Messenger
 */
export const generateClientShareText = ({ clientName = '', albumTitle = 'Album ảnh', clientUrl = '', passcode = '' }) => {
  let msg = `📸 STUDIO GỬI LINK CHỌN ẢNH\n`;
  if (clientName && clientName.trim()) {
    msg += `Kính chào anh/chị ${clientName.trim()}!\n`;
  } else {
    msg += `Kính chào anh/chị!\n`;
  }
  msg += `Studio xin gửi link album ảnh "${albumTitle}":\n`;
  msg += `👉 Link chọn ảnh: ${clientUrl}\n`;
  if (passcode && passcode.trim()) {
    msg += `🔑 Mã PIN mở album: ${passcode.trim()}\n`;
  }
  msg += `\nAnh/chị truy cập link trên để chọn những tấm ảnh ưng ý nhất giúp Studio nhé! Trân trọng.`;
  return msg;
};

