const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE_PATH = process.env.VERCEL 
  ? '/tmp/users.json' 
  : path.join(__dirname, '../data/users.json');

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
    console.error('ensureDbFile users error:', err.message);
  }
};

/**
 * Đọc dữ liệu từ file JSON an toàn
 * @returns {Array<Object>}
 */
const readDb = () => {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
    if (!raw || typeof raw !== 'string') return [];
    const trimmed = raw.trim();
    if (!trimmed || trimmed === 'null') return [];
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Lỗi khi đọc file CSDL LocalUser:', err.message);
    return [];
  }
};

/**
 * Ghi dữ liệu vào file JSON an toàn
 * @param {Array<Object>} users 
 */
const writeDb = (users) => {
  ensureDbFile();
  const safeData = Array.isArray(users) ? users : [];
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(safeData, null, 2), 'utf8');
  } catch (err) {
    console.error('Lỗi khi ghi file CSDL LocalUser:', err.message);
  }
};

/**
 * Model User lưu trữ JSON cục bộ
 */
class LocalUser {
  constructor(data = {}) {
    this._id = data._id || crypto.randomBytes(12).toString('hex');
    this.name = data.name || '';
    this.email = (data.email || '').toLowerCase().trim();
    this.phone = data.phone || '';
    this.password = data.password || '';
    this.role = data.role || 'client'; // 'admin' | 'photographer' | 'client'
    this.status = data.status || (this.role === 'photographer' ? 'pending' : 'active'); // 'pending' | 'active' | 'rejected' | 'inactive'
    this.studioInfo = data.studioInfo || {
      portfolioUrl: '',
      experience: '',
      equipment: '',
      styles: '',
      location: '',
      bio: ''
    };
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;
  }

  async save() {
    const users = readDb();
    const index = users.findIndex(u => u && u._id && u._id.toString() === this._id.toString());

    const serialized = {
      _id: this._id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.role,
      status: this.status,
      studioInfo: this.studioInfo,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };

    if (index >= 0) {
      users[index] = serialized;
    } else {
      users.push(serialized);
    }

    writeDb(users);
    return this;
  }

  static async findById(id) {
    if (!id) return null;
    const users = readDb();
    const found = users.find(u => u && u._id && u._id.toString() === id.toString());
    if (!found) return null;
    return new LocalUser(found);
  }

  static async findOne(query = {}) {
    const users = readDb();
    const found = users.find(u => {
      if (!u) return false;
      if (query.email && u.email && u.email.toLowerCase() === query.email.toLowerCase()) return true;
      if (query.phone && u.phone && u.phone === query.phone) return true;
      if (query._id && u._id && u._id.toString() === query._id.toString()) return true;
      return false;
    });
    if (!found) return null;
    return new LocalUser(found);
  }

  static async find(query = {}) {
    const users = readDb();
    return users
      .filter(u => {
        if (!u || !u._id) return false;
        if (query.role && u.role !== query.role) return false;
        if (query.status && u.status !== query.status) return false;
        return true;
      })
      .map(u => new LocalUser(u));
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    if (!id) return null;
    const users = readDb();
    const index = users.findIndex(u => u && u._id && u._id.toString() === id.toString());
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updateData,
      studioInfo: {
        ...(users[index].studioInfo || {}),
        ...(updateData.studioInfo || {})
      }
    };

    writeDb(users);
    return new LocalUser(users[index]);
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const users = readDb();
    const index = users.findIndex(u => u && u._id && u._id.toString() === id.toString());
    if (index === -1) return null;
    const [deleted] = users.splice(index, 1);
    writeDb(users);
    return new LocalUser(deleted);
  }
}

module.exports = LocalUser;
