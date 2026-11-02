const mongoose = require('mongoose');
const Template = require('../models/Template');
const LocalTemplate = require('../models/LocalTemplate');
const { extractFolderId, fetchImagesFromFolder } = require('../services/googleDriveService');
const { asyncHandler } = require('../middlewares/errorHandler');

const getMongoIdQuery = (id) => {
  const strId = String(id);
  const conditions = [{ id: strId }];
  if (mongoose.Types.ObjectId.isValid(strId)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(strId) });
  }
  return { $or: conditions };
};

/**
 * Đảm bảo DB luôn có sẵn 6 mẫu Editorial mặc định nếu mới khởi tạo
 */
const ensureSeededTemplates = async () => {
  if (global.useLocalDB) {
    return await LocalTemplate.find();
  }
  let list = await Template.find();
  if (!list || list.length === 0) {
    const mongoDefaults = LocalTemplate.DEFAULT_TEMPLATES.map((t) => {
      const { _id, ...rest } = t;
      return rest;
    });
    list = await Template.insertMany(mongoDefaults);
  }
  return list;
};

/**
 * @desc    Lấy danh sách Template (Hệ thống + Cộng đồng + Cá nhân NAG)
 * @route   GET /api/templates
 */
const getTemplates = asyncHandler(async (req, res) => {
  const { authorId, category, includeAll } = req.query;
  const rawList = await ensureSeededTemplates();
  let list = Array.isArray(rawList) ? rawList.map((item) => (item.toObject ? item.toObject() : item)) : [];

  if (includeAll !== 'true') {
    list = list.filter((t) => {
      if (t.isSystem) return true;
      if (authorId && String(t.authorId) === String(authorId)) return true;
      return t.isPublic && t.status !== 'hidden';
    });
  }

  if (category && category !== 'all') {
    list = list.filter((t) => t.category === category);
  }

  list.sort((a, b) => {
    if (Boolean(b.isFeatured) !== Boolean(a.isFeatured)) return b.isFeatured ? 1 : -1;
    if (Boolean(b.isSystem) !== Boolean(a.isSystem)) return b.isSystem ? 1 : -1;
    return (Number(b.usageCount) || 0) - (Number(a.usageCount) || 0);
  });

  res.status(200).json({
    success: true,
    count: list.length,
    data: list
  });
});

/**
 * @desc    Tạo mới hoặc Lưu Template từ Nhiếp ảnh gia / Admin
 * @route   POST /api/templates
 */
const createTemplate = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    category,
    aspectRatio,
    isPublic,
    authorId,
    authorName,
    driveOverlayUrl,
    driveFileId,
    background,
    decorCards,
    photoSlots,
    textLayers,
    logoConfig
  } = req.body;

  if (!title || !title.trim()) {
    const err = new Error('Vui lòng nhập tên cho mẫu Template.');
    err.statusCode = 400;
    throw err;
  }

  // Tự động trích xuất fileId nếu người dùng nhập link file Google Drive cho khung PNG
  let extractedFileId = driveFileId || '';
  let normalizedOverlayUrl = (driveOverlayUrl || '').trim();
  if (normalizedOverlayUrl && !extractedFileId && normalizedOverlayUrl.includes('drive.google.com')) {
    const match =
      normalizedOverlayUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      normalizedOverlayUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      extractedFileId = match[1];
      normalizedOverlayUrl = `https://lh3.googleusercontent.com/d/${extractedFileId}`;
    }
  }

  const generatedId = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const payload = {
    id: generatedId,
    title: title.trim(),
    subtitle: (subtitle || 'Mẫu sáng tạo từ Studio').trim(),
    category: category || 'Pre-Wedding & Cưới',
    aspectRatio: aspectRatio || '3:4',
    isSystem: false,
    isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
    isFeatured: false,
    status: 'approved',
    authorId: authorId || '',
    authorName: authorName || 'Studio Partner',
    usageCount: 1,
    driveOverlayUrl: normalizedOverlayUrl,
    driveFileId: extractedFileId,
    background: background || { type: 'solid', color: '#FAF8F5', grayscale: false, blur: 0, overlayOpacity: 0 },
    decorCards: Array.isArray(decorCards) ? decorCards : [],
    photoSlots:
      Array.isArray(photoSlots) && photoSlots.length > 0
        ? photoSlots
        : [{ id: 'slot_1', label: 'Ảnh chính', x: 0, y: 0, w: 100, h: 100, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 }],
    textLayers: Array.isArray(textLayers) ? textLayers : [],
    logoConfig: logoConfig || {
      visible: true,
      x: 50,
      y: 92,
      scale: 0.9,
      colorMode: 'black',
      studioText: authorName || 'STUDIO',
      subtitle: 'Present'
    },
    createdAt: new Date()
  };

  const newTpl = new Template(payload);
  await newTpl.save();

  res.status(201).json({
    success: true,
    message: 'Đã lưu mẫu Template thành công!',
    data: newTpl
  });
});

