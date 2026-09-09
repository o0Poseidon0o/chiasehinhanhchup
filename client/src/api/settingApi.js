import axios from 'axios';

const api = axios.create({
  baseURL: '/api/settings',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

const getAdminHeaders = () => {
  const adminPassword = sessionStorage.getItem('adminPassword') || 'admin123';
  return adminPassword ? { 'x-admin-password': adminPassword } : {};
};

const extractErrorMessage = (error, defaultMsg = 'Có lỗi xảy ra, vui lòng thử lại.') => {
  return error.response?.data?.message || error.message || defaultMsg;
};

export const settingApi = {
  /**
   * Lấy cấu hình liên hệ công khai
   */
  async getContactSettings() {
    try {
      const response = await api.get('/contact');
      return response.data;
    } catch (error) {
      console.warn('Cannot fetch contact settings from server, using fallback:', error.message);
      return { 
        success: false, 
        data: {
          hotline: '0777908179',
          hotlineDisplay: '0777 908 179',
          hotlineHours: '8h - 22h hàng ngày',
          enableHotline: true,
          telegramUrl: 'https://t.me/photodate',
          telegramSubtext: 'Chat Telegram 24/7',
          enableTelegram: true,
          zaloUrl: 'https://zalo.me/0777908179',
          zaloSubtext: 'Phản hồi sau 1 phút',
          enableZalo: false,
          messengerUrl: 'https://m.me/photodate.vn',
          messengerSubtext: 'Hỗ trợ 24/7',
          enableMessenger: false,
          supportPillText: 'Tư vấn hỗ trợ',
          supportPillSubtext: 'Trả lời tức thì • 24/7',
          enableSupportPill: true
        } 
      };
    }
  },

  /**
   * Cập nhật cấu hình liên hệ (Dành cho Master Admin)
   */
  async updateContactSettings(data) {
    try {
      const response = await api.put('/contact', data, {
        headers: getAdminHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể cập nhật cấu hình liên hệ.'));
    }
  },

  /**
   * Kích hoạt nhanh toàn bộ tài khoản Nhiếp ảnh gia đang chờ duyệt (Master Admin)
   */
  async approveAllPendingPhotographers() {
    try {
      const response = await api.post('/approve-all-pending-photographers', {}, {
        headers: getAdminHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể kích hoạt tài khoản.'));
    }
  },

  /**
   * Lấy cấu hình Email Gmail / SMTP (Master Admin)
   */
  async getEmailSettings() {
    try {
      const response = await api.get('/email', {
        headers: getAdminHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải cấu hình Email.'));
    }
  },

  /**
   * Cập nhật cấu hình Email Gmail / SMTP (Master Admin)
   */
  async updateEmailSettings(data) {
    try {
      const response = await api.put('/email', data, {
        headers: getAdminHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể lưu cấu hình Email.'));
    }
  },

  /**
   * Gửi email thử nghiệm (Test Email Connection)
   */
  async testEmailSettings(testEmail) {
    try {
      const response = await api.post('/email/test', { testEmail }, {
        headers: getAdminHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Kiểm tra gửi email thất bại. Vui lòng kiểm tra lại Gmail hoặc Mật khẩu ứng dụng.'));
    }
  }
};
