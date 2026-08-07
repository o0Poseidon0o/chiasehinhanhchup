/**
 * Async handler wrapper giúp loại bỏ các khối try-catch lặp đi lặp lại trong Controller
 * @param {Function} fn 
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware bắt lỗi 404 khi không tìm thấy route
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Đường dẫn không tồn tại: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware bắt lỗi toàn cục (Global Error Handler)
 */
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';

  if (statusCode === 500) {
    console.error('Unhandled Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  asyncHandler,
  notFoundHandler,
  globalErrorHandler
};