/**
 * @desc    Quét thư mục Google Drive hoặc file Google Drive để nhập hàng loạt Khung Template PNG siêu nhẹ
 * @route   POST /api/templates/import-drive
 */
const importDriveTemplates = asyncHandler(async (req, res) => {
  const {
    driveUrl,
    titlePrefix = 'Khung Drive',
    category = 'Pre-Wedding & Cưới',
    aspectRatio = '3:4',
    isPublic = true,
    authorId = '',
    authorName = 'Studio Partner'
  } = req.body;

  if (!driveUrl || !driveUrl.trim()) {
    const err = new Error('Vui lòng dán đường dẫn thư mục hoặc file ảnh Google Drive.');
    err.statusCode = 400;
    throw err;
  }

  const trimmedUrl = driveUrl.trim();
  const createdTemplates = [];

  // Trường hợp 1: Link 1 file lẻ trên Google Drive (/file/d/FILE_ID)
  const singleFileMatch =
    trimmedUrl.includes('/file/d/') &&
    (trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmedUrl.match(/id=([a-zA-Z0-9_-]+)/));

  if (singleFileMatch && singleFileMatch[1]) {
    const fileId = singleFileMatch[1];
    const generatedId = `tpl_drv_${Date.now()}`;
    const tplData = {
      id: generatedId,
      title: `${titlePrefix} #1`,
      subtitle: 'Khung PNG lưu trữ trên Google Drive',
      category,
      aspectRatio,
      isSystem: false,
      isPublic: Boolean(isPublic),
      isFeatured: false,
      status: 'approved',
      authorId,
      authorName,
      usageCount: 1,
      driveOverlayUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      driveFileId: fileId,
      background: { type: 'solid', color: '#FAF8F5', grayscale: false, blur: 0, overlayOpacity: 0 },
      decorCards: [],
      photoSlots: [
        { id: 'slot_main', label: 'Ảnh lồng dưới khung Drive', x: 5, y: 5, w: 90, h: 90, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 }
      ],
      textLayers: [],
      logoConfig: { visible: true, x: 50, y: 92, scale: 0.85, colorMode: 'black', studioText: authorName, subtitle: 'Present' },
      createdAt: new Date()
    };
    const saved = new Template(tplData);
    await saved.save();
    createdTemplates.push(saved);
  } else {
    // Trường hợp 2: Link Thư mục Google Drive chứa nhiều khung PNG/Template
    const folderId = extractFolderId(trimmedUrl);
    if (!folderId) {
      const err = new Error('Link Google Drive không hợp lệ. Hãy dán link thư mục (folders/...) hoặc link file (file/d/...).');
      err.statusCode = 400;
      throw err;
    }

    const driveImages = await fetchImagesFromFolder(folderId);
    if (!driveImages || driveImages.length === 0) {
      const err = new Error('Không tìm thấy file hình ảnh / khung PNG nào trong thư mục Google Drive này. Hãy kiểm tra quyền chia sẻ công khai.');
      err.statusCode = 400;
      throw err;
    }

    // Giới hạn tối đa 20 mẫu mỗi lần import để tránh quá tải
    const sliceList = driveImages.slice(0, 20);
    for (let i = 0; i < sliceList.length; i++) {
      const img = sliceList[i];
      const cleanName = (img.fileName || `Mẫu ${i + 1}`).replace(/\.[^/.]+$/, '');
      const generatedId = `tpl_drv_${Date.now()}_${i}`;
      const tplData = {
        id: generatedId,
        title: `${titlePrefix} - ${cleanName}`,
        subtitle: 'Khung Overlay PNG từ Google Drive',
        category,
        aspectRatio,
        isSystem: false,
        isPublic: Boolean(isPublic),
        isFeatured: false,
        status: 'approved',
        authorId,
        authorName,
        usageCount: 1,
        driveOverlayUrl: img.embedUrl || img.thumbnailUrl || `https://lh3.googleusercontent.com/d/${img.fileId}`,
        driveFileId: img.fileId,
        background: { type: 'solid', color: '#FAF8F5', grayscale: false, blur: 0, overlayOpacity: 0 },
        decorCards: [],
        photoSlots: [
          { id: 'slot_main', label: 'Ảnh chính lồng khung', x: 6, y: 6, w: 88, h: 82, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 }
        ],
        textLayers: [],
        logoConfig: { visible: true, x: 50, y: 93, scale: 0.85, colorMode: 'black', studioText: authorName, subtitle: 'Present' },
        createdAt: new Date()
      };
      const saved = new Template(tplData);
      await saved.save();
      createdTemplates.push(saved);
    }
  }

  res.status(201).json({
    success: true,
    message: `Đã đồng bộ thành công ${createdTemplates.length} mẫu Template từ Google Drive!`,
    count: createdTemplates.length,
    data: createdTemplates
  });
});

