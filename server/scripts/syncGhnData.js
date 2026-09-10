const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const GHN_TOKEN = 'cf4ca636-ac31-11f1-bfaa-46748cdd90fd';
const BASE_URL = 'https://online-gateway.ghn.vn/shiip/public-api/v3/master-data';

async function syncGhnData() {
  console.log('🚀 Bắt đầu tải dữ liệu Tỉnh/Thành và Phường/Xã từ GHN...');

  try {
    // 1. Tải toàn bộ tỉnh thành
    console.log('📦 1. Đang tải danh sách Tỉnh / Thành phố...');
    const provinceRes = await fetch(`${BASE_URL}/province/all?offset=0&limit=200`, {
      headers: { Token: GHN_TOKEN }
    });
    const provinceJson = await provinceRes.json();

    if (provinceJson.code !== 200 || !provinceJson.data) {
      throw new Error(`Lỗi tải tỉnh thành: ${provinceJson.message}`);
    }

    const rawProvinces = provinceJson.data;
    console.log(`✅ Đã tải ${rawProvinces.length} Tỉnh/Thành phố.`);

    const provinces = rawProvinces.map(p => ({
      provinceId: p._id,
      name: p.name,
      extensionNames: p.extension_names || [],
      type: p.type,
      status: p.status
    })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    // 2. Tải toàn bộ phường xã theo từng tỉnh
    console.log('🏘️ 2. Đang tải danh sách Phường / Xã của từng tỉnh...');
    const allWards = [];

    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i];
      process.stdout.write(`   [${i + 1}/${provinces.length}] Đang tải phường/xã của ${p.name}... `);

      const wardRes = await fetch(`${BASE_URL}/ward/all-by-province-id?province_id=${p.provinceId}&offset=0&limit=200`, {
        headers: { Token: GHN_TOKEN }
      });
      const wardJson = await wardRes.json();

      if (wardJson.code === 200 && Array.isArray(wardJson.data)) {
        const wards = wardJson.data.map(w => ({
          wardId: w._id,
          provinceId: w.parent_id,
          provinceName: p.name,
          name: w.name,
          extensionNames: w.extension_names || [],
          type: w.type,
          status: w.status
        })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));

        allWards.push(...wards);
        console.log(`${wards.length} phường/xã.`);
      } else {
        console.log(`0 phường/xã (Lỗi/Trống: ${wardJson.message}).`);
      }
    }

    console.log(`\n🎉 Tải hoàn tất! Tổng cộng: ${provinces.length} Tỉnh/Thành và ${allWards.length} Phường/Xã.`);

    // 3. Lưu vào file JSON local
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputFile = path.join(dataDir, 'ghn_address_data.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      updatedAt: new Date().toISOString(),
      totalProvinces: provinces.length,
      totalWards: allWards.length,
      provinces,
      wards: allWards
    }, null, 2), 'utf8');

    console.log(`💾 Đã lưu dữ liệu vào: ${outputFile}`);

    // 4. Nếu kết nối MongoDB, tiến hành seed vào DB
    const connectDB = require('../config/db');
    const mongoose = require('mongoose');
    await connectDB();

    if (!global.useLocalDB && mongoose.connection.readyState === 1) {
      console.log('🍃 Đang đồng bộ vào MongoDB...');
      const GhnProvince = require('../models/GhnProvince');
      const GhnWard = require('../models/GhnWard');

      await GhnProvince.deleteMany({});
      await GhnProvince.insertMany(provinces);
      console.log(`✅ Đã nạp ${provinces.length} Tỉnh/Thành vào MongoDB.`);

      await GhnWard.deleteMany({});
      // Batch insert in chunks of 1000
      const chunkSize = 1000;
      for (let i = 0; i < allWards.length; i += chunkSize) {
        const chunk = allWards.slice(i, i + chunkSize);
        await GhnWard.insertMany(chunk);
      }
      console.log(`✅ Đã nạp ${allWards.length} Phường/Xã vào MongoDB.`);
    } else {
      console.log('ℹ️ Đang chạy chế độ Local DB (dữ liệu được phục vụ trực tiếp từ file JSON).');
    }

    console.log('\n✨ Hoàn thành xuất sắc!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi trong quá trình đồng bộ GHN:', error);
    process.exit(1);
  }
}

syncGhnData();
