const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'categories.json');

const DEFAULT_CATEGORIES = [
  {
    _id: 'cat_personal',
    id: 'personal',
    title: 'Chụp Cá Nhân / Chân Dung',
    subtitle: 'Nổi bật phong cách riêng, ảnh profile & nghệ thuật',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 890.000đ',
    badge: 'Phổ biến nhất',
    tags: ['Street Style', 'Nghệ Thuật', 'Profile CV', 'Film Tone'],
    duration: '1 - 2 giờ',
    deliverables: 'Toàn bộ file gốc + 15 ảnh chỉnh sửa',
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_couple',
    id: 'couple',
    title: 'Cặp Đôi & Pre-Wedding',
    subtitle: 'Ghi lại câu chuyện tình yêu lãng mạn và ngọt ngào',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 1.800.000đ',
    badge: 'Được yêu thích',
    tags: ['Ngoại cảnh', 'Studio Hàn Quốc', 'Pre-Wedding', 'Vintage'],
    duration: '2 - 3 giờ',
    deliverables: 'Toàn bộ file gốc + 25 ảnh chỉnh sửa',
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_family',
    id: 'family',
    title: 'Ảnh Gia Đình & Bé Yêu',
    subtitle: 'Lưu giữ những khoảnh khắc gắn kết thiêng liêng',
    image: 'https://images.unsplash.com/photo-1581952977263-df621a28a387?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 1.500.000đ',
    badge: 'Ấm cúng',
    tags: ['Studio gia đình', 'Kỷ niệm ngày cưới', 'Bé sơ sinh', 'Tại gia'],
    duration: '2 giờ',
    deliverables: 'Toàn bộ file gốc + 20 ảnh chỉnh sửa',
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_graduation',
    id: 'graduation',
    title: 'Kỷ Yếu / Học Sinh - Sinh Viên',
    subtitle: 'Lưu giữ ký ức thanh xuân tươi đẹp cùng bạn bè',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 250.000đ/người',
    badge: 'Ưu đãi nhóm',
    tags: ['Cử nhân', 'Áo dài', 'Concept độc lạ', 'Party đêm'],
    duration: 'Buổi sáng/chiều',
    deliverables: 'Toàn bộ file gốc + Ảnh tập thể + Ảnh cá nhân',
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_event',
    id: 'event',
    title: 'Sự Kiện & Doanh Nghiệp',
    subtitle: 'Bắt trọn từng khoảnh khắc quan trọng của sự kiện',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 2.500.000đ/buổi',
    badge: 'Chuyên nghiệp',
    tags: ['Hội thảo', 'Gala Dinner', 'Khai trương', 'Teambuilding'],
    duration: 'Theo yêu cầu',
    deliverables: 'Bàn giao ảnh nhanh trong 24h',
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_fashion',
    id: 'fashion',
    title: 'Lookbook & Thời Trang',
    subtitle: 'Tôn vinh sản phẩm, thương hiệu và thần thái người mẫu',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    price: 'Từ 3.000.000đ',
    badge: 'High Fashion',
    tags: ['Editorial', 'Commercial', 'Studio High-key', 'Outdoor'],
    duration: '4 giờ',
    deliverables: 'Retouch chi tiết + File gốc',
    order: 6,
    createdAt: new Date().toISOString()
  }
];

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf8');
  }
};

const readData = () => {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf8');
      return DEFAULT_CATEGORIES;
    }
    return parsed;
  } catch (_) {
    return DEFAULT_CATEGORIES;
  }
};

const writeData = (data) => {
  ensureDataDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

class LocalCategory {
  constructor(data = {}) {
    this._id = data._id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.id = data.id || this._id;
    this.title = data.title || '';
    this.subtitle = data.subtitle || '';
    this.image = data.image || '';
    this.price = data.price || 'Thỏa thuận';
    this.badge = data.badge || '';
    this.tags = Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(s => s.trim()) : []);
    this.duration = data.duration || 'Thỏa thuận';
    this.deliverables = data.deliverables || 'Toàn bộ file gốc';
    this.order = Number(data.order) || 1;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  async save() {
    const list = readData();
    const targetId = String(this._id || this.id);
    const idx = list.findIndex(c => String(c._id) === targetId || String(c.id) === targetId);
    if (idx !== -1) {
      list[idx] = { ...this };
    } else {
      list.push({ ...this });
    }
    writeData(list);
    return this;
  }

  static async find() {
    return readData();
  }

  static async findById(id) {
    const list = readData();
    const targetId = String(id);
    return list.find(c => String(c._id) === targetId || String(c.id) === targetId) || null;
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const list = readData();
    const targetId = String(id);
    const idx = list.findIndex(c => String(c._id) === targetId || String(c.id) === targetId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updateData };
    writeData(list);
    return list[idx];
  }

  static async findByIdAndDelete(id) {
    const list = readData();
    const targetId = String(id);
    const idx = list.findIndex(c => String(c._id) === targetId || String(c.id) === targetId);
    if (idx === -1) return null;
    const removed = list.splice(idx, 1)[0];
    writeData(list);
    return removed;
  }

  static async resetDefaults() {
    writeData(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
}

LocalCategory.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
module.exports = LocalCategory;
