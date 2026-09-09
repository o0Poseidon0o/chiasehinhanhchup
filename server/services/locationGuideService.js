const LocationGuide = require('../models/LocationGuide');
const LocalLocationGuide = require('../models/LocalLocationGuide');

const getRegionName = (region) => {
  switch (region) {
    case 'central': return 'Miền Trung';
    case 'south': return 'Miền Nam';
    case 'highlands': return 'Tây Nguyên';
    case 'north':
    default:
      return 'Miền Bắc';
  }
};

/**
 * Lấy danh sách địa điểm chụp ảnh (có filter theo vùng miền hoặc nổi bật)
 */
const getLocations = async (query = {}) => {
  let filter = {};
  if (query.region && query.region !== 'all') {
    filter.region = query.region;
  }
  if (query.featured === 'true' || query.featured === true) {
    filter.isFeatured = true;
  }

  let locations = await LocationGuide.find(filter);

  // Nếu DB trống hoàn toàn, tự động nạp danh sách mẫu ban đầu
  if ((!locations || locations.length === 0) && (!query.region || query.region === 'all')) {
    try {
      const defaults = LocalLocationGuide.DEFAULT_LOCATIONS || [];
      for (const item of defaults) {
        const { _id, ...rest } = item;
        await LocationGuide.create(rest);
      }
      locations = await LocationGuide.find(filter);
    } catch (_) {}
  }

  const safeList = Array.isArray(locations) ? locations : [];
  return safeList.sort((a, b) => (a.order || 0) - (b.order || 0));
};

/**
 * Lấy chi tiết 1 địa điểm
 */
const getLocationById = async (id) => {
  const loc = await LocationGuide.findById(id);
  if (!loc) {
    const error = new Error('Không tìm thấy địa điểm chụp ảnh này.');
    error.statusCode = 404;
    throw error;
  }
  return loc;
};

/**
 * Tạo mới địa điểm chụp ảnh
 */
const createLocation = async (data) => {
  if (!data.name || !String(data.name).trim()) {
    const error = new Error('Vui lòng nhập tên địa điểm chụp ảnh.');
    error.statusCode = 400;
    throw error;
  }
  if (!data.city || !String(data.city).trim()) {
    const error = new Error('Vui lòng nhập Tỉnh / Thành phố.');
    error.statusCode = 400;
    throw error;
  }
  if (!data.image || !String(data.image).trim()) {
    const error = new Error('Vui lòng cung cấp link hình ảnh đại diện của địa điểm.');
    error.statusCode = 400;
    throw error;
  }

  const region = data.region || 'north';
  const regionName = data.regionName || getRegionName(region);

  const suitableConcepts = Array.isArray(data.suitableConcepts)
    ? data.suitableConcepts
    : (data.suitableConcepts ? String(data.suitableConcepts).split(',').map(s => s.trim()).filter(Boolean) : []);

  const newLoc = new LocationGuide({
    name: String(data.name).trim(),
    city: String(data.city).trim(),
    region,
    regionName,
    image: String(data.image).trim(),
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    description: String(data.description || '').trim(),
    bestTime: String(data.bestTime || '').trim(),
    ticketPrice: String(data.ticketPrice || 'Miễn phí').trim(),
    suitableConcepts,
    tips: String(data.tips || '').trim(),
    isFeatured: Boolean(data.isFeatured),
    order: Number(data.order) || 1
  });

  return await newLoc.save();
};

/**
 * Cập nhật địa điểm chụp ảnh
 */
const updateLocation = async (id, data) => {
  const loc = await LocationGuide.findById(id);
  if (!loc) {
    const error = new Error('Không tìm thấy địa điểm để cập nhật.');
    error.statusCode = 404;
    throw error;
  }

  const updatePayload = { ...data };
  if (updatePayload.region && !updatePayload.regionName) {
    updatePayload.regionName = getRegionName(updatePayload.region);
  }
  if (updatePayload.suitableConcepts && !Array.isArray(updatePayload.suitableConcepts)) {
    updatePayload.suitableConcepts = String(updatePayload.suitableConcepts)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  return await LocationGuide.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
};

/**
 * Xóa địa điểm chụp ảnh
 */
const deleteLocation = async (id) => {
  const loc = await LocationGuide.findById(id);
  if (!loc) {
    const error = new Error('Không tìm thấy địa điểm chụp ảnh cần xóa.');
    error.statusCode = 404;
    throw error;
  }
  await LocationGuide.findByIdAndDelete(id);
  return { success: true, message: 'Đã xóa địa điểm chụp ảnh thành công.' };
};

/**
 * Khôi phục danh sách địa điểm mẫu kinh điển
 */
const resetLocations = async () => {
  try {
    await LocationGuide.deleteMany({});
  } catch (_) {}

  const defaults = LocalLocationGuide.DEFAULT_LOCATIONS || [];
  const created = [];
  for (const item of defaults) {
    const { _id, ...rest } = item;
    const doc = await LocationGuide.create(rest);
    created.push(doc);
  }
  return created;
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  resetLocations
};
