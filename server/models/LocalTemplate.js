const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'templates.json');

const DEFAULT_TEMPLATES = [
  {
    _id: 'tpl_editorial_love',
    id: 'tpl_editorial_love',
    title: 'Mẫu 1: Magazine Definition — Love Card',
    subtitle: 'Ảnh nền tràn viền kết hợp khung tạp chí kem, định nghĩa cảm xúc & ảnh chi tiết',
    category: 'Pre-Wedding & Cưới',
    aspectRatio: '3:4',
    isSystem: true,
    isPublic: true,
    isFeatured: true,
    status: 'approved',
    authorId: 'system',
    authorName: 'Photodate Editorial',
    usageCount: 342,
    driveOverlayUrl: '',
    driveFileId: '',
    background: {
      type: 'photo',
      slotIndex: 0,
      color: '#181512',
      grayscale: false,
      blur: 0,
      overlayOpacity: 0.22
    },
    decorCards: [
      {
        id: 'card_main',
        x: 12.5,
        y: 25,
        w: 75,
        h: 49.5,
        bgColor: '#FAF8F4',
        borderRadius: 0,
        shadow: true
      }
    ],
    photoSlots: [
      {
        id: 'slot_bg',
        label: 'Ảnh nền tràn viền',
        isBackground: true,
        x: 0,
        y: 0,
        w: 100,
        h: 100,
        borderRadius: 0,
        grayscale: false,
        panX: 50,
        panY: 50,
        zoom: 1
      },
      {
        id: 'slot_1',
        label: 'Ảnh chính bên trái',
        isBackground: false,
        x: 15.8,
        y: 27.5,
        w: 43.5,
        h: 44.5,
        borderRadius: 0,
        grayscale: false,
        panX: 50,
        panY: 50,
        zoom: 1
      },
      {
        id: 'slot_2',
        label: 'Ảnh chi tiết góc phải',
        isBackground: false,
        x: 60.5,
        y: 49.2,
        w: 23.8,
        h: 22.8,
        borderRadius: 0,
        grayscale: false,
        panX: 50,
        panY: 50,
        zoom: 1
      }
    ],
    textLayers: [
      {
        id: 'txt_love',
        text: 'love',
        x: 84,
        y: 39.5,
        align: 'right',
        fontFamily: 'Playfair Display',
        fontSize: 38,
        fontWeight: '500',
        fontStyle: 'normal',
        color: '#6B1D1D',
        letterSpacing: 0.5
      },
      {
        id: 'txt_def',
        text: 'a deep, tender, strong feeling of affection\ntoward a person; an intense emotional\nattachment.',
        x: 84,
        y: 44.2,
        align: 'right',
        fontFamily: 'Cormorant Garamond',
        fontSize: 11.5,
        fontWeight: '500',
        fontStyle: 'normal',
        color: '#4A433E',
        letterSpacing: 0.2
      }
    ],
    logoConfig: {
      visible: true,
      x: 50,
      y: 88.5,
      scale: 1,
      colorMode: 'white',
      studioText: 'TAM LE MEDIA',
      subtitle: 'Present'
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'tpl_bento_8',
    id: 'tpl_bento_8',
    title: 'Mẫu 2: Minimalist Bento Mosaic (9 Ô Khoảnh Khắc)',
    subtitle: 'Viền trắng Gallery sang trọng, ghép xen kẽ ảnh cận cảnh chi tiết và toàn cảnh',
    category: 'Pre-Wedding & Cưới',
    aspectRatio: '3:4',
    isSystem: true,
    isPublic: true,
    isFeatured: true,
    status: 'approved',
    authorId: 'system',
    authorName: 'Photodate Editorial',
    usageCount: 289,
    driveOverlayUrl: '',
    driveFileId: '',
    background: {
      type: 'solid',
      slotIndex: -1,
      color: '#FFFFFF',
      grayscale: false,
      blur: 0,
      overlayOpacity: 0
    },
    decorCards: [],
    photoSlots: [
      { id: 'slot_1', label: 'Ô 1 (Chân dung lớn trái)', x: 20.5, y: 18.5, w: 23.8, h: 24, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_2', label: 'Ô 2 (Cặp đôi trên giữa)', x: 45.3, y: 18.5, w: 16.5, h: 16.2, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_3', label: 'Ô 3 (Váy cưới trên phải)', x: 62.8, y: 18.5, w: 16.7, h: 16.2, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_4', label: 'Ô 4 (Lễ đường nhỏ trái)', x: 20.5, y: 44.2, w: 11.4, h: 11.4, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_5', label: 'Ô 5 (Cô dâu nhỏ giữa)', x: 32.9, y: 44.2, w: 11.4, h: 11.4, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_6', label: 'Ô 6 (Cận cảnh nhẫn cưới)', x: 45.3, y: 37.3, w: 11.8, h: 11.4, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_7', label: 'Ô 7 (Cận cảnh nụ cười)', x: 58.1, y: 37.3, w: 21.4, h: 11.4, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_8', label: 'Ô 8 (Cổng hoa dưới trái)', x: 20.5, y: 57.3, w: 23.8, h: 24, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_9', label: 'Ô 9 (Khoảnh khắc lớn phải)', x: 45.3, y: 50.0, w: 34.2, h: 31.3, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 }
    ],
    textLayers: [],
    logoConfig: {
      visible: true,
      x: 50,
      y: 90,
      scale: 0.95,
      colorMode: 'black',
      studioText: 'TAM LE MEDIA',
      subtitle: 'Present'
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'tpl_quad_2x2',
    id: 'tpl_quad_2x2',
    title: 'Mẫu 3: Asymmetric 2×2 — Bố Cục 4 Ô Lồng Khung',
    subtitle: 'Kết hợp 2 ô tràn viền, 1 ô lồng trên nền B&W và 1 ô chi tiết đen-trắng trên nền kem',
    category: 'Pre-Wedding & Cưới',
    aspectRatio: '3:4',
    isSystem: true,
    isPublic: true,
    isFeatured: true,
    status: 'approved',
    authorId: 'system',
    authorName: 'Photodate Editorial',
    usageCount: 215,
    driveOverlayUrl: '',
    driveFileId: '',
    background: {
      type: 'solid',
      slotIndex: -1,
      color: '#FAF7F0',
      grayscale: false,
      blur: 0,
      overlayOpacity: 0
    },
    decorCards: [
      {
        id: 'card_br_cream',
        x: 50,
        y: 50,
        w: 50,
        h: 50,
        bgColor: '#FAF7F0',
        borderRadius: 0,
        shadow: false
      }
    ],
    photoSlots: [
      { id: 'slot_1', label: 'Nền Đen-Trắng góc trên trái', x: 0, y: 0, w: 50, h: 50, borderRadius: 0, grayscale: true, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_2', label: 'Ảnh màu lồng góc trên trái', x: 8, y: 8.2, w: 34, h: 33.5, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_3', label: 'Ảnh tràn góc trên phải', x: 50, y: 0, w: 50, h: 50, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_4', label: 'Ảnh tràn góc dưới trái', x: 0, y: 50, w: 50, h: 50, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_5', label: 'Ảnh B&W lồng góc dưới phải', x: 58, y: 58, w: 34, h: 33.8, borderRadius: 0, grayscale: true, panX: 50, panY: 50, zoom: 1 }
    ],
    textLayers: [],
    logoConfig: {
      visible: true,
      x: 25,
      y: 45.8,
      scale: 0.72,
      colorMode: 'black',
      studioText: 'TAM LE MEDIA',
      subtitle: 'Present'
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'tpl_triptych_destiny',
    id: 'tpl_triptych_destiny',
    title: 'Mẫu 4: Triptych on B&W — Destiny Film Strip',
    subtitle: 'Nền ảnh Đen-Trắng tràn viền cảm xúc + 3 khung ảnh màu xếp lệch tầng & Quote ngôn tình',
    category: 'Pre-Wedding & Cưới',
    aspectRatio: '3:4',
    isSystem: true,
    isPublic: true,
    isFeatured: true,
    status: 'approved',
    authorId: 'system',
    authorName: 'Photodate Editorial',
    usageCount: 410,
    driveOverlayUrl: '',
    driveFileId: '',
    background: {
      type: 'photo',
      slotIndex: 0,
      color: '#1C1C1C',
      grayscale: true,
      blur: 0,
      overlayOpacity: 0.12
    },
    decorCards: [],
    photoSlots: [
      { id: 'slot_bg', label: 'Ảnh nền Đen-Trắng tràn viền', isBackground: true, x: 0, y: 0, w: 100, h: 100, borderRadius: 0, grayscale: true, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_1', label: 'Ảnh màu trái', isBackground: false, x: 2.2, y: 26.8, w: 30.8, h: 34.5, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_2', label: 'Ảnh màu giữa (dài)', isBackground: false, x: 34.5, y: 26.8, w: 31.0, h: 40.5, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_3', label: 'Ảnh màu phải (thấp)', isBackground: false, x: 67.0, y: 30.0, w: 30.8, h: 34.2, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 }
    ],
    textLayers: [
      {
        id: 'txt_destiny',
        text: 'Destiny',
        x: 49.5,
        y: 19.5,
        align: 'center',
        fontFamily: 'Montserrat',
        fontSize: 22,
        fontWeight: '300',
        fontStyle: 'normal',
        color: '#232323',
        letterSpacing: 1.5
      },
      {
        id: 'txt_quote_bottom',
        text: "Maybe we didn't meet by chance.\nMaybe every road we took was simply leading us to each other.",
        x: 49.5,
        y: 88,
        align: 'center',
        fontFamily: 'Montserrat',
        fontSize: 12,
        fontWeight: '300',
        fontStyle: 'normal',
        color: '#2B2B2B',
        letterSpacing: 0.4
      }
    ],
    logoConfig: {
      visible: true,
      x: 49.5,
      y: 95,
      scale: 0.82,
      colorMode: 'black',
      studioText: 'TAM LE MEDIA',
      subtitle: 'Present'
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'tpl_vogue_editorial',
    id: 'tpl_vogue_editorial',
    title: 'Mẫu 5: Bìa Tạp Chí Nghệ Thuật (Vogue / Lookbook)',
    subtitle: 'Bố cục bìa tạp chí thời trang & chân dung nàng thơ với tiêu đề lớn phía trên',
    category: 'Chân Dung & Lookbook',
    aspectRatio: '3:4',
    isSystem: true,
    isPublic: true,
    isFeatured: false,
    status: 'approved',
    authorId: 'system',
    authorName: 'Photodate Editorial',
    usageCount: 178,
    driveOverlayUrl: '',
    driveFileId: '',
    background: {
      type: 'solid',
      slotIndex: -1,
      color: '#F7F4EE',
      grayscale: false,
      blur: 0,
      overlayOpacity: 0
    },
    decorCards: [],
    photoSlots: [
      { id: 'slot_main', label: 'Ảnh bìa trung tâm', isBackground: false, x: 9, y: 17, w: 82, h: 66, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 }
    ],
    textLayers: [
      {
        id: 'txt_masthead',
        text: 'TIMELESS MUSE',
        x: 50,
        y: 9.5,
        align: 'center',
        fontFamily: 'Cinzel',
        fontSize: 36,
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#1C1917',
        letterSpacing: 4
      },
      {
        id: 'txt_issue',
        text: 'FINE ART PORTRAITURE • SPECIAL EDITION',
        x: 50,
        y: 13.8,
        align: 'center',
        fontFamily: 'Montserrat',
        fontSize: 9.5,
        fontWeight: '500',
        fontStyle: 'normal',
        color: '#78716C',
        letterSpacing: 3
      },
      {
        id: 'txt_caption',
        text: '“Elegance is the only beauty that never fades.”',
        x: 50,
        y: 86,
        align: 'center',
        fontFamily: 'Cormorant Garamond',
        fontSize: 15,
        fontWeight: '500',
        fontStyle: 'italic',
        color: '#44403C',
        letterSpacing: 0.5
      }
    ],
    logoConfig: {
      visible: true,
      x: 50,
      y: 93,
      scale: 0.85,
      colorMode: 'black',
      studioText: 'STUDIO PORTFOLIO',
      subtitle: 'Present'
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'tpl_cinematic_3frame',
    id: 'tpl_cinematic_3frame',
    title: 'Mẫu 6: Dải Phim Điện Ảnh 3 Khung Ngang (Cinema Strip)',
    subtitle: '3 khung hình tỉ lệ điện ảnh xếp dọc trên nền kem hoặc đen kèm phụ đề phim',
    category: 'Kỷ Yếu & Phóng Sự',
    aspectRatio: '3:4',
    isSystem: true,
    isPublic: true,
    isFeatured: false,
    status: 'approved',
    authorId: 'system',
    authorName: 'Photodate Editorial',
    usageCount: 164,
    driveOverlayUrl: '',
    driveFileId: '',
    background: {
      type: 'solid',
      slotIndex: -1,
      color: '#111113',
      grayscale: false,
      blur: 0,
      overlayOpacity: 0
    },
    decorCards: [],
    photoSlots: [
      { id: 'slot_top', label: 'Khung phim 1 (Trên)', isBackground: false, x: 8, y: 8, w: 84, h: 24.5, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_mid', label: 'Khung phim 2 (Giữa)', isBackground: false, x: 8, y: 34, w: 84, h: 24.5, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 },
      { id: 'slot_bot', label: 'Khung phim 3 (Dưới)', isBackground: false, x: 8, y: 60, w: 84, h: 24.5, borderRadius: 0, grayscale: false, panX: 50, panY: 50, zoom: 1 }
    ],
    textLayers: [
      {
        id: 'txt_sub',
        text: '— Every frame tells a story of youth and love —',
        x: 50,
        y: 88,
        align: 'center',
        fontFamily: 'Cormorant Garamond',
        fontSize: 14,
        fontWeight: '400',
        fontStyle: 'italic',
        color: '#E5E0D8',
        letterSpacing: 1
      }
    ],
    logoConfig: {
      visible: true,
      x: 50,
      y: 94,
      scale: 0.85,
      colorMode: 'white',
      studioText: 'TAM LE MEDIA',
      subtitle: 'Present'
    },
    createdAt: new Date().toISOString()
  }
];

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_TEMPLATES, null, 2), 'utf8');
  }
};

const readData = () => {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_TEMPLATES, null, 2), 'utf8');
      return DEFAULT_TEMPLATES;
    }
    return parsed;
  } catch (_) {
    return DEFAULT_TEMPLATES;
  }
};

