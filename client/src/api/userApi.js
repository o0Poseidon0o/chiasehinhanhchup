import axios from 'axios';

const api = axios.create({
  baseURL: '/api/users',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Helper lấy header Admin từ sessionStorage
const getAdminHeaders = () => {
  const adminPassword = sessionStorage.getItem('adminPassword') || '';
  return adminPassword ? { 'x-admin-password': adminPassword } : {};
};

const extractErrorMessage = (error, defaultMsg = 'Có lỗi xảy ra, vui lòng thử lại.') => {
  return error.response?.data?.message || error.message || defaultMsg;
};

export const userApi = {
  /**
   * Đăng ký tài khoản mới (Nhiếp ảnh gia hoặc Khách hàng)
   */
  async register(data) {
    try {
      const response = await api.post('/register', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Đăng ký không thành công.'));
    }
  },

  /**
   * Đăng nhập người dùng
   */
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Đăng nhập không thành công.'));
    }
  },

  /**
   * Lấy danh sách các Nhiếp ảnh gia đã được duyệt (Cho khách chọn chụp)
   */
  async getActivePhotographers() {
    try {
      const response = await api.get('/photographers');
      return response.data;
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  /**
   * Lấy danh sách tất cả người dùng (Admin)
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/', {
        params,
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải danh sách người dùng.'));
    }
  },

  /**
   * Lấy thống kê người dùng (Admin)
   */
  async getStats() {
    try {
      const response = await api.get('/stats', {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải thống kê người dùng.'));
    }
  },

  /**
   * Duyệt & Kích hoạt hồ sơ Nhiếp ảnh gia (Admin)
   */
  async approvePhotographer(id) {
    try {
      const response = await api.put(`/${id}/approve`, {}, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể phê duyệt hồ sơ.'));
    }
  },

  /**
   * Từ chối hồ sơ Nhiếp ảnh gia (Admin)
   */
  async rejectPhotographer(id, reason = '') {
    try {
      const response = await api.put(`/${id}/reject`, { reason }, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể từ chối hồ sơ.'));
    }
  },

  /**
   * Tạo User mới trực tiếp từ Admin
   */
  async createUser(data) {
    try {
      const response = await api.post('/', data, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tạo người dùng.'));
    }
  },

  /**
   * Cập nhật thông tin User (Admin)
   */
  async updateUser(id, data) {
    try {
      const response = await api.put(`/${id}`, data, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể cập nhật người dùng.'));
    }
  },

  /**
   * Nhiếp ảnh gia / Người dùng tự cập nhật Profile cá nhân
   */
  async updateProfile(id, data) {
    try {
      const response = await api.put(`/profile/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể lưu thông tin hồ sơ.'));
    }
  },

  /**
   * Xóa User
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/${id}`, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể xóa người dùng.'));
    }
  }
};

export default userApi;
