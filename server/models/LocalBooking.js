const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE_PATH = process.env.VERCEL 
  ? '/tmp/bookings.json' 
  : path.join(__dirname, '../data/bookings.json');

const ensureDbFile = () => {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('ensureDbFile bookings error:', err.message);
  }
};

const readDb = () => {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
    if (!raw || typeof raw !== 'string') return [];
    const trimmed = raw.trim();
    if (!trimmed || trimmed === 'null') return [];
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Lỗi khi đọc file CSDL LocalBooking:', err.message);
    return [];
  }
};

const writeDb = (bookings) => {
  ensureDbFile();
  const safeData = Array.isArray(bookings) ? bookings : [];
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(safeData, null, 2), 'utf8');
  } catch (err) {
    console.error('Lỗi khi ghi file CSDL LocalBooking:', err.message);
  }
};

class LocalBooking {
  constructor(data = {}) {
    this._id = data._id || crypto.randomBytes(12).toString('hex');
    this.photographerId = data.photographerId || '';
    this.photographerName = data.photographerName || '';
    this.clientName = data.clientName || '';
    this.clientPhone = data.clientPhone || '';
    this.clientEmail = data.clientEmail || '';
    this.category = data.category || 'Chân dung';
    this.bookingDate = data.bookingDate || '';
    this.location = data.location || '';
    this.budget = data.budget || '';
    this.note = data.note || '';
    this.status = data.status || 'pending'; // 'pending' | 'confirmed' | 'completed' | 'cancelled'
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  async save() {
    const bookings = readDb();
    const index = bookings.findIndex(b => b && b._id && b._id.toString() === this._id.toString());

    const serialized = {
      _id: this._id,
      photographerId: this.photographerId,
      photographerName: this.photographerName,
      clientName: this.clientName,
      clientPhone: this.clientPhone,
      clientEmail: this.clientEmail,
      category: this.category,
      bookingDate: this.bookingDate,
      location: this.location,
      budget: this.budget,
      note: this.note,
      status: this.status,
      createdAt: this.createdAt
    };

    if (index >= 0) {
      bookings[index] = serialized;
    } else {
      bookings.push(serialized);
    }

    writeDb(bookings);
    return this;
  }

  static async findById(id) {
    if (!id) return null;
    const bookings = readDb();
    const found = bookings.find(b => b && b._id && b._id.toString() === id.toString());
    if (!found) return null;
    return new LocalBooking(found);
  }

  static async find(query = {}) {
    const bookings = readDb();
    return bookings
      .filter(b => {
        if (!b || !b._id) return false;
        if (query.photographerId && b.photographerId !== query.photographerId) return false;
        if (query.status && b.status !== query.status) return false;
        return true;
      })
      .map(b => new LocalBooking(b));
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    if (!id) return null;
    const bookings = readDb();
    const index = bookings.findIndex(b => b && b._id && b._id.toString() === id.toString());
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      ...updateData
    };

    writeDb(bookings);
    return new LocalBooking(bookings[index]);
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const bookings = readDb();
    const index = bookings.findIndex(b => b && b._id && b._id.toString() === id.toString());
    if (index === -1) return null;
    const [deleted] = bookings.splice(index, 1);
    writeDb(bookings);
    return new LocalBooking(deleted);
  }
}

module.exports = LocalBooking;
