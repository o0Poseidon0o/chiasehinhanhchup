const albumService = require('../services/albumService');
const { extractFolderId, getMockImages, fetchImagesFromFolder } = require('../services/googleDriveService');
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

/**
 * @desc    Tự động đồng bộ toàn bộ album từ Google Drive
 * @route   POST /api/albums/sync-all
 * @access  Public / Admin
 */
const syncAllAlbums = asyncHandler(async (req, res) => {
  const result = await albumService.syncAllAlbums();
  res.status(200).json(result);
});

/**
 * @desc    Cập nhật các thiết lập của Album (maxSelect, allowDownload, allowComment, passcode, title, status)
 * @route   PUT /api/albums/:id/settings
 * @access  Admin (manageToken)
 */
const updateAlbumSettings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const token = req.manageToken || req.query.token || req.headers['x-manage-token'];

  const result = await albumService.updateAlbumSettings(id, token, req.body);
  res.status(200).json(result);
});

const axios = require('axios');

/**
 * @desc    Proxy tải thumbnail ảnh Google Drive tránh chặn CORS / Referrer
 * @route   GET /api/albums/proxy-image/:fileId
 * @access  Public
 */
const proxyImage = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const sz = req.query.sz || 800;

  if (!fileId) {
    return res.status(400).send('Missing fileId');
  }

  const urls = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${sz}`,
    `https://lh3.googleusercontent.com/d/${fileId}=s${sz}`,
    `https://lh3.googleusercontent.com/u/0/d/${fileId}=w${sz}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`
  ];

  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return response.data.pipe(res);
    } catch (_) {
      continue;
    }
  }

  return res.status(404).send('Image could not be fetched');
});

/**
 * @desc    Xác thực Mật khẩu Admin
 * @route   POST /api/albums/admin/login
 * @access  Public
 */
const verifyAdminPassword = asyncHandler(async (req, res) => {
  const { adminPassword } = req.body;
  const result = await albumService.verifyAdminPassword(adminPassword);
  res.status(200).json(result);
});

/**
 * @desc    Lấy danh sách các album công khai (Public cho trang Photographer Detail)
 * @route   GET /api/albums/public
 * @access  Public
 */
const getPublicAlbums = asyncHandler(async (req, res) => {
  const { photographerId } = req.query;
  const albums = await albumService.getAllAlbums();
  const filtered = photographerId 
    ? albums.filter(a => String(a.photographerId) === String(photographerId))
    : albums;
  
  res.status(200).json({
    success: true,
    data: filtered.map(a => ({
      _id: a._id,
      title: a.title,
      coverImage: a.coverImage,
      photographerId: a.photographerId,
      photographerName: a.photographerName,
      images: (a.images || []).map(img => ({
        fileId: img.fileId,
        url: img.embedUrl || img.thumbnailUrl,
        thumbnail: img.thumbnailUrl
      }))
    }))
  });
});

/**
 * @desc    Quét danh sách ảnh từ link Google Drive bất kỳ (Public cho Photographer Portfolio)
 * @route   POST /api/albums/parse-drive
 * @access  Public
 */
const parseDriveUrl = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp link Google Drive.' });
  }

  const folderId = extractFolderId(url);
  if (!folderId) {
    return res.status(400).json({ success: false, message: 'Link Google Drive không đúng định dạng.' });
  }

  let images = [];
  try {
    images = await fetchImagesFromFolder(folderId);
  } catch (err) {
    images = [];
  }

  res.status(200).json({
    success: true,
    folderId,
    count: images.length,
    images: images.map(img => ({
      fileId: img.fileId,
      fileName: img.fileName,
      url: img.embedUrl || img.thumbnailUrl,
      thumbnail: img.thumbnailUrl
    }))
  });
});

module.exports = {
  createAlbum,
  getAlbums,
  getAlbum,
  getPublicAlbums,
  parseDriveUrl,
  verifyPasscode,
  submitSelection,
  getManageAlbum,
  lockAlbum,
  unlockAlbum,
  deleteAlbum,
  deleteBulkAlbums,
  syncAlbum,
  syncAllAlbums,
  updateAlbumSettings,
  verifyAdminPassword,
  proxyImage
};
