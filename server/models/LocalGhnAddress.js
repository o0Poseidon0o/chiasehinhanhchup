const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/ghn_address_data.json');

let cachedData = null;

const loadData = () => {
  if (cachedData) return cachedData;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      cachedData = JSON.parse(raw);
    } else {
      cachedData = { provinces: [], wards: [] };
    }
  } catch (err) {
    console.error('Lỗi đọc file dữ liệu địa chỉ GHN local:', err.message);
    cachedData = { provinces: [], wards: [] };
  }
  return cachedData;
};

const LocalGhnAddress = {
  // Lấy tất cả tỉnh thành
  getProvinces() {
    const data = loadData();
    return data.provinces || [];
  },

  // Tìm tỉnh theo ID
  getProvinceById(provinceId) {
    const data = loadData();
    const pid = Number(provinceId);
    return (data.provinces || []).find(p => p.provinceId === pid) || null;
  },

  // Lấy danh sách phường xã theo Province ID
  getWardsByProvinceId(provinceId) {
    const data = loadData();
    const pid = Number(provinceId);
    return (data.wards || []).filter(w => w.provinceId === pid);
  },

  // Tìm phường xã theo ID
  getWardById(wardId) {
    const data = loadData();
    const wid = Number(wardId);
    return (data.wards || []).find(w => w.wardId === wid) || null;
  },

  // Tìm kiếm theo từ khóa
  search(keyword) {
    if (!keyword) return { provinces: [], wards: [] };
    const data = loadData();
    const cleanKw = keyword.toLowerCase().trim();

    const matchedProvinces = (data.provinces || []).filter(p => 
      p.name.toLowerCase().includes(cleanKw) || 
      (p.extensionNames && p.extensionNames.some(ext => ext.toLowerCase().includes(cleanKw)))
    ).slice(0, 10);

    const matchedWards = (data.wards || []).filter(w => 
      w.name.toLowerCase().includes(cleanKw) || 
      (w.extensionNames && w.extensionNames.some(ext => ext.toLowerCase().includes(cleanKw)))
    ).slice(0, 20);

    return {
      provinces: matchedProvinces,
      wards: matchedWards
    };
  },

  // Xóa cache bộ nhớ khi cần nạp lại
  reloadCache() {
    cachedData = null;
    return loadData();
  }
};

module.exports = LocalGhnAddress;
