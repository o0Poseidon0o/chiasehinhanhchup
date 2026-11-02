const mongoose = require('mongoose');
const LocalTemplate = require('./LocalTemplate');

const TemplateSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '', trim: true },
  category: { type: String, default: 'Pre-Wedding & Cưới', trim: true },
  aspectRatio: { type: String, default: '3:4' },
  isSystem: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, default: 'approved' }, // 'approved' | 'pending' | 'hidden'
  authorId: { type: String, default: '' },
  authorName: { type: String, default: 'Nhiếp Ảnh Gia' },
  usageCount: { type: Number, default: 0 },
  driveOverlayUrl: { type: String, default: '' },
  driveFileId: { type: String, default: '' },
  background: { type: mongoose.Schema.Types.Mixed, default: {} },
  decorCards: { type: [mongoose.Schema.Types.Mixed], default: [] },
  photoSlots: { type: [mongoose.Schema.Types.Mixed], default: [] },
  textLayers: { type: [mongoose.Schema.Types.Mixed], default: [] },
  logoConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const MongooseTemplate = mongoose.model('Template', TemplateSchema);

const TemplateProxy = new Proxy(MongooseTemplate, {
  get(target, prop) {
    if (global.useLocalDB) {
      if (typeof LocalTemplate[prop] === 'function') {
        return LocalTemplate[prop].bind(LocalTemplate);
      }
      return LocalTemplate[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useLocalDB) {
      return new LocalTemplate(...args);
    }
    return new target(...args);
  }
});

module.exports = TemplateProxy;

