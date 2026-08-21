import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Award, ShieldCheck, Phone, Mail, Calendar, 
  Share2, ArrowLeft, CheckCircle2, Camera, Layers, ExternalLink, Sparkles, Clock, Package
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { albumApi } from '../api/albumApi';
import { categoryApi } from '../api/categoryApi';

const DEFAULT_PACKAGES = [
  {
    id: 'pkg_1',
    title: 'Gói Chụp Cá Nhân / Profile CV',
    price: '1.200.000đ',
    duration: '1.5 - 2 giờ',
    deliverables: 'Toàn bộ file gốc + 15 ảnh chỉnh sửa hậu kỳ tỉ mỉ',
    popular: true,
    tags: ['Profile CV', 'Street Style', 'Nghệ Thuật']
  },
  {
    id: 'pkg_2',
    title: 'Gói Cặp Đôi & Pre-Wedding Hàn Quốc',
    price: '2.500.000đ',
    duration: '3 - 4 giờ',
    deliverables: 'Toàn bộ file gốc + 30 ảnh retouch + 1 Ảnh ép gỗ 60x90cm',
    popular: false,
    tags: ['Pre-Wedding', 'Studio Hàn Quốc', 'Ngoại Cảnh']
  },
  {
    id: 'pkg_3',
    title: 'Gói Lookbook & Thời Trang Thương Mại',
    price: '3.200.000đ',
    duration: '4 - 5 giờ',
    deliverables: 'Toàn bộ file gốc + Hậu kỳ màu sắc theo concept thương hiệu',
    popular: false,
    tags: ['Lookbook', 'E-commerce', 'High Fashion']
  }
];

