const mongoose = require('mongoose');
const LocalAlbum = require('./LocalAlbum');

// --- Cấu trúc Schema Mongoose ---
const albumSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  driveFolderUrl: { type: String, required: true, trim: true },
  driveFolderId: { type: String, required: true, trim: true },
  passcode: { type: String, default: '', trim: true },
  manageToken: { type: String, required: true },
  maxSelect: { type: Number, default: 0, min: 0 },
  allowDownload: { type: Boolean, default: true },
  allowComment: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['selecting', 'submitted', 'locked'], 
    default: 'selecting' 
  },
  clientInfo: {
    name: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    note: { type: String, default: '', trim: true },
    submittedAt: { type: Date }
  },
  images: [{
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    thumbnailUrl: { type: String },
    embedUrl: { type: String }
  }],
  selectedImages: [{
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    comment: { type: String, default: '' },
    thumbnailUrl: { type: String },
    embedUrl: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

const MongooseAlbum = mongoose.models.Album || mongoose.model('Album', albumSchema);

/**
 * Album Factory / Resolver: Tự động quyết định sử dụng Mongoose hay Local JSON DB
 */
class Album {
  constructor(data) {
    if (global.useLocalDB) {
      return new LocalAlbum(data);
    }
    return new MongooseAlbum(data);
  }

  static async findById(id) {
    if (global.useLocalDB) {
      return await LocalAlbum.findById(id);
    }
    return await MongooseAlbum.findById(id);
  }

  static async find(query = {}) {
    if (global.useLocalDB) {
      return await LocalAlbum.find();
    }
    return await MongooseAlbum.find(query);
  }

  static async findByIdAndDelete(id) {
    if (global.useLocalDB) {
      return await LocalAlbum.findByIdAndDelete(id);
    }
    return await MongooseAlbum.findByIdAndDelete(id);
  }
}

module.exports = Album;
