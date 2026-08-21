import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Award, ShieldCheck, Phone, Mail, Calendar, 
  Share2, ArrowLeft, CheckCircle2, Camera, Layers, ExternalLink, Sparkles, Clock, Package
} from 'lucide-react';
import { userApi } from '../api/userApi';
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

  useEffect(() => {
    let isMounted = true;
    
    // Fetch categories for packages
    categoryApi.getAll().then(res => {
      if (isMounted && res.data) setCategories(res.data);
    }).catch(() => {});

    userApi.getActivePhotographers().then(res => {
      if (!isMounted) return;
      const list = res.data || [];
      const found = list.find(p => String(p._id) === String(id) || String(p.id) === String(id));
      if (found) {
        setPhotographer({
          _id: found._id,
          name: found.name,
          role: 'Verified Pro Photographer',
          avatar: found.studioInfo?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
          coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
          studioInfo: {
            location: found.studioInfo?.location || 'Hà Nội & Miền Bắc',
            experience: found.studioInfo?.experience || '6 năm kinh nghiệm',
            styles: Array.isArray(found.studioInfo?.styles) ? found.studioInfo.styles : ['Cinematic', 'Chân Dung', 'Pre-Wedding'],
            phone: found.studioInfo?.phone || '0988 123 456',
            bio: found.studioInfo?.bio || 'Chuyên chụp ảnh phong cách Cinematic, Chân dung cá nhân & Pre-wedding lãng mạn. Đã thực hiện hơn 500+ bộ ảnh nghệ thuật.',
            portfolioUrl: found.studioInfo?.portfolioUrl || ''
          },
          rating: 4.9,
          reviewsCount: 142,
          startingPrice: '1.200.000đ',
          badge: 'Verified Pro'
        });
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
            className="w-full h-full object-cover"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop'
            ].map((imgUrl, pIdx) => (
              <div key={pIdx} className="group relative h-72 rounded-3xl overflow-hidden bg-black/40 border border-[#242938] shadow-xl">
                <img src={imgUrl} alt="portfolio" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <p className="text-xs font-bold text-amber-400">Bộ Ảnh Nghệ Thuật #{pIdx + 1}</p>
                  <p className="text-xs text-white">Chân Dung Cinematic & Mood Film</p>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default PhotographerDetailPage;
