const mongoose = require('mongoose');
const LocalGhnAddress = require('./LocalGhnAddress');

const GhnProvinceSchema = new mongoose.Schema({
  provinceId: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  extensionNames: { type: [String], default: [] },
  type: { type: String, default: 'province' },
  status: { type: Number, default: 1 }
}, {
  timestamps: true
});

const MongooseGhnProvince = mongoose.model('GhnProvince', GhnProvinceSchema);

const GhnProvinceProxy = new Proxy(MongooseGhnProvince, {
  get(target, prop) {
    if (global.useLocalDB) {
      if (prop === 'find') {
        return () => ({
          sort: () => Promise.resolve(LocalGhnAddress.getProvinces()),
          lean: () => Promise.resolve(LocalGhnAddress.getProvinces()),
          then: (resolve) => resolve(LocalGhnAddress.getProvinces())
        });
      }
      if (prop === 'findOne') {
        return (query) => {
          const id = query.provinceId;
          return {
            lean: () => Promise.resolve(LocalGhnAddress.getProvinceById(id)),
            then: (resolve) => resolve(LocalGhnAddress.getProvinceById(id))
          };
        };
      }
    }
    return target[prop];
  }
});

module.exports = GhnProvinceProxy;
