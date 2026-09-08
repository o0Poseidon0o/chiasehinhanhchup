const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  key: 'contact_settings',
  hotline: '0777908179',
  hotlineDisplay: '0777 908 179',
  hotlineHours: '8h - 22h hàng ngày',
  enableHotline: true,

  telegramUrl: 'https://t.me/photodate',
  telegramSubtext: 'Chat Telegram 24/7',
  enableTelegram: true,

  zaloUrl: 'https://zalo.me/0777908179',
  zaloSubtext: 'Phản hồi sau 1 phút',
  enableZalo: false,

  messengerUrl: 'https://m.me/photodate.vn',
  messengerSubtext: 'Hỗ trợ 24/7',
  enableMessenger: false,

  supportPillText: 'Tư vấn hỗ trợ',
  supportPillSubtext: 'Trả lời tức thì • 24/7',
  enableSupportPill: true,
  updatedAt: new Date().toISOString()
};

function ensureFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify([DEFAULT_SETTINGS], null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Error ensuring settings.json:', e);
  }
}

function readData() {
  ensureFile();
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [DEFAULT_SETTINGS];
  }
}

function writeData(data) {
  ensureFile();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing settings.json:', e);
  }
}

class LocalSetting {
  static async findOne(query = {}) {
    const items = readData();
    const key = query.key || 'contact_settings';
    const found = items.find(s => s.key === key);
    return found ? { ...DEFAULT_SETTINGS, ...found } : { ...DEFAULT_SETTINGS };
  }

  static async find(query = {}) {
    const items = readData();
    return items;
  }

  static async findOneAndUpdate(query = {}, update = {}, options = { new: true, upsert: true }) {
    const items = readData();
    const key = query.key || 'contact_settings';
    const idx = items.findIndex(s => s.key === key);
    
    const current = idx >= 0 ? items[idx] : { ...DEFAULT_SETTINGS };
    const updated = {
      ...current,
      ...(update.$set || update),
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      items[idx] = updated;
    } else {
      items.push(updated);
    }

    writeData(items);
    return updated;
  }
}

module.exports = LocalSetting;
