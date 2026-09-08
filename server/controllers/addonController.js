const addonService = require('../services/addonService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy danh sách dịch vụ đi kèm (chỉ lấy active nếu là khách, lấy hết nếu admin)
 * @route   GET /api/addons
 * @access  Public
 */
const getAddons = asyncHandler(async (req, res) => {
  const onlyActive = req.query.all !== 'true';
  const data = await addonService.getAddons({ onlyActive });
  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});

/**
 * @desc    Lấy chi tiết dịch vụ đi kèm theo ID
 * @route   GET /api/addons/:id
 * @access  Public
 */
const getAddonById = asyncHandler(async (req, res) => {
  const data = await addonService.getAddonById(req.params.id);
  res.status(200).json({
    success: true,
    data
  });
});

/**
 * @desc    Tạo dịch vụ đi kèm mới (Master Admin)
 * @route   POST /api/addons
 * @access  Admin
 */
const createAddon = asyncHandler(async (req, res) => {
  const data = await addonService.createAddon(req.body);
  res.status(201).json({
    success: true,
    message: 'Tạo dịch vụ đi kèm thành công!',
    data
  });
});

/**
 * @desc    Cập nhật dịch vụ đi kèm (Master Admin)
 * @route   PUT /api/addons/:id
 * @access  Admin
 */
const updateAddon = asyncHandler(async (req, res) => {
  const data = await addonService.updateAddon(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Cập nhật dịch vụ đi kèm thành công!',
    data
  });
});

/**
 * @desc    Bật / Tắt trạng thái mở bán dịch vụ (Master Admin)
 * @route   PATCH /api/addons/:id/toggle
 * @access  Admin
 */
const toggleAddonActive = asyncHandler(async (req, res) => {
  const data = await addonService.toggleAddonActive(req.params.id);
  res.status(200).json({
    success: true,
    message: `Đã ${data.isActive ? 'mở bán' : 'tạm ẩn'} dịch vụ thành công!`,
    data
  });
});

/**
 * @desc    Xóa dịch vụ đi kèm (Master Admin)
 * @route   DELETE /api/addons/:id
 * @access  Admin
 */
const deleteAddon = asyncHandler(async (req, res) => {
  const result = await addonService.deleteAddon(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Khôi phục bảng dịch vụ mặc định (Master Admin)
 * @route   POST /api/addons/reset
 * @access  Admin
 */
const resetAddons = asyncHandler(async (req, res) => {
  const data = await addonService.resetAddons();
  res.status(200).json({
    success: true,
    message: 'Đã khôi phục các dịch vụ đi kèm mặc định thành công!',
    count: data.length,
    data
  });
});

module.exports = {
  getAddons,
  getAddonById,
  createAddon,
  updateAddon,
  toggleAddonActive,
  deleteAddon,
  resetAddons
};
