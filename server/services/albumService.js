const Album = require('../models/Album');
const { extractFolderId, getMockImages, fetchImagesFromFolder } = require('./googleDriveService');
const { generateToken, sanitizeAlbumForClient } = require('../utils/helpers');

/**
 * 1. Tạo mới một Album từ đường link Google Drive
 */
const createAlbum = async (payload) => {
  const { title, driveFolderUrl, passcode, maxSelect, allowDownload, allowComment, clientName, clientPhone, clientNote, clientInfo } = payload;

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

  const initialClientInfo = {
    name: (clientName || clientInfo?.name || '').trim(),
    phone: (clientPhone || clientInfo?.phone || '').trim(),
    note: (clientNote || clientInfo?.note || '').trim()
  };

  const newAlbum = new Album({
    title: title.trim(),
    driveFolderUrl: driveFolderUrl.trim(),
    driveFolderId: folderId,
    passcode: passcode ? passcode.trim() : '',
    manageToken,
    maxSelect: Number(maxSelect) || 0,
    allowDownload: allowDownload !== undefined ? Boolean(allowDownload) : true,
    allowComment: allowComment !== undefined ? Boolean(allowComment) : true,
    clientInfo: initialClientInfo,
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
    passcode: a.passcode || '',
    driveFolderUrl: a.driveFolderUrl || '',
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
 * Helper: Tự động đồng bộ và nạp danh sách ảnh mới nhất từ Google Drive cho Album
 */
const refreshAlbumImagesFromDrive = async (album) => {
  if (!album || album.status === 'locked') {
    return album;
  }

  // Không thực hiện fetch API thật nếu là dữ liệu mock demo
  if (album.driveFolderUrl === 'mock' || album.driveFolderId === 'mock-demo') {
    return album;
  }

  try {
    let folderId = album.driveFolderId;
    if (!folderId || folderId === 'undefined') {
      folderId = extractFolderId(album.driveFolderUrl);
      album.driveFolderId = folderId;
    }

    if (!folderId) return album;

    const latestImages = await fetchImagesFromFolder(folderId);
    if (Array.isArray(latestImages) && latestImages.length > 0) {
      const existingFileIds = new Set((album.images || []).map(img => img.fileId));
      const hasDifferences = latestImages.length !== (album.images || []).length ||
        latestImages.some(img => !existingFileIds.has(img.fileId));

      if (hasDifferences) {
        album.images = latestImages;
        await album.save();
      }
    }
  } catch (err) {
    console.warn(`[Auto-Sync Drive] Không thể đồng bộ tự động cho album ${album._id}:`, err.message);
  }

  return album;
};

/**
 * 3. Lấy thông tin Album an toàn cho Khách hàng
 */
const getAlbumForClient = async (id, providedPasscode) => {
  let album = await Album.findById(id);
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

  // Tự động kiểm tra và đồng bộ ảnh mới nhất từ Google Drive cho link khách hàng
  album = await refreshAlbumImagesFromDrive(album);

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
    name: (clientInfo && clientInfo.name && clientInfo.name.trim()) ? clientInfo.name.trim() : (album.clientInfo?.name || 'Khách hàng'),
    phone: (clientInfo && clientInfo.phone && clientInfo.phone.trim()) ? clientInfo.phone.trim() : (album.clientInfo?.phone || ''),
    note: (clientInfo && clientInfo.note && clientInfo.note.trim()) ? clientInfo.note.trim() : (album.clientInfo?.note || ''),
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
  let album = await Album.findById(id);
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

  // Tự động kiểm tra và đồng bộ ảnh mới nhất từ Google Drive cho trang Admin
  album = await refreshAlbumImagesFromDrive(album);

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

/**
 * 10. Đồng bộ lại danh sách ảnh từ Google Drive khi người dùng upload thêm ảnh mới
 */
const syncAlbumImages = async (id, token) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album để đồng bộ.');
    error.statusCode = 404;
    throw error;
  }

  if (token && album.manageToken && album.manageToken !== token) {
    const error = new Error('Token quản lý không hợp lệ.');
    error.statusCode = 403;
    throw error;
  }

  let latestImages = [];
  if (album.driveFolderUrl === 'mock' || album.driveFolderId === 'mock-demo') {
    latestImages = getMockImages();
  } else {
    // Trích xuất lại folderId nếu chưa có
    let folderId = album.driveFolderId;
    if (!folderId || folderId === 'undefined') {
      folderId = extractFolderId(album.driveFolderUrl);
      album.driveFolderId = folderId;
    }

    if (!folderId) {
      const error = new Error('Không thể xác định Folder ID từ link Google Drive của album.');
      error.statusCode = 400;
      throw error;
    }

    latestImages = await fetchImagesFromFolder(folderId);
  }

  const existingFileIds = new Set((album.images || []).map(img => img.fileId));
  const newImagesAdded = latestImages.filter(img => !existingFileIds.has(img.fileId));
  
  // Cập nhật danh sách ảnh mới nhất
  const previousCount = (album.images || []).length;
  album.images = latestImages;

  await album.save();

  return {
    success: true,
    message: `Đồng bộ thành công! Hiện có ${latestImages.length} ảnh (Phát hiện thêm mới ${newImagesAdded.length} ảnh).`,
    previousCount,
    totalImages: latestImages.length,
    newAddedCount: newImagesAdded.length,
    images: latestImages
  };
};

/**
 * 11. Tự động đồng bộ toàn bộ tất cả album đang hoạt động
 */
const syncAllAlbums = async () => {
  const albums = await Album.find();
  const activeAlbums = (Array.isArray(albums) ? albums : []).filter(a => a && a.status !== 'locked');

  let updatedCount = 0;
  let totalNewImages = 0;

  await Promise.allSettled(
    activeAlbums.map(async (album) => {
      const prevCount = (album.images || []).length;
      await refreshAlbumImagesFromDrive(album);
      const newCount = (album.images || []).length;
      if (newCount > prevCount) {
        updatedCount++;
        totalNewImages += (newCount - prevCount);
      }
      return { id: album._id, title: album.title, imagesCount: newCount };
    })
  );

  return {
    success: true,
    message: `Đã tự động đồng bộ ${activeAlbums.length} album! (Có ${updatedCount} album có ảnh mới, thêm ${totalNewImages} ảnh).`,
    syncedCount: activeAlbums.length,
    updatedAlbumsCount: updatedCount,
    totalNewImages
  };
};

/**
 * 12. Cập nhật Cài đặt Album (maxSelect, allowDownload, allowComment, passcode, title, status)
 */
const updateAlbumSettings = async (id, token, settings = {}) => {
  const album = await Album.findById(id);
  if (!album) {
    const error = new Error('Không tìm thấy Album để cập nhật cài đặt.');
    error.statusCode = 404;
    throw error;
  }

  if (token && album.manageToken && album.manageToken !== token) {
    const error = new Error('Mã Token quản lý không hợp lệ.');
    error.statusCode = 403;
    throw error;
  }

  if (settings.title !== undefined) {
    const trimmedTitle = String(settings.title).trim();
    if (trimmedTitle) {
      album.title = trimmedTitle;
    }
  }

  if (settings.maxSelect !== undefined) {
    const max = Number(settings.maxSelect);
    album.maxSelect = isNaN(max) || max < 0 ? 0 : max;
  }

  if (settings.allowDownload !== undefined) {
    album.allowDownload = Boolean(settings.allowDownload);
  }

  if (settings.allowComment !== undefined) {
    album.allowComment = Boolean(settings.allowComment);
  }

  if (settings.passcode !== undefined) {
    album.passcode = String(settings.passcode).trim();
  }

  if (settings.clientName !== undefined || settings.clientPhone !== undefined || settings.clientNote !== undefined || settings.clientInfo !== undefined) {
    album.clientInfo = {
      name: settings.clientName !== undefined ? String(settings.clientName).trim() : (settings.clientInfo?.name !== undefined ? String(settings.clientInfo.name).trim() : (album.clientInfo?.name || '')),
      phone: settings.clientPhone !== undefined ? String(settings.clientPhone).trim() : (settings.clientInfo?.phone !== undefined ? String(settings.clientInfo.phone).trim() : (album.clientInfo?.phone || '')),
      note: settings.clientNote !== undefined ? String(settings.clientNote).trim() : (settings.clientInfo?.note !== undefined ? String(settings.clientInfo.note).trim() : (album.clientInfo?.note || '')),
      submittedAt: album.clientInfo?.submittedAt
    };
  }

  if (settings.status !== undefined && ['selecting', 'submitted', 'locked'].includes(settings.status)) {
    album.status = settings.status;
  }

  await album.save();

  return {
    success: true,
    message: 'Đã cập nhật cài đặt album thành công!',
    data: album
  };
};

/**
 * Xác thực Mật khẩu Admin
 */
const verifyAdminPassword = async (adminPassword) => {
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (!adminPassword || adminPassword !== expectedPassword) {
    const error = new Error('Mật khẩu Admin không chính xác.');
    error.statusCode = 401;
    throw error;
  }
  return { success: true, message: 'Đăng nhập Admin thành công.' };
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
  deleteBulkAlbums,
  syncAlbumImages,
  syncAllAlbums,
  updateAlbumSettings,
  verifyAdminPassword
};
