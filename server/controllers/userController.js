const userService = require('../services/userService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Đăng ký tài khoản mới (Nhiếp ảnh gia hoặc Khách hàng)
 * @route   POST /api/users/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await userService.registerUser(req.body);
  res.status(201).json({
    success: true,
    ...result
  });
});

/**
 * @desc    Đăng nhập người dùng
 * @route   POST /api/users/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const result = await userService.loginUser(req.body);
  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @desc    Lấy danh sách người dùng (Admin)
 * @route   GET /api/users
 * @access  Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers(req.query);
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

/**
 * @desc    Lấy thống kê người dùng (Admin)
 * @route   GET /api/users/stats
 * @access  Admin
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Lấy chi tiết 1 người dùng
 * @route   GET /api/users/:id
 * @access  Admin / Authenticated
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Duyệt & Kích hoạt hồ sơ Nhiếp ảnh gia (Admin)
 * @route   PUT /api/users/:id/approve
 * @access  Admin
 */
const approvePhotographer = asyncHandler(async (req, res) => {
  const result = await userService.approvePhotographer(req.params.id);
  res.status(200).json(result);
});

/**
 * @desc    Từ chối hồ sơ Nhiếp ảnh gia (Admin)
 * @route   PUT /api/users/:id/reject
 * @access  Admin
 */
const rejectPhotographer = asyncHandler(async (req, res) => {
  const result = await userService.rejectPhotographer(req.params.id, req.body?.reason);
  res.status(200).json(result);
});

/**
 * @desc    Admin tạo User mới trực tiếp
 * @route   POST /api/users
 * @access  Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.adminCreateUser(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Cập nhật thông tin User
 * @route   PUT /api/users/:id
 * @access  Admin / Authenticated
 */
const updateUser = asyncHandler(async (req, res) => {
  const result = await userService.updateUser(req.params.id, req.body);
  res.status(200).json(result);
});

/**
 * @desc    Lấy danh sách các Nhiếp ảnh gia đã được duyệt (Public cho khách chọn)
 * @route   GET /api/users/photographers
 * @access  Public
 */
const getActivePhotographers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers({ role: 'photographer', status: 'active' });
  res.status(200).json({
    success: true,
    count: users.length,
    data: users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      studioInfo: u.studioInfo,
      createdAt: u.createdAt
    }))
  });
});

/**
 * @desc    Xóa User
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  res.status(200).json(result);
});

module.exports = {
  register,
  login,
  getActivePhotographers,
  getUsers,
  getStats,
  getUser,
  approvePhotographer,
  rejectPhotographer,
  createUser,
  updateUser,
  deleteUser
};
