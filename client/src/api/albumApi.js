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

// Helper lấy header Admin từ sessionStorage
const getAdminHeaders = () => {
  const adminPassword = sessionStorage.getItem('adminPassword') || '';
  return adminPassword ? { 'x-admin-password': adminPassword } : {};
};

export const albumApi = {
  /**
   * Xác thực mật khẩu Admin
   */
  async adminLogin(adminPassword) {
    try {
      const response = await api.post('/admin/login', { adminPassword });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Mật khẩu Admin không chính xác.'));
    }
  },

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
   * Lấy danh sách các Album công khai (Dành cho trang cá nhân Nhiếp ảnh gia, không cần pass Admin)
   */
  async getPublicAlbums(photographerId = '') {
    try {
      const response = await api.get('/public', {
        params: photographerId ? { photographerId } : {}
      });
      return response.data;
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  /**
   * Quét và trích xuất danh sách ảnh từ link Google Drive bất kỳ
   */
  async parseDriveFolder(url) {
    try {
      const response = await api.post('/parse-drive', { url });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể quét ảnh từ Google Drive.'));
    }
  },

  /**
   * Lấy danh sách tất cả các Album (Admin Dashboard)
   */
  async getAll(search = '') {
    try {
      const response = await api.get('/', {
        params: search ? { search } : {},
        headers: getAdminHeaders()
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
      const response = await api.put(`/${id}/lock`, {}, {
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
      const response = await api.put(`/${id}/unlock`, {}, {
        params: { token },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể mở khóa album.'));
    }
  },

  /**
   * Cập nhật Cài đặt Album (maxSelect, allowDownload, allowComment, passcode, title, status)
   */
  async updateSettings(id, token, data) {
    try {
      const response = await api.put(`/${id}/settings`, data, {
        params: token ? { token } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể cập nhật cài đặt album.'));
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
      const response = await api.post('/bulk-delete', { ids }, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể xóa các album đã chọn.'));
    }
  },

  /**
   * Đồng bộ lại danh sách ảnh mới nhất từ Google Drive cho 1 album
   */
  async syncDrivePhotos(id, token = '') {
    try {
      const response = await api.post(`/${id}/sync`, {}, {
        params: token ? { token } : {},
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể đồng bộ ảnh từ Google Drive. Vui lòng kiểm tra quyền chia sẻ thư mục.'));
    }
  },

  /**
   * Tự động đồng bộ toàn bộ tất cả album đang hoạt động
   */
  async syncAll() {
    try {
      const response = await api.post('/sync-all', {}, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể đồng bộ toàn bộ album.'));
    }
  }
};

export default albumApi;
