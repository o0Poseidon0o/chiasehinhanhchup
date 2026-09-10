const GhnProvince = require('../models/GhnProvince');
const GhnWard = require('../models/GhnWard');
const LocalGhnAddress = require('../models/LocalGhnAddress');

// @desc    Lấy danh sách toàn bộ Tỉnh / Thành phố
// @route   GET /api/address/provinces
// @access  Public
exports.getProvinces = async (req, res) => {
  try {
    if (global.useLocalDB) {
      const provinces = LocalGhnAddress.getProvinces();
      return res.json({ success: true, count: provinces.length, data: provinces });
    }

    const provinces = await GhnProvince.find({ status: 1 }).sort({ name: 1 }).lean();
    if (!provinces || provinces.length === 0) {
      // Fallback sang local nếu MongoDB chưa có data
      const localList = LocalGhnAddress.getProvinces();
      return res.json({ success: true, count: localList.length, data: localList });
    }

    res.json({
      success: true,
      count: provinces.length,
      data: provinces
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách tỉnh thành:', error);
    const localList = LocalGhnAddress.getProvinces();
    res.json({ success: true, count: localList.length, data: localList });
  }
};

// @desc    Lấy danh sách Phường / Xã theo ID Tỉnh / Thành
// @route   GET /api/address/wards/:provinceId
// @access  Public
exports.getWardsByProvince = async (req, res) => {
  try {
    const provinceId = Number(req.params.provinceId);
    if (!provinceId) {
      return res.status(400).json({ success: false, message: 'provinceId không hợp lệ' });
    }

    if (global.useLocalDB) {
      const wards = LocalGhnAddress.getWardsByProvinceId(provinceId);
      return res.json({ success: true, count: wards.length, data: wards });
    }

    const wards = await GhnWard.find({ provinceId, status: 1 }).sort({ name: 1 }).lean();
    if (!wards || wards.length === 0) {
      const localList = LocalGhnAddress.getWardsByProvinceId(provinceId);
      return res.json({ success: true, count: localList.length, data: localList });
    }

    res.json({
      success: true,
      count: wards.length,
      data: wards
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách phường xã:', error);
    const provinceId = Number(req.params.provinceId);
    const localList = LocalGhnAddress.getWardsByProvinceId(provinceId);
    res.json({ success: true, count: localList.length, data: localList });
  }
};

// @desc    Tìm kiếm nhanh Tỉnh/Thành hoặc Phường/Xã theo từ khóa
// @route   GET /api/address/search?q=...
// @access  Public
exports.searchAddress = async (req, res) => {
  try {
    const keyword = (req.query.q || '').trim();
    if (!keyword) {
      return res.json({ success: true, data: { provinces: [], wards: [] } });
    }

    const result = LocalGhnAddress.search(keyword);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Lỗi tìm kiếm địa chỉ:', error);
    res.status(500).json({ success: false, message: 'Lỗi tìm kiếm địa chỉ' });
  }
};
