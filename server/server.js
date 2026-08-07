const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const albumRoutes = require('./routes/albumRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler');

// Nạp biến môi trường từ file .env
dotenv.config();

// Khởi tạo kết nối cơ sở dữ liệu nền
connectDB();

const app = express();

// Middlewares xử lý request
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware đảm bảo DB luôn sẵn sàng trước khi xử lý mọi request API
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('DB connect middleware warning:', err.message);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbMode: global.useLocalDB ? 'Local JSON' : 'MongoDB',
    connectionState: mongoose.connection.readyState
  });
});

// Gắn route API Album
app.use('/api/albums', albumRoutes);

// Bắt lỗi 404 cho các route không tồn tại
app.use(notFoundHandler);

// Xử lý lỗi tập trung toàn ứng dụng
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
