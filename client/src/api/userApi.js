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
  },

  // =========================================================
  // HỆ THỐNG ĐÁNH GIÁ SAO & UY TÍN NHIẾP ẢNH GIA (REVIEWS & RATING)
  // =========================================================
  getStoredReviews() {
    try {
      const saved = localStorage.getItem('app_reviews_data');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    const seed = [
      {
        id: 'rev_1',
        photographerId: 'ph_default_1',
        clientName: 'Phương Thảo',
        bookingCode: 'BK-892102',
        isVerifiedBooking: true,
        rating: 5,
        comment: 'Nhiếp ảnh gia siêu nhiệt tình! Hướng dẫn tạo dáng từ A-Z, ảnh màu phim Cinematic mộng mơ xuất sắc. Trả ảnh nhanh đúng cam kết 24h.',
        createdAt: '2026-08-15T10:30:00Z',
        status: 'approved',
        photographerReply: {
          text: 'Cảm ơn Thảo rất nhiều vì buổi chụp tuyệt vời! Chúc bạn luôn xinh đẹp rạng rỡ nhé!',
          repliedAt: '2026-08-15T14:20:00Z'
        }
      },
      {
        id: 'rev_2',
        photographerId: 'ph_default_1',
        clientName: 'Anh Tuấn & Mai Trinh',
        bookingCode: 'BK-552910',
        isVerifiedBooking: true,
        rating: 5,
        comment: 'Bộ ảnh Pre-wedding đẹp vượt kỳ vọng. Thợ ảnh vui tính giúp 2 đứa bớt ngại trước ống kính.',
        createdAt: '2026-08-10T14:20:00Z',
        status: 'approved'
      },
      {
        id: 'rev_3',
        photographerId: 'ph_default_2',
        clientName: 'Khánh Linh',
        bookingCode: 'BK-102938',
        isVerifiedBooking: true,
        rating: 5,
        comment: 'Gói chụp Lookbook rất chuyên nghiệp, góc máy hiện đại, bắt kịp trend Korea.',
        createdAt: '2026-08-12T09:15:00Z',
        status: 'approved'
      }
    ];
    localStorage.setItem('app_reviews_data', JSON.stringify(seed));
    return seed;
  },

  async submitReview(data) {
    const reviews = this.getStoredReviews();
    const newReview = {
      id: `rev_${Date.now()}`,
      photographerId: String(data.photographerId || ''),
      clientName: data.clientName || 'Khách Hàng',
      bookingCode: data.bookingCode ? String(data.bookingCode).trim().toUpperCase() : '',
      isVerifiedBooking: Boolean(data.bookingCode && data.bookingCode.trim()),
      rating: Number(data.rating) || 5,
      comment: data.comment || '',
      createdAt: new Date().toISOString(),
      status: 'approved',
      photographerReply: null,
      isReported: false,
      reportReason: ''
    };
    const updated = [newReview, ...reviews];
    localStorage.setItem('app_reviews_data', JSON.stringify(updated));
    return { success: true, data: newReview };
  },

  async getPhotographerReviews(photographerId) {
    const reviews = this.getStoredReviews();
    const filtered = reviews.filter(r => (String(r.photographerId) === String(photographerId) || !photographerId) && r.status === 'approved');
    return { success: true, data: filtered };
  },

  async getAllReviewsAdmin() {
    const reviews = this.getStoredReviews();
    return { success: true, data: reviews };
  },

  async updateReviewStatus(reviewId, status) {
    const reviews = this.getStoredReviews();
    let updated;
    if (status === 'deleted') {
      updated = reviews.filter(r => r.id !== reviewId);
    } else {
      updated = reviews.map(r => r.id === reviewId ? { ...r, status, isReported: status === 'approved' ? false : r.isReported } : r);
    }
    localStorage.setItem('app_reviews_data', JSON.stringify(updated));
    return { success: true, data: updated };
  },

  async replyReview(reviewId, replyText) {
    const reviews = this.getStoredReviews();
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          photographerReply: {
            text: replyText.trim(),
            repliedAt: new Date().toISOString()
          }
        };
      }
      return r;
    });
    localStorage.setItem('app_reviews_data', JSON.stringify(updated));
    return { success: true, data: updated };
  },

  async reportReview(reviewId, reason) {
    const reviews = this.getStoredReviews();
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          isReported: true,
          reportReason: reason || 'Báo cáo sai sự thật / khiếu nại oan sai',
          status: 'disputed'
        };
      }
      return r;
    });
    localStorage.setItem('app_reviews_data', JSON.stringify(updated));
    return { success: true, data: updated };
  }
};

export default userApi;
