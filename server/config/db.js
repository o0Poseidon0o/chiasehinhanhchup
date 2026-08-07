const mongoose = require('mongoose');

const DEFAULT_MONGODB_URI = 'mongodb+srv://chonanhdb:Lenh%40n16587@chonanh.3evokx5.mongodb.net/?appName=chonanh';

let isConnecting = false;

const connectDB = async () => {
  // Nếu đã kết nối rồi (readyState 1 = connected, 2 = connecting), tái sử dụng connection
  if (mongoose.connection.readyState === 1) {
    global.useLocalDB = false;
    return mongoose.connection;
  }

  if (isConnecting) {
    // Đang trong quá trình kết nối, đợi kết nối hoàn tất
    let attempts = 0;
    while (isConnecting && attempts < 30) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    if (mongoose.connection.readyState === 1) {
      global.useLocalDB = false;
      return mongoose.connection;
    }
  }

  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  try {
    isConnecting = true;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useLocalDB = false;
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.log(`\n⚠️  Lỗi kết nối MongoDB: ${error.message}`);
    console.log(`⚠️  Tự động kích hoạt CSDL Dự phòng Local JSON để chạy ứng dụng offline.\n`);
    global.useLocalDB = true;
  }
};

module.exports = connectDB;
