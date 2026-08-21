const mongoose = require('mongoose');
const LocalCategory = require('./LocalCategory');

const CategorySchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '', trim: true },
  image: { type: String, required: true, trim: true },
  price: { type: String, default: 'Thỏa thuận', trim: true },
  badge: { type: String, default: '', trim: true },
  tags: { type: [String], default: [] },
  duration: { type: String, default: 'Thỏa thuận', trim: true },
  deliverables: { type: String, default: 'Toàn bộ file gốc', trim: true },
  order: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const MongooseCategory = mongoose.model('Category', CategorySchema);

const CategoryProxy = new Proxy(MongooseCategory, {
  get(target, prop) {
    if (global.useLocalDB) {
      if (typeof LocalCategory[prop] === 'function') {
        return LocalCategory[prop].bind(LocalCategory);
      }
      return LocalCategory[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useLocalDB) {
      return new LocalCategory(...args);
    }
    return new target(...args);
  }
});

module.exports = CategoryProxy;
