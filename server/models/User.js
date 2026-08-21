const mongoose = require('mongoose');
const LocalUser = require('./LocalUser');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'photographer', 'client'], 
    default: 'client' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'rejected', 'inactive'], 
    default: 'active' 
  },
  studioInfo: {
    portfolioUrl: { type: String, default: '', trim: true },
    experience: { type: String, default: '', trim: true },
    equipment: { type: String, default: '', trim: true },
    styles: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    bio: { type: String, default: '', trim: true }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

class User {
  constructor(data) {
    if (global.useLocalDB) {
      return new LocalUser(data);
    }
    return new MongooseUser(data);
  }

  static async findById(id) {
    if (global.useLocalDB) {
      return await LocalUser.findById(id);
    }
    return await MongooseUser.findById(id);
  }

  static async findOne(query = {}) {
    if (global.useLocalDB) {
      return await LocalUser.findOne(query);
    }
    return await MongooseUser.findOne(query);
  }

  static async find(query = {}) {
    if (global.useLocalDB) {
      return await LocalUser.find(query);
    }
    return await MongooseUser.find(query);
  }

  static async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (global.useLocalDB) {
      return await LocalUser.findByIdAndUpdate(id, updateData, options);
    }
    return await MongooseUser.findByIdAndUpdate(id, updateData, options);
  }

  static async findByIdAndDelete(id) {
    if (global.useLocalDB) {
      return await LocalUser.findByIdAndDelete(id);
    }
    return await MongooseUser.findByIdAndDelete(id);
  }
}

module.exports = User;