/**
 * @desc    Cập nhật Template (Sửa bố cục, duyệt hiển thị, ghim nổi bật, tăng lượt dùng)
 * @route   PUT /api/templates/:id
 */
const updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData._id;

  let updated = null;
  if (global.useLocalDB) {
    updated = await LocalTemplate.findByIdAndUpdate(id, updateData);
  } else {
    const query = getMongoIdQuery(id);
    updated = await Template.findOneAndUpdate(query, updateData, { new: true });
  }

  if (!updated) {
    const err = new Error('Không tìm thấy mẫu Template cần cập nhật.');
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({
    success: true,
    message: 'Đã cập nhật mẫu Template thành công!',
    data: updated
  });
});

/**
 * @desc    Xóa Template
 * @route   DELETE /api/templates/:id
 */
const deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let removed = null;

  if (global.useLocalDB) {
    removed = await LocalTemplate.findByIdAndDelete(id);
  } else {
    const query = getMongoIdQuery(id);
    removed = await Template.findOneAndDelete(query);
  }

  if (!removed) {
    const err = new Error('Không tìm thấy mẫu Template để xóa.');
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({
    success: true,
    message: 'Đã xóa mẫu Template khỏi hệ thống.'
  });
});

/**
 * @desc    Khôi phục 6 mẫu Editorial gốc
 * @route   POST /api/templates/reset
 */
const resetTemplates = asyncHandler(async (req, res) => {
  let data = [];
  if (global.useLocalDB) {
    data = await LocalTemplate.resetDefaults();
  } else {
    await Template.deleteMany({ isSystem: true });
    const mongoDefaults = LocalTemplate.DEFAULT_TEMPLATES.map((t) => {
      const { _id, ...rest } = t;
      return rest;
    });
    await Template.insertMany(mongoDefaults);
    data = await Template.find();
  }

  res.status(200).json({
    success: true,
    message: 'Đã khôi phục bộ 6 mẫu Editorial Storyboard mặc định!',
    count: data.length,
    data
  });
});

module.exports = {
  getTemplates,
  createTemplate,
  importDriveTemplates,
  updateTemplate,
  deleteTemplate,
  resetTemplates
};

