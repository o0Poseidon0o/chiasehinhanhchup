const locationGuideService = require('../services/locationGuideService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy danh sách địa điểm chụp ảnh
 * @route   GET /api/locations
 * @access  Public
 */
const getLocations = asyncHandler(async (req, res) => {
  const data = await locationGuideService.getLocations(req.query);
  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});

/**
 * @desc    Lấy chi tiết 1 địa điểm
 * @route   GET /api/locations/:id
 * @access  Public
 */
const getLocationById = asyncHandler(async (req, res) => {
  const data = await locationGuideService.getLocationById(req.params.id);
  res.status(200).json({
    success: true,
    data
  });
});

/**
 * @desc    Tạo mới địa điểm chụp ảnh (Master Admin)
 * @route   POST /api/locations
 * @access  Admin
 */
const createLocation = asyncHandler(async (req, res) => {
  const data = await locationGuideService.createLocation(req.body);
  res.status(201).json({
    success: true,
    message: 'Tạo địa điểm chụp ảnh thành công!',
    data
  });
});

/**
 * @desc    Cập nhật địa điểm chụp ảnh (Master Admin)
 * @route   PUT /api/locations/:id
 * @access  Admin
 */
const updateLocation = asyncHandler(async (req, res) => {
  const data = await locationGuideService.updateLocation(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Cập nhật thông tin địa điểm thành công!',
    data
  });
});

/**
 * @desc    Xóa địa điểm chụp ảnh (Master Admin)
 * @route   DELETE /api/locations/:id
 * @access  Admin
 */
const deleteLocation = asyncHandler(async (req, res) => {
  const result = await locationGuideService.deleteLocation(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Khôi phục 8 địa điểm chụp ảnh kinh điển mặc định (Master Admin)
 * @route   POST /api/locations/reset
 * @access  Admin
 */
const resetLocations = asyncHandler(async (req, res) => {
  const data = await locationGuideService.resetLocations();
  res.status(200).json({
    success: true,
    message: 'Đã khôi phục danh sách địa điểm chụp ảnh mẫu thành công!',
    count: data.length,
    data
  });
});

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  resetLocations
};
