import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Star, MapPin, Search, Filter, ShieldCheck, Sparkles, 
  Calendar, ArrowRight, Phone, ExternalLink, Award, CheckCircle2, ChevronRight
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { albumApi } from '../api/albumApi';
import { BookingModal } from '../components/booking/BookingModal';

const DEFAULT_PHOTOGRAPHERS = [
  {
    _id: 'ph_default_1',
    name: 'Minh Hoàng Studio',
    role: 'Top Rated Photographer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    studioInfo: {
      location: 'Hà Nội & Miền Bắc',
      experience: '6 năm kinh nghiệm',
      styles: ['Cinematic', 'Mood Film', 'Chân Dung', 'Pre-Wedding'],
      phone: '0988 123 456',
      portfolioUrl: 'https://instagram.com'
    },
    rating: 4.9,
    reviewsCount: 142,
    startingPrice: '1.200.000đ',
    badge: 'Verified Pro',
    portfolio: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    _id: 'ph_default_2',
    name: 'Linh Dan Photography',
    role: 'Editorial & Fashion Specialist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    studioInfo: {
      location: 'TP. Hồ Chí Minh',
      experience: '5 năm kinh nghiệm',
      styles: ['Pastel', 'Hàn Quốc', 'Lookbook', 'Thời Trang'],
      phone: '0912 345 678',
      portfolioUrl: 'https://instagram.com'
    },
    rating: 5.0,
    reviewsCount: 98,
    startingPrice: '1.500.000đ',
    badge: 'High Fashion',
    portfolio: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    _id: 'ph_default_3',
    name: 'Đức Huy Visuals',
    role: 'Event & Pre-Wedding Master',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop',
    studioInfo: {
      location: 'Đà Nẵng & Đà Lạt',
      experience: '7 năm kinh nghiệm',
      styles: ['Sự Kiện', 'Pre-Wedding', 'Ngoại Cảnh', 'Gia Đình'],
      phone: '0977 888 999',
      portfolioUrl: 'https://instagram.com'
    },
    rating: 4.95,
    reviewsCount: 210,
    startingPrice: '2.000.000đ',
    badge: 'Studio Uy Tín',
    portfolio: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    _id: 'ph_default_4',
    name: 'Phương Thảo Art Studio',
    role: 'Newborn & Family Specialist',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1581952977263-df621a28a387?q=80&w=800&auto=format&fit=crop',
    studioInfo: {
      location: 'Hà Nội',
      experience: '4 năm kinh nghiệm',
      styles: ['Bé Yêu', 'Gia Đình', 'Studio Ấm Cúng', 'Kỷ Niệm'],
      phone: '0904 555 666',
      portfolioUrl: 'https://instagram.com'
    },
    rating: 4.88,
    reviewsCount: 76,
    startingPrice: '1.000.000đ',
    badge: 'Ấm Cúng',
    portfolio: [
      'https://images.unsplash.com/photo-1581952977263-df621a28a387?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=400&auto=format&fit=crop'
    ]
  }
];

