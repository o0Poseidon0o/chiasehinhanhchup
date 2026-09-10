const mongoose = require('mongoose');
const LocalLocationGuide = require('./LocalLocationGuide');

const LocationGuideSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  ward: { type: String, default: '', trim: true },
  address: { type: String, default: '', trim: true },
  region: { 
    type: String, 
    required: true, 
    enum: ['north', 'central', 'south', 'highlands'], 
    default: 'north' 
  },
  regionName: { type: String, default: 'Miền Bắc', trim: true },
  image: { type: String, required: true, trim: true },
  gallery: { type: [String], default: [] },
  description: { type: String, default: '', trim: true },
  bestTime: { type: String, default: '', trim: true },
  ticketPrice: { type: String, default: 'Miễn phí', trim: true },
  suitableConcepts: { type: [String], default: [] },
  tips: { type: String, default: '', trim: true },
  videoUrl: { type: String, default: '', trim: true },
  videoType: { type: String, default: '', trim: true },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const MongooseLocationGuide = mongoose.model('LocationGuide', LocationGuideSchema);

const LocationGuideProxy = new Proxy(MongooseLocationGuide, {
  get(target, prop) {
    if (global.useLocalDB) {
      if (typeof LocalLocationGuide[prop] === 'function') {
        return LocalLocationGuide[prop].bind(LocalLocationGuide);
      }
      return LocalLocationGuide[prop];
    }
    return target[prop];
  },
  construct(target, args) {
    if (global.useLocalDB) {
      return new LocalLocationGuide(...args);
    }
    return new target(...args);
  }
});

module.exports = LocationGuideProxy;
