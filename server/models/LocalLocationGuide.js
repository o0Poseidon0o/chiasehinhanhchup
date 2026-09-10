const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'locations.json');

const DEFAULT_LOCATIONS = [
  {
    _id: 'loc_hanoi',
    id: 'hanoi_hoankiem',
    name: 'Hồ Gươm & 36 Phố Phường',
    city: 'Hà Nội',
    ward: 'Phường Hàng Trống',
    address: 'Khu vực Hồ Hoàn Kiếm & Phố Cổ Hà Nội, Quận Hoàn Kiếm',
    region: 'north',
    regionName: 'Miền Bắc',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop',
    description: 'Trái tim ngàn năm văn hiến với những ngõ nhỏ rêu phong, hàng cây cổ thụ bóng nước hồ Gươm và nét đẹp thanh lịch của Hà thành 4 mùa.',
    bestTime: '05:30 - 08:00 sáng mùa thu hoặc hoàng hôn 17:00',
    ticketPrice: 'Miễn phí',
    suitableConcepts: ['Áo dài truyền thống', 'Vintage hoài cổ', 'Street Style Hà Nội', 'Film tone'],
    tips: 'Nên chọn trang phục tone trắng, be hoặc đỏ nhung cổ điển. Chụp lúc sáng sớm vắng vẻ không vướng người.',
    videoUrl: 'https://www.youtube.com/watch?v=F52kQkC_sio',
    videoType: 'youtube',
    isFeatured: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'loc_ninhbinh',
    id: 'ninhbinh_trangan',
    name: 'Quần Thể Danh Thắng Tràng An & Hang Múa',
    city: 'Ninh Bình',
    ward: 'Xã Trường Yên',
    address: 'Khu du lịch sinh thái Tràng An, Huyện Hoa Lư',
    region: 'north',
    regionName: 'Miền Bắc',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop',
    description: 'Vịnh Hạ Long trên cạn với non xanh nước biếc, thung lũng lúa vàng và góc nhìn kỳ vĩ từ đỉnh Ngọa Long ngắm trọn Tam Cốc.',
    bestTime: '06:30 - 09:00 sáng hoặc 16:00 - 17:30 ngắm hoàng hôn',
    ticketPrice: 'Vé thuyền ~250.000đ, vé Hang Múa 100.000đ',
    suitableConcepts: ['Cổ phục Việt phục', 'Nàng thơ Cinematic', 'Pre-Wedding kỳ vĩ', 'Du mục Boho'],
    tips: 'Trang phục màu đỏ hoặc vàng nổi bật trên nền núi đá xanh ngắt. Mang giày thể thao để leo Hang Múa.',
    videoUrl: 'https://www.youtube.com/watch?v=2r7d7B3gT9Q',
    videoType: 'youtube',
    isFeatured: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'loc_sapa',
    id: 'sapa_fansipan',
    name: 'Bản Cát Cát & Mây Ngàn Sa Pa',
    city: 'Lào Cai',
    ward: 'Phường Sa Pa',
    address: 'Thung lũng Mường Hoa, Bản Cát Cát, Sa Pa',
    region: 'north',
    regionName: 'Miền Bắc',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1000&auto=format&fit=crop',
    description: 'Thị trấn trong sương mù thơ mộng với những thửa ruộng bậc thang kỳ vĩ, suối Mường Hoa uốn lượn và biển mây ngập tràn.',
    bestTime: 'Tháng 9 - 10 mùa lúa chín hoặc tháng 12 - 2 săn mây tuyết',
    ticketPrice: 'Bản Cát Cát: 150.000đ/vé',
    suitableConcepts: ['Trang phục dân tộc H’Mông/Dao', 'Cổ tích Tây Bắc', 'Áo ấm Đông Bohemian'],
    tips: 'Thuê trang phục bản địa tại lối vào bản để có set đồ ăn rơ trọn vẹn. Săn mây đẹp nhất sau cơn mưa sáng.',
    videoUrl: 'https://www.youtube.com/watch?v=kYJm3sT9190',
    videoType: 'youtube',
    isFeatured: true,
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'loc_hoian',
    id: 'hoian_oldtown',
    name: 'Phố Cổ Hội An & Hoa Đăng Sông Hoài',
    city: 'Đà Nẵng',
    ward: 'Phường Minh An',
    address: 'Khu phố cổ Hội An & Bờ Sông Hoài',
    region: 'central',
    regionName: 'Miền Trung',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop',
    description: 'Di sản thế giới đậm chất thơ với những bức tường vàng hoa giấy, đèn lồng rực rỡ soi bóng dòng sông Hoài lững lờ trôi.',
    bestTime: '06:00 sáng bình yên hoặc 18:30 - 20:30 phố lên đèn',
    ticketPrice: '80.000đ - 120.000đ vé tham quan di tích',
    suitableConcepts: ['Áo dài nón lá', 'Đèn lồng hoa đăng', 'Cặp đôi lãng mạn', 'Retro thập niên 80'],
    tips: 'Đến lúc 6h sáng để bắt trọn ánh nắng sớm xuyên qua giàn hoa giấy vắng bóng du khách.',
    videoUrl: '',
    videoType: '',
    isFeatured: true,
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'loc_hue',
    id: 'hue_imperial',
    name: 'Đại Nội & Lăng Tẩm Cố Đô Huế',
    city: 'Huế',
    ward: 'Phường Thuận Thành',
    address: 'Đường 23 Tháng 8, Phường Thuận Thành, TP. Huế',
    region: 'central',
    regionName: 'Miền Trung',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop',
    description: 'Nét thâm trầm quý phái của kinh thành xưa, mái ngói lưu ly cổ kính, hồ súng và tà áo dài tím thướt tha bên bờ sông Hương.',
    bestTime: '07:30 - 10:00 sáng hoặc 15:00 - 17:00',
    ticketPrice: 'Đại Nội: 200.000đ/người lớn',
    suitableConcepts: ['Cổ phục Nhật Bình', 'Áo dài cung đình', 'Chân dung nghệ thuật hoài niệm'],
    tips: 'Thuê Nhật Bình hoặc Áo ngũ thân chất lượng cao tại đường Đinh Tiên Hoàng trước khi vào Đại Nội chụp ảnh.',
    videoUrl: '',
    videoType: '',
    isFeatured: false,
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'loc_dalat',
    id: 'dalat_pinetrees',
    name: 'Đồi Thông & Đồi Chè Cầu Đất',
    city: 'Lâm Đồng',
    ward: 'Xã Trạm Hành',
    address: 'Thôn Cầu Đất, Xã Trạm Hành, TP. Đà Lạt',
    region: 'highlands',
    regionName: 'Tây Nguyên',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop',
    description: 'Xứ sở mù sương đầy chất thơ với những cánh rừng thông xanh ngắt, thung lũng săn mây huyền ảo và đồi chè bạt ngàn.',
    bestTime: '05:00 - 06:30 sáng săn mây đón nắng xiên cực phẩm',
    ticketPrice: 'Đồi chè: Miễn phí, khu cắm trại: tùy dịch vụ',
    suitableConcepts: ['Nàng thơ trong trẻo', 'Pre-Wedding Hàn Quốc', 'Vintage Film', 'Dã ngoại Acoustic'],
    tips: 'Chuẩn bị áo ấm, khăn choàng len màu pastel. Luôn mang theo dù trong suốt vừa che sương vừa làm phụ kiện ảnh tuyệt đẹp.',
    videoUrl: 'https://www.youtube.com/watch?v=eLwL0vYv94I',
    videoType: 'youtube',
    isFeatured: true,
    order: 6,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'loc_saigon',
    id: 'saigon_bason',
    name: 'Bến Bạch Đằng & Cầu Ba Son',
    city: 'Hồ Chí Minh',
    ward: 'Phường Bến Nghé',
    address: 'Số 2 Tôn Đức Thắng, Phường Bến Nghé, Quận 1',
    region: 'south',
    regionName: 'Miền Nam',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000&auto=format&fit=crop',
    description: 'Nhịp sống phồn hoa rực rỡ nhìn ra sông Sài Gòn, tòa nhà Landmark chọc trời và hoàng hôn ánh vàng phản chiếu trên mặt nước.',
    bestTime: '16:45 - 18:30 hoàng hôn buông xuống cầu Ba Son',
    ticketPrice: 'Miễn phí',
    suitableConcepts: ['Street Style hiện đại', 'Doanh nhân City Life', 'Thời trang tạp chí', 'Night Portrait'],
    tips: 'Sử dụng đèn LED hắt sáng hoặc lens khẩu lớn f/1.4 để chụp bokeh đèn xe lung linh khi thành phố lên đèn.',
    videoUrl: '',
    videoType: '',
    isFeatured: true,
    order: 7,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'loc_phuquoc',
    id: 'phuquoc_sunset',
    name: 'Bãi Sao & Hoàng Hôn Sunset Sanato',
    city: 'Kiên Giang',
    ward: 'Phường An Thới',
    address: 'Bãi Sao, Ấp 4, Phường An Thới, TP. Phú Quốc',
    region: 'south',
    regionName: 'Miền Nam',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    description: 'Thiên đường biển xanh cát trắng như kem, những rặng dừa nghiêng bóng nước và hoàng hôn rực sắc cam tím ấn tượng bậc nhất.',
    bestTime: '16:30 - 18:15 hoàng hôn đảo ngọc',
    ticketPrice: 'Sunset Sanato ~100.000đ/vé',
    suitableConcepts: ['Bikini quyến rũ', 'Váy maxi biển bồng bềnh', 'Pre-Wedding lãng mạn', 'Cặp đôi nắm tay'],
    tips: 'Mang váy maxi dài bay bổng màu trắng hoặc vàng tươi. Khoảnh khắc mặt trời chạm mặt biển chỉ diễn ra trong vòng 15 phút.',
    videoUrl: '',
    videoType: '',
    isFeatured: true,
    order: 8,
    createdAt: new Date().toISOString()
  }
];

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const readData = () => {
  ensureDataDir();
  if (!fs.existsSync(FILE_PATH)) {
    writeData(DEFAULT_LOCATIONS);
    return DEFAULT_LOCATIONS;
  }
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      writeData(DEFAULT_LOCATIONS);
      return DEFAULT_LOCATIONS;
    }
    return parsed;
  } catch (_) {
    return DEFAULT_LOCATIONS;
  }
};

