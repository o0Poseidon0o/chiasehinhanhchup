const mongoose = require('mongoose');
const LocalSetting = require('./LocalSetting');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'contact_settings' },
  hotline: { type: String, default: '0777908179' },
  hotlineDisplay: { type: String, default: '0777 908 179' },
  hotlineHours: { type: String, default: '8h - 22h hàng ngày' },
  enableHotline: { type: Boolean, default: true },

  telegramUrl: { type: String, default: 'https://t.me/photodate' },
  telegramSubtext: { type: String, default: 'Chat Telegram 24/7' },
  enableTelegram: { type: Boolean, default: true },

  zaloUrl: { type: String, default: 'https://zalo.me/0777908179' },
  zaloSubtext: { type: String, default: 'Phản hồi sau 1 phút' },
  enableZalo: { type: Boolean, default: false },

  messengerUrl: { type: String, default: 'https://m.me/photodate.vn' },
  messengerSubtext: { type: String, default: 'Hỗ trợ 24/7' },
  enableMessenger: { type: Boolean, default: false },

  supportPillText: { type: String, default: 'Tư vấn hỗ trợ' },
  supportPillSubtext: { type: String, default: 'Trả lời tức thì • 24/7' },
  enableSupportPill: { type: Boolean, default: true },

  updatedAt: { type: Date, default: Date.now }
});

const MongooseSetting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

const SettingProxy = new Proxy(MongooseSetting, {
  get(target, prop) {
    if (global.useLocalDB) {
      if (typeof LocalSetting[prop] === 'function') {
        return LocalSetting[prop].bind(LocalSetting);
      }
      return LocalSetting[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useLocalDB) {
      return new LocalSetting(...args);
    }
    return new target(...args);
  }
});

module.exports = SettingProxy;