const LOCATIONS = ['Tất cả khu vực', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt'];
const STYLES = ['Tất cả thể loại', 'Chân Dung', 'Pre-Wedding', 'Hàn Quốc', 'Lookbook', 'Sự Kiện', 'Gia Đình', 'Kỷ Yếu'];

export const PhotographersPage = () => {
  const navigate = useNavigate();
  const [photographers, setPhotographers] = useState(DEFAULT_PHOTOGRAPHERS);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả khu vực');
  const [selectedStyle, setSelectedStyle] = useState('Tất cả thể loại');

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    photographer: null
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      userApi.getActivePhotographers(),
      albumApi.getPublicAlbums().catch(() => ({ data: [] }))
    ]).then(async ([usersRes, albumsRes]) => {
      if (!isMounted) return;
      const realList = usersRes.data || [];
      const publicAlbums = albumsRes.data || [];

      if (realList.length > 0) {
        const formattedReal = await Promise.all(realList.map(async (p, idx) => {
          const phAlbums = publicAlbums.filter(a => String(a.photographerId) === String(p._id) || a.photographerName === p.name);
          let extractedImgs = [];

          phAlbums.forEach(a => {
            if (Array.isArray(a.images) && a.images.length > 0) {
              a.images.forEach(img => {
                const u = img.url || img.thumbnail;
                if (u && !extractedImgs.includes(u)) extractedImgs.push(u);
              });
            }
          });

          if (extractedImgs.length < 3 && p.studioInfo?.portfolioUrl && p.studioInfo.portfolioUrl.includes('drive.google.com')) {
            try {
              const driveRes = await albumApi.parseDriveFolder(p.studioInfo.portfolioUrl);
              if (driveRes.images && Array.isArray(driveRes.images)) {
                driveRes.images.forEach(img => {
                  const u = img.url || img.thumbnail;
                  if (u && !extractedImgs.includes(u)) extractedImgs.push(u);
                });
              }
            } catch (dErr) {
              console.log('Parse drive notice:', dErr.message);
            }
          }

          const fallbackPortfolio = DEFAULT_PHOTOGRAPHERS[idx % DEFAULT_PHOTOGRAPHERS.length].portfolio;
          const finalPortfolio = extractedImgs.length >= 3 
            ? extractedImgs.slice(0, 3) 
            : extractedImgs.length > 0 
              ? [...extractedImgs, ...fallbackPortfolio.slice(extractedImgs.length)] 
              : fallbackPortfolio;

          const coverPhoto = p.studioInfo?.coverImage 
            || (extractedImgs.length > 0 ? extractedImgs[0] : DEFAULT_PHOTOGRAPHERS[idx % DEFAULT_PHOTOGRAPHERS.length].coverImage);

          return {
            _id: p._id,
            name: p.name,
            role: 'Verified Pro Photographer',
            avatar: p.studioInfo?.avatar || DEFAULT_PHOTOGRAPHERS[idx % DEFAULT_PHOTOGRAPHERS.length].avatar,
            coverImage: coverPhoto,
            studioInfo: {
              location: p.studioInfo?.location || 'Việt Nam',
              experience: p.studioInfo?.experience || 'Chuyên nghiệp',
              styles: Array.isArray(p.studioInfo?.styles)
                ? p.studioInfo.styles
                : (typeof p.studioInfo?.styles === 'string' ? p.studioInfo.styles.split(',').map(s => s.trim()) : ['Chân Dung', 'Tự Nhiên']),
              phone: p.studioInfo?.phone || 'Liên hệ',
              portfolioUrl: p.studioInfo?.portfolioUrl || ''
            },
            rating: 5.0,
            reviewsCount: 15 + idx * 4,
            startingPrice: p.studioInfo?.startingPrice || 'Từ 1.000.000đ',
            badge: p.studioInfo?.badge || 'Verified Pro',
            portfolio: finalPortfolio
          };
        }));

        if (isMounted) {
          setPhotographers(formattedReal);
        }
      }
    }).catch(err => {
      console.error('Fetch photographers page error:', err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Filtered List
  const filteredPhotographers = photographers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLoc = selectedLocation === 'Tất cả khu vực' || 
      (p.studioInfo?.location && p.studioInfo.location.toLowerCase().includes(selectedLocation.toLowerCase()));

    const stylesArr = Array.isArray(p.studioInfo?.styles) 
      ? p.studioInfo.styles 
      : (typeof p.studioInfo?.styles === 'string' ? p.studioInfo.styles.split(',') : []);
    
    const matchesStyle = selectedStyle === 'Tất cả thể loại' || 
      stylesArr.some(s => s.trim().toLowerCase().includes(selectedStyle.toLowerCase()));

    return matchesSearch && matchesLoc && matchesStyle;
  });

  const handleBookDirect = (photographer) => {
    navigate(`/bookings?phUserId=${photographer._id}`);
  };

  const handleViewDetail = (photographer) => {
    navigate(`/photographer/${photographer._id}`);
  };

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#141720] via-[#10131c] to-[#0c0d12] border border-[#242938] rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Mạng Lưới Nhiếp Ảnh Gia Uy Tín</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Khám Phá Nhiếp Ảnh Gia & Studio Tài Năng
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Lựa chọn nhiếp ảnh gia có phong cách phù hợp nhất với ý tưởng của bạn, xem bảng giá minh bạch và đặt lịch chụp ảnh nhanh chóng chỉ với 1-Click.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 pt-8 border-t border-[#242938] grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên Nhiếp ảnh gia / Studio..."
              className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white outline-none transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Location Select */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white outline-none appearance-none cursor-pointer"
            >
              {LOCATIONS.map((loc, idx) => (
                <option key={idx} value={loc} className="bg-[#141720] text-white">{loc}</option>
              ))}
            </select>
          </div>

          {/* Style Select */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400" />
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white outline-none appearance-none cursor-pointer"
            >
              {STYLES.map((st, idx) => (
                <option key={idx} value={st} className="bg-[#141720] text-white">{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Photographers Grid */}
      {filteredPhotographers.length === 0 ? (
        <div className="text-center py-20 bg-[#141720] border border-[#242938] rounded-3xl space-y-4">
          <Camera className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Không tìm thấy Nhiếp ảnh gia phù hợp</h3>
          <p className="text-xs text-gray-400">Vui lòng thử thay đổi từ khóa hoặc chọn bộ lọc khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPhotographers.map((p) => {
            const stylesArr = Array.isArray(p.studioInfo?.styles)
              ? p.studioInfo.styles
              : (typeof p.studioInfo?.styles === 'string' ? p.studioInfo.styles.split(',') : []);

            return (
              <div
                key={p._id}
                className="bg-[#141720] border border-[#242938] hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Top Cover Banner */}
                <div className="relative h-44 overflow-hidden bg-black/40">
                  <img
                    src={p.coverImage}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141720] via-transparent to-black/30" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{p.badge}</span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-amber-950 text-xs font-black shadow-md">
                    Giá từ {p.startingPrice}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-5 -mt-8 relative z-10 flex-1">
                  {/* Header info with Avatar */}
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex items-end space-x-3.5">
                      <div className="relative">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#141720] rounded-full" title="Sẵn sàng nhận lịch" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center space-x-1.5">
                          <span>{p.name}</span>
                          <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                        </h3>
                        <p className="text-xs text-gray-400">{p.role}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 bg-[#0c0d12] border border-[#242938] px-2.5 py-1.5 rounded-xl text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-black text-amber-300">{p.rating}</span>
                      <span className="text-gray-500">({p.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Location & Experience */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 pt-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{p.studioInfo?.location || 'Toàn quốc'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{p.studioInfo?.experience || 'Chuyên nghiệp'}</span>
                    </div>
                  </div>

                  {/* Style Tag Pills */}
                  {stylesArr.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sở Trường Phong Cách:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {stylesArr.map((st, sIdx) => (
                          <span key={sIdx} className="px-2.5 py-0.5 bg-[#0c0d12] border border-[#242938] text-amber-300 text-[11px] font-medium rounded-lg">
                            #{st.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Previews */}
                  {p.portfolio && p.portfolio.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {p.portfolio.map((imgUrl, iIdx) => (
                        <div key={iIdx} className="h-20 rounded-xl overflow-hidden bg-[#0c0d12] border border-[#242938]">
                          <img
                            src={imgUrl}
                            alt="portfolio"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-6 pt-0 border-t border-[#242938]/50 mt-4 flex items-center space-x-3">
                  <button
                    onClick={() => handleViewDetail(p)}
                    className="flex-1 py-3 px-4 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Xem Profile</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => handleBookDirect(p)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.02]"
                  >
                    <Calendar className="w-4 h-4 stroke-[2.5]" />
                    <span>⚡ Đặt Lịch Ngay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal Fallback */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false, photographer: null })}
        initialPhotographer={bookingModal.photographer}
      />
    </div>
  );
};

export default PhotographersPage;
