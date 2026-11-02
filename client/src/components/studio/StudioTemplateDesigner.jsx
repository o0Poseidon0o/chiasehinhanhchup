import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Layout,
  Type,
  Image as ImageIcon,
  Award,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  FolderOpen,
  Upload,
  Check,
  Copy,
  Share2,
  Sliders,
  Eye,
  Heart,
  CloudDownload,
  Layers,
  Move,
  Palette,
  Wand2,
  BookmarkPlus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { templateApi, FALLBACK_EDITORIAL_TEMPLATES } from '../../api/templateApi';
import { albumApi } from '../../api/albumApi';
import { getPublicBaseUrl } from '../../utils/formatters';

const EDITORIAL_QUOTES = [
  {
    id: 'q_love',
    label: 'Love (Định nghĩa từ điển - Mẫu 1)',
    title: 'love',
    body: 'a deep, tender, strong feeling of affection\ntoward a person; an intense emotional\nattachment.',
    titleFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    titleColor: '#6B1D1D'
  },
  {
    id: 'q_destiny',
    label: 'Destiny (Định mệnh - Mẫu 4)',
    title: 'Destiny',
    body: "Maybe we didn't meet by chance.\nMaybe every road we took was simply leading us to each other.",
    titleFont: 'Montserrat',
    bodyFont: 'Montserrat',
    titleColor: '#232323'
  },
  {
    id: 'q_forever',
    label: 'Forever (Mãi mãi bên nhau)',
    title: 'forever',
    body: 'in a milliondifferent universes,\nI would still choose to find my way back to you.',
    titleFont: 'Playfair Display',
    bodyFont: 'Cormorant Garamond',
    titleColor: '#5C1D24'
  },
  {
    id: 'q_soulmate',
    label: 'Soulmate (Tri kỷ)',
    title: 'soulmate',
    body: 'two halves of the same soul,\njoined together in time and eternity.',
    titleFont: 'Cinzel',
    bodyFont: 'Cormorant Garamond',
    titleColor: '#2C2523'
  },
  {
    id: 'q_muse',
    label: 'Timeless Muse (Nàng thơ)',
    title: 'Muse',
    body: 'she wears sunlight like poetry\nand carries grace in every quiet glance.',
    titleFont: 'Great Vibes',
    bodyFont: 'Cormorant Garamond',
    titleColor: '#6B4226'
  },
  {
    id: 'q_viet',
    label: 'Bình Yên (Tiếng Việt lãng mạn)',
    title: 'Bình Yên',
    body: 'Giữa hàng vạn người lướt qua nhân thế,\ncảm ơn vì cuối cùng chúng ta đã dừng lại bên nhau.',
    titleFont: 'Playfair Display',
    bodyFont: 'Be Vietnam Pro',
    titleColor: '#6B1D1D'
  }
];

const FONT_OPTIONS = [
  { value: 'Playfair Display', label: 'Playfair Display (Tạp chí Cổ điển)' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (Thơ & Định nghĩa)' },
  { value: 'Montserrat', label: 'Montserrat Thin (Hiện đại - Mẫu Destiny)' },
  { value: 'Cinzel', label: 'Cinzel (Tạp chí Vogue / Luxury)' },
  { value: 'Great Vibes', label: 'Great Vibes (Chữ ký Viết tay)' },
  { value: 'Dancing Script', label: 'Dancing Script (Bay bổng)' },
  { value: 'Be Vietnam Pro', label: 'Be Vietnam Pro (Tiếng Việt Hiện đại)' }
];

const ASPECT_RATIOS = {
  '3:4': { label: '3:4 (Chuẩn Bài Đăng Học Thuật / Cưới)', w: 1500, h: 2000, css: 'aspect-[3/4]' },
  '4:5': { label: '4:5 (Chuẩn Instagram / Facebook Dọc)', w: 1600, h: 2000, css: 'aspect-[4/5]' },
  '1:1': { label: '1:1 (Ảnh Vuông Avatar / Lookbook)', w: 1600, h: 1600, css: 'aspect-square' },
  '9:16': { label: '9:16 (Story / Reels / TikTok)', w: 1350, h: 2400, css: 'aspect-[9/16]' }
};

const SAMPLE_WEDDING_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop'
];

const PHOTO_FILTER_PRESETS = [
  {
    id: 'original',
    label: '🎨 Màu Gốc',
    desc: 'Giữ nguyên màu gốc',
    patch: { filterPreset: 'original', grayscale: false, brightness: 100, contrast: 100, saturate: 100, sepia: 0, blur: 0 }
  },
  {
    id: 'bw_classic',
    label: '🖤 B&W Tạp Chí',
    desc: 'Đen trắng thanh lịch',
    patch: { filterPreset: 'bw_classic', grayscale: true, brightness: 103, contrast: 112, saturate: 0, sepia: 0, blur: 0 }
  },
  {
    id: 'bw_noir',
    label: '🎬 Noir Điện Ảnh',
    desc: 'Đen trắng tương phản sâu',
    patch: { filterPreset: 'bw_noir', grayscale: true, brightness: 96, contrast: 138, saturate: 0, sepia: 0, blur: 0 }
  },
  {
    id: 'film_warm',
    label: '🎞️ Film Cổ Điển',
    desc: 'Màu phim ấm hoài niệm',
    patch: { filterPreset: 'film_warm', grayscale: false, brightness: 103, contrast: 106, saturate: 92, sepia: 28, blur: 0 }
  },
  {
    id: 'matte_cream',
    label: '☁️ Kem Mịn Hàn',
    desc: 'Trong trẻo, dịu nhẹ',
    patch: { filterPreset: 'matte_cream', grayscale: false, brightness: 107, contrast: 92, saturate: 86, sepia: 8, blur: 0 }
  },
  {
    id: 'kodak_gold',
    label: '☀️ Kodak Gold',
    desc: 'Rực rỡ, ấm nắng',
    patch: { filterPreset: 'kodak_gold', grayscale: false, brightness: 102, contrast: 110, saturate: 130, sepia: 14, blur: 0 }
  },
  {
    id: 'retro_sepia',
    label: '📜 Hoài Cổ Sepia',
    desc: 'Nâu trầm thập niên 90',
    patch: { filterPreset: 'retro_sepia', grayscale: false, brightness: 100, contrast: 106, saturate: 80, sepia: 68, blur: 0 }
  },
  {
    id: 'dreamy_glow',
    label: '✨ Mơ Màng',
    desc: 'Sáng mịn lãng mạn',
    patch: { filterPreset: 'dreamy_glow', grayscale: false, brightness: 110, contrast: 94, saturate: 95, sepia: 5, blur: 0.6 }
  }
];

const SLOT_FRAME_STYLES = [
  {
    id: 'none',
    label: 'Không viền',
    patch: { frameStyle: 'none', borderWidth: 0, borderColor: '#FFFFFF', borderRadius: 0, shadow: 'none' }
  },
  {
    id: 'thin_white',
    label: 'Viền Trắng Mảnh',
    patch: { frameStyle: 'thin_white', borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 0, shadow: 'soft' }
  },
  {
    id: 'polaroid',
    label: 'Khung Polaroid',
    patch: { frameStyle: 'polaroid', borderWidth: 6, borderColor: '#FAF8F4', borderRadius: 2, shadow: 'deep' }
  },
  {
    id: 'floating_3d',
    label: 'Nổi 3D Đổ Bóng',
    patch: { frameStyle: 'floating_3d', borderWidth: 0, borderColor: '#FFFFFF', borderRadius: 6, shadow: 'deep' }
  },
  {
    id: 'rounded_arch',
    label: 'Bo Góc Mềm',
    patch: { frameStyle: 'rounded_arch', borderWidth: 2, borderColor: '#FAF8F4', borderRadius: 20, shadow: 'soft' }
  },
  {
    id: 'gold_luxury',
    label: 'Viền Vàng Gold',
    patch: { frameStyle: 'gold_luxury', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 0, shadow: 'soft' }
  }
];

/**
 * Tạo chuỗi CSS / Canvas filter đồng nhất cho từng Ô ảnh
 */
const buildSlotCssFilter = (slot = {}, extraBlur = 0) => {
  const parts = [];
  if (slot.grayscale) parts.push('grayscale(100%)');
  if (slot.brightness !== undefined && Number(slot.brightness) !== 100) {
    parts.push(`brightness(${slot.brightness}%)`);
  }
  if (slot.contrast !== undefined && Number(slot.contrast) !== 100) {
    parts.push(`contrast(${slot.contrast}%)`);
  }
  if (slot.saturate !== undefined && Number(slot.saturate) !== 100 && !slot.grayscale) {
    parts.push(`saturate(${slot.saturate}%)`);
  }
  if (slot.sepia && Number(slot.sepia) > 0 && !slot.grayscale) {
    parts.push(`sepia(${slot.sepia}%)`);
  }
  const totalBlur = (Number(slot.blur) || 0) + (Number(extraBlur) || 0);
  if (totalBlur > 0) {
    parts.push(`blur(${totalBlur}px)`);
  }
  return parts.length > 0 ? parts.join(' ') : 'none';
};

/**
 * Chuẩn hóa link ảnh Google Drive sang link an toàn cho cả hiển thị và xuất Canvas (không bị chặn CORS)
 */
const getCanvasSafeImageUrl = (url = '', fileId = '') => {
  if (!url && !fileId) return '';
  if (url && (url.startsWith('data:') || url.startsWith('blob:'))) return url;

  let extractedId = fileId;
  if (!extractedId && url) {
    const match =
      url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/id=([a-zA-Z0-9_-]+)/) ||
      url.match(/proxy-image\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) extractedId = match[1];
  }

  if (extractedId) {
    return `/api/albums/proxy-image/${extractedId}?sz=1600`;
  }
  return url;
};

