const albumService = require('../services/albumService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Tạo album mới
 * @route   POST /api/albums
 * @access  Public
 */
const createAlbum = asyncHandler(async (req, res) => {
  const result = await albumService.createAlbum(req.body);
  res.status(201).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Lấy danh sách tất cả các Album (Admin Dashboard)
 * @route   GET /api/albums
 * @access  Public / Admin
 */
const getAlbums = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const albums = await albumService.getAllAlbums(search);
  res.status(200).json({
    success: true,
    count: albums.length,
    data: albums
  });
});

/**
 * @desc    Lấy thông tin Album cho khách hàng
 * @route   GET /api/albums/:id
 * @access  Public (Protected by optional passcode)
 */
const getAlbum = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const passcode = req.headers['x-passcode'] || req.query.passcode || '';
  
  const result = await albumService.getAlbumForClient(id, passcode);
  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @desc    Xác thực mã PIN của album
 * @route   POST /api/albums/:id/verify-passcode
 * @access  Public
 */
const verifyPasscode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { passcode } = req.body;
  
  const result = await albumService.verifyPasscode(id, passcode);
  res.status(200).json(result);
});

/**
 * @desc    Khách hàng gửi lựa chọn ảnh
 * @route   POST /api/albums/:id/submit
 * @access  Public
 */
const submitSelection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await albumService.submitSelection(id, req.body);
  res.status(200).json(result);
});

/**
 * @desc    Lấy dữ liệu quản trị Album (Admin)
 * @route   GET /api/albums/:id/manage
 * @access  Private (Manage Token)
 */
const getManageAlbum = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = req.manageToken || req.query.token || req.headers['x-manage-token'];
  
  const album = await albumService.getAlbumForAdmin(id, token);
  res.status(200).json({
    success: true,
    data: album
  });
});

/**
 * @desc    Khóa Album (Admin)
 * @route   PUT /api/albums/:id/lock
 * @access  Private (Manage Token required)
 */
const lockAlbum = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = req.manageToken || req.query.token || req.headers['x-manage-token'];
  
  const result = await albumService.toggleAlbumStatus(id, token, 'lock');
  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @desc    Mở khóa Album (Admin)
 * @route   PUT /api/albums/:id/unlock
 * @access  Private (Manage Token required)
 */
const unlockAlbum = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = req.manageToken || req.query.token || req.headers['x-manage-token'];
  
  const result = await albumService.toggleAlbumStatus(id, token, 'unlock');
  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @desc    Xóa Album để giải phóng bộ nhớ
 * @route   DELETE /api/albums/:id
 * @access  Public / Admin
 */
const deleteAlbum = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = req.manageToken || req.query.token || req.headers['x-manage-token'];

  const result = await albumService.deleteAlbum(id, token);
  res.status(200).json(result);
});

/**
 * @desc    Xóa hàng loạt nhiều Album
 * @route   POST /api/albums/bulk-delete
 * @access  Public / Admin
 */
const deleteBulkAlbums = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const result = await albumService.deleteBulkAlbums(ids);
  res.status(200).json(result);
});

/**
 * @desc    Đồng bộ danh sách ảnh từ Google Drive
 * @route   POST /api/albums/:id/sync
 * @access  Public / Admin
 */
const syncAlbum = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = req.manageToken || req.query.token || req.headers['x-manage-token'];

  const result = await albumService.syncAlbumImages(id, token);
  res.status(200).json(result);
});

module.exports = {
  createAlbum,
  getAlbums,
  getAlbum,
  verifyPasscode,
  submitSelection,
  getManageAlbum,
  lockAlbum,
  unlockAlbum,
  deleteAlbum,
  deleteBulkAlbums,
  syncAlbum
};
