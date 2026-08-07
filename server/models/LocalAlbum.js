const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE_PATH = path.join(__dirname, '../data/albums.json');

/**
 * Đảm bảo file JSON và thư mục tồn tại
 */
const ensureDbFile = () => {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
  }
};

/**
 * Model Album lưu trữ trực tiếp bằng file JSON cục bộ
 */
class LocalAlbum {
  constructor(data = {}) {
    this._id = data._id || crypto.randomBytes(12).toString('hex');
    this.title = data.title;
    this.driveFolderUrl = data.driveFolderUrl;
    this.driveFolderId = data.driveFolderId;
    this.passcode = data.passcode || '';
    this.manageToken = data.manageToken;
    this.maxSelect = data.maxSelect || 0;
    this.allowDownload = data.allowDownload !== undefined ? data.allowDownload : true;
    this.allowComment = data.allowComment !== undefined ? data.allowComment : true;
    this.status = data.status || 'selecting';
    this.clientInfo = data.clientInfo || { name: '', phone: '', note: '' };
    this.images = data.images || [];
    this.selectedImages = data.selectedImages || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  /**
   * Lưu hoặc cập nhật album vào file JSON
   */
  async save() {
    ensureDbFile();
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
    const albums = JSON.parse(raw || '[]');
    const index = albums.findIndex(a => a._id.toString() === this._id.toString());

    const serialized = {
      _id: this._id,
      title: this.title,
      driveFolderUrl: this.driveFolderUrl,
      driveFolderId: this.driveFolderId,
      passcode: this.passcode,
      manageToken: this.manageToken,
      maxSelect: this.maxSelect,
      allowDownload: this.allowDownload,
      allowComment: this.allowComment,
      status: this.status,
      clientInfo: this.clientInfo,
      images: this.images,
      selectedImages: this.selectedImages,
      createdAt: this.createdAt
    };

    if (index >= 0) {
      albums[index] = serialized;
    } else {
      albums.push(serialized);
    }

    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(albums, null, 2), 'utf8');
    return this;
  }

  /**
   * Tìm album theo ID
   * @param {string} id 
   */
  static async findById(id) {
    if (!id) return null;
    ensureDbFile();
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
    const albums = JSON.parse(raw || '[]');
    const found = albums.find(a => a._id.toString() === id.toString());
    if (!found) return null;
    return new LocalAlbum(found);
  }

  /**
   * Lấy danh sách tất cả album
   */
  static async find() {
    ensureDbFile();
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
    const albums = JSON.parse(raw || '[]');
    return albums.map(a => new LocalAlbum(a));
  }
}

module.exports = LocalAlbum;
