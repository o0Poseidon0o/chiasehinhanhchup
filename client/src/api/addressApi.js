import axios from 'axios';

const api = axios.create({
  baseURL: '/api/address',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const addressApi = {
  /**
   * Lấy danh sách toàn bộ Tỉnh / Thành phố từ database nội bộ
   */
  async getProvinces() {
    try {
      const response = await api.get('/provinces');
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy danh sách tỉnh thành:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Lấy danh sách Phường / Xã theo provinceId từ database nội bộ
   */
  async getWards(provinceId) {
    if (!provinceId) return { success: true, data: [] };
    try {
      const response = await api.get(`/wards/${provinceId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi lấy danh sách phường xã cho tỉnh ${provinceId}:`, error);
      return { success: false, data: [] };
    }
  },

  /**
   * Tìm kiếm nhanh địa chỉ theo từ khóa
   */
  async search(keyword) {
    if (!keyword) return { success: true, data: { provinces: [], wards: [] } };
    try {
      const response = await api.get('/search', { params: { q: keyword } });
      return response.data;
    } catch (error) {
      console.error('Lỗi tìm kiếm địa chỉ:', error);
      return { success: false, data: { provinces: [], wards: [] } };
    }
  }
};

export default addressApi;
