import axios from 'axios';

const api = axios.create({
  baseURL: '/api/photographer',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Helper lấy ID người dùng hiện tại
const getPhotographerHeaders = () => {
  try {
    const raw = sessionStorage.getItem('userData');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?._id) {
        return { 'x-user-id': user._id };
      }
    }
  } catch (_) {}
  return { 'x-user-id': 'master_admin' };
};

const extractErrorMessage = (error, defaultMsg = 'Có lỗi xảy ra, vui lòng thử lại.') => {
  return error.response?.data?.message || error.message || defaultMsg;
};

export const photographerApi = {
  /**
   * Lấy số liệu thống kê tổng quan của riêng Studio / Nhiếp ảnh gia
   */
  async getOverview() {
    try {
      const response = await api.get('/overview', {
        headers: getPhotographerHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải thống kê studio.'));
    }
  },

  /**
   * Lấy danh sách Album của riêng Nhiếp ảnh gia
   */
  async getAlbums(params = {}) {
    try {
      const response = await api.get('/albums', {
        params,
        headers: getPhotographerHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải kho album của bạn.'));
    }
  },

  /**
   * Lấy danh sách Khách Hàng của riêng Nhiếp ảnh gia (CRM)
   */
  async getClients(params = {}) {
    try {
      const response = await api.get('/clients', {
        params,
        headers: getPhotographerHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải danh sách khách hàng.'));
    }
  },

  /**
   * Lấy danh sách Lịch Booking của riêng Nhiếp ảnh gia
   */
  async getBookings(params = {}) {
    try {
      const response = await api.get('/bookings', {
        params,
        headers: getPhotographerHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể tải lịch booking của bạn.'));
    }
  },

  /**
   * Cập nhật trạng thái lịch booking
   */
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, { status }, {
        headers: getPhotographerHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể cập nhật trạng thái booking.'));
    }
  },

  /**
   * Cập nhật toàn bộ thông tin chi tiết lịch booking
   */
  async updateBooking(bookingId, data) {
    try {
      const response = await api.put(`/bookings/${bookingId}`, data, {
        headers: getPhotographerHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể cập nhật thông tin booking.'));
    }
  },

  /**
   * Xóa lịch booking
   */
  async deleteBooking(bookingId) {
    try {
      const response = await api.delete(`/bookings/${bookingId}`, {
        headers: getPhotographerHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể xóa lịch booking.'));
    }
  },

  /**
   * Khách hàng gửi yêu cầu đặt lịch booking mới
   */
  async createBooking(data) {
    try {
      const response = await api.post('/bookings', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Gửi yêu cầu đặt lịch không thành công.'));
    }
  }
};

export default photographerApi;
