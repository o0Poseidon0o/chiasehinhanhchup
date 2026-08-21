const photographerService = require('../services/photographerService');
const { asyncHandler } = require('../middlewares/errorHandler');

// Helper lấy ID user từ header hoặc session
const getUserIdFromReq = (req) => {
  return req.headers['x-user-id'] || req.query.userId || req.body.userId || 'master_admin';
};

/**
 * @desc    Lấy thống kê tổng quan của riêng Nhiếp ảnh gia
 * @route   GET /api/photographer/overview
 * @access  Photographer / Admin
 */
const getOverview = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const overview = await photographerService.getPhotographerOverview(userId);
  res.status(200).json({
    success: true,
    data: overview
  });
});

/**
 * @desc    Lấy danh sách album của riêng Nhiếp ảnh gia
 * @route   GET /api/photographer/albums
 * @access  Photographer / Admin
 */
const getAlbums = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const albums = await photographerService.getPhotographerAlbums(userId, req.query);
  res.status(200).json({
    success: true,
    count: albums.length,
    data: albums
  });
});

/**
 * @desc    Lấy danh sách khách hàng của riêng Nhiếp ảnh gia (CRM)
 * @route   GET /api/photographer/clients
 * @access  Photographer / Admin
 */
const getClients = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const clients = await photographerService.getPhotographerClients(userId, req.query);
  res.status(200).json({
    success: true,
    count: clients.length,
    data: clients
  });
});

/**
 * @desc    Lấy danh sách lịch booking của riêng Nhiếp ảnh gia
 * @route   GET /api/photographer/bookings
 * @access  Photographer / Admin
 */
const getBookings = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const bookings = await photographerService.getPhotographerBookings(userId, req.query);
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

/**
 * @desc    Cập nhật trạng thái lịch booking
 * @route   PUT /api/photographer/bookings/:id/status
 * @access  Photographer / Admin
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await photographerService.updateBookingStatus(req.params.id, userId, req.body.status);
  res.status(200).json(result);
});

/**
 * @desc    Cập nhật toàn bộ thông tin chi tiết lịch booking
 * @route   PUT /api/photographer/bookings/:id
 * @access  Photographer / Admin
 */
const updateBooking = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await photographerService.updateBooking(req.params.id, userId, req.body);
  res.status(200).json(result);
});

/**
 * @desc    Xóa lịch booking
 * @route   DELETE /api/photographer/bookings/:id
 * @access  Photographer / Admin
 */
const deleteBooking = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await photographerService.deleteBooking(req.params.id, userId);
  res.status(200).json(result);
});

/**
 * @desc    Khách hàng gửi yêu cầu đặt lịch booking
 * @route   POST /api/photographer/bookings
 * @access  Public
 */
const createBooking = asyncHandler(async (req, res) => {
  const result = await photographerService.createBooking(req.body);
  res.status(201).json(result);
});

module.exports = {
  getOverview,
  getAlbums,
  getClients,
  getBookings,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  createBooking
};
