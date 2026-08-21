const mongoose = require('mongoose');
const LocalBooking = require('./LocalBooking');

const bookingSchema = new mongoose.Schema({
  photographerId: { type: String, default: '', trim: true },
  photographerName: { type: String, default: '', trim: true },
  clientName: { type: String, required: true, trim: true },
  clientPhone: { type: String, required: true, trim: true },
  clientEmail: { type: String, default: '', trim: true },
  category: { type: String, default: 'Chân dung', trim: true },
  bookingDate: { type: String, default: '', trim: true },
  location: { type: String, default: '', trim: true },
  budget: { type: String, default: '', trim: true },
  note: { type: String, default: '', trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

const MongooseBooking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

class Booking {
  constructor(data) {
    if (global.useLocalDB) {
      return new LocalBooking(data);
    }
    return new MongooseBooking(data);
  }

  static async findById(id) {
    if (global.useLocalDB) {
      return await LocalBooking.findById(id);
    }
    return await MongooseBooking.findById(id);
  }

  static async find(query = {}) {
    if (global.useLocalDB) {
      return await LocalBooking.find(query);
    }
    return await MongooseBooking.find(query);
  }

  static async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (global.useLocalDB) {
      return await LocalBooking.findByIdAndUpdate(id, updateData, options);
    }
    return await MongooseBooking.findByIdAndUpdate(id, updateData, options);
  }

  static async findByIdAndDelete(id) {
    if (global.useLocalDB) {
      return await LocalBooking.findByIdAndDelete(id);
    }
    return await MongooseBooking.findByIdAndDelete(id);
  }
}

module.exports = Booking;
