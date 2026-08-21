import axios from 'axios';

const api = axios.create({
  baseURL: '/api/categories',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Helper lấy header Admin từ sessionStorage
const getAdminHeaders = () => {
  const adminPassword = sessionStorage.getItem('adminPassword') || 'admin123';
  return adminPassword ? { 'x-admin-password': adminPassword } : {};
};

const extractErrorMessage = (error, defaultMsg = 'Có lỗi xảy ra, vui lòng thử lại.') => {
  return error.response?.data?.message || error.message || defaultMsg;
};

export const categoryApi = {
  /**
   * Lấy danh sách thể loại chụp ảnh công khai
   */
  async getAll() {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.warn('Cannot fetch categories from server, using fallback:', error.message);
      return { success: false, data: [] };
    }
  },

  /**
   * Lấy chi tiết thể loại chụp
   */
  async getById(id) {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải thông tin thể loại chụp.'));
    }
  },

  /**
   * Tạo thể loại chụp ảnh mới (Master Admin)
   */
  async create(data) {
    try {
      const response = await api.post('/', data, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tạo thể loại chụp mới.'));
    }
  },

  /**
   * Cập nhật thể loại chụp ảnh (Master Admin)
   */
  async update(id, data) {
    try {
      const response = await api.put(`/${id}`, data, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể cập nhật thể loại chụp ảnh.'));
    }
  },

  /**
   * Xóa thể loại chụp ảnh (Master Admin)
   */
  async delete(id) {
    try {
      const response = await api.delete(`/${id}`, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể xóa thể loại chụp ảnh.'));
    }
  },

  /**
   * Khôi phục 6 thể loại chụp mặc định ban đầu (Master Admin)
   */
  async resetDefaults() {
    try {
      const response = await api.post('/reset', {}, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể khôi phục danh sách mặc định.'));
    }
  }
};
