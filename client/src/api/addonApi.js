import axios from 'axios';

const api = axios.create({
  baseURL: '/api/addons',
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

// Mặc định dự phòng nếu server tạm thời không phản hồi
export const FALLBACK_ADDONS = [
  {
    id: 'makeup',
    name: 'Makeup & Làm Tóc Chuyên Nghiệp',
    price: 350000,
    priceDisplay: '+ 350.000đ',
    unit: 'lần',
    description: 'Trang điểm tự nhiên, phong cách Hàn Quốc/Lookbook & làm tóc đi kèm',
    icon: 'Scissors',
    badge: '🔥 Phổ biến',
    isActive: true,
    isRecommended: true,
    order: 1
  },
  {
    id: 'costume',
    name: 'Cho Thuê Trang Phục / Áo Dài / Concept',
    price: 250000,
    priceDisplay: '+ 250.000đ',
    unit: 'bộ',
    description: 'Bao gồm phụ kiện đi kèm, nhiều kích cỡ từ Vintage, Cổ phục đến Hiện đại',
    icon: 'Shirt',
    badge: 'Được yêu thích',
    isActive: true,
    isRecommended: false,
    order: 2
  },
  {
    id: 'fast_delivery',
    name: 'Giao Ảnh Hậu Kỳ Nhanh Trong 24h',
    price: 200000,
    priceDisplay: '+ 200.000đ',
    unit: 'gói',
    description: 'Nhận toàn bộ ảnh chọn chỉnh màu đẹp lung linh ngay trong 24 giờ',
    icon: 'Zap',
    badge: '⚡ Nhanh 24h',
    isActive: true,
    isRecommended: false,
    order: 3
  },
  {
    id: 'photobook',
    name: 'In Photobook / Ảnh Ép Gỗ Cao Cấp',
    price: 450000,
    priceDisplay: '+ 450.000đ',
    unit: 'cuốn',
    description: 'Album ảnh photobook bìa cứng hoặc 1 ảnh ép gỗ trang trí để bàn',
    icon: 'BookOpen',
    badge: '✨ Cao cấp',
    isActive: true,
    isRecommended: false,
    order: 4
  }
];

export const addonApi = {
  /**
   * Lấy danh sách toàn bộ dịch vụ đi kèm (cho Master Admin)
   */
  async getAll() {
    try {
      const response = await api.get('/?all=true', {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      console.warn('Cannot fetch all addons from server, using fallback:', error.message);
      return { success: false, data: FALLBACK_ADDONS };
    }
  },

  /**
   * Lấy danh sách các dịch vụ đang mở bán (Active) cho khách hàng
   */
  async getActive() {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.warn('Cannot fetch active addons from server, using fallback:', error.message);
      return { success: false, data: FALLBACK_ADDONS.filter(a => a.isActive) };
    }
  },

  /**
   * Lấy chi tiết dịch vụ theo ID
   */
  async getById(id) {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải thông tin dịch vụ đi kèm.'));
    }
  },

  /**
   * Tạo dịch vụ mới (Master Admin)
   */
  async create(data) {
    try {
      const response = await api.post('/', data, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tạo dịch vụ mới.'));
    }
  },

  /**
   * Cập nhật dịch vụ (Master Admin)
   */
  async update(id, data) {
    try {
      const response = await api.put(`/${id}`, data, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể cập nhật dịch vụ.'));
    }
  },

  /**
   * Bật/Tắt trạng thái mở bán tức thì (Master Admin)
   */
  async toggleActive(id) {
    try {
      const response = await api.patch(`/${id}/toggle`, {}, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể thay đổi trạng thái dịch vụ.'));
    }
  },

  /**
   * Xóa dịch vụ (Master Admin)
   */
  async delete(id) {
    try {
      const response = await api.delete(`/${id}`, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể xóa dịch vụ.'));
    }
  },

  /**
   * Khôi phục bảng dịch vụ mặc định (Master Admin)
   */
  async resetDefaults() {
    try {
      const response = await api.post('/reset', {}, {
        headers: getAdminHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể khôi phục dịch vụ mặc định.'));
    }
  }
};
