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
 * 2. Lấy danh sách tất cả Album cho Admin Dashboard
 */
const getAllAlbums = async (search = '') => {
  const rawAlbums = await Album.find();
  
  // Sắp xếp theo ngày tạo mới nhất trước
  let list = Array.isArray(rawAlbums) ? [...rawAlbums] : [];
  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // Lọc theo từ khóa tìm kiếm nếu có
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(a => {
      const titleMatch = (a.title || '').toLowerCase().includes(q);
      const clientNameMatch = (a.clientInfo?.name || '').toLowerCase().includes(q);
      const clientPhoneMatch = (a.clientInfo?.phone || '').toLowerCase().includes(q);
      return titleMatch || clientNameMatch || clientPhoneMatch;
    });
  }

  return list.map(a => ({
    _id: a._id,
    title: a.title,
    status: a.status || 'selecting',
    createdAt: a.createdAt,
    hasPasscode: Boolean(a.passcode),
    maxSelect: a.maxSelect || 0,
    allowDownload: a.allowDownload !== undefined ? a.allowDownload : true,
    allowComment: a.allowComment !== undefined ? a.allowComment : true,
    imagesCount: Array.isArray(a.images) ? a.images.length : 0,
    selectedCount: Array.isArray(a.selectedImages) ? a.selectedImages.length : 0,
    clientInfo: a.clientInfo || { name: '', phone: '', note: '' },
    manageToken: a.manageToken
  }));
};

/**
 * 3. Lấy thông tin Album an toàn cho Khách hàng
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
 * 4. Xác thực mã PIN của Khách hàng
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
 * 5. Khách hàng gửi chốt danh sách chọn ảnh
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
 * 6. Lấy toàn bộ thông tin Album cho Admin quản trị
 */
const getAlbumForAdmin = async (id, token) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album này.');
    error.statusCode = 404;
    throw error;
  }

  if (token && album.manageToken !== token) {
    const error = new Error('Bạn không có quyền truy cập trang quản lý này (Token không đúng).');
    error.statusCode = 403;
    throw error;
  }

  return album;
};

/**
 * 7. Khóa hoặc Mở khóa Album
 */
const toggleAlbumStatus = async (id, token, action) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album này.');
    error.statusCode = 404;
    throw error;
  }

  if (token && album.manageToken !== token) {
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

/**
 * 8. Xóa một Album theo ID
 */
const deleteAlbum = async (id, token) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album để xóa.');
    error.statusCode = 404;
    throw error;
  }

  if (token && album.manageToken && album.manageToken !== token) {
    const error = new Error('Mã Token quản lý không hợp lệ, không thể xóa album.');
    error.statusCode = 403;
    throw error;
  }

  await Album.findByIdAndDelete(id);

  return {
    success: true,
    message: `Đã xóa album "${album.title}" thành công để giải phóng bộ nhớ.`
  };
};

/**
 * 9. Xóa hàng loạt nhiều Album
 */
const deleteBulkAlbums = async (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('Danh sách ID album cần xóa không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  let deletedCount = 0;
  for (const id of ids) {
    const deleted = await Album.findByIdAndDelete(id);
    if (deleted) deletedCount++;
  }

  return {
    success: true,
    deletedCount,
    message: `Đã xóa thành công ${deletedCount} album để giải phóng dung lượng.`
  };
};

module.exports = {
  createAlbum,
  getAllAlbums,
  getAlbumForClient,
  verifyPasscode,
  submitSelection,
  getAlbumForAdmin,
  toggleAlbumStatus,
  deleteAlbum,
  deleteBulkAlbums
};