const writeData = (data) => {
  ensureDataDir();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

class LocalTemplate {
  constructor(data = {}) {
    this._id = data._id || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.id = data.id || this._id;
    this.title = data.title || 'Template Mới';
    this.subtitle = data.subtitle || '';
    this.category = data.category || 'Pre-Wedding & Cưới';
    this.aspectRatio = data.aspectRatio || '3:4';
    this.isSystem = Boolean(data.isSystem);
    this.isPublic = data.isPublic !== undefined ? Boolean(data.isPublic) : true;
    this.isFeatured = Boolean(data.isFeatured);
    this.status = data.status || 'approved';
    this.authorId = data.authorId || '';
    this.authorName = data.authorName || 'Nhiếp Ảnh Gia';
    this.usageCount = Number(data.usageCount) || 0;
    this.driveOverlayUrl = data.driveOverlayUrl || '';
    this.driveFileId = data.driveFileId || '';
    this.background = data.background || {
      type: 'solid',
      slotIndex: -1,
      color: '#FAF8F5',
      grayscale: false,
      blur: 0,
      overlayOpacity: 0
    };
    this.decorCards = Array.isArray(data.decorCards) ? data.decorCards : [];
    this.photoSlots = Array.isArray(data.photoSlots) ? data.photoSlots : [];
    this.textLayers = Array.isArray(data.textLayers) ? data.textLayers : [];
    this.logoConfig = data.logoConfig || {
      visible: true,
      x: 50,
      y: 92,
      scale: 0.9,
      colorMode: 'black',
      studioText: '',
      subtitle: 'Present'
    };
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  async save() {
    const list = readData();
    const targetId = String(this._id || this.id);
    const idx = list.findIndex(t => String(t._id) === targetId || String(t.id) === targetId);
    if (idx !== -1) {
      list[idx] = { ...this };
    } else {
      list.push({ ...this });
    }
    writeData(list);
    return this;
  }

  static async find() {
    return readData();
  }

  static async findById(id) {
    const list = readData();
    const targetId = String(id);
    return list.find(t => String(t._id) === targetId || String(t.id) === targetId) || null;
  }

  static async findByIdAndUpdate(id, updateData) {
    const list = readData();
    const targetId = String(id);
    const idx = list.findIndex(t => String(t._id) === targetId || String(t.id) === targetId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updateData };
    writeData(list);
    return list[idx];
  }

  static async findByIdAndDelete(id) {
    const list = readData();
    const targetId = String(id);
    const idx = list.findIndex(t => String(t._id) === targetId || String(t.id) === targetId);
    if (idx === -1) return null;
    const removed = list.splice(idx, 1)[0];
    writeData(list);
    return removed;
  }

  static async resetDefaults() {
    writeData(DEFAULT_TEMPLATES);
    return DEFAULT_TEMPLATES;
  }
}

LocalTemplate.DEFAULT_TEMPLATES = DEFAULT_TEMPLATES;
module.exports = LocalTemplate;

