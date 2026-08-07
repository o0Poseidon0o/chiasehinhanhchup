const crypto = require('crypto');

/**
 * Tạo chuỗi token ngẫu nhiên bảo mật
 * @param {number} bytes 
 * @returns {string} Hex string
 */
const generateToken = (bytes = 16) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Làm sạch dữ liệu Album để gửi về cho khách hàng (ẩn passcode và manageToken)
 * @param {Object} album 
 * @returns {Object} Cleaned album object
 */
const sanitizeAlbumForClient = (album) => {
  if (!album) return null;
  
  const raw = typeof album.toObject === 'function' ? album.toObject() : album;

  return {
    _id: raw._id,
    title: raw.title,
    driveFolderUrl: raw.driveFolderUrl,
    maxSelect: raw.maxSelect || 0,
    allowDownload: raw.allowDownload !== undefined ? raw.allowDownload : true,
    allowComment: raw.allowComment !== undefined ? raw.allowComment : true,
    status: raw.status || 'selecting',
    images: raw.images || [],
    clientInfo: raw.clientInfo || null,
    selectedImages: raw.selectedImages || [],
    createdAt: raw.createdAt
  };
};

module.exports = {
  generateToken,
  sanitizeAlbumForClient
};
