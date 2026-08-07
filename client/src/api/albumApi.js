import axios from 'axios';

const api = axios.create({
  baseURL: '/api/albums',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Helper xử lý thông điệp lỗi từ API
const extractErrorMessage = (error, defaultMsg = 'Có lỗi xảy ra, vui lòng thử lại.') => {
  return error.response?.data?.message || error.message || defaultMsg;
};

export const albumApi = {
  /**
   * Tạo Album mới
   */
  async create(data) {
    try {
      const response = await api.post('/', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tạo album. Vui lòng kiểm tra lại link Google Drive.'));
    }
  },

  /**
   * Lấy danh sách tất cả các Album (Admin Dashboard)
   */
  async getAll(search = '') {
    try {
      const response = await api.get('/', {
        params: search ? { search } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải danh sách album.'));
    }
  },

  /**
   * Lấy thông tin Album cho khách hàng xem & chọn ảnh
   */
  async getById(id, passcode = '') {
    try {
      const config = {};
      if (passcode) {
        config.headers = { 'x-passcode': passcode };
      }
      const response = await api.get(`/${id}`, config);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải album.'));
    }
  },

  /**
   * Xác thực mã PIN của album
   */
  async verifyPasscode(id, passcode) {
    try {
      const response = await api.post(`/${id}/verify-passcode`, { passcode });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Mã PIN không chính xác.'));
    }
  },

  /**
   * Gửi danh sách lựa chọn ảnh của khách
   */
  async submitSelection(id, payload) {
    try {
      const response = await api.post(`/${id}/submit`, payload);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể gửi danh sách chọn ảnh.'));
    }
  },

  /**
   * Lấy dữ liệu quản trị Album (Admin)
   */
  async getManageData(id, token) {
    try {
      const response = await api.get(`/${id}/manage`, {
        params: { token },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không có quyền truy cập trang quản lý này.'));
    }
  },

  /**
   * Khóa Album (Admin)
   */
  async lockAlbum(id, token) {
    try {
      const response = await api.put(`/${id}/lock`, null, {
        params: { token },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể khóa album.'));
    }
  },

  /**
   * Mở khóa Album (Admin)
   */
  async unlockAlbum(id, token) {
    try {
      const response = await api.put(`/${id}/unlock`, null, {
        params: { token },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể mở khóa album.'));
    }
  },

  /**
   * Xóa một Album để giải phóng bộ nhớ
   */
  async deleteAlbum(id, token = '') {
    try {
      const response = await api.delete(`/${id}`, {
        params: token ? { token } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể xóa album.'));
    }
  },

  /**
   * Xóa nhiều Album hàng loạt
   */
  async deleteBulk(ids = []) {
    try {
      const response = await api.post('/bulk-delete', { ids });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể xóa các album đã chọn.'));
    }
  },

  /**
   * Đồng bộ lại danh sách ảnh mới nhất từ Google Drive
   */
  async syncDrivePhotos(id, token = '') {
    try {
      const response = await api.post(`/${id}/sync`, null, {
        params: token ? { token } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể đồng bộ ảnh từ Google Drive. Vui lòng kiểm tra quyền chia sẻ thư mục.'));
    }
  }
};

export default albumApi;
