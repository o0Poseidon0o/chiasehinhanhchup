const Album = require('../models/Album');
const { extractFolderId, getMockImages, fetchImagesFromFolder } = require('./googleDriveService');
const { generateToken, sanitizeAlbumForClient } = require('../utils/helpers');

/**
 * 1. Tạo mới một Album từ đường link Google Drive
 */
const createAlbum = async (payload) => {
  const { title, driveFolderUrl, passcode, maxSelect, allowDownload, allowComment } = payload;

  let folderId = 'mock-demo';
  let images = [];

  // Hỗ trợ mock link cho mục đích demo / test
  if (driveFolderUrl === 'mock' || driveFolderUrl.includes('mock')) {
    images = getMockImages();
  } else {
    folderId = extractFolderId(driveFolderUrl);
    if (!folderId) {
      const error = new Error('Đường dẫn thư mục Google Drive không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }

    images = await fetchImagesFromFolder(folderId);
    if (images.length === 0) {
      const error = new Error('Không tìm thấy hình ảnh nào trong thư mục Google Drive này. Vui lòng kiểm tra quyền chia sẻ công khai.');
      error.statusCode = 400;
      throw error;
    }
  }

  const manageToken = generateToken(16);

  const newAlbum = new Album({
    title: title.trim(),
    driveFolderUrl: driveFolderUrl.trim(),
    driveFolderId: folderId,
    passcode: passcode ? passcode.trim() : '',
    manageToken,
    maxSelect: Number(maxSelect) || 0,
    allowDownload: allowDownload !== undefined ? Boolean(allowDownload) : true,
    allowComment: allowComment !== undefined ? Boolean(allowComment) : true,
    images
  });

  const savedAlbum = await newAlbum.save();

  return {
    albumId: savedAlbum._id,
    manageToken: savedAlbum.manageToken,
    title: savedAlbum.title,
    imagesCount: savedAlbum.images.length
  };
};

/**
 * 2. Lấy thông tin Album an toàn cho Khách hàng
 */
const getAlbumForClient = async (id, providedPasscode) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album này.');
    error.statusCode = 404;
    throw error;
  }

  // Kiểm tra mã PIN bảo mật nếu album có thiết lập
  if (album.passcode && album.passcode !== providedPasscode) {
    return {
      needsPasscode: true,
      title: album.title
    };
  }

  return {
    needsPasscode: false,
    album: sanitizeAlbumForClient(album)
  };
};

/**
 * 3. Xác thực mã PIN của Khách hàng
 */
const verifyPasscode = async (id, passcode) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album này.');
    error.statusCode = 404;
    throw error;
  }

  if (album.passcode && album.passcode !== passcode) {
    const error = new Error('Mã PIN truy cập không chính xác.');
    error.statusCode = 400;
    throw error;
  }

  return { success: true };
};

/**
 * 4. Khách hàng gửi chốt danh sách chọn ảnh
 */
const submitSelection = async (id, payload) => {
  const { clientInfo, selectedImages } = payload;

  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album này.');
    error.statusCode = 404;
    throw error;
  }

  if (album.status === 'locked') {
    const error = new Error('Album này đã bị khóa, không thể thay đổi danh sách chọn.');
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra giới hạn số lượng ảnh
  if (album.maxSelect > 0 && selectedImages.length > album.maxSelect) {
    const error = new Error(`Bạn chỉ được chọn tối đa ${album.maxSelect} ảnh.`);
    error.statusCode = 400;
    throw error;
  }

  // Chuẩn hóa và mapping dữ liệu ảnh được chọn kèm thumbnail
  const mappedSelectedImages = selectedImages.map((sel) => {
    const match = album.images.find(img => img.fileId === sel.fileId);
    return {
      fileId: sel.fileId,
      fileName: sel.fileName,
      comment: sel.comment ? sel.comment.trim() : '',
      thumbnailUrl: match ? match.thumbnailUrl : (sel.thumbnailUrl || ''),
      embedUrl: match ? match.embedUrl : (sel.embedUrl || '')
    };
  });

  album.selectedImages = mappedSelectedImages;
  album.clientInfo = {
    name: clientInfo.name.trim(),
    phone: clientInfo.phone.trim(),
    note: clientInfo.note ? clientInfo.note.trim() : '',
    submittedAt: new Date()
  };
  album.status = 'submitted';

  await album.save();

  return {
    message: 'Gửi danh sách chọn ảnh thành công! Cảm ơn bạn.',
    album: sanitizeAlbumForClient(album)
  };
};

/**
 * 5. Lấy toàn bộ thông tin Album cho Admin quản trị
 */
const getAlbumForAdmin = async (id, token) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album này.');
    error.statusCode = 404;
    throw error;
  }

  if (album.manageToken !== token) {
    const error = new Error('Bạn không có quyền truy cập trang quản lý này (Token không đúng).');
    error.statusCode = 403;
    throw error;
  }

  return album;
};

/**
 * 6. Khóa hoặc Mở khóa Album
 */
const toggleAlbumStatus = async (id, token, action) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album này.');
    error.statusCode = 404;
    throw error;
  }

  if (album.manageToken !== token) {
    const error = new Error('Quyền truy cập bị từ chối.');
    error.statusCode = 403;
    throw error;
  }

  if (action === 'lock') {
    album.status = 'locked';
    await album.save();
    return { message: 'Đã khóa album thành công. Khách hàng không thể thay đổi danh sách chọn.' };
  } else if (action === 'unlock') {
    album.status = 'selecting';
    await album.save();
    return { message: 'Đã mở khóa album thành công. Khách hàng có thể tiếp tục chọn ảnh.' };
  } else {
    const error = new Error('Hành động không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  createAlbum,
  getAlbumForClient,
  verifyPasscode,
  submitSelection,
  getAlbumForAdmin,
  toggleAlbumStatus
};
