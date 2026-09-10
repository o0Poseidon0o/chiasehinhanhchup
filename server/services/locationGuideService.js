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

  // Tự động bổ sung thông tin Phường/Xã và Địa chỉ cụ thể nếu bản ghi cũ chưa có
  const defaults = LocalLocationGuide.DEFAULT_LOCATIONS || [];
  for (let loc of (locations || [])) {
    if (!loc.ward || !loc.address) {
      const match = defaults.find(d => 
        (d.id && loc.id && d.id === loc.id) || 
        (d.name && loc.name && d.name.toLowerCase() === loc.name.toLowerCase())
      );
      if (match) {
        if (!loc.ward && match.ward) loc.ward = match.ward;
        if (!loc.address && match.address) loc.address = match.address;
        if (loc.city && match.city && (loc.city.includes('TP.') || loc.city.includes('('))) {
          loc.city = match.city;
        }
        try {
          if (typeof loc.save === 'function') {
            await loc.save();
          } else if (LocationGuide.findByIdAndUpdate && loc._id) {
            await LocationGuide.findByIdAndUpdate(loc._id, {
              ward: loc.ward,
              address: loc.address,
              city: loc.city
            });
          }
        } catch (_) {}
      }
    }
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

  const videoUrl = String(data.videoUrl || '').trim();
  const videoType = data.videoType || (videoUrl ? (videoUrl.includes('tiktok.com') ? 'tiktok' : videoUrl.includes('youtu') ? 'youtube' : 'other') : '');

  const newLoc = new LocationGuide({
    name: String(data.name).trim(),
    city: String(data.city).trim(),
    ward: String(data.ward || '').trim(),
    address: String(data.address || '').trim(),
    region,
    regionName,
    image: String(data.image).trim(),
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    description: String(data.description || '').trim(),
    bestTime: String(data.bestTime || '').trim(),
    ticketPrice: String(data.ticketPrice || 'Miễn phí').trim(),
    suitableConcepts,
    tips: String(data.tips || '').trim(),
    videoUrl,
    videoType,
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
  if (updatePayload.videoUrl !== undefined) {
    const vUrl = String(updatePayload.videoUrl || '').trim();
    updatePayload.videoUrl = vUrl;
    updatePayload.videoType = vUrl ? (vUrl.includes('tiktok.com') ? 'tiktok' : vUrl.includes('youtu') ? 'youtube' : 'other') : '';
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
