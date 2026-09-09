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

  // Cấu hình chế độ kiểm duyệt tài khoản Nhiếp ảnh gia (Mặc định: true = Mở tự do trải nghiệm, không bắt chờ duyệt)
  autoApprovePhotographer: { type: Boolean, default: true },

  // Cấu hình gửi Mail qua Gmail / SMTP dành cho Master Admin
  emailUser: { type: String, default: '', trim: true },
  emailPass: { type: String, default: '', trim: true },
  emailSenderName: { type: String, default: 'Photodate.vn', trim: true },
  emailService: { type: String, default: 'gmail', trim: true }, // 'gmail' | 'smtp' | 'custom'
  emailHost: { type: String, default: '', trim: true }, // Ví dụ: smtp.gmail.com, smtp.domain.com, mail.company.vn
  emailPort: { type: Number, default: 587 }, // 465 (SSL) hoặc 587 (TLS/STARTTLS)
  emailSecure: { type: Boolean, default: false }, // true cho port 465, false cho port 587

  // Mật khẩu tùy chỉnh của Master Admin nếu được đổi qua email
  adminPassword: { type: String, default: '', trim: true },

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