const writeData = (data) => {
  ensureDataDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

class LocalLocationGuide {
  constructor(data = {}) {
    this._id = data._id || `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.id = data.id || this._id;
    this.name = data.name || '';
    this.city = data.city || '';
    this.ward = data.ward || '';
    this.address = data.address || '';
    this.region = data.region || 'north';
    this.regionName = data.regionName || (data.region === 'central' ? 'Miền Trung' : data.region === 'south' ? 'Miền Nam' : data.region === 'highlands' ? 'Tây Nguyên' : 'Miền Bắc');
    this.image = data.image || '';
    this.description = data.description || '';
    this.bestTime = data.bestTime || '';
    this.ticketPrice = data.ticketPrice || 'Miễn phí';
    this.suitableConcepts = Array.isArray(data.suitableConcepts)
      ? data.suitableConcepts
      : (data.suitableConcepts ? String(data.suitableConcepts).split(',').map(s => s.trim()) : []);
    this.tips = data.tips || '';
    this.videoUrl = data.videoUrl || '';
    this.videoType = data.videoType || (data.videoUrl ? (data.videoUrl.includes('tiktok.com') ? 'tiktok' : data.videoUrl.includes('youtu') ? 'youtube' : 'other') : '');
    this.isFeatured = Boolean(data.isFeatured);
    this.order = Number(data.order) || 1;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  async save() {
    const list = readData();
    const targetId = String(this._id || this.id);
    const idx = list.findIndex(c => String(c._id) === targetId || String(c.id) === targetId);
    if (idx !== -1) {
      list[idx] = { ...this };
    } else {
      list.push({ ...this });
    }
    writeData(list);
    return this;
  }

  static async find(filter = {}) {
    const list = readData();
    if (filter.region && filter.region !== 'all') {
      return list.filter(l => l.region === filter.region);
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  static async findById(id) {
    const list = readData();
    const targetId = String(id);
    return list.find(c => String(c._id) === targetId || String(c.id) === targetId) || null;
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const list = readData();
    const targetId = String(id);
    const idx = list.findIndex(c => String(c._id) === targetId || String(c.id) === targetId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updateData };
    writeData(list);
    return list[idx];
  }

  static async findByIdAndDelete(id) {
    const list = readData();
    const targetId = String(id);
    const idx = list.findIndex(c => String(c._id) === targetId || String(c.id) === targetId);
    if (idx === -1) return null;
    const removed = list.splice(idx, 1)[0];
    writeData(list);
    return removed;
  }

  static async resetDefaults() {
    writeData(DEFAULT_LOCATIONS);
    return DEFAULT_LOCATIONS;
  }
}

LocalLocationGuide.DEFAULT_LOCATIONS = DEFAULT_LOCATIONS;
module.exports = LocalLocationGuide;
