const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Thiết lập timeout nhanh để không bị treo khi khởi động
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useLocalDB = false;
  } catch (error) {
    console.log(`\n⚠️  Lỗi kết nối MongoDB: ${error.message}`);
    console.log(`⚠️  Tự động kích hoạt CSDL Dự phòng Local JSON (server/data/albums.json) để chạy ứng dụng offline.\n`);
    global.useLocalDB = true;
  }
};

module.exports = connectDB;
