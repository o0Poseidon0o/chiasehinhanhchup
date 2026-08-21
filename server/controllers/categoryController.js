const categoryService = require('../services/categoryService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy danh sách thể loại chụp ảnh công khai
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategories();
  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});

/**
 * @desc    Lấy chi tiết thể loại chụp ảnh
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategoryById(req.params.id);
  res.status(200).json({
    success: true,
    data
  });
});

/**
 * @desc    Tạo thể loại chụp ảnh mới
 * @route   POST /api/categories
 * @access  Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const data = await categoryService.createCategory(req.body);
  res.status(201).json({
    success: true,
    message: 'Tạo thể loại chụp ảnh thành công!',
    data
  });
});

/**
 * @desc    Cập nhật thể loại chụp ảnh
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const data = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Cập nhật thể loại chụp ảnh thành công!',
    data
  });
});

/**
 * @desc    Xóa thể loại chụp ảnh
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Khôi phục 6 thể loại chụp ảnh mặc định ban đầu
 * @route   POST /api/categories/reset
 * @access  Admin
 */
const resetCategories = asyncHandler(async (req, res) => {
  const data = await categoryService.resetCategories();
  res.status(200).json({
    success: true,
    message: 'Đã khôi phục 6 thể loại chụp ảnh mặc định thành công!',
    count: data.length,
    data
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  resetCategories
};
