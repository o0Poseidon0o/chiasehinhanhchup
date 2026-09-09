import axios from 'axios';

const api = axios.create({
  baseURL: '/api/locations',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const getAdminHeaders = () => {
  const adminPassword = sessionStorage.getItem('adminPassword') || '';
  return adminPassword ? { 'x-admin-password': adminPassword } : {};
};

const extractErrorMessage = (error, defaultMsg = 'Có lỗi xảy ra, vui lòng thử lại.') => {
  return error.response?.data?.message || error.message || defaultMsg;
};

export const locationGuideApi = {
  /**
   * Lấy danh sách địa điểm (có thể lọc theo region)
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải danh sách địa điểm chụp ảnh.'));
    }
  },

  /**
   * Lấy chi tiết 1 địa điểm
   */
  async getById(id) {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải thông tin địa điểm này.'));
    }
  },

  /**
   * Tạo mới địa điểm (Admin)
   */
  async create(data) {
    try {
      const response = await api.post('/', data, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tạo địa điểm chụp ảnh mới.'));
    }
  },

  /**
   * Cập nhật thông tin địa điểm (Admin)
   */
  async update(id, data) {
    try {
      const response = await api.put(`/${id}`, data, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể cập nhật thông tin địa điểm.'));
    }
  },

  /**
   * Xóa địa điểm (Admin)
   */
  async delete(id) {
    try {
      const response = await api.delete(`/${id}`, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể xóa địa điểm này.'));
    }
  },

  /**
   * Khôi phục danh sách mẫu ban đầu (Admin)
   */
  async resetDefaults() {
    try {
      const response = await api.post('/reset', {}, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể khôi phục danh sách địa điểm mẫu.'));
    }
  }
};

export default locationGuideApi;
