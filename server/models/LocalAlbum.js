const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE_PATH = process.env.VERCEL 
  ? '/tmp/albums.json' 
  : path.join(__dirname, '../data/albums.json');

/**
 * Đảm bảo file JSON và thư mục tồn tại, đồng thời hợp lệ
 */
const ensureDbFile = () => {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('ensureDbFile error:', err.message);
  }
};

/**
 * Đọc dữ liệu từ file JSON một cách an toàn tuyệt đối
 * @returns {Array<Object>}
 */
const readDb = () => {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
    if (!raw || typeof raw !== 'string') {
      return [];
    }
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      writeDb([]);
      return [];
    }
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    writeDb([]);
    return [];
  } catch (err) {
    console.error('Lỗi khi đọc file CSDL LocalAlbum, tự động reset về []:', err.message);
    try {
      writeDb([]);
    } catch (_) {}
    return [];
  }
};

/**
 * Ghi dữ liệu vào file JSON một cách an toàn
 * @param {Array<Object>} albums 
 */
const writeDb = (albums) => {
  ensureDbFile();
  const safeData = Array.isArray(albums) ? albums : [];
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(safeData, null, 2), 'utf8');
  } catch (err) {
    console.error('Lỗi khi ghi file CSDL LocalAlbum:', err.message);
  }
};

/**
 * Model Album lưu trữ trực tiếp bằng file JSON cục bộ
 */
class LocalAlbum {
  constructor(data = {}) {
    this._id = data._id || crypto.randomBytes(12).toString('hex');
    this.title = data.title || 'Album';
    this.driveFolderUrl = data.driveFolderUrl || '';
    this.driveFolderId = data.driveFolderId || '';
    this.passcode = data.passcode || '';
    this.manageToken = data.manageToken || crypto.randomBytes(16).toString('hex');
    this.maxSelect = Number(data.maxSelect) || 0;
    this.allowDownload = data.allowDownload !== undefined ? Boolean(data.allowDownload) : true;
    this.allowComment = data.allowComment !== undefined ? Boolean(data.allowComment) : true;
    this.status = data.status || 'selecting';
    this.clientInfo = data.clientInfo || { name: '', phone: '', note: '' };
    this.images = Array.isArray(data.images) ? data.images : [];
    this.selectedImages = Array.isArray(data.selectedImages) ? data.selectedImages : [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  /**
   * Lưu hoặc cập nhật album vào file JSON
   */
  async save() {
    const albums = readDb();
    const index = albums.findIndex(a => a && a._id && a._id.toString() === this._id.toString());

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

    writeDb(albums);
    return this;
  }

  /**
   * Tìm album theo ID
   * @param {string} id 
   */
  static async findById(id) {
    if (!id) return null;
    const albums = readDb();
    const found = albums.find(a => a && a._id && a._id.toString() === id.toString());
    if (!found) return null;
    return new LocalAlbum(found);
  }

  /**
   * Lấy danh sách tất cả album
   */
  static async find() {
    const albums = readDb();
    return albums
      .filter(a => a && a._id)
      .map(a => new LocalAlbum(a));
  }

  /**
   * Xóa album theo ID
   * @param {string} id
   */
  static async findByIdAndDelete(id) {
    if (!id) return null;
    const albums = readDb();
    const index = albums.findIndex(a => a && a._id && a._id.toString() === id.toString());
    if (index === -1) return null;
    const [deleted] = albums.splice(index, 1);
    writeDb(albums);
    return new LocalAlbum(deleted);
  }
}

module.exports = LocalAlbum;
