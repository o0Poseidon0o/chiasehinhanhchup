const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'addons.json');

const DEFAULT_ADDONS = [
  {
    _id: 'addon_makeup',
    id: 'makeup',
    name: 'Makeup & Làm Tóc Chuyên Nghiệp',
    price: 350000,
    priceDisplay: '+ 350.000đ',
    unit: 'lần',
    description: 'Trang điểm tự nhiên, phong cách Hàn Quốc/Lookbook & làm tóc đi kèm',
    icon: 'Scissors',
    badge: '🔥 Phổ biến',
    isActive: true,
    isRecommended: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'addon_costume',
    id: 'costume',
    name: 'Cho Thuê Trang Phục / Áo Dài / Concept',
    price: 250000,
    priceDisplay: '+ 250.000đ',
    unit: 'bộ',
    description: 'Bao gồm phụ kiện đi kèm, nhiều kích cỡ từ Vintage, Cổ phục đến Hiện đại',
    icon: 'Shirt',
    badge: 'Được yêu thích',
    isActive: true,
    isRecommended: false,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'addon_fast_delivery',
    id: 'fast_delivery',
    name: 'Giao Ảnh Hậu Kỳ Nhanh Trong 24h',
    price: 200000,
    priceDisplay: '+ 200.000đ',
    unit: 'gói',
    description: 'Nhận toàn bộ ảnh chọn chỉnh màu đẹp lung linh ngay trong 24 giờ',
    icon: 'Zap',
    badge: '⚡ Nhanh 24h',
    isActive: true,
    isRecommended: false,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'addon_photobook',
    id: 'photobook',
    name: 'In Photobook / Ảnh Ép Gỗ Cao Cấp',
    price: 450000,
    priceDisplay: '+ 450.000đ',
    unit: 'cuốn',
    description: 'Album ảnh photobook bìa cứng hoặc 1 ảnh ép gỗ trang trí để bàn',
    icon: 'BookOpen',
    badge: '✨ Cao cấp',
    isActive: true,
    isRecommended: false,
    order: 4,
    createdAt: new Date().toISOString()
  }
];

const ensureDataFile = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_ADDONS, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Lỗi khi khởi tạo tệp addons.json:', err.message);
  }
};

const readAddons = () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc addons.json:', err.message);
    return [...DEFAULT_ADDONS];
  }
};

const writeAddons = (list) => {
  ensureDataFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Lỗi ghi addons.json:', err.message);
    return false;
  }
};

class LocalAddon {
  constructor(data) {
    this._id = data._id || `addon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.id = data.id || this._id;
    this.name = data.name || '';
    this.price = typeof data.price === 'number' ? data.price : (Number(data.price) || 0);
    this.priceDisplay = data.priceDisplay || `+ ${this.price.toLocaleString('vi-VN')}đ`;
    this.unit = data.unit || 'gói';
    this.description = data.description || '';
    this.icon = data.icon || 'Sparkles';
    this.badge = data.badge || '';
    this.isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
    this.isRecommended = Boolean(data.isRecommended);
    this.order = Number(data.order) || 1;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  async save() {
    const list = readAddons();
    const existingIndex = list.findIndex(item => item._id === this._id || item.id === this.id);
    const plainObj = { ...this };
    if (existingIndex >= 0) {
      list[existingIndex] = plainObj;
    } else {
      list.push(plainObj);
    }
    writeAddons(list);
    return this;
  }

  static async find(query = {}) {
    let list = readAddons();
    if (query.isActive !== undefined) {
      list = list.filter(item => item.isActive === query.isActive);
    }
    list.sort((a, b) => (Number(a.order) || 1) - (Number(b.order) || 1));
    return list.map(item => new LocalAddon(item));
  }

  static async findById(id) {
    if (!id) return null;
    const list = readAddons();
    const strId = String(id);
    const item = list.find(x => String(x._id) === strId || String(x.id) === strId);
    return item ? new LocalAddon(item) : null;
  }

  static async findOne(query = {}) {
    const list = await this.find(query);
    return list.length > 0 ? list[0] : null;
  }

  static async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const list = readAddons();
    const strId = String(id);
    const index = list.findIndex(x => String(x._id) === strId || String(x.id) === strId);
    if (index === -1) return null;

    if (updateData.price !== undefined) {
      updateData.price = typeof updateData.price === 'number' ? updateData.price : (Number(updateData.price) || 0);
      if (!updateData.priceDisplay) {
        updateData.priceDisplay = `+ ${updateData.price.toLocaleString('vi-VN')}đ`;
      }
    }

    const updated = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    list[index] = updated;
    writeAddons(list);
    return new LocalAddon(updated);
  }

  static async findByIdAndDelete(id) {
    const list = readAddons();
    const strId = String(id);
    const filtered = list.filter(x => String(x._id) !== strId && String(x.id) !== strId);
    if (filtered.length !== list.length) {
      writeAddons(filtered);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  static async resetDefaults() {
    writeAddons(DEFAULT_ADDONS);
    return DEFAULT_ADDONS.map(item => new LocalAddon(item));
  }
}

module.exports = LocalAddon;
