const mongoose = require('mongoose');
const Addon = require('../models/Addon');
const LocalAddon = require('../models/LocalAddon');

const DEFAULT_ADDONS = [
  {
    id: 'makeup',
    name: 'Makeup & Làm Tóc Chuyên Nghiệp',
    price: 350000,
    priceDisplay: '+ 350.000đ',
    unit: 'lần',
    description: 'Trang điểm tự nhiên, phong cách Hàn Quốc/Lookbook & làm tóc đi kèm',
    icon: 'Scissors',
    badge: '🔥 Phổ biến',
    isActive: true,
    isRecommended: true,
    order: 1
  },
  {
    id: 'costume',
    name: 'Cho Thuê Trang Phục / Áo Dài / Concept',
    price: 250000,
    priceDisplay: '+ 250.000đ',
    unit: 'bộ',
    description: 'Bao gồm phụ kiện đi kèm, nhiều kích cỡ từ Vintage, Cổ phục đến Hiện đại',
    icon: 'Shirt',
    badge: 'Được yêu thích',
    isActive: true,
    isRecommended: false,
    order: 2
  },
  {
    id: 'fast_delivery',
    name: 'Giao Ảnh Hậu Kỳ Nhanh Trong 24h',
    price: 200000,
    priceDisplay: '+ 200.000đ',
    unit: 'gói',
    description: 'Nhận toàn bộ ảnh chọn chỉnh màu đẹp lung linh ngay trong 24 giờ',
    icon: 'Zap',
    badge: '⚡ Nhanh 24h',
    isActive: true,
    isRecommended: false,
    order: 3
  },
  {
    id: 'photobook',
    name: 'In Photobook / Ảnh Ép Gỗ Cao Cấp',
    price: 450000,
    priceDisplay: '+ 450.000đ',
    unit: 'cuốn',
    description: 'Album ảnh photobook bìa cứng hoặc 1 ảnh ép gỗ trang trí để bàn',
    icon: 'BookOpen',
    badge: '✨ Cao cấp',
    isActive: true,
    isRecommended: false,
    order: 4
  }
];

const getMongoIdQuery = (id) => {
  const strId = String(id);
  const conditions = [{ _id: strId }, { id: strId }];
  if (mongoose.Types.ObjectId.isValid(strId)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(strId) });
  }
  return { $or: conditions };
};

const getAddons = async (options = {}) => {
  const { onlyActive = false } = options;
  const query = onlyActive ? { isActive: true } : {};

  let addons = await Addon.find(query);

  // Nếu DB trống hoàn toàn, tự động nạp các dịch vụ mặc định
  if ((!addons || addons.length === 0) && !onlyActive) {
    addons = await resetAddons();
  }

  const list = Array.isArray(addons) ? [...addons] : [];
  list.sort((a, b) => (Number(a.order) || 1) - (Number(b.order) || 1));
  return list;
};

const getAddonById = async (id) => {
  if (!id) {
    const err = new Error('Thiếu ID dịch vụ đi kèm.');
    err.statusCode = 400;
    throw err;
  }

  if (global.useLocalDB) {
    const addon = await LocalAddon.findById(id);
    if (!addon) {
      const err = new Error('Không tìm thấy dịch vụ đi kèm này.');
      err.statusCode = 404;
      throw err;
    }
    return addon;
  }

  const query = getMongoIdQuery(id);
  const addon = await Addon.findOne(query);
  if (!addon) {
    const err = new Error('Không tìm thấy dịch vụ đi kèm này.');
    err.statusCode = 404;
    throw err;
  }
  return addon;
};

const createAddon = async (data) => {
  const { name, price, unit, description, icon, badge, isRecommended, order } = data;

  if (!name || !name.trim()) {
    const err = new Error('Vui lòng nhập tên dịch vụ đi kèm.');
    err.statusCode = 400;
    throw err;
  }

  const numPrice = typeof price === 'number' ? price : (Number(String(price).replace(/\D/g, '')) || 0);
  const generatedId = `addon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const displayPrice = `+ ${numPrice.toLocaleString('vi-VN')}đ`;

  const newAddon = new Addon({
    id: generatedId,
    name: name.trim(),
    price: numPrice,
    priceDisplay: displayPrice,
    unit: (unit || 'gói').trim(),
    description: (description || '').trim(),
    icon: (icon || 'Sparkles').trim(),
    badge: (badge || '').trim(),
    isActive: true,
    isRecommended: Boolean(isRecommended),
    order: Number(order) || 1,
    createdAt: new Date()
  });

  await newAddon.save();
  return newAddon;
};

const updateAddon = async (id, data) => {
  const existing = await getAddonById(id);

  let numPrice = existing.price;
  if (data.price !== undefined) {
    numPrice = typeof data.price === 'number' ? data.price : (Number(String(data.price).replace(/\D/g, '')) || 0);
  }

  const displayPrice = `+ ${numPrice.toLocaleString('vi-VN')}đ`;

  const updateFields = {
    name: data.name !== undefined ? data.name.trim() : existing.name,
    price: numPrice,
    priceDisplay: displayPrice,
    unit: data.unit !== undefined ? data.unit.trim() : existing.unit,
    description: data.description !== undefined ? data.description.trim() : existing.description,
    icon: data.icon !== undefined ? data.icon.trim() : existing.icon,
    badge: data.badge !== undefined ? data.badge.trim() : existing.badge,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
    isRecommended: data.isRecommended !== undefined ? Boolean(data.isRecommended) : existing.isRecommended,
    order: data.order !== undefined ? Number(data.order) : existing.order
  };

  if (global.useLocalDB) {
    return await LocalAddon.findByIdAndUpdate(id, updateFields);
  }

  const query = getMongoIdQuery(id);
  const updated = await Addon.findOneAndUpdate(query, { $set: updateFields }, { new: true });
  return updated;
};

const toggleAddonActive = async (id) => {
  const existing = await getAddonById(id);
  const newStatus = !existing.isActive;

  if (global.useLocalDB) {
    return await LocalAddon.findByIdAndUpdate(id, { isActive: newStatus });
  }

  const query = getMongoIdQuery(id);
  const updated = await Addon.findOneAndUpdate(query, { $set: { isActive: newStatus } }, { new: true });
  return updated;
};

const deleteAddon = async (id) => {
  await getAddonById(id);

  if (global.useLocalDB) {
    await LocalAddon.findByIdAndDelete(id);
    return { success: true, message: 'Đã xóa dịch vụ đi kèm thành công!' };
  }

  const query = getMongoIdQuery(id);
  await Addon.findOneAndDelete(query);
  return { success: true, message: 'Đã xóa dịch vụ đi kèm thành công!' };
};

const resetAddons = async () => {
  if (global.useLocalDB) {
    return await LocalAddon.resetDefaults();
  }

  await Addon.deleteMany({});
  const inserted = await Addon.insertMany(DEFAULT_ADDONS);
  return inserted;
};

module.exports = {
  getAddons,
  getAddonById,
  createAddon,
  updateAddon,
  toggleAddonActive,
  deleteAddon,
  resetAddons
};