export const StudioTemplateDesigner = ({
  currentUser,
  albums = [],
  onSaveToPortfolio
}) => {
  // Danh sách templates
  const [templates, setTemplates] = useState(FALLBACK_EDITORIAL_TEMPLATES);
  const [templateFilter, setTemplateFilter] = useState('all'); // 'all' | 'system' | 'community' | 'mine'
  const [activeTemplateId, setActiveTemplateId] = useState('tpl_editorial_love');

  // State thiết kế hiện tại trên Canvas
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [background, setBackground] = useState(FALLBACK_EDITORIAL_TEMPLATES[0].background);
  const [decorCards, setDecorCards] = useState(FALLBACK_EDITORIAL_TEMPLATES[0].decorCards || []);
  const [photoSlots, setPhotoSlots] = useState(FALLBACK_EDITORIAL_TEMPLATES[0].photoSlots || []);
  const [textLayers, setTextLayers] = useState(FALLBACK_EDITORIAL_TEMPLATES[0].textLayers || []);
  const [driveOverlayUrl, setDriveOverlayUrl] = useState('');
  const [driveFileId, setDriveFileId] = useState('');

  // Ảnh đang gắn vào từng slot: { [slotId]: { url, fileId, fileName } }
  const [slotImages, setSlotImages] = useState({});
  const [selectedSlotId, setSelectedSlotId] = useState('slot_1');
  const [selectedTextId, setSelectedTextId] = useState('txt_love');

  // Bộ Brand Kit Logo của Studio (Lưu tự động vào localStorage theo Studio)
  const storageBrandKey = `photodate_brandkit_${currentUser?._id || 'default'}`;
  const [logoConfig, setLogoConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(storageBrandKey);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      visible: true,
      x: 50,
      y: 88.5,
      scale: 1,
      colorMode: 'white', // 'white' | 'black' | 'gold' | 'original'
      studioText: (currentUser?.name || 'TAM LE MEDIA').toUpperCase(),
      subtitle: 'Present',
      logoDataUrl: ''
    };
  });

  // Panel điều khiển bên phải: 'photos' | 'text' | 'brand' | 'layout' | 'drive'
  const [controlTab, setControlTab] = useState('photos');

  // Nguồn ảnh từ Album Google Drive
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [albumPhotoMode, setAlbumPhotoMode] = useState('all'); // 'all' | 'selected'
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loadingAlbumPhotos, setLoadingAlbumPhotos] = useState(false);
  const [localUploadedPhotos, setLocalUploadedPhotos] = useState([]);

  // Dragging text / logo on Preview Canvas
  const previewContainerRef = useRef(null);
  const [draggingItem, setDraggingItem] = useState(null); // { type: 'text' | 'logo', id?: string }

  // Modals & Export states
  const [exporting, setExporting] = useState(false);
  const [batchExporting, setBatchExporting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Modal Lưu Template mới
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveTplForm, setSaveTplForm] = useState({
    title: '',
    subtitle: '',
    category: 'Pre-Wedding & Cưới',
    isPublic: true,
    driveOverlayUrl: ''
  });
  const [savingTpl, setSavingTpl] = useState(false);

  // Modal Nhập Kho Khung PNG từ Google Drive
  const [isImportDriveOpen, setIsImportDriveOpen] = useState(false);
  const [importDriveForm, setImportDriveForm] = useState({
    driveUrl: '',
    titlePrefix: `Template ${currentUser?.name || 'Studio'}`,
    category: 'Pre-Wedding & Cưới',
    isPublic: true
  });
  const [importingDrive, setImportingDrive] = useState(false);

  const showToast = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4500);
  };

  // Lưu Brand Kit vào localStorage khi đổi logo/tên
  useEffect(() => {
    try {
      localStorage.setItem(storageBrandKey, JSON.stringify(logoConfig));
    } catch (_) {}
  }, [logoConfig, storageBrandKey]);

  // Tải danh sách Templates từ API
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await templateApi.getAll({ authorId: currentUser?._id || '' });
      if (res.data && res.data.length > 0) {
        setTemplates(res.data);
      }
    } catch (_) {}
  }, [currentUser?._id]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Nạp cấu hình khi chọn 1 Template
  const applyTemplate = useCallback((tpl, customPhotoPool = null) => {
    if (!tpl) return;
    setActiveTemplateId(tpl._id || tpl.id);
    setAspectRatio(tpl.aspectRatio || '3:4');
    setBackground(tpl.background || { type: 'solid', color: '#FAF8F5', grayscale: false, blur: 0, overlayOpacity: 0 });
    setDecorCards(Array.isArray(tpl.decorCards) ? JSON.parse(JSON.stringify(tpl.decorCards)) : []);
    const clonedSlots = Array.isArray(tpl.photoSlots) ? JSON.parse(JSON.stringify(tpl.photoSlots)) : [];
    const clonedTexts = Array.isArray(tpl.textLayers) ? JSON.parse(JSON.stringify(tpl.textLayers)) : [];
    setPhotoSlots(clonedSlots);
    setTextLayers(clonedTexts);
    setDriveOverlayUrl(tpl.driveOverlayUrl || '');
    setDriveFileId(tpl.driveFileId || '');

    if (tpl.logoConfig) {
      setLogoConfig((prev) => ({
        ...prev,
        visible: tpl.logoConfig.visible !== undefined ? tpl.logoConfig.visible : true,
        x: tpl.logoConfig.x ?? 50,
        y: tpl.logoConfig.y ?? 90,
        scale: tpl.logoConfig.scale ?? 0.9,
        colorMode: tpl.logoConfig.colorMode || 'black'
      }));
    }

    if (clonedSlots.length > 0) {
      const firstNonBg = clonedSlots.find((s) => !s.isBackground) || clonedSlots[0];
      setSelectedSlotId(firstNonBg.id);
    }
    if (clonedTexts.length > 0) {
      setSelectedTextId(clonedTexts[0].id);
    } else {
      setSelectedTextId('');
    }

    // Tự động lấp ảnh từ nguồn ảnh hiện tại hoặc ảnh mẫu cưới
    const pool = customPhotoPool || [
      ...localUploadedPhotos,
      ...albumPhotos,
      ...SAMPLE_WEDDING_PHOTOS.map((u, idx) => ({ url: u, fileName: `Sample_${idx + 1}.jpg` }))
    ];

    setSlotImages((prev) => {
      const next = {};
      clonedSlots.forEach((slot, idx) => {
        const picked = pool[idx % pool.length];
        if (picked) {
          next[slot.id] = picked;
        } else if (prev[slot.id]) {
          next[slot.id] = prev[slot.id];
        }
      });
      return next;
    });
  }, [localUploadedPhotos, albumPhotos]);

  // Khởi tạo ảnh mẫu lần đầu
  useEffect(() => {
    applyTemplate(FALLBACK_EDITORIAL_TEMPLATES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi chọn Album Google Drive của Studio, tải danh sách ảnh của Album đó
  useEffect(() => {
    if (!selectedAlbumId) {
      setAlbumPhotos([]);
      return;
    }

    const foundAlbum = albums.find((a) => String(a._id) === String(selectedAlbumId));
    if (!foundAlbum) return;

    setLoadingAlbumPhotos(true);
    albumApi
      .getManageData(foundAlbum._id, foundAlbum.manageToken)
      .then((res) => {
        const fullAlbum = res.data || foundAlbum;
        const rawImgs =
          albumPhotoMode === 'selected' && fullAlbum.selectedImages?.length > 0
            ? fullAlbum.selectedImages
            : fullAlbum.images || [];

        const normalized = rawImgs.map((img, i) => ({
          fileId: img.fileId || '',
          fileName: img.fileName || `Photo_${i + 1}.jpg`,
          url: img.thumbnailUrl || img.embedUrl || (img.fileId ? `https://lh3.googleusercontent.com/d/${img.fileId}=s1200` : ''),
          isSelectedByClient: Boolean(
            fullAlbum.selectedImages?.some((s) => s.fileId === img.fileId)
          )
        }));
        setAlbumPhotos(normalized);
      })
      .catch(() => {
        const fallbackImgs =
          albumPhotoMode === 'selected' && foundAlbum.selectedImages?.length > 0
            ? foundAlbum.selectedImages
            : foundAlbum.images || [];
        setAlbumPhotos(
          fallbackImgs.map((img, i) => ({
            fileId: img.fileId || '',
            fileName: img.fileName || `Photo_${i + 1}.jpg`,
            url: img.thumbnailUrl || img.embedUrl || ''
          }))
        );
      })
      .finally(() => setLoadingAlbumPhotos(false));
  }, [selectedAlbumId, albumPhotoMode, albums]);

  // Tự động đổ toàn bộ ảnh từ Album đang chọn vào các ô trên Canvas
  const handleAutoFillFromSource = (sourceList) => {
    if (!sourceList || sourceList.length === 0) {
      showToast('error', 'Chưa có ảnh nào trong nguồn đã chọn để lấp đầy.');
      return;
    }
    const nextMap = {};
    photoSlots.forEach((slot, idx) => {
      nextMap[slot.id] = sourceList[idx % sourceList.length];
    });
    setSlotImages(nextMap);
    showToast('success', `✨ Đã tự động dàn ${photoSlots.length} ảnh vào bố cục!`);
  };

  // Xử lý tải ảnh từ máy tính của Nhiếp ảnh gia
  const handleLocalPhotosUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map((file) => ({
      fileId: '',
      fileName: file.name,
      url: URL.createObjectURL(file)
    }));

    setLocalUploadedPhotos((prev) => {
      const combined = [...newItems, ...prev];
      // Nếu đang chọn 1 ô ảnh thì gán ngay ảnh đầu tiên vào ô đó, nếu nhiều ảnh thì lấp đầy
      if (newItems.length === 1 && selectedSlotId) {
        setSlotImages((old) => ({ ...old, [selectedSlotId]: newItems[0] }));
      } else {
        const nextMap = { ...slotImages };
        photoSlots.forEach((slot, idx) => {
          if (combined[idx]) nextMap[slot.id] = combined[idx];
        });
        setSlotImages(nextMap);
      }
      return combined;
    });
    e.target.value = '';
  };

  // Upload Logo PNG tách nền cho Brand Kit
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoConfig((prev) => ({
        ...prev,
        logoDataUrl: reader.result
      }));
      showToast('success', 'Đã lưu Logo PNG vào Brand Kit của Studio!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Cập nhật thuộc tính của 1 ô ảnh
  const updateSelectedSlot = (patch) => {
    if (!selectedSlotId) return;
    setPhotoSlots((prev) =>
      prev.map((s) => (s.id === selectedSlotId ? { ...s, ...patch } : s))
    );
  };

  // Thêm 1 ô ảnh mới tự do (hỗ trợ kéo-thả vị trí, kích thước, xoay và hiệu ứng màu)
  const handleAddPhotoSlot = () => {
    const fgCount = photoSlots.filter((s) => !s.isBackground).length;
    const offset = (fgCount % 5) * 4;
    const newId = `slot_custom_${Date.now()}`;
    const newSlot = {
      id: newId,
      label: `Ô ảnh #${photoSlots.length + 1}`,
      isBackground: false,
      x: Math.min(55, 16 + offset),
      y: Math.min(55, 16 + offset),
      w: 42,
      h: 42,
      rotation: 0,
      opacity: 100,
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#FFFFFF',
      frameStyle: 'none',
      shadow: 'soft',
      filterPreset: 'original',
      grayscale: false,
      brightness: 100,
      contrast: 100,
      saturate: 100,
      sepia: 0,
      blur: 0,
      panX: 50,
      panY: 50,
      zoom: 1
    };
    setPhotoSlots((prev) => [...prev, newSlot]);
    setSelectedSlotId(newId);
    setControlTab('photos');
    const pool = activeSourcePhotos;
    setSlotImages((prev) => ({
      ...prev,
      [newId]: pool[photoSlots.length % pool.length] || {
        url: SAMPLE_WEDDING_PHOTOS[photoSlots.length % SAMPLE_WEDDING_PHOTOS.length]
      }
    }));
    showToast('success', '✨ Đã thêm Ô ảnh mới! Bạn có thể nhấn giữ chuột kéo ô ảnh tới bất kỳ vị trí nào hoặc kéo góc phải-dưới để chỉnh kích thước.');
  };

  // Nhân bản ô ảnh đang chọn
  const handleDuplicateSelectedSlot = () => {
    if (!selectedSlotObj) return;
    const newId = `slot_dup_${Date.now()}`;
    const cloned = {
      ...selectedSlotObj,
      id: newId,
      label: `${selectedSlotObj.label || 'Ô ảnh'} (Bản sao)`,
      isBackground: false,
      x: Math.min(85, Number(selectedSlotObj.x || 10) + 5),
      y: Math.min(85, Number(selectedSlotObj.y || 10) + 5)
    };
    setPhotoSlots((prev) => [...prev, cloned]);
    setSelectedSlotId(newId);
    if (slotImages[selectedSlotObj.id]) {
      setSlotImages((prev) => ({ ...prev, [newId]: slotImages[selectedSlotObj.id] }));
    }
  };

  // Đổi thứ tự lớp (Đưa lên trên / Đẩy xuống dưới) cho ô ảnh đang chọn
  const handleMoveSlotLayer = (direction) => {
    if (!selectedSlotId) return;
    setPhotoSlots((prev) => {
      const idx = prev.findIndex((s) => s.id === selectedSlotId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(targetIdx, 0, item);
      return next;
    });
  };

  // Xóa ô ảnh đang chọn
  const handleDeleteSelectedSlot = () => {
    if (!selectedSlotId || photoSlots.length <= 1) return;
    const remaining = photoSlots.filter((s) => s.id !== selectedSlotId);
    setPhotoSlots(remaining);
    setSelectedSlotId(remaining[0]?.id || '');
  };

  // Tạo nhanh bố cục sáng tạo mới (Tự thiết kế Template mới từ đầu)
  const handleQuickCreateLayout = (layoutType) => {
    const now = Date.now();
    let newSlots = [];
    let newCards = [];
    let newBg = { type: 'solid', color: '#FAF8F4', grayscale: false, blur: 0, overlayOpacity: 0 };

    if (layoutType === 'blank_freeform') {
      newSlots = [
        {
          id: `slot_${now}_1`,
          label: 'Ô ảnh chính #1',
          isBackground: false,
          x: 15,
          y: 12,
          w: 70,
          h: 65,
          rotation: 0,
          opacity: 100,
          borderRadius: 0,
          borderWidth: 0,
          borderColor: '#FFFFFF',
          frameStyle: 'floating_3d',
          shadow: 'deep',
          filterPreset: 'original',
          grayscale: false,
          brightness: 100,
          contrast: 100,
          saturate: 100,
          sepia: 0,
          blur: 0,
          panX: 50,
          panY: 50,
          zoom: 1
        }
      ];
    } else if (layoutType === 'polaroid_scrapbook') {
      newBg = { type: 'solid', color: '#F3EFE6', grayscale: false, blur: 0, overlayOpacity: 0 };
      newSlots = [
        {
          id: `slot_${now}_bg`,
          label: 'Ảnh nền mờ',
          isBackground: true,
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          grayscale: true,
          panX: 50,
          panY: 50,
          zoom: 1.05
        },
        {
          id: `slot_${now}_1`,
          label: 'Polaroid Trái',
          isBackground: false,
          x: 10,
          y: 16,
          w: 48,
          h: 44,
          rotation: -6,
          opacity: 100,
          borderRadius: 2,
          borderWidth: 6,
          borderColor: '#FAF8F4',
          frameStyle: 'polaroid',
          shadow: 'deep',
          filterPreset: 'film_warm',
          grayscale: false,
          brightness: 103,
          contrast: 106,
          saturate: 92,
          sepia: 28,
          blur: 0,
          panX: 50,
          panY: 50,
          zoom: 1
        },
        {
          id: `slot_${now}_2`,
          label: 'Polaroid Phải',
          isBackground: false,
          x: 42,
          y: 36,
          w: 48,
          h: 44,
          rotation: 5,
          opacity: 100,
          borderRadius: 2,
          borderWidth: 6,
          borderColor: '#FAF8F4',
          frameStyle: 'polaroid',
          shadow: 'deep',
          filterPreset: 'original',
          grayscale: false,
          brightness: 100,
          contrast: 100,
          saturate: 100,
          sepia: 0,
          blur: 0,
          panX: 50,
          panY: 50,
          zoom: 1
        }
      ];
      newBg.blur = 4;
      newBg.overlayOpacity = 0.25;
    } else if (layoutType === 'editorial_overlap') {
      newCards = [
        {
          id: `card_${now}`,
          x: 8,
          y: 10,
          w: 84,
          h: 76,
          bgColor: '#FAF8F4',
          borderRadius: 0,
          shadow: true
        }
      ];
      newSlots = [
        {
          id: `slot_${now}_1`,
          label: 'Ảnh lớn bên trái',
          isBackground: false,
          x: 13,
          y: 15,
          w: 52,
          h: 62,
          rotation: 0,
          opacity: 100,
          borderRadius: 0,
          borderWidth: 0,
          borderColor: '#FFFFFF',
          frameStyle: 'none',
          shadow: 'soft',
          filterPreset: 'original',
          grayscale: false,
          brightness: 100,
          contrast: 100,
          saturate: 100,
          sepia: 0,
          blur: 0,
          panX: 50,
          panY: 50,
          zoom: 1
        },
        {
          id: `slot_${now}_2`,
          label: 'Ảnh nổi chồng góc phải',
          isBackground: false,
          x: 52,
          y: 44,
          w: 35,
          h: 36,
          rotation: 0,
          opacity: 100,
          borderRadius: 0,
          borderWidth: 5,
          borderColor: '#FAF8F4',
          frameStyle: 'thin_white',
          shadow: 'deep',
          filterPreset: 'bw_classic',
          grayscale: true,
          brightness: 103,
          contrast: 112,
          saturate: 0,
          sepia: 0,
          blur: 0,
          panX: 50,
          panY: 50,
          zoom: 1
        }
      ];
    }

    setActiveTemplateId('custom_freeform');
    setBackground(newBg);
    setDecorCards(newCards);
    setPhotoSlots(newSlots);
    const firstFg = newSlots.find((s) => !s.isBackground) || newSlots[0];
    if (firstFg) setSelectedSlotId(firstFg.id);

    const pool = activeSourcePhotos;
    const nextImgs = {};
    newSlots.forEach((s, idx) => {
      nextImgs[s.id] = pool[idx % pool.length] || {
        url: SAMPLE_WEDDING_PHOTOS[idx % SAMPLE_WEDDING_PHOTOS.length]
      };
    });
    setSlotImages(nextImgs);
    showToast('success', '🎨 Đã khởi tạo bố cục sáng tạo! Hãy kéo-thả các Ô ảnh trên khung để tùy biến và bấm "Lưu Thành Template Mới".');
  };

  // Thêm / Xóa Thẻ nền trang trí (Decor Card)
  const handleAddDecorCard = () => {
    const newCard = {
      id: `card_${Date.now()}`,
      x: 12,
      y: 18,
      w: 76,
      h: 60,
      bgColor: '#FAF8F4',
      borderRadius: 0,
      shadow: true
    };
    setDecorCards((prev) => [...prev, newCard]);
    showToast('success', 'Đã thêm Khung giấy nền trang trí (Decor Card)!');
  };

  const handleRemoveDecorCard = (cardId) => {
    setDecorCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // Thêm 1 lớp chữ mới tự do
  const handleAddTextLayer = () => {
    const newId = `txt_${Date.now()}`;
    const newLayer = {
      id: newId,
      text: 'Nhập chữ của bạn...',
      x: 50,
      y: 50,
      align: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 24,
      fontWeight: '500',
      fontStyle: 'normal',
      color: '#222222',
      letterSpacing: 0.5
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedTextId(newId);
    setControlTab('text');
  };

  // Cập nhật lớp chữ đang chọn
  const updateSelectedText = (patch) => {
    if (!selectedTextId) return;
    setTextLayers((prev) =>
      prev.map((t) => (t.id === selectedTextId ? { ...t, ...patch } : t))
    );
  };

  // Xóa lớp chữ đang chọn
  const handleDeleteSelectedText = () => {
    if (!selectedTextId) return;
    const remaining = textLayers.filter((t) => t.id !== selectedTextId);
    setTextLayers(remaining);
    setSelectedTextId(remaining[0]?.id || '');
  };

  // Áp dụng nhanh 1 bộ Quote cảm xúc
  const handleApplyQuotePreset = (preset) => {
    const titleId = `txt_title_${Date.now()}`;
    const bodyId = `txt_body_${Date.now() + 1}`;
    const isLoveStyle = activeTemplateId === 'tpl_editorial_love';

    const newLayers = [
      {
        id: titleId,
        text: preset.title,
        x: isLoveStyle ? 84 : 50,
        y: isLoveStyle ? 39.5 : 19,
        align: isLoveStyle ? 'right' : 'center',
        fontFamily: preset.titleFont,
        fontSize: isLoveStyle ? 36 : 26,
        fontWeight: '500',
        fontStyle: 'normal',
        color: preset.titleColor,
        letterSpacing: 1
      },
      {
        id: bodyId,
        text: preset.body,
        x: isLoveStyle ? 84 : 50,
        y: isLoveStyle ? 44.5 : 88,
        align: isLoveStyle ? 'right' : 'center',
        fontFamily: preset.bodyFont,
        fontSize: 12,
        fontWeight: '400',
        fontStyle: 'normal',
        color: '#3A3532',
        letterSpacing: 0.3
      }
    ];
    setTextLayers(newLayers);
    setSelectedTextId(titleId);
    showToast('success', `Đã áp dụng bộ chữ "${preset.label}"!`);
  };

  // Kéo-thả trực tiếp Ô ảnh (Di chuyển & Đổi kích thước), Khung nền, Chữ hoặc Logo trên khung Preview
  const handlePreviewPointerMove = (e) => {
    if (!draggingItem || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const relX = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
    const relY = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100));

    if (draggingItem.type === 'slot-move' && draggingItem.id) {
      const dx = ((e.clientX - draggingItem.startClientX) / rect.width) * 100;
      const dy = ((e.clientY - draggingItem.startClientY) / rect.height) * 100;
      let nextX = Math.max(-15, Math.min(94, draggingItem.origX + dx));
      let nextY = Math.max(-15, Math.min(94, draggingItem.origY + dy));

      // Tự động bắt dính (Snap) vào trục giữa trang (50%) nếu kéo gần tâm
      const centerX = nextX + (draggingItem.origW || 40) / 2;
      const centerY = nextY + (draggingItem.origH || 40) / 2;
      if (Math.abs(centerX - 50) < 1.2) {
        nextX = 50 - (draggingItem.origW || 40) / 2;
      }
      if (Math.abs(centerY - 50) < 1.2) {
        nextY = 50 - (draggingItem.origH || 40) / 2;
      }

      setPhotoSlots((prev) =>
        prev.map((s) =>
          s.id === draggingItem.id
            ? { ...s, x: Number(nextX.toFixed(1)), y: Number(nextY.toFixed(1)) }
            : s
        )
      );
    } else if (draggingItem.type === 'slot-resize' && draggingItem.id) {
      const dx = ((e.clientX - draggingItem.startClientX) / rect.width) * 100;
      const dy = ((e.clientY - draggingItem.startClientY) / rect.height) * 100;
      const dir = draggingItem.dir || 'se';
      const nextW =
        dir === 's'
          ? draggingItem.origW
          : Math.max(8, Math.min(100, draggingItem.origW + dx));
      const nextH =
        dir === 'e'
          ? draggingItem.origH
          : Math.max(8, Math.min(100, draggingItem.origH + dy));

      setPhotoSlots((prev) =>
        prev.map((s) =>
          s.id === draggingItem.id
            ? { ...s, w: Number(nextW.toFixed(1)), h: Number(nextH.toFixed(1)) }
            : s
        )
      );
    } else if (draggingItem.type === 'text' && draggingItem.id) {
      setTextLayers((prev) =>
        prev.map((t) =>
          t.id === draggingItem.id
            ? { ...t, x: Number(relX.toFixed(1)), y: Number(relY.toFixed(1)) }
            : t
        )
      );
    } else if (draggingItem.type === 'logo') {
      setLogoConfig((prev) => ({
        ...prev,
        x: Number(relX.toFixed(1)),
        y: Number(relY.toFixed(1))
      }));
    }
  };

  const handlePreviewPointerUp = () => {
    if (draggingItem) setDraggingItem(null);
  };

  /**
   * HÀM RENDER CANVAS ĐỘ PHÂN GIẢI CAO (2K) ĐỂ XUẤT PNG/JPG HOẶC LƯU PORTFOLIO
   */
  const renderStoryboardToCanvas = async (customState = null) => {
    const state = customState || {
      aspectRatio,
      background,
      decorCards,
      photoSlots,
      textLayers,
      logoConfig,
      slotImages,
      driveOverlayUrl,
      driveFileId
    };

    const ratioMeta = ASPECT_RATIOS[state.aspectRatio] || ASPECT_RATIOS['3:4'];
    const W = ratioMeta.w;
    const H = ratioMeta.h;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Helper tải ảnh an toàn CORS
    const loadImageSafe = (rawUrl, fId = '') =>
      new Promise((resolve) => {
        const safeUrl = getCanvasSafeImageUrl(rawUrl, fId);
        if (!safeUrl) return resolve(null);
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          const fallbackImg = new window.Image();
          fallbackImg.crossOrigin = 'anonymous';
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => resolve(null);
          fallbackImg.src = rawUrl;
        };
        img.src = safeUrl;
      });

    // Helper vẽ ảnh object-fit: cover kèm Pan, Zoom, Rotation, Frame & Bộ lọc màu nghệ thuật
    const drawCoverImage = (img, xPx, yPx, wPx, hPx, opts = {}) => {
      if (!img) return;
      const {
        panX = 50,
        panY = 50,
        zoom = 1,
        borderRadius = 0,
        cssFilter = 'none'
      } = opts;

      ctx.save();
      ctx.beginPath();
      if (borderRadius > 0 && ctx.roundRect) {
        ctx.roundRect(xPx, yPx, wPx, hPx, borderRadius);
      } else {
        ctx.rect(xPx, yPx, wPx, hPx);
      }
      ctx.clip();

      if (cssFilter && cssFilter !== 'none') {
        ctx.filter = cssFilter;
      }

      const imgRatio = img.width / img.height;
      const boxRatio = wPx / hPx;
      let drawW = wPx;
      let drawH = hPx;

      if (imgRatio > boxRatio) {
        drawH = hPx * zoom;
        drawW = drawH * imgRatio;
      } else {
        drawW = wPx * zoom;
        drawH = drawW / imgRatio;
      }

      const offsetX = xPx - (drawW - wPx) * (panX / 100);
      const offsetY = yPx - (drawH - hPx) * (panY / 100);

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    };

    // 1. Vẽ nền đặc (Solid Background)
    ctx.fillStyle = state.background?.color || '#FAF8F5';
    ctx.fillRect(0, 0, W, H);

    // 2. Vẽ các ô ảnh là Background (isBackground: true) trước
    const bgSlots = state.photoSlots.filter((s) => s.isBackground);
    for (const slot of bgSlots) {
      const assigned = state.slotImages[slot.id];
      if (assigned?.url) {
        const img = await loadImageSafe(assigned.url, assigned.fileId);
        if (img) {
          const mergedSlot = {
            ...slot,
            grayscale: Boolean(slot.grayscale || state.background?.grayscale)
          };
          drawCoverImage(img, 0, 0, W, H, {
            panX: slot.panX ?? 50,
            panY: slot.panY ?? 50,
            zoom: slot.zoom ?? 1,
            cssFilter: buildSlotCssFilter(mergedSlot, (Number(state.background?.blur) || 0) * 2)
          });
        }
      }
      if (state.background?.overlayOpacity > 0) {
        ctx.fillStyle = `rgba(0,0,0,${state.background.overlayOpacity})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // 3. Vẽ các Thẻ nền trang trí (Decor Cards)
    for (const card of state.decorCards || []) {
      const cx = (card.x / 100) * W;
      const cy = (card.y / 100) * H;
      const cw = (card.w / 100) * W;
      const ch = (card.h / 100) * H;
      ctx.save();
      if (card.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 12;
      }
      ctx.fillStyle = card.bgColor || '#FAF8F4';
      const cRadius = (Number(card.borderRadius) || 0) * (W / 540);
      if (cRadius > 0 && ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(cx, cy, cw, ch, cRadius);
        ctx.fill();
      } else {
        ctx.fillRect(cx, cy, cw, ch);
      }
      ctx.restore();
    }

    // 4. Vẽ các Ô ảnh chính (Foreground Photo Slots) hỗ trợ Xoay, Khung Polaroid/Viền, Đổ bóng & Bộ lọc màu
    const scaleRatio = W / 540;
    const fgSlots = state.photoSlots.filter((s) => !s.isBackground);
    for (const slot of fgSlots) {
      const sx = (slot.x / 100) * W;
      const sy = (slot.y / 100) * H;
      const sw = (slot.w / 100) * W;
      const sh = (slot.h / 100) * H;
      const rotDeg = Number(slot.rotation) || 0;
      const opacityVal = Math.max(0.1, Math.min(1, (Number(slot.opacity ?? 100)) / 100));
      const radiusPx = (Number(slot.borderRadius) || 0) * scaleRatio;
      const borderW = (Number(slot.borderWidth) || 0) * scaleRatio;
      const isPolaroid = slot.frameStyle === 'polaroid';
      const padSide = isPolaroid ? Math.max(14 * scaleRatio, borderW) : borderW;
      const padBottom = isPolaroid ? Math.max(44 * scaleRatio, borderW * 3.2) : borderW;

      ctx.save();
      ctx.globalAlpha = opacityVal;

      // Xoay quanh tâm của Ô ảnh nếu có góc xoay (Rotation)
      if (rotDeg !== 0) {
        const cx = sx + sw / 2;
        const cy = sy + sh / 2;
        ctx.translate(cx, cy);
        ctx.rotate((rotDeg * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      // Đổ bóng 3D hoặc bóng nhẹ cho Ô ảnh
      if (slot.shadow === 'deep' || slot.shadow === 'soft' || isPolaroid) {
        ctx.save();
        ctx.shadowColor = slot.shadow === 'deep' || isPolaroid ? 'rgba(0,0,0,0.42)' : 'rgba(0,0,0,0.22)';
        ctx.shadowBlur = (slot.shadow === 'deep' || isPolaroid ? 36 : 18) * scaleRatio;
        ctx.shadowOffsetY = (slot.shadow === 'deep' || isPolaroid ? 14 : 6) * scaleRatio;
        ctx.fillStyle = slot.borderColor || '#FAF8F4';
        if (radiusPx > 0 && ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(sx, sy, sw, sh, radiusPx);
          ctx.fill();
        } else {
          ctx.fillRect(sx, sy, sw, sh);
        }
        ctx.restore();
      }

      // Vẽ nền khung viền (nếu có viền hoặc Polaroid)
      if (padSide > 0 || padBottom > 0) {
        ctx.fillStyle = slot.borderColor || '#FFFFFF';
        if (radiusPx > 0 && ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(sx, sy, sw, sh, radiusPx);
          ctx.fill();
        } else {
          ctx.fillRect(sx, sy, sw, sh);
        }
      }

      const innerX = sx + padSide;
      const innerY = sy + padSide;
      const innerW = Math.max(10, sw - padSide * 2);
      const innerH = Math.max(10, sh - padSide - padBottom);
      const innerRadius = Math.max(0, radiusPx - padSide * 0.5);

      ctx.fillStyle = '#E5E0D8';
      if (innerRadius > 0 && ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(innerX, innerY, innerW, innerH, innerRadius);
        ctx.fill();
      } else {
        ctx.fillRect(innerX, innerY, innerW, innerH);
      }

      const assigned = state.slotImages[slot.id];
      if (assigned?.url) {
        const img = await loadImageSafe(assigned.url, assigned.fileId);
        if (img) {
          drawCoverImage(img, innerX, innerY, innerW, innerH, {
            panX: slot.panX ?? 50,
            panY: slot.panY ?? 50,
            zoom: slot.zoom ?? 1,
            borderRadius: innerRadius,
            cssFilter: buildSlotCssFilter(slot, (Number(slot.blur) || 0) * 1.5)
          });
        }
      }

      ctx.restore();
    }

    // 5. Vẽ Khung PNG Overlay từ Google Drive (nếu Template có gắn link Drive PNG)
    if (state.driveOverlayUrl || state.driveFileId) {
      const overlayImg = await loadImageSafe(state.driveOverlayUrl, state.driveFileId);
      if (overlayImg) {
        ctx.drawImage(overlayImg, 0, 0, W, H);
      }
    }

    // 6. Vẽ các Lớp chữ tự do (Text Layers)
    const scaleFactor = W / 600; // Chuẩn hóa cỡ chữ theo khung preview 600px
    for (const layer of state.textLayers || []) {
      if (!layer.text) continue;
      ctx.save();
      const fontSizePx = Math.round((Number(layer.fontSize) || 20) * scaleFactor);
      const fontStyle = layer.fontStyle || 'normal';
      const fontWeight = layer.fontWeight || '400';
      const fontFamily = layer.fontFamily || 'Playfair Display';
      ctx.font = `${fontStyle} ${fontWeight} ${fontSizePx}px "${fontFamily}", serif`;
      ctx.fillStyle = layer.color || '#222222';
      ctx.textAlign = layer.align || 'center';
      ctx.textBaseline = 'top';

      const tx = (layer.x / 100) * W;
      const ty = (layer.y / 100) * H;
      const lines = String(layer.text).split('\n');
      const lineHeight = fontSizePx * 1.38;

      lines.forEach((line, idx) => {
        ctx.fillText(line, tx, ty + idx * lineHeight);
      });
      ctx.restore();
    }

    // 7. Vẽ Bộ Nhận Diện Logo Studio (Brand Kit)
    if (state.logoConfig?.visible) {
      const lx = (state.logoConfig.x / 100) * W;
      const ly = (state.logoConfig.y / 100) * H;
      const lScale = Number(state.logoConfig.scale) || 1;
      const colorMode = state.logoConfig.colorMode || 'black';
      const primaryColor =
        colorMode === 'white'
          ? '#FFFFFF'
          : colorMode === 'gold'
          ? '#D4AF37'
          : '#161616';

      ctx.save();
      ctx.translate(lx, ly);
      ctx.scale(lScale, lScale);

      if (state.logoConfig.logoDataUrl) {
        const logoImg = await loadImageSafe(state.logoConfig.logoDataUrl);
        if (logoImg) {
          const maxH = 85;
          const ratio = logoImg.width / logoImg.height;
          const drawH = maxH;
          const drawW = drawH * ratio;
          if (colorMode === 'white') {
            ctx.filter = 'brightness(0) invert(1)';
          } else if (colorMode === 'black') {
            ctx.filter = 'brightness(0)';
          }
          ctx.drawImage(logoImg, -drawW / 2, -drawH / 2 - 15, drawW, drawH);
          ctx.filter = 'none';
        }
      } else {
        // Vẽ biểu tượng Monogram Kiến Trúc (Phong cách TAM LE MEDIA)
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 6.5;
        ctx.lineCap = 'square';
        // Nét đứng trái & mái vòm Isometric
        ctx.beginPath();
        ctx.moveTo(-22, -46);
        ctx.lineTo(0, -60);
        ctx.lineTo(22, -46);
        ctx.moveTo(-14, -48);
        ctx.lineTo(-14, -12);
        ctx.lineTo(4, -22);
        ctx.moveTo(14, -46);
        ctx.lineTo(14, -16);
        ctx.stroke();
      }

      // Tên Studio & chữ Present
      ctx.fillStyle = primaryColor;
      ctx.textAlign = 'center';
      ctx.font = `700 18px "Montserrat", sans-serif`;
      ctx.fillText((state.logoConfig.studioText || 'TAM LE MEDIA').toUpperCase(), 0, 8);

      if (state.logoConfig.subtitle) {
        ctx.font = `400 14px "Montserrat", sans-serif`;
        ctx.fillText(state.logoConfig.subtitle, 0, 29);
      }

      ctx.restore();
    }

    return canvas;
  };

  // Tải ảnh Storyboard hiện tại về máy (High-Res PNG)
  const handleDownloadImage = async () => {
    try {
      setExporting(true);
      const canvas = await renderStoryboardToCanvas();
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      const cleanStudio = (logoConfig.studioText || 'Photodate').replace(/\s+/g, '_');
      link.download = `${cleanStudio}_Storyboard_${activeTemplateId}_${Date.now()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', '🎉 Đã xuất ảnh Storyboard độ phân giải 2K thành công!');
    } catch (err) {
      showToast('error', 'Không thể xuất file ảnh: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Xuất trọn bộ 4 trang liên hoàn (4 mẫu Editorial từ ảnh đang có)
  const handleBatchExport4Pages = async () => {
    try {
      setBatchExporting(true);
      const pool = [
        ...localUploadedPhotos,
        ...albumPhotos,
        ...SAMPLE_WEDDING_PHOTOS.map((u, idx) => ({ url: u, fileName: `Sample_${idx + 1}.jpg` }))
      ];
      const core4 = FALLBACK_EDITORIAL_TEMPLATES.slice(0, 4);
      let photoCursor = 0;

      for (let i = 0; i < core4.length; i++) {
        const tpl = core4[i];
        const mapForPage = {};
        (tpl.photoSlots || []).forEach((s) => {
          mapForPage[s.id] = pool[photoCursor % pool.length];
          photoCursor++;
        });

        const pageState = {
          aspectRatio: tpl.aspectRatio || '3:4',
          background: tpl.background,
          decorCards: tpl.decorCards || [],
          photoSlots: tpl.photoSlots || [],
          textLayers: tpl.textLayers || [],
          logoConfig: {
            ...logoConfig,
            x: tpl.logoConfig?.x ?? 50,
            y: tpl.logoConfig?.y ?? 90,
            scale: tpl.logoConfig?.scale ?? 0.9,
            colorMode: tpl.logoConfig?.colorMode || 'black'
          },
          slotImages: mapForPage,
          driveOverlayUrl: tpl.driveOverlayUrl || '',
          driveFileId: tpl.driveFileId || ''
        };

        const canvas = await renderStoryboardToCanvas(pageState);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
        const link = document.createElement('a');
        link.download = `Storyboard_0${i + 1}_${tpl.id}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise((r) => setTimeout(r, 350));
      }

      showToast('success', '🔥 Đã xuất trọn bộ 4 trang Storyboard liên hoàn về máy!');
    } catch (err) {
      showToast('error', 'Lỗi khi xuất bộ 4 trang: ' + err.message);
    } finally {
      setBatchExporting(false);
    }
  };

  // Lưu bố cục hiện tại thành Template mới (JSON siêu nhẹ + Link Drive)
  const handleSaveNewTemplate = async (e) => {
    e.preventDefault();
    if (!saveTplForm.title.trim()) return;
    try {
      setSavingTpl(true);
      const payload = {
        title: saveTplForm.title.trim(),
        subtitle: saveTplForm.subtitle.trim() || `Thiết kế bởi ${currentUser?.name || 'Studio'}`,
        category: saveTplForm.category,
        aspectRatio,
        isPublic: saveTplForm.isPublic,
        authorId: currentUser?._id || '',
        authorName: currentUser?.name || logoConfig.studioText || 'Studio Partner',
        driveOverlayUrl: saveTplForm.driveOverlayUrl.trim() || driveOverlayUrl,
        driveFileId,
        background,
        decorCards,
        photoSlots,
        textLayers,
        logoConfig: {
          visible: logoConfig.visible,
          x: logoConfig.x,
          y: logoConfig.y,
          scale: logoConfig.scale,
          colorMode: logoConfig.colorMode,
          studioText: logoConfig.studioText,
          subtitle: logoConfig.subtitle
        }
      };

      const res = await templateApi.create(payload);
      await fetchTemplates();
      if (res.data) {
        setActiveTemplateId(res.data._id || res.data.id);
      }
      setIsSaveModalOpen(false);
      setSaveTplForm({ title: '', subtitle: '', category: 'Pre-Wedding & Cưới', isPublic: true, driveOverlayUrl: '' });
      showToast('success', '💾 Đã lưu Template mới thành công!');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setSavingTpl(false);
    }
  };

  // Nhập hàng loạt Khung PNG Template từ link Google Drive
  const handleImportDriveTemplates = async (e) => {
    e.preventDefault();
    if (!importDriveForm.driveUrl.trim()) return;
    try {
      setImportingDrive(true);
      const res = await templateApi.importDrive({
        ...importDriveForm,
        aspectRatio,
        authorId: currentUser?._id || '',
        authorName: currentUser?.name || logoConfig.studioText || 'Studio Partner'
      });
      await fetchTemplates();
      setIsImportDriveOpen(false);
      setImportDriveForm((prev) => ({ ...prev, driveUrl: '' }));
      showToast('success', res.message || 'Đã đồng bộ Template từ Google Drive!');
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setImportingDrive(false);
    }
  };

  // Xóa Template tự tạo
  const handleDeleteTemplate = async (tpl, e) => {
    e.stopPropagation();
    if (tpl.isSystem) return;
    if (!window.confirm(`Bạn có chắc muốn xóa mẫu "${tpl.title}"?`)) return;
    try {
      await templateApi.delete(tpl._id || tpl.id);
      await fetchTemplates();
      showToast('success', 'Đã xóa mẫu Template.');
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Tạo Caption gợi ý đăng Facebook / Instagram / Threads kèm link đặt lịch Studio
  const socialCaption = `✨ ${textLayers[0]?.text ? `[${textLayers[0].text.toUpperCase()}] — ` : ''}Lưu giữ trọn vẹn từng khoảnh khắc cảm xúc nhất.\n${
    textLayers[1]?.text ? `“${textLayers[1].text.replace(/\n/g, ' ')}”\n\n` : '\n'
  }📸 Thực hiện bởi: ${logoConfig.studioText || currentUser?.name || 'Studio'}\n📅 Xem trọn bộ sưu tập & Đặt lịch chụp tại: ${getPublicBaseUrl()}/photographer/${
    currentUser?._id || 'studio'
  }\n#Photodate #${(logoConfig.studioText || 'Studio').replace(/\s+/g, '')} #PreWedding #WeddingPhotography #EditorialStoryboard`;

  const selectedSlotObj = photoSlots.find((s) => s.id === selectedSlotId) || photoSlots[0];
  const selectedTextObj = textLayers.find((t) => t.id === selectedTextId);

  const filteredTemplates = templates.filter((t) => {
    if (templateFilter === 'system') return t.isSystem;
    if (templateFilter === 'community') return !t.isSystem && t.isPublic;
    if (templateFilter === 'mine') return String(t.authorId) === String(currentUser?._id);
    return true;
  });

  const activeSourcePhotos =
    localUploadedPhotos.length > 0 && !selectedAlbumId
      ? localUploadedPhotos
      : albumPhotos.length > 0
      ? albumPhotos
      : SAMPLE_WEDDING_PHOTOS.map((u, i) => ({ url: u, fileName: `Mẫu_${i + 1}.jpg` }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#171a26] via-[#131722] to-[#0f121b] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Photodate Editorial Storyboard & Google Drive Template Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Thiết Kế Storyboard Nghệ Thuật & Kho Template Cộng Đồng
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
            Ghép ảnh trực tiếp từ Album Google Drive vào các mẫu tạp chí, tự do thêm chữ, đóng dấu Logo Studio hoặc nhập kho khung PNG từ Google Drive hoàn toàn không tốn dung lượng ứng dụng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsImportDriveOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#1c2233] hover:bg-[#252d42] border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md"
          >
            <CloudDownload className="w-4 h-4 text-sky-400" />
            <span>☁️ Nhập Template từ Google Drive</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSaveTplForm((prev) => ({
                ...prev,
                title: `Mẫu ${logoConfig.studioText || 'Studio'} #${templates.length + 1}`
              }));
              setIsSaveModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#1c2233] hover:bg-[#252d42] border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md"
          >
            <BookmarkPlus className="w-4 h-4 text-amber-400" />
            <span>💾 Lưu Thành Template Mới</span>
          </button>

          <button
            type="button"
            disabled={batchExporting}
            onClick={handleBatchExport4Pages}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            title="Tự động dàn ảnh vào cả 4 mẫu Editorial và tải trọn bộ 4 tấm về đăng Facebook/Instagram"
          >
            {batchExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            <span>Tải Trọn Bộ 4 Trang</span>
          </button>
        </div>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-medium animate-fade-in ${
            notice.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. THANH CHỌN MẪU TEMPLATE (PRESETS + CỘNG ĐỒNG + GOOGLE DRIVE) */}
      <div className="bg-[#141720] border border-[#242938] rounded-3xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            <Layout className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Chọn Bố Cục Template ({filteredTemplates.length} mẫu)
            </h3>
            <div className="flex items-center space-x-1.5 pl-1">
              <button
                type="button"
                onClick={() => handleQuickCreateLayout('blank_freeform')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer"
                title="Bắt đầu từ trang trắng để tự thêm ô ảnh, kéo-thả vị trí và lưu thành Template mới"
              >
                + Tự Tạo Mẫu Trắng
              </button>
              <button
                type="button"
                onClick={() => handleQuickCreateLayout('polaroid_scrapbook')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer"
              >
                📸 Mẫu Polaroid Nghiêng
              </button>
              <button
                type="button"
                onClick={() => handleQuickCreateLayout('editorial_overlap')}
                className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[11px] font-bold transition-all cursor-pointer"
              >
                📖 Mẫu Tạp Chí Xếp Chồng
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-[#0c0d12] p-1 rounded-xl border border-[#242938]">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'system', label: '⭐ Mẫu Chuẩn Tạp Chí (6)' },
              { id: 'community', label: '🌐 Cộng Đồng NAG' },
              { id: 'mine', label: '📁 Mẫu Của Tôi' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTemplateFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  templateFilter === tab.id
                    ? 'bg-amber-500 text-amber-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Template Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {filteredTemplates.map((tpl) => {
            const isSelected = (tpl._id || tpl.id) === activeTemplateId;
            const slotCount = (tpl.photoSlots || []).length;
            return (
              <div
                key={tpl._id || tpl.id}
                onClick={() => applyTemplate(tpl)}
                className={`group relative rounded-2xl p-3 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                    : 'bg-[#0c0d12] border-[#242938] hover:border-amber-500/40'
                }`}
              >
                {/* Mini Visual Wireframe Preview */}
                <div
                  className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-2.5 border border-white/10"
                  style={{ backgroundColor: tpl.background?.color || '#FAF8F5' }}
                >
                  {(tpl.decorCards || []).map((c) => (
                    <div
                      key={c.id}
                      style={{
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        width: `${c.w}%`,
                        height: `${c.h}%`,
                        backgroundColor: c.bgColor || '#FAF8F4'
                      }}
                      className="absolute shadow-sm"
                    />
                  ))}
                  {(tpl.photoSlots || []).map((s, idx) => (
                    <div
                      key={s.id || idx}
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.w}%`,
                        height: `${s.h}%`
                      }}
                      className={`absolute border border-white/40 flex items-center justify-center text-[8px] font-bold ${
                        s.isBackground
                          ? 'bg-zinc-700/60 text-white/60'
                          : s.grayscale
                          ? 'bg-zinc-500/80 text-white'
                          : 'bg-amber-500/30 text-amber-950'
                      }`}
                    >
                      {!s.isBackground && idx + 1}
                    </div>
                  ))}
                  {tpl.driveOverlayUrl && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-sky-500 text-sky-950 text-[8px] font-black">
                      DRIVE PNG
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300">
                    {tpl.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{slotCount} ô ảnh</span>
                    <span className="truncate max-w-[90px] text-amber-400/90">
                      {tpl.authorName || 'Photodate'}
                    </span>
                  </div>
                </div>

                {!tpl.isSystem && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTemplate(tpl, e)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                    title="Xóa mẫu này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. KHU VỰC THIẾT KẾ CHÍNH: BÊN TRÁI LÀ CANVAS TƯƠNG TÁC, BÊN PHẢI LÀ CÔNG CỤ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (7 CỘT): LIVE INTERACTIVE STORYBOARD CANVAS */}
        <div className="lg:col-span-7 bg-[#141720] border border-[#242938] rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242938] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-white">
                Bản Xem Trước Trực Tiếp (Bấm vào Ảnh hoặc Kéo-thả Chữ / Logo)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="bg-[#0c0d12] border border-[#2b3245] rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-semibold outline-none"
              >
                {Object.entries(ASPECT_RATIOS).map(([key, meta]) => (
                  <option key={key} value={key}>
                    Tỉ lệ {meta.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={exporting}
                onClick={handleDownloadImage}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20"
              >
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Tải Ảnh 2K (JPG)</span>
              </button>
            </div>
          </div>

          {/* KHUNG CANVAS CHÍNH */}
          <div className="flex items-center justify-center bg-[#090b10] rounded-2xl p-3 sm:p-6 border border-[#1e2330] overflow-hidden">
            <div
              ref={previewContainerRef}
              onPointerMove={handlePreviewPointerMove}
              onPointerUp={handlePreviewPointerUp}
              onPointerLeave={handlePreviewPointerUp}
              style={{ backgroundColor: background?.color || '#FAF8F5' }}
              className={`relative w-full max-w-[540px] ${
                ASPECT_RATIOS[aspectRatio]?.css || 'aspect-[3/4]'
              } shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden select-none`}
            >
              {/* Lớp 1: Ảnh nền tràn viền (isBackground: true) */}
              {photoSlots
                .filter((s) => s.isBackground)
                .map((bgSlot) => {
                  const bgImg = slotImages[bgSlot.id];
                  const isSlotSelected = selectedSlotId === bgSlot.id;
                  const mergedBgSlot = {
                    ...bgSlot,
                    grayscale: Boolean(bgSlot.grayscale || background?.grayscale)
                  };
                  return (
                    <div
                      key={bgSlot.id}
                      onClick={() => {
                        setSelectedSlotId(bgSlot.id);
                        setControlTab('photos');
                      }}
                      className={`absolute inset-0 cursor-pointer overflow-hidden ${
                        isSlotSelected ? 'ring-2 ring-inset ring-amber-400' : ''
                      }`}
                    >
                      {bgImg?.url && (
                        <img
                          src={getCanvasSafeImageUrl(bgImg.url, bgImg.fileId)}
                          alt="Background"
                          style={{
                            objectPosition: `${bgSlot.panX ?? 50}% ${bgSlot.panY ?? 50}%`,
                            transform: `scale(${bgSlot.zoom ?? 1})`,
                            filter: buildSlotCssFilter(mergedBgSlot, background?.blur || 0)
                          }}
                          className="w-full h-full object-cover transition-transform duration-150"
                        />
                      )}
                      {background?.overlayOpacity > 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ backgroundColor: `rgba(0,0,0,${background.overlayOpacity})` }}
                        />
                      )}
                    </div>
                  );
                })}

              {/* Lớp 2: Thẻ nền trang trí (Decor Cards như khung kem Mẫu 1 & Mẫu 3) */}
              {decorCards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    left: `${card.x}%`,
                    top: `${card.y}%`,
                    width: `${card.w}%`,
                    height: `${card.h}%`,
                    backgroundColor: card.bgColor || '#FAF8F4',
                    borderRadius: `${card.borderRadius || 0}px`
                  }}
                  className={`absolute pointer-events-none ${card.shadow ? 'shadow-2xl' : ''}`}
                />
              ))}

              {/* Lớp 3: Các Ô Ảnh Chính (Hỗ trợ Kéo-thả di chuyển, Kéo góc đổi kích thước, Xoay, Khung Polaroid & Bộ lọc màu) */}
              {photoSlots
                .filter((s) => !s.isBackground)
                .map((slot, idx) => {
                  const assigned = slotImages[slot.id];
                  const isSelected = selectedSlotId === slot.id;
                  const isPolaroid = slot.frameStyle === 'polaroid';
                  const borderW = Number(slot.borderWidth) || 0;
                  const padSide = isPolaroid ? Math.max(8, borderW) : borderW;
                  const padBottom = isPolaroid ? Math.max(24, borderW * 3) : borderW;
                  const shadowClass =
                    slot.shadow === 'deep' || isPolaroid
                      ? 'shadow-[0_14px_34px_rgba(0,0,0,0.45)]'
                      : slot.shadow === 'soft'
                      ? 'shadow-md'
                      : '';

                  return (
                    <div
                      key={slot.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setSelectedSlotId(slot.id);
                        setControlTab('photos');
                        setDraggingItem({
                          type: 'slot-move',
                          id: slot.id,
                          startClientX: e.clientX,
                          startClientY: e.clientY,
                          origX: Number(slot.x) || 0,
                          origY: Number(slot.y) || 0,
                          origW: Number(slot.w) || 40,
                          origH: Number(slot.h) || 40
                        });
                      }}
                      style={{
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        width: `${slot.w}%`,
                        height: `${slot.h}%`,
                        transform: slot.rotation ? `rotate(${slot.rotation}deg)` : undefined,
                        opacity: (Number(slot.opacity ?? 100)) / 100,
                        borderRadius: `${slot.borderRadius || 0}px`,
                        backgroundColor:
                          padSide > 0 || padBottom > 0 ? slot.borderColor || '#FFFFFF' : 'transparent',
                        paddingTop: `${padSide}px`,
                        paddingLeft: `${padSide}px`,
                        paddingRight: `${padSide}px`,
                        paddingBottom: `${padBottom}px`
                      }}
                      className={`absolute cursor-move transition-shadow group ${shadowClass} ${
                        isSelected
                          ? 'ring-2 ring-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.35)] z-20'
                          : 'hover:ring-1 hover:ring-amber-400/70 z-10'
                      }`}
                      title="Nhấn giữ chuột để kéo di chuyển Ô ảnh • Kéo góc phải-dưới để đổi kích thước"
                    >
                      <div
                        className="w-full h-full overflow-hidden relative"
                        style={{
                          borderRadius: `${Math.max(0, (Number(slot.borderRadius) || 0) - padSide * 0.5)}px`
                        }}
                      >
                        {assigned?.url ? (
                          <img
                            src={getCanvasSafeImageUrl(assigned.url, assigned.fileId)}
                            alt={slot.label || `Slot ${idx + 1}`}
                            style={{
                              objectPosition: `${slot.panX ?? 50}% ${slot.panY ?? 50}%`,
                              transform: `scale(${slot.zoom ?? 1})`,
                              filter: buildSlotCssFilter(slot)
                            }}
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-200 flex flex-col items-center justify-center text-zinc-500 text-[10px] p-1 text-center pointer-events-none">
                            <ImageIcon className="w-4 h-4 mb-0.5 opacity-60" />
                            <span>Ô #{idx + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* Nhãn hiển thị & Nút kéo chỉnh kích thước (Resize Handles) khi đang chọn Ô ảnh */}
                      {isSelected && (
                        <>
                          <div className="absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-amber-500 text-amber-950 font-black text-[9px] shadow-md flex items-center space-x-1 whitespace-nowrap pointer-events-none">
                            <Move className="w-2.5 h-2.5" />
                            <span>
                              {slot.label || `Ô #${idx + 1}`} ({Math.round(slot.w)}% × {Math.round(slot.h)}%)
                            </span>
                          </div>

                          {/* Nút kéo góc Dưới-Phải (Resize W & H) */}
                          <div
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDraggingItem({
                                type: 'slot-resize',
                                dir: 'se',
                                id: slot.id,
                                startClientX: e.clientX,
                                startClientY: e.clientY,
                                origX: Number(slot.x) || 0,
                                origY: Number(slot.y) || 0,
                                origW: Number(slot.w) || 40,
                                origH: Number(slot.h) || 40
                              });
                            }}
                            className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-950 shadow-lg cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                            title="Kéo góc này để phóng to / thu nhỏ Ô ảnh"
                          />

                          {/* Nút kéo cạnh Phải (Resize W) */}
                          <div
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDraggingItem({
                                type: 'slot-resize',
                                dir: 'e',
                                id: slot.id,
                                startClientX: e.clientX,
                                startClientY: e.clientY,
                                origX: Number(slot.x) || 0,
                                origY: Number(slot.y) || 0,
                                origW: Number(slot.w) || 40,
                                origH: Number(slot.h) || 40
                              });
                            }}
                            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-6 rounded-full bg-amber-400/90 border border-slate-950 shadow cursor-ew-resize z-30"
                            title="Kéo để chỉnh chiều rộng Ô ảnh"
                          />

                          {/* Nút kéo cạnh Dưới (Resize H) */}
                          <div
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDraggingItem({
                                type: 'slot-resize',
                                dir: 's',
                                id: slot.id,
                                startClientX: e.clientX,
                                startClientY: e.clientY,
                                origX: Number(slot.x) || 0,
                                origY: Number(slot.y) || 0,
                                origW: Number(slot.w) || 40,
                                origH: Number(slot.h) || 40
                              });
                            }}
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 rounded-full bg-amber-400/90 border border-slate-950 shadow cursor-ns-resize z-30"
                            title="Kéo để chỉnh chiều cao Ô ảnh"
                          />
                        </>
                      )}
                    </div>
                  );
                })}

              {/* Lớp 4: Khung PNG Overlay từ Google Drive (nếu có) */}
              {(driveOverlayUrl || driveFileId) && (
                <img
                  src={getCanvasSafeImageUrl(driveOverlayUrl, driveFileId)}
                  alt="Google Drive Frame Overlay"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20"
                />
              )}

              {/* Lớp 5: Các Lớp Chữ Tự Do (Kéo-thả trực tiếp trên Canvas) */}
              {textLayers.map((layer) => {
                const isSelected = selectedTextId === layer.id && controlTab === 'text';
                const translateX =
                  layer.align === 'right' ? '-100%' : layer.align === 'left' ? '0%' : '-50%';
                return (
                  <div
                    key={layer.id}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelectedTextId(layer.id);
                      setControlTab('text');
                      setDraggingItem({ type: 'text', id: layer.id });
                    }}
                    style={{
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      transform: `translate(${translateX}, 0)`,
                      fontFamily: `"${layer.fontFamily || 'Playfair Display'}", serif`,
                      fontSize: `${Math.max(8, (Number(layer.fontSize) || 20) * 0.82)}px`,
                      fontWeight: layer.fontWeight || '400',
                      fontStyle: layer.fontStyle || 'normal',
                      color: layer.color || '#222222',
                      textAlign: layer.align || 'center',
                      letterSpacing: `${layer.letterSpacing || 0}px`,
                      lineHeight: 1.35,
                      whiteSpace: 'pre-line'
                    }}
                    className={`absolute z-30 cursor-move px-1 py-0.5 rounded transition-shadow ${
                      isSelected ? 'ring-1 ring-dashed ring-amber-500 bg-amber-500/5' : 'hover:ring-1 hover:ring-white/40'
                    }`}
                    title="Nhấn giữ chuột để kéo chữ tới vị trí bất kỳ"
                  >
                    {layer.text}
                  </div>
                );
              })}

              {/* Lớp 6: Logo Studio Brand Kit (Kéo-thả trực tiếp trên Canvas) */}
              {logoConfig.visible && (
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setControlTab('brand');
                    setDraggingItem({ type: 'logo' });
                  }}
                  style={{
                    left: `${logoConfig.x}%`,
                    top: `${logoConfig.y}%`,
                    transform: `translate(-50%, -50%) scale(${logoConfig.scale || 1})`,
                    color:
                      logoConfig.colorMode === 'white'
                        ? '#FFFFFF'
                        : logoConfig.colorMode === 'gold'
                        ? '#D4AF37'
                        : '#161616'
                  }}
                  className="absolute z-30 cursor-move flex flex-col items-center text-center px-2 py-1 rounded hover:ring-1 hover:ring-amber-400/60"
                  title="Nhấn giữ chuột để di chuyển vị trí Logo Studio"
                >
                  {logoConfig.logoDataUrl ? (
                    <img
                      src={logoConfig.logoDataUrl}
                      alt="Studio Logo"
                      style={{
                        filter:
                          logoConfig.colorMode === 'white'
                            ? 'brightness(0) invert(1)'
                            : logoConfig.colorMode === 'black'
                            ? 'brightness(0)'
                            : 'none'
                      }}
                      className="h-9 w-auto object-contain mb-0.5 pointer-events-none"
                    />
                  ) : (
                    /* Biểu tượng Monogram Kiến Trúc mặc định phong cách TAM LE MEDIA */
                    <svg
                      viewBox="0 0 60 60"
                      className="w-8 h-8 mb-0.5 stroke-current fill-none"
                      strokeWidth="5.5"
                      strokeLinecap="square"
                    >
                      <path d="M12 20 L30 8 L48 20" />
                      <path d="M20 18 L20 48 L34 40" />
                      <path d="M40 20 L40 44" />
                    </svg>
                  )}
                  <span className="text-[9px] font-extrabold tracking-[0.18em] uppercase leading-tight">
                    {logoConfig.studioText || 'TAM LE MEDIA'}
                  </span>
                  {logoConfig.subtitle && (
                    <span className="text-[7.5px] font-medium tracking-wider opacity-90 leading-tight">
                      {logoConfig.subtitle}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hộp Caption & Hashtag Đăng Mạng Xã Hội Tự Động */}
          <div className="bg-[#0c0d12] border border-[#242938] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>Caption Đăng Facebook / Instagram / Threads Kèm Link Đặt Lịch Studio:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(socialCaption);
                  setCopiedCaption(true);
                  setTimeout(() => setCopiedCaption(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Đã Copy Caption!' : 'Copy Caption'}</span>
              </button>
            </div>
            <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-sans bg-[#141720] p-2.5 rounded-xl border border-[#242938]">
              {socialCaption}
            </pre>
          </div>
        </div>

        {/* CỘT PHẢI (5 CỘT): BẢNG CÔNG CỤ TÙY CHỈNH CHI TIẾT */}
        <div className="lg:col-span-5 bg-[#141720] border border-[#242938] rounded-3xl p-4 sm:p-5 space-y-5 shadow-2xl">
          {/* Sub-navigation Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-[#0c0d12] p-1.5 rounded-2xl border border-[#242938]">
            {[
              { id: 'photos', label: 'Ảnh & Khung', icon: ImageIcon },
              { id: 'text', label: 'Chữ & Quote', icon: Type },
              { id: 'brand', label: 'Logo Studio', icon: Award },
              { id: 'layout', label: 'Nền & Drive', icon: Sliders }
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setControlTab(t.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    controlTab === t.id
                      ? 'bg-amber-500 text-amber-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CHỌN ẢNH, DI CHUYỂN BỐ CỤC Ô ẢNH & BỘ LỌC HIỆU ỨNG NGHỆ THUẬT */}
          {controlTab === 'photos' && (
            <div className="space-y-4 animate-fade-in">
              {/* Chọn Ô Ảnh Đang Chỉnh */}
              <div className="p-3.5 bg-[#0c0d12] rounded-2xl border border-[#242938] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Ô Ảnh Đang Chọn ({photoSlots.length} ô):
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleAddPhotoSlot}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Thêm Ô Ảnh</span>
                    </button>
                    {selectedSlotObj && !selectedSlotObj.isBackground && (
                      <button
                        type="button"
                        onClick={handleDuplicateSelectedSlot}
                        className="px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                        title="Nhân bản ô ảnh này"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Nhân bản</span>
                      </button>
                    )}
                    {photoSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelectedSlot}
                        className="p-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 cursor-pointer"
                        title="Xóa ô ảnh này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Danh sách nút chọn nhanh từng Slot */}
                <div className="flex flex-wrap gap-1.5">
                  {photoSlots.map((slot, idx) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedSlotId === slot.id
                          ? 'bg-amber-500 text-amber-950 font-bold shadow'
                          : 'bg-[#141720] text-gray-300 border border-[#282f42] hover:border-amber-500/40'
                      }`}
                    >
                      {slot.isBackground ? '🖼️ Ảnh Nền' : `Ô #${idx + 1}`}
                    </button>
                  ))}
                </div>

                {selectedSlotObj && (
                  <div className="pt-2.5 border-t border-[#1e2330] space-y-3.5 text-xs">
                    {/* 1. DI CHUYỂN VỊ TRÍ, ĐỔI KÍCH THƯỚC, XOAY & SẮP XẾP LỚP Ô ẢNH */}
                    {!selectedSlotObj.isBackground && (
                      <div className="p-3 rounded-xl bg-[#141720] border border-[#242938] space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-bold text-amber-300 flex items-center space-x-1 text-[11px]">
                            <Move className="w-3.5 h-3.5" />
                            <span>Vị Trí, Kích Thước & Xoay Khung (Hoặc Kéo Trực Tiếp Trên Ảnh)</span>
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateSelectedSlot({
                                  x: Number((50 - (selectedSlotObj.w || 40) / 2).toFixed(1))
                                })
                              }
                              className="px-2 py-0.5 rounded bg-[#0c0d12] hover:bg-amber-500/20 border border-[#2b3245] text-[10px] text-gray-300 cursor-pointer"
                              title="Căn giữa theo chiều ngang"
                            >
                              Căn giữa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSlotLayer('up')}
                              className="px-2 py-0.5 rounded bg-[#0c0d12] hover:bg-amber-500/20 border border-[#2b3245] text-[10px] text-gray-300 cursor-pointer"
                              title="Đưa ô ảnh này lên lớp trên"
                            >
                              ▲ Lên trên
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSlotLayer('down')}
                              className="px-2 py-0.5 rounded bg-[#0c0d12] hover:bg-amber-500/20 border border-[#2b3245] text-[10px] text-gray-300 cursor-pointer"
                              title="Đẩy ô ảnh này xuống lớp dưới"
                            >
                              ▼ Xuống dưới
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                              <span>Vị trí Ngang (X)</span>
                              <span className="text-amber-300">{Math.round(selectedSlotObj.x ?? 15)}%</span>
                            </label>
                            <input
                              type="range"
                              min="-10"
                              max="90"
                              step="0.5"
                              value={selectedSlotObj.x ?? 15}
                              onChange={(e) => updateSelectedSlot({ x: Number(e.target.value) })}
                              className="w-full accent-amber-500"
                            />
                          </div>
                          <div>
                            <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                              <span>Vị trí Dọc (Y)</span>
                              <span className="text-amber-300">{Math.round(selectedSlotObj.y ?? 15)}%</span>
                            </label>
                            <input
                              type="range"
                              min="-10"
                              max="90"
                              step="0.5"
                              value={selectedSlotObj.y ?? 15}
                              onChange={(e) => updateSelectedSlot({ y: Number(e.target.value) })}
                              className="w-full accent-amber-500"
                            />
                          </div>
                          <div>
                            <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                              <span>Chiều Rộng (W)</span>
                              <span className="text-amber-300">{Math.round(selectedSlotObj.w ?? 40)}%</span>
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="0.5"
                              value={selectedSlotObj.w ?? 40}
                              onChange={(e) => updateSelectedSlot({ w: Number(e.target.value) })}
                              className="w-full accent-amber-500"
                            />
                          </div>
                          <div>
                            <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                              <span>Chiều Cao (H)</span>
                              <span className="text-amber-300">{Math.round(selectedSlotObj.h ?? 40)}%</span>
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="0.5"
                              value={selectedSlotObj.h ?? 40}
                              onChange={(e) => updateSelectedSlot({ h: Number(e.target.value) })}
                              className="w-full accent-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                              <span>Góc xoay nghiêng (Polaroid)</span>
                              <span className="text-amber-300">{selectedSlotObj.rotation || 0}°</span>
                            </label>
                            <input
                              type="range"
                              min="-25"
                              max="25"
                              step="1"
                              value={selectedSlotObj.rotation || 0}
                              onChange={(e) => updateSelectedSlot({ rotation: Number(e.target.value) })}
                              className="w-full accent-amber-500"
                            />
                          </div>
                          <div>
                            <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                              <span>Độ trong suốt (Opacity)</span>
                              <span className="text-amber-300">{selectedSlotObj.opacity ?? 100}%</span>
                            </label>
                            <input
                              type="range"
                              min="20"
                              max="100"
                              step="5"
                              value={selectedSlotObj.opacity ?? 100}
                              onChange={(e) => updateSelectedSlot({ opacity: Number(e.target.value) })}
                              className="w-full accent-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. BỘ LỌC MÀU & HIỆU ỨNG ẢNH NGHỆ THUẬT (8 PRESETS + CHỈNH MÀU CHI TIẾT) */}
                    <div className="p-3 rounded-xl bg-[#141720] border border-[#242938] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 flex items-center space-x-1 text-[11px]">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Hiệu Ứng Màu Ảnh & Bộ Lọc Film Nghệ Thuật:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSelectedSlot(PHOTO_FILTER_PRESETS[0].patch)}
                          className="text-[10px] text-gray-400 hover:text-amber-300 underline cursor-pointer"
                        >
                          Reset màu gốc
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {PHOTO_FILTER_PRESETS.map((preset) => {
                          const isPresetActive =
                            (selectedSlotObj.filterPreset || (selectedSlotObj.grayscale ? 'bw_classic' : 'original')) ===
                            preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => updateSelectedSlot(preset.patch)}
                              className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                                isPresetActive
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                                  : 'bg-[#0c0d12] border-[#242938] text-gray-300 hover:border-amber-500/40'
                              }`}
                            >
                              <div className="text-[11px] font-bold truncate">{preset.label}</div>
                              <div className="text-[9px] text-gray-400 truncate">{preset.desc}</div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Thanh trượt chỉnh hiệu ứng màu chuyên sâu */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                            <span>Độ sáng (Brightness)</span>
                            <span className="text-amber-300">{selectedSlotObj.brightness ?? 100}%</span>
                          </label>
                          <input
                            type="range"
                            min="60"
                            max="145"
                            value={selectedSlotObj.brightness ?? 100}
                            onChange={(e) =>
                              updateSelectedSlot({
                                brightness: Number(e.target.value),
                                filterPreset: 'custom'
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                            <span>Tương phản (Contrast)</span>
                            <span className="text-amber-300">{selectedSlotObj.contrast ?? 100}%</span>
                          </label>
                          <input
                            type="range"
                            min="65"
                            max="155"
                            value={selectedSlotObj.contrast ?? 100}
                            onChange={(e) =>
                              updateSelectedSlot({
                                contrast: Number(e.target.value),
                                filterPreset: 'custom'
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                            <span>Độ tươi màu (Saturate)</span>
                            <span className="text-amber-300">{selectedSlotObj.saturate ?? 100}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="180"
                            value={selectedSlotObj.saturate ?? 100}
                            onChange={(e) =>
                              updateSelectedSlot({
                                saturate: Number(e.target.value),
                                grayscale: Number(e.target.value) === 0,
                                filterPreset: 'custom'
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                            <span>Màu Phim Ấm (Sepia)</span>
                            <span className="text-amber-300">{selectedSlotObj.sepia ?? 0}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            value={selectedSlotObj.sepia ?? 0}
                            onChange={(e) =>
                              updateSelectedSlot({
                                sepia: Number(e.target.value),
                                filterPreset: 'custom'
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. KIỂU KHUNG VIỀN, POLAROID, BO GÓC & ĐỔ BÓNG 3D */}
                    {!selectedSlotObj.isBackground && (
                      <div className="p-3 rounded-xl bg-[#141720] border border-[#242938] space-y-2.5">
                        <span className="font-bold text-amber-300 block text-[11px]">
                          🖼️ Kiểu Khung Viền, Polaroid & Bóng Đổ 3D:
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {SLOT_FRAME_STYLES.map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => updateSelectedSlot(st.patch)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                (selectedSlotObj.frameStyle || 'none') === st.id
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                  : 'bg-[#0c0d12] border-[#242938] text-gray-400 hover:text-white'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 items-center">
                          <div>
                            <label className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                              <span>Độ dày viền</span>
                              <span className="text-amber-300">{selectedSlotObj.borderWidth || 0}px</span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="16"
                              value={selectedSlotObj.borderWidth || 0}
                              onChange={(e) =>
                                updateSelectedSlot({ borderWidth: Number(e.target.value) })
                              }
                              className="w-full accent-amber-500"
                            />
                          </div>
                          <div>
                            <label className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                              <span>Bo tròn góc</span>
                              <span className="text-amber-300">{selectedSlotObj.borderRadius || 0}px</span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="40"
                              value={selectedSlotObj.borderRadius || 0}
                              onChange={(e) =>
                                updateSelectedSlot({ borderRadius: Number(e.target.value) })
                              }
                              className="w-full accent-amber-500"
                            />
                          </div>
                          <div className="flex items-center space-x-1.5 pt-2">
                            <input
                              type="color"
                              value={selectedSlotObj.borderColor || '#FFFFFF'}
                              onChange={(e) => updateSelectedSlot({ borderColor: e.target.value })}
                              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                              title="Chọn màu viền khung ảnh"
                            />
                            <select
                              value={selectedSlotObj.shadow || 'none'}
                              onChange={(e) => updateSelectedSlot({ shadow: e.target.value })}
                              className="flex-1 bg-[#0c0d12] border border-[#282f42] rounded-lg px-1.5 py-1 text-[10px] text-gray-200 outline-none"
                            >
                              <option value="none">Không bóng</option>
                              <option value="soft">Bóng nhẹ</option>
                              <option value="deep">Bóng 3D sâu</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. CĂN CHỈNH GÓC CẮT BÊN TRONG KHUNG (PAN X / PAN Y / ZOOM) */}
                    <div className="p-3 rounded-xl bg-[#141720] border border-[#242938] space-y-2">
                      <span className="font-bold text-gray-300 block text-[11px]">
                        🔍 Căn Chỉnh Góc Cắt Ảnh Bên Trong Ô (Pan & Zoom):
                      </span>
                      <div className="grid grid-cols-3 gap-2.5">
                        <div>
                          <label className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                            <span>Tâm Ngang</span>
                            <span className="text-amber-300">{selectedSlotObj.panX ?? 50}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={selectedSlotObj.panX ?? 50}
                            onChange={(e) => updateSelectedSlot({ panX: Number(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                            <span>Tâm Dọc</span>
                            <span className="text-amber-300">{selectedSlotObj.panY ?? 50}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={selectedSlotObj.panY ?? 50}
                            onChange={(e) => updateSelectedSlot({ panY: Number(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <label className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                            <span>Zoom Ảnh</span>
                            <span className="text-amber-300">
                              {Number(selectedSlotObj.zoom ?? 1).toFixed(2)}x
                            </span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="2.5"
                            step="0.05"
                            value={selectedSlotObj.zoom ?? 1}
                            onChange={(e) => updateSelectedSlot({ zoom: Number(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nguồn lấy ảnh: Album Google Drive hoặc Upload từ máy */}
              <div className="p-3.5 bg-[#0c0d12] rounded-2xl border border-[#242938] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <FolderOpen className="w-4 h-4 text-amber-400" />
                    <span>Lấy Ảnh Từ Album Google Drive Hoặc Máy Tính</span>
                  </span>

                  <label className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3 h-3" />
                    <span>Tải Ảnh Từ Máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleLocalPhotosUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Dropdown chọn Album Google Drive của Studio */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={selectedAlbumId}
                    onChange={(e) => setSelectedAlbumId(e.target.value)}
                    className="sm:col-span-2 bg-[#141720] border border-[#282f42] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">-- Ảnh mẫu Cưới & Ảnh tải từ máy --</option>
                    {albums.map((a) => (
                      <option key={a._id} value={a._id}>
                        📁 {a.title} ({a.images?.length || 0} ảnh • Đã chọn: {a.selectedImages?.length || 0})
                      </option>
                    ))}
                  </select>

                  <select
                    value={albumPhotoMode}
                    onChange={(e) => setAlbumPhotoMode(e.target.value)}
                    disabled={!selectedAlbumId}
                    className="bg-[#141720] border border-[#282f42] rounded-xl px-2.5 py-2 text-xs text-amber-300 font-semibold outline-none disabled:opacity-40"
                  >
                    <option value="all">Tất cả ảnh</option>
                    <option value="selected">❤️ Khách đã chọn</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleAutoFillFromSource(activeSourcePhotos)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-400/15 hover:from-amber-500/30 hover:to-amber-400/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>✨ Tự Động Lấp Đầy Tất Cả Các Ô Bằng Danh Sách Ảnh Dưới Đây</span>
                </button>

                {/* Lưới ảnh để bấm gán vào ô đang chọn */}
                {loadingAlbumPhotos ? (
                  <div className="py-8 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Đang tải ảnh từ Album Google Drive...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                    {activeSourcePhotos.map((img, i) => (
                      <button
                        key={img.fileId || img.url || i}
                        type="button"
                        onClick={() => {
                          if (!selectedSlotId) return;
                          setSlotImages((prev) => ({
                            ...prev,
                            [selectedSlotId]: img
                          }));
                        }}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-[#282f42] hover:border-amber-400 transition-all"
                        title="Bấm để đưa ảnh này vào ô đang chọn"
                      >
                        <img
                          src={getCanvasSafeImageUrl(img.url, img.fileId)}
                          alt={img.fileName || `Thumb ${i}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {img.isSelectedByClient && (
                          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-amber-950 flex items-center justify-center shadow">
                            <Heart className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TỰ DO THÊM CHỮ, ĐỔI FONT & KHO QUOTE TẠP CHÍ */}
          {controlTab === 'text' && (
            <div className="space-y-4 animate-fade-in">
              {/* Kho Quote gợi ý 1 chạm */}
              <div className="p-3.5 bg-[#0c0d12] rounded-2xl border border-[#242938] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    ✨ Kho Quote & Định Nghĩa Cảm Xúc Mẫu (1-Click):
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {EDITORIAL_QUOTES.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleApplyQuotePreset(q)}
                      className="p-2 rounded-xl bg-[#141720] hover:bg-[#1d2230] border border-[#242938] hover:border-amber-500/40 text-left transition-all"
                    >
                      <div className="text-xs font-bold text-white truncate">{q.label}</div>
                      <div className="text-[10px] text-gray-400 truncate">{q.body}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quản lý các lớp chữ trên Canvas */}
              <div className="p-3.5 bg-[#0c0d12] rounded-2xl border border-[#242938] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Các Lớp Chữ Trên Ảnh ({textLayers.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddTextLayer}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-amber-950 text-xs font-black flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Chữ Mới</span>
                  </button>
                </div>

                {textLayers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {textLayers.map((t, idx) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTextId(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold truncate max-w-[140px] ${
                          selectedTextId === t.id
                            ? 'bg-amber-500 text-amber-950 font-bold'
                            : 'bg-[#141720] text-gray-300 border border-[#282f42]'
                        }`}
                      >
                        {t.text || `Chữ #${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                {selectedTextObj ? (
                  <div className="space-y-3 pt-2 border-t border-[#1e2330] text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-gray-400 font-semibold">Nội dung chữ (Hỗ trợ xuống dòng):</label>
                        <button
                          type="button"
                          onClick={handleDeleteSelectedText}
                          className="text-red-400 hover:text-red-300 flex items-center space-x-1 text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa chữ này</span>
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={selectedTextObj.text}
                        onChange={(e) => updateSelectedText({ text: e.target.value })}
                        className="w-full bg-[#141720] border border-[#282f42] focus:border-amber-500 rounded-xl p-2.5 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Font chữ Nghệ thuật</label>
                        <select
                          value={selectedTextObj.fontFamily}
                          onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
                          className="w-full bg-[#141720] border border-[#282f42] rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                        >
                          {FONT_OPTIONS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">
                          Cỡ chữ ({selectedTextObj.fontSize}px)
                        </label>
                        <input
                          type="range"
                          min="9"
                          max="64"
                          value={selectedTextObj.fontSize || 20}
                          onChange={(e) => updateSelectedText({ fontSize: Number(e.target.value) })}
                          className="w-full accent-amber-500 mt-1.5"
                        />
                      </div>
                    </div>

                    {/* Màu sắc chữ & Căn lề */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={selectedTextObj.color || '#222222'}
                          onChange={(e) => updateSelectedText({ color: e.target.value })}
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                        />
                        {[
                          { c: '#6B1D1D', label: 'Đỏ rượu Love' },
                          { c: '#1E1E1E', label: 'Đen' },
                          { c: '#FFFFFF', label: 'Trắng' },
                          { c: '#D4AF37', label: 'Vàng Gold' },
                          { c: '#4A433E', label: 'Nâu trầm' }
                        ].map((sw) => (
                          <button
                            key={sw.c}
                            type="button"
                            onClick={() => updateSelectedText({ color: sw.c })}
                            style={{ backgroundColor: sw.c }}
                            className="w-5 h-5 rounded-full border border-white/30"
                            title={sw.label}
                          />
                        ))}
                      </div>

                      <div className="flex items-center space-x-1 bg-[#141720] p-1 rounded-xl border border-[#242938]">
                        {['left', 'center', 'right'].map((al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() => updateSelectedText({ align: al })}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              selectedTextObj.align === al
                                ? 'bg-amber-500 text-amber-950'
                                : 'text-gray-400'
                            }`}
                          >
                            {al === 'left' ? 'Trái' : al === 'center' ? 'Giữa' : 'Phải'}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedText({
                              fontStyle: selectedTextObj.fontStyle === 'italic' ? 'normal' : 'italic'
                            })
                          }
                          className={`px-2 py-1 rounded text-[10px] italic font-serif ${
                            selectedTextObj.fontStyle === 'italic'
                              ? 'bg-amber-500 text-amber-950 font-bold'
                              : 'text-gray-400'
                          }`}
                        >
                          I
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic py-4 text-center">
                    Mẫu này đang để trống chữ. Hãy bấm "+ Thêm Chữ Mới" hoặc chọn 1 Quote ở trên!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STUDIO BRAND KIT (LOGO PNG + ĐẢO MÀU TRẮNG/ĐEN/VÀNG) */}
          {controlTab === 'brand' && (
            <div className="p-4 bg-[#0c0d12] rounded-2xl border border-[#242938] space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 uppercase tracking-wider">
                  Bộ Nhận Diện Thương Hiệu Studio (Brand Kit)
                </span>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(logoConfig.visible)}
                    onChange={(e) => setLogoConfig((p) => ({ ...p, visible: e.target.checked }))}
                    className="rounded accent-amber-500"
                  />
                  <span className="text-white font-semibold">Hiển thị Logo</span>
                </label>
              </div>

              {/* Upload Logo PNG tách nền */}
              <div className="flex items-center justify-between p-3 bg-[#141720] rounded-xl border border-[#282f42]">
                <div>
                  <div className="font-bold text-white">Logo PNG Tách Nền Của Studio</div>
                  <div className="text-[11px] text-gray-400">
                    {logoConfig.logoDataUrl
                      ? 'Đã tải lên Logo riêng của bạn'
                      : 'Đang dùng biểu tượng Monogram mặc định'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold cursor-pointer">
                    <span>Tải Logo PNG</span>
                    <input
                      type="file"
                      accept="image/png,image/webp,image/svg+xml,image/jpeg"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  {logoConfig.logoDataUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoConfig((p) => ({ ...p, logoDataUrl: '' }))}
                      className="p-1.5 rounded-xl bg-red-500/20 text-red-300"
                      title="Khôi phục biểu tượng mặc định"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Chuyển màu Logo tự động (Trắng / Đen / Vàng Gold / Gốc) */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-semibold">
                  Đổi màu Logo & Chữ ký theo nền ảnh:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'white', label: '⚪ Trắng (Nền tối)' },
                    { id: 'black', label: '⚫ Đen (Nền sáng)' },
                    { id: 'gold', label: '🟡 Vàng Gold' },
                    { id: 'original', label: '🎨 Giữ màu gốc' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setLogoConfig((p) => ({ ...p, colorMode: m.id }))}
                      className={`py-2 px-2 rounded-xl font-bold text-[11px] border transition-all ${
                        logoConfig.colorMode === m.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-[#141720] border-[#242938] text-gray-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Tên Thương Hiệu Studio</label>
                  <input
                    type="text"
                    value={logoConfig.studioText}
                    onChange={(e) => setLogoConfig((p) => ({ ...p, studioText: e.target.value }))}
                    placeholder="VD: TAM LE MEDIA"
                    className="w-full bg-[#141720] border border-[#282f42] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Dòng chữ phụ dưới Logo</label>
                  <input
                    type="text"
                    value={logoConfig.subtitle}
                    onChange={(e) => setLogoConfig((p) => ({ ...p, subtitle: e.target.value }))}
                    placeholder="VD: Present / Photography"
                    className="w-full bg-[#141720] border border-[#282f42] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex justify-between text-gray-400 mb-1">
                  <span>Kích thước Logo</span>
                  <span className="text-amber-300">{Math.round((logoConfig.scale || 1) * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={logoConfig.scale || 1}
                  onChange={(e) => setLogoConfig((p) => ({ ...p, scale: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: TÙY CHỈNH NỀN & GẮN KHUNG PNG GOOGLE DRIVE */}
          {controlTab === 'layout' && (
            <div className="p-4 bg-[#0c0d12] rounded-2xl border border-[#242938] space-y-4 animate-fade-in text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-amber-400 uppercase tracking-wider">
                  Màu Nền Khung Giấy (Gallery Background):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={background?.color || '#FAF8F5'}
                    onChange={(e) => setBackground((p) => ({ ...p, color: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  {[
                    { c: '#FFFFFF', label: 'Trắng Tinh (Mẫu 2)' },
                    { c: '#FAF8F4', label: 'Kem Tạp Chí (Mẫu 1 & 3)' },
                    { c: '#F3EFE6', label: 'Giấy Mỹ Thuật Cổ Điển' },
                    { c: '#141416', label: 'Đen Điện Ảnh (Cinema)' }
                  ].map((bg) => (
                    <button
                      key={bg.c}
                      type="button"
                      onClick={() => setBackground((p) => ({ ...p, color: bg.c }))}
                      className="px-2.5 py-1.5 rounded-xl bg-[#141720] border border-[#282f42] text-[11px] text-gray-200 hover:border-amber-400 flex items-center space-x-1.5"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: bg.c }}
                      />
                      <span>{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nếu có ảnh nền (như Mẫu 1 & Mẫu 4): Chỉnh độ tối & làm mờ ảnh nền */}
              {photoSlots.some((s) => s.isBackground) && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1e2330]">
                  <div>
                    <label className="flex justify-between text-gray-400 mb-1">
                      <span>Độ phủ tối ảnh nền</span>
                      <span className="text-amber-300">
                        {Math.round((background?.overlayOpacity || 0) * 100)}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="0.75"
                      step="0.05"
                      value={background?.overlayOpacity || 0}
                      onChange={(e) =>
                        setBackground((p) => ({ ...p, overlayOpacity: Number(e.target.value) }))
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-gray-400 mb-1">
                      <span>Làm mờ ảnh nền (Blur)</span>
                      <span className="text-amber-300">{background?.blur || 0}px</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={background?.blur || 0}
                      onChange={(e) =>
                        setBackground((p) => ({ ...p, blur: Number(e.target.value) }))
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Quản lý Thẻ nền trang trí (Decor Cards như khung kem giữa trang ở Mẫu 1 & Mẫu 3) */}
              <div className="pt-3 border-t border-[#1e2330] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">
                    🃏 Khung Giấy Nền Trang Trí ({decorCards.length} thẻ):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddDecorCard}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold cursor-pointer"
                  >
                    + Thêm Khung Giấy Nền
                  </button>
                </div>

                {decorCards.map((card, cIdx) => (
                  <div
                    key={card.id || cIdx}
                    className="p-2.5 rounded-xl bg-[#141720] border border-[#242938] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-200 text-[11px]">
                        Thẻ nền #{cIdx + 1} ({Math.round(card.w)}% × {Math.round(card.h)}%)
                      </span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={card.bgColor || '#FAF8F4'}
                          onChange={(e) =>
                            setDecorCards((prev) =>
                              prev.map((c, i) =>
                                i === cIdx ? { ...c, bgColor: e.target.value } : c
                              )
                            )
                          }
                          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                          title="Màu thẻ nền"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDecorCard(card.id)}
                          className="text-red-400 hover:text-red-300 text-[10px] font-bold cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                      <div>
                        <span className="text-gray-400 block">X ({card.x}%)</span>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={card.x}
                          onChange={(e) =>
                            setDecorCards((prev) =>
                              prev.map((c, i) =>
                                i === cIdx ? { ...c, x: Number(e.target.value) } : c
                              )
                            )
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div>
                        <span className="text-gray-400 block">Y ({card.y}%)</span>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={card.y}
                          onChange={(e) =>
                            setDecorCards((prev) =>
                              prev.map((c, i) =>
                                i === cIdx ? { ...c, y: Number(e.target.value) } : c
                              )
                            )
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div>
                        <span className="text-gray-400 block">Rộng ({card.w}%)</span>
                        <input
                          type="range"
                          min="15"
                          max="100"
                          value={card.w}
                          onChange={(e) =>
                            setDecorCards((prev) =>
                              prev.map((c, i) =>
                                i === cIdx ? { ...c, w: Number(e.target.value) } : c
                              )
                            )
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div>
                        <span className="text-gray-400 block">Cao ({card.h}%)</span>
                        <input
                          type="range"
                          min="15"
                          max="100"
                          value={card.h}
                          onChange={(e) =>
                            setDecorCards((prev) =>
                              prev.map((c, i) =>
                                i === cIdx ? { ...c, h: Number(e.target.value) } : c
                              )
                            )
                          }
                          className="w-full accent-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dán trực tiếp Link File Khung PNG trên Google Drive làm lớp phủ */}
              <div className="pt-3 border-t border-[#1e2330] space-y-2">
                <label className="block font-bold text-sky-400">
                  ☁️ Gắn Link Khung PNG Trong Suốt Từ Google Drive (Tùy chọn):
                </label>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Nếu bạn có sẵn file khung PNG thiết kế trên Photoshop/Canva lưu trên Google Drive, dán link file vào đây để đắp lên lớp trên cùng mà không tốn bộ nhớ web:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={driveOverlayUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDriveOverlayUrl(val);
                      const m = val.match(/\/d\/([a-zA-Z0-9_-]+)/) || val.match(/id=([a-zA-Z0-9_-]+)/);
                      if (m && m[1]) setDriveFileId(m[1]);
                    }}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="flex-1 bg-[#141720] border border-[#282f42] rounded-xl px-3 py-2 text-white outline-none"
                  />
                  {driveOverlayUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setDriveOverlayUrl('');
                        setDriveFileId('');
                      }}
                      className="px-3 py-2 rounded-xl bg-red-500/20 text-red-300 font-bold"
                    >
                      Gỡ
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: LƯU THÀNH TEMPLATE MỚI (CHIA SẺ CỘNG ĐỒNG HOẶC CÁ NHÂN) */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#141720] border border-[#282f42] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242938] pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BookmarkPlus className="w-5 h-5 text-amber-400" />
                <span>Lưu Bố Cục Thành Template Mới</span>
              </h3>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTemplate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Tên Mẫu Template *</label>
                <input
                  type="text"
                  required
                  value={saveTplForm.title}
                  onChange={(e) => setSaveTplForm({ ...saveTplForm, title: e.target.value })}
                  placeholder="VD: Wedding Magazine - Tam Le Media"
                  className="w-full bg-[#0c0d12] border border-[#282f42] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Mô tả ngắn</label>
                <input
                  type="text"
                  value={saveTplForm.subtitle}
                  onChange={(e) => setSaveTplForm({ ...saveTplForm, subtitle: e.target.value })}
                  placeholder="VD: Bố cục 4 ảnh kèm quote tiếng Anh nhẹ nhàng"
                  className="w-full bg-[#0c0d12] border border-[#282f42] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Link Khung PNG trên Google Drive (Nếu có)</label>
                <input
                  type="text"
                  value={saveTplForm.driveOverlayUrl}
                  onChange={(e) => setSaveTplForm({ ...saveTplForm, driveOverlayUrl: e.target.value })}
                  placeholder="Dán link file PNG trên Google Drive (Tùy chọn)"
                  className="w-full bg-[#0c0d12] border border-[#282f42] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <label className="flex items-start space-x-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveTplForm.isPublic}
                  onChange={(e) => setSaveTplForm({ ...saveTplForm, isPublic: e.target.checked })}
                  className="mt-0.5 rounded accent-amber-500"
                />
                <div>
                  <div className="font-bold text-amber-300">Chia sẻ lên Kho Template Cộng Đồng</div>
                  <div className="text-[11px] text-gray-400">
                    Các Nhiếp ảnh gia khác có thể sử dụng mẫu bố cục này và ghi nhận tên Studio của bạn là tác giả sáng tạo.
                  </div>
                </div>
              </label>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0c0d12] text-gray-400 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingTpl}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black flex items-center space-x-1.5"
                >
                  {savingTpl && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Lưu Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NHẬP KHO KHUNG PNG TEMPLATE TỪ THƯ MỤC GOOGLE DRIVE */}
      {isImportDriveOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#141720] border border-[#282f42] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242938] pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CloudDownload className="w-5 h-5 text-sky-400" />
                <span>☁️ Đồng Bộ Template Từ Thư Mục Google Drive</span>
              </h3>
              <button onClick={() => setIsImportDriveOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportDriveTemplates} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-200 space-y-1 leading-relaxed">
                <div className="font-bold text-sky-300">💡 Giải pháp lưu trữ Template siêu nhẹ trên Google Drive:</div>
                <p>
                  Bạn chỉ cần tải các file Khung ảnh PNG trong suốt (thiết kế sẵn chữ, viền film, tạp chí) lên 1 thư mục Google Drive (chế độ Công khai) rồi dán link vào dưới đây. Hệ thống sẽ tự động quét và nạp toàn bộ thành Template mà không làm nặng ứng dụng!
                </p>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Đường dẫn Thư mục (hoặc File) Google Drive chứa Template *
                </label>
                <input
                  type="url"
                  required
                  value={importDriveForm.driveUrl}
                  onChange={(e) => setImportDriveForm({ ...importDriveForm, driveUrl: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-[#0c0d12] border border-[#282f42] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tiền tố tên bộ Template</label>
                  <input
                    type="text"
                    value={importDriveForm.titlePrefix}
                    onChange={(e) => setImportDriveForm({ ...importDriveForm, titlePrefix: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-[#282f42] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Chủ đề</label>
                  <select
                    value={importDriveForm.category}
                    onChange={(e) => setImportDriveForm({ ...importDriveForm, category: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-[#282f42] rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Pre-Wedding & Cưới">Pre-Wedding & Cưới</option>
                    <option value="Chân Dung & Lookbook">Chân Dung & Lookbook</option>
                    <option value="Kỷ Yếu & Phóng Sự">Kỷ Yếu & Phóng Sự</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importDriveForm.isPublic}
                  onChange={(e) => setImportDriveForm({ ...importDriveForm, isPublic: e.target.checked })}
                  className="rounded accent-sky-500"
                />
                <span className="text-gray-300 font-medium">
                  Chia sẻ bộ Template này lên Kho Cộng Đồng cho các Nhiếp ảnh gia khác cùng sử dụng
                </span>
              </label>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportDriveOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0c0d12] text-gray-400 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={importingDrive}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-sky-950 font-black flex items-center space-x-1.5"
                >
                  {importingDrive ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                  <span>Quét & Nhập Từ Google Drive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioTemplateDesigner;

