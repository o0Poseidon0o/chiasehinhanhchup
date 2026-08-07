/**
 * Middleware kiểm tra dữ liệu khi tạo Album
 */
const validateCreateAlbum = (req, res, next) => {
  const { title, driveFolderUrl } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    const error = new Error('Vui lòng nhập Tên Album.');
    error.statusCode = 400;
    return next(error);
  }

  if (!driveFolderUrl || typeof driveFolderUrl !== 'string' || !driveFolderUrl.trim()) {
    const error = new Error('Vui lòng nhập Đường dẫn thư mục Google Drive.');
    error.statusCode = 400;
    return next(error);
  }

  next();
};

/**
 * Middleware kiểm tra dữ liệu khi submit chọn ảnh
 */
const validateSubmitSelection = (req, res, next) => {
  const { selectedImages } = req.body;

  if (!Array.isArray(selectedImages) || selectedImages.length === 0) {
    const error = new Error('Vui lòng chọn ít nhất 1 hình ảnh trước khi gửi.');
    error.statusCode = 400;
    return next(error);
  }

  next();
};

/**
 * Middleware kiểm tra token quản trị
 */
const validateManageToken = (req, res, next) => {
  const token = req.query.token || req.headers['x-manage-token'];

  if (!token) {
    const error = new Error('Thiếu Token quản trị (Manage Token).');
    error.statusCode = 401;
    return next(error);
  }

  req.manageToken = token;
  next();
};

/**
 * Middleware kiểm tra mật khẩu Admin toàn hệ thống
 */
const validateAdminPassword = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const provided = req.headers['x-admin-password'] || req.query.adminPassword || req.body?.adminPassword;

  if (!provided || provided !== adminPassword) {
    const error = new Error('Mật khẩu Admin không chính xác hoặc bạn không có quyền truy cập trang quản trị.');
    error.statusCode = 401;
    return next(error);
  }

  next();
};

module.exports = {
  validateCreateAlbum,
  validateSubmitSelection,
  validateManageToken,
  validateAdminPassword
};
