const mongoose = require('mongoose');
const LocalAddon = require('./LocalAddon');

const AddonSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, default: 0 },
  priceDisplay: { type: String, default: '', trim: true },
  unit: { type: String, default: 'gói', trim: true },
  description: { type: String, default: '', trim: true },
  icon: { type: String, default: 'Sparkles', trim: true },
  badge: { type: String, default: '', trim: true },
  isActive: { type: Boolean, default: true },
  isRecommended: { type: Boolean, default: false },
  order: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const MongooseAddon = mongoose.models.Addon || mongoose.model('Addon', AddonSchema);

const AddonProxy = new Proxy(MongooseAddon, {
  get(target, prop) {
    if (global.useLocalDB) {
      if (typeof LocalAddon[prop] === 'function') {
        return LocalAddon[prop].bind(LocalAddon);
      }
      return LocalAddon[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useLocalDB) {
      return new LocalAddon(...args);
    }
    return new target(...args);
  }
});

module.exports = AddonProxy;
