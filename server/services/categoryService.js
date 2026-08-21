const mongoose = require('mongoose');
const Category = require('../models/Category');

/**
 * Helper tạo query hỗ trợ cả MongoDB ObjectId lẫn String ID
 */
const getMongoIdQuery = (id) => {
  const strId = String(id);
  const conditions = [{ _id: strId }, { id: strId }];
  if (mongoose.Types.ObjectId.isValid(strId)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(strId) });
  }
  return { $or: conditions };
};

/**
 * Lấy danh sách tất cả các thể loại chụp ảnh nổi bật (sắp xếp theo order)
 */
const getCategories = async () => {
  const categories = await Category.find();
  const list = Array.isArray(categories) ? [...categories] : [];
  list.sort((a, b) => (Number(a.order) || 1) - (Number(b.order) || 1));
  return list;
};

/**
 * Lấy chi tiết thể loại chụp ảnh theo ID
 */
const getCategoryById = async (id) => {
  if (!id) {
    const err = new Error('Thiếu ID thể loại chụp.');
    err.statusCode = 400;
    throw err;
  }

  if (global.useLocalDB) {
    const LocalCategory = require('../models/LocalCategory');
    const cat = await LocalCategory.findById(id);
    if (!cat) {
      const err = new Error('Không tìm thấy thể loại chụp ảnh này.');
      err.statusCode = 404;
      throw err;
    }
    return cat;
  }

  const query = getMongoIdQuery(id);
  const category = await Category.findOne(query);
  if (!category) {
    const err = new Error('Không tìm thấy thể loại chụp ảnh này.');
    err.statusCode = 404;
    throw err;
  }
  return category;
};

/**
 * Tạo thể loại chụp ảnh mới (Master Admin)
 */
const createCategory = async (data) => {
  const { title, subtitle, image, price, badge, tags, duration, deliverables, order } = data;

  if (!title || !title.trim()) {
    const err = new Error('Vui lòng nhập tiêu đề thể loại chụp ảnh.');
    err.statusCode = 400;
    throw err;
  }

  if (!image || !image.trim()) {
    const err = new Error('Vui lòng nhập đường dẫn hình ảnh đại diện cho thể loại.');
    err.statusCode = 400;
    throw err;
  }

  const tagList = Array.isArray(tags) 
    ? tags 
    : (typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : []);

  const generatedId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newCategory = new Category({
    id: generatedId,
    title: title.trim(),
    subtitle: (subtitle || '').trim(),
    image: image.trim(),
    price: (price || 'Thỏa thuận').trim(),
    badge: (badge || '').trim(),
    tags: tagList,
    duration: (duration || 'Thỏa thuận').trim(),
    deliverables: (deliverables || 'Toàn bộ file gốc').trim(),
    order: Number(order) || 1,
    createdAt: new Date()
  });

  await newCategory.save();
  return newCategory;
};

/**
 * Cập nhật thể loại chụp ảnh (Master Admin)
 */
const updateCategory = async (id, data) => {
  const updateFields = {};
  if (data.title !== undefined) updateFields.title = data.title.trim();
  if (data.subtitle !== undefined) updateFields.subtitle = data.subtitle.trim();
  if (data.image !== undefined) updateFields.image = data.image.trim();
  if (data.price !== undefined) updateFields.price = data.price.trim();
  if (data.badge !== undefined) updateFields.badge = data.badge.trim();
  if (data.duration !== undefined) updateFields.duration = data.duration.trim();
  if (data.deliverables !== undefined) updateFields.deliverables = data.deliverables.trim();
  if (data.order !== undefined) updateFields.order = Number(data.order) || 1;

  if (data.tags !== undefined) {
    updateFields.tags = Array.isArray(data.tags)
      ? data.tags
      : (typeof data.tags === 'string' ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : []);
  }

  if (global.useLocalDB) {
    const LocalCategory = require('../models/LocalCategory');
    const updated = await LocalCategory.findByIdAndUpdate(id, updateFields);
    if (!updated) {
      const err = new Error('Không tìm thấy thể loại chụp ảnh để cập nhật.');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }

  const query = getMongoIdQuery(id);
  const updated = await Category.findOneAndUpdate(query, updateFields, { new: true });
  if (!updated) {
    const err = new Error('Không tìm thấy thể loại chụp ảnh để cập nhật.');
    err.statusCode = 404;
    throw err;
  }
  return updated;
};

/**
 * Xóa thể loại chụp ảnh (Master Admin)
 */
const deleteCategory = async (id) => {
  if (global.useLocalDB) {
    const LocalCategory = require('../models/LocalCategory');
    const removed = await LocalCategory.findByIdAndDelete(id);
    if (!removed) {
      const err = new Error('Không tìm thấy thể loại chụp ảnh để xóa.');
      err.statusCode = 404;
      throw err;
    }
    return { message: 'Đã xóa thể loại chụp ảnh thành công.' };
  }

  const query = getMongoIdQuery(id);
  const removed = await Category.findOneAndDelete(query);
  if (!removed) {
    const err = new Error('Không tìm thấy thể loại chụp ảnh để xóa.');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Đã xóa thể loại chụp ảnh thành công.' };
};

/**
 * Khôi phục danh sách 6 thể loại chụp ảnh mặc định ban đầu
 */
const resetCategories = async () => {
  const LocalCategory = require('../models/LocalCategory');
  if (global.useLocalDB) {
    const defaults = await LocalCategory.resetDefaults();
    return defaults;
  } else {
    await Category.deleteMany({});
    const mongoDefaults = LocalCategory.DEFAULT_CATEGORIES.map(c => {
      const { _id, ...rest } = c;
      return rest;
    });
    const inserted = await Category.insertMany(mongoDefaults);
    return inserted;
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  resetCategories
};
