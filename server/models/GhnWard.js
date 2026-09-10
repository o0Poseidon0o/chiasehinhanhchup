const mongoose = require('mongoose');
const LocalGhnAddress = require('./LocalGhnAddress');

const GhnWardSchema = new mongoose.Schema({
  wardId: { type: Number, required: true, unique: true, index: true },
  provinceId: { type: Number, required: true, index: true },
  provinceName: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  extensionNames: { type: [String], default: [] },
  type: { type: String, default: 'ward' },
  status: { type: Number, default: 1 }
}, {
  timestamps: true
});

const MongooseGhnWard = mongoose.model('GhnWard', GhnWardSchema);

const GhnWardProxy = new Proxy(MongooseGhnWard, {
  get(target, prop) {
    if (global.useLocalDB) {
      if (prop === 'find') {
        return (query = {}) => {
          const list = query.provinceId 
            ? LocalGhnAddress.getWardsByProvinceId(query.provinceId)
            : [];
          return {
            sort: () => Promise.resolve(list),
            lean: () => Promise.resolve(list),
            then: (resolve) => resolve(list)
          };
        };
      }
      if (prop === 'findOne') {
        return (query) => {
          const id = query.wardId;
          return {
            lean: () => Promise.resolve(LocalGhnAddress.getWardById(id)),
            then: (resolve) => resolve(LocalGhnAddress.getWardById(id))
          };
        };
      }
    }
    return target[prop];
  }
});

module.exports = GhnWardProxy;