export const PhotographerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photographer, setPhotographer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // portfolio | packages | reviews
  const [copiedLink, setCopiedLink] = useState(false);

  const [portfolioImages, setPortfolioImages] = useState([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [fitMode, setFitMode] = useState('contain'); // 'contain' (vừa khung trọn vẹn) hoặc 'cover' (lấp đầy)
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch categories for packages
    categoryApi.getAll().then(res => {
      if (isMounted && res.data) setCategories(res.data);
    }).catch(() => {});

    userApi.getActivePhotographers().then(async res => {
      if (!isMounted) return;
      const list = res.data || [];
      const found = list.find(p => String(p._id) === String(id) || String(p.id) === String(id));
      if (found) {
        const phData = {
          _id: found._id,
          name: found.name,
          role: 'Verified Pro Photographer',
          avatar: found.studioInfo?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
          coverImage: found.studioInfo?.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
          studioInfo: {
            location: found.studioInfo?.location || 'Hà Nội & Miền Bắc',
            experience: found.studioInfo?.experience || 'Chuyên nghiệp',
            styles: Array.isArray(found.studioInfo?.styles)
              ? found.studioInfo.styles
              : (typeof found.studioInfo?.styles === 'string' ? found.studioInfo.styles.split(',').map(s => s.trim()) : ['Cinematic', 'Chân Dung', 'Pre-Wedding']),
            phone: found.studioInfo?.phone || found.phone || 'Liên hệ',
            bio: found.studioInfo?.bio || 'Chuyên chụp ảnh nghệ thuật, chân dung cá nhân & Pre-wedding.',
            portfolioUrl: found.studioInfo?.portfolioUrl || '',
            equipment: found.studioInfo?.equipment || ''
          },
          rating: 5.0,
          reviewsCount: 142,
          startingPrice: found.studioInfo?.startingPrice || '1.200.000đ',
          badge: found.studioInfo?.badge || 'Verified Pro'
        };
        setPhotographer(phData);

        // Fetch Photographer Albums & Drive Portfolio photos
        try {
          setLoadingDrive(true);
          let extractedImgs = [];

          // 1. Quét link Google Drive nếu photographer dán folder Drive tác phẩm
          if (found.studioInfo?.portfolioUrl && found.studioInfo.portfolioUrl.includes('drive.google.com')) {
            try {
              const driveRes = await albumApi.parseDriveFolder(found.studioInfo.portfolioUrl);
              if (driveRes.images && Array.isArray(driveRes.images)) {
                driveRes.images.forEach(img => {
                  extractedImgs.push({ url: img.url || img.thumbnail, title: img.fileName || 'Ảnh từ Google Drive' });
                });
              }
            } catch (dErr) {
              console.log('Parse Drive folder notice:', dErr.message);
            }
          }

          // 2. Quét các Album công khai mà photographer này tạo
          const albumsRes = await albumApi.getPublicAlbums(found._id);
          const phAlbums = albumsRes.data || [];
          phAlbums.forEach(a => {
            if (Array.isArray(a.images) && a.images.length > 0) {
              a.images.forEach(img => extractedImgs.push({ url: img.url || img.thumbnail, title: a.title }));
            }
          });

          if (extractedImgs.length > 0 && isMounted) {
            setPortfolioImages(extractedImgs);
            if (!found.studioInfo?.coverImage) {
              setPhotographer(prev => prev ? ({ ...prev, coverImage: extractedImgs[0].url }) : prev);
            }
          }
        } catch (err) {
          console.error('Fetch portfolio error:', err);
        } finally {
          if (isMounted) setLoadingDrive(false);
        }
      } else {
        // Mock fallback by ID
        setPhotographer({
          _id: id || 'ph_default',
          name: 'Minh Hoàng Studio',
          role: 'Top Rated Photographer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
          coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
          studioInfo: {
            location: 'Hà Nội & Miền Bắc',
            experience: '6 năm kinh nghiệm',
            styles: ['Cinematic', 'Mood Film', 'Chân Dung', 'Pre-Wedding'],
            phone: '0988 123 456',
            bio: 'Chuyên chụp ảnh phong cách Cinematic, Chân dung cá nhân & Pre-wedding lãng mạn. Đã thực hiện hơn 500+ bộ ảnh nghệ thuật cho khách hàng toàn quốc.',
            portfolioUrl: 'https://instagram.com'
          },
          rating: 4.9,
          reviewsCount: 142,
          startingPrice: '1.200.000đ',
          badge: 'Verified Pro'
        });
      }
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [id]);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleBookPackage = (pkgTitle) => {
    navigate(`/bookings?phUserId=${photographer?._id}&package=${encodeURIComponent(pkgTitle)}`);
  };

  if (loading) {
    return (
      <div className="text-center py-32 space-y-4 animate-fade-in">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400">Đang nạp thông tin Nhiếp ảnh gia...</p>
      </div>
    );
  }

  if (!photographer) return null;

  const stylesArr = Array.isArray(photographer.studioInfo?.styles)
    ? photographer.studioInfo.styles
    : (typeof photographer.studioInfo?.styles === 'string' ? photographer.studioInfo.styles.split(',') : []);

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/photographers')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách Nhiếp ảnh gia</span>
      </button>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-[#242938] bg-[#141720] shadow-2xl">
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <img
            src={photographer.coverImage}
            alt={photographer.name}
            className={`w-full h-full ${
              photographer.studioInfo?.coverFit === 'contain' ? 'object-contain' : 'object-cover'
            }`}
            style={{
              objectPosition: photographer.studioInfo?.coverPositionY !== undefined
                ? `50% ${photographer.studioInfo.coverPositionY}%`
                : (photographer.studioInfo?.coverPosition || 'center')
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141720] via-[#141720]/40 to-transparent" />
          
          <button
            onClick={handleShareLink}
            className="absolute top-4 right-4 px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>{copiedLink ? 'Đã Sao Chép Link!' : 'Chia Sẻ Profile'}</span>
          </button>
        </div>

        {/* Studio Info Card Floating */}
        <div className="p-6 sm:p-8 -mt-20 relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              <img
                src={photographer.avatar}
                alt={photographer.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#141720] shadow-2xl ring-2 ring-amber-400/40"
                style={{
                  objectPosition: photographer.studioInfo?.avatarPositionY !== undefined
                    ? `50% ${photographer.studioInfo.avatarPositionY}%`
                    : (photographer.studioInfo?.avatarPosition || 'center')
                }}
              />
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{photographer.badge}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center space-x-2">
                  <span>{photographer.name}</span>
                  <CheckCircle2 className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                </h1>
                <p className="text-xs sm:text-sm text-gray-300">{photographer.role}</p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-3">
              <a
                href={`tel:${photographer.studioInfo?.phone || ''}`}
                className="px-5 py-3 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 transition-all"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Gọi Zalo / SĐT</span>
              </a>

              <button
                onClick={() => navigate(`/bookings?phUserId=${photographer._id}`)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Calendar className="w-4 h-4 stroke-[2.5]" />
                <span>⚡ Đặt Lịch Chụp Ngay</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#242938] text-center">
            <div className="bg-[#0c0d12] border border-[#242938] p-3.5 rounded-2xl">
              <p className="text-[11px] text-gray-400 font-semibold uppercase">Đánh Giá</p>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-base font-black text-white">{photographer.rating}</span>
                <span className="text-xs text-gray-500">({photographer.reviewsCount})</span>
              </div>
            </div>

            <div className="bg-[#0c0d12] border border-[#242938] p-3.5 rounded-2xl">
              <p className="text-[11px] text-gray-400 font-semibold uppercase">Khu Vực Hoạt Động</p>
              <div className="flex items-center justify-center space-x-1 mt-1 text-white font-bold text-xs sm:text-sm truncate">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{photographer.studioInfo?.location}</span>
              </div>
            </div>

            <div className="bg-[#0c0d12] border border-[#242938] p-3.5 rounded-2xl">
              <p className="text-[11px] text-gray-400 font-semibold uppercase">Kinh Nghiệm</p>
              <div className="flex items-center justify-center space-x-1 mt-1 text-white font-bold text-xs sm:text-sm">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{photographer.studioInfo?.experience}</span>
              </div>
            </div>

            <div className="bg-[#0c0d12] border border-[#242938] p-3.5 rounded-2xl">
              <p className="text-[11px] text-gray-400 font-semibold uppercase">Giá Khởi Điểm</p>
              <p className="text-base font-black text-amber-400 mt-1">{photographer.startingPrice}</p>
            </div>
          </div>

          {/* Bio & Styles */}
          <div className="space-y-3 pt-2">
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {photographer.studioInfo?.bio}
            </p>

            {stylesArr.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-gray-400">Sở Trường:</span>
                {stylesArr.map((st, sIdx) => (
                  <span key={sIdx} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl">
                    #{st.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#242938] pb-4">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'portfolio'
              ? 'bg-amber-500 text-amber-950 shadow-md'
              : 'bg-[#141720] border border-[#242938] text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Bộ Sưu Tập Nổi Bật</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'packages'
              ? 'bg-amber-500 text-amber-950 shadow-md'
              : 'bg-[#141720] border border-[#242938] text-gray-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Gói Chụp & Bảng Giá</span>
        </button>
      </div>

      {/* Tab Content: Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#141720] border border-[#242938] px-4 py-2.5 rounded-2xl">
            <span className="text-xs text-gray-400 font-semibold">Chế độ hiển thị khung ảnh:</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setFitMode('contain')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  fitMode === 'contain'
                    ? 'bg-amber-500 text-amber-950 shadow-md'
                    : 'bg-[#0c0d12] text-gray-400 hover:text-white'
                }`}
              >
                🖼️ Trọn Vẹn Ảnh (Contain)
              </button>
              <button
                type="button"
                onClick={() => setFitMode('cover')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  fitMode === 'cover'
                    ? 'bg-amber-500 text-amber-950 shadow-md'
                    : 'bg-[#0c0d12] text-gray-400 hover:text-white'
                }`}
              >
                ✂️ Lấp Đầy Khung (Cover)
              </button>
            </div>
          </div>

          {loadingDrive ? (
            <div className="text-center py-16 space-y-3 bg-[#141720] rounded-3xl border border-[#242938]">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400">Đang quét và lấy tác phẩm từ Google Drive...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(portfolioImages.length > 0
                ? portfolioImages
                : [
                    { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop', title: 'Pre-Wedding Nghệ Thuật' },
                    { url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800&auto=format&fit=crop', title: 'Chân Dung Cinematic' },
                    { url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop', title: 'Mood Film Outdoor' },
                    { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop', title: 'Editorial Lookbook' },
                    { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop', title: 'Street Style Cặp Đôi' },
                    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop', title: 'Studio Hàn Quốc' }
                  ]
              ).map((item, pIdx) => (
                <div
                  key={pIdx}
                  onClick={() => setLightboxImage(item)}
                  className="group relative h-80 rounded-3xl overflow-hidden bg-[#0c0d12] border border-[#242938] shadow-xl cursor-pointer flex items-center justify-center p-2"
                >
                  <img
                    src={item.url}
                    alt={item.title || 'Portfolio tác phẩm'}
                    className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                      fitMode === 'contain' ? 'object-contain' : 'object-cover rounded-2xl'
                    }`}
                    onError={(e) => {
                      const FALLBACK_GALLERY = [
                        'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop'
                      ];
                      e.target.src = FALLBACK_GALLERY[pIdx % FALLBACK_GALLERY.length];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                    <p className="text-xs font-bold text-amber-400 flex items-center justify-between">
                      <span className="truncate">{item.title || `Bộ Ảnh Nghệ Thuật #${pIdx + 1}`}</span>
                      <span className="text-[10px] bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full font-black shrink-0 ml-2">🔍 Xem Ảnh Full</span>
                    </p>
                    <p className="text-[11px] text-gray-300 mt-1">Tác phẩm từ Studio / Google Drive</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Packages */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEFAULT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-[#141720] border border-[#242938] hover:border-amber-500/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 group relative"
            >
              {pkg.popular && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-amber-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                  Phổ Biến Nhất
                </span>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {pkg.title}
                </h3>
                <p className="text-2xl font-black text-amber-400">{pkg.price}</p>
                <div className="text-xs text-gray-400 space-y-2 pt-2 border-t border-[#242938]">
                  <p className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Thời gian chụp: <strong>{pkg.duration}</strong></span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pkg.deliverables}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleBookPackage(pkg.title)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-105"
              >
                <Calendar className="w-4 h-4 stroke-[2.5]" />
                <span>⚡ Đặt Lịch Gói Này</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal Xem Ảnh Trọn Vẹn Khổ Lớn */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 font-black text-sm bg-black/60 border border-white/20 rounded-full px-3 py-1 transition-all"
            >
              ✕ Đóng
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title || 'Xem ảnh full'}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-[#242938]"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop'; }}
            />
            {lightboxImage.title && (
              <p className="mt-3 text-xs sm:text-sm font-bold text-amber-400 bg-black/70 px-4 py-1.5 rounded-full border border-amber-500/30">
                {lightboxImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotographerDetailPage;
