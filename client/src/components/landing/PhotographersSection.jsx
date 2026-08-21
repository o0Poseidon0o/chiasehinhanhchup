import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Camera, CheckCircle2, ArrowRight, ExternalLink, Calendar, 
  ShieldCheck, Sparkles, ChevronRight, Award, UserPlus
} from 'lucide-react';
import { userApi } from '../../api/userApi';
import { albumApi } from '../../api/albumApi';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_PHOTOGRAPHERS = [
  {
    _id: 'ph_default_1',
    name: 'Minh Hoàng Studio',
    role: 'Top Rated Photographer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    studioInfo: {
      location: 'Hà Nội & Miền Bắc',
      experience: '6 năm kinh nghiệm',
      styles: ['Cinematic', 'Mood Film', 'Chân Dung', 'Pre-Wedding']
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
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    studioInfo: {
      location: 'TP. Hồ Chí Minh',
      experience: '5 năm kinh nghiệm',
      styles: ['Pastel', 'Hàn Quốc', 'Lookbook', 'Thời Trang']
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
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop',
    studioInfo: {
      location: 'Đà Nẵng & Đà Lạt',
      experience: '7 năm kinh nghiệm',
      styles: ['Sự Kiện', 'Pre-Wedding', 'Ngoại Cảnh', 'Gia Đình']
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
  }
];

export const PhotographersSection = () => {
  const navigate = useNavigate();
  const { isLoggedIn, openAuthModal } = useAuth();
  const [photographersList, setPhotographersList] = useState(DEFAULT_PHOTOGRAPHERS);

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
                : (typeof p.studioInfo?.styles === 'string' ? p.studioInfo.styles.split(',').map(s => s.trim()) : ['Chân Dung', 'Tự Nhiên'])
            },
            rating: 5.0,
            reviewsCount: 18 + idx * 6,
            startingPrice: p.studioInfo?.startingPrice || 'Từ 1.000.000đ',
            badge: p.studioInfo?.badge || 'Verified Pro',
            portfolio: finalPortfolio
          };
        }));

        if (isMounted) {
          setPhotographersList(formattedReal);
        }
      }
    }).catch(err => {
      console.error('Fetch homepage photographers error:', err);
    });

    return () => { isMounted = false; };
  }, []);

  return (
    <section id="photographers-section" className="py-16 sm:py-24 border-t border-[#242938] relative">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Nhiếp Ảnh Gia & Studio Đã Xác Thực</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tuyển Chọn Nhiếp Ảnh Gia & Studio Nghệ Thuật
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
              Khám phá những góc máy độc đáo, xem tác phẩm thực tế và trực tiếp đặt lịch chụp cùng nghệ sĩ bạn yêu thích.
            </p>
          </div>

          <button
            onClick={() => navigate('/photographers')}
            className="inline-flex items-center space-x-2 px-5 py-3 bg-[#141720] hover:bg-[#1c2230] border border-[#242938] hover:border-amber-500/50 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all group shrink-0"
          >
            <span>Khám Phá Tất Cả Studio</span>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Photographers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {photographersList.slice(0, 3).map((p) => {
            const stylesArr = Array.isArray(p.studioInfo?.styles)
              ? p.studioInfo.styles
              : (typeof p.studioInfo?.styles === 'string' ? p.studioInfo.styles.split(',') : []);

            return (
              <div
                key={p._id}
                className="bg-[#141720] border border-[#242938] hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Top Banner Cover */}
                <div className="relative h-40 overflow-hidden bg-black/40">
                  <img
                    src={p.coverImage}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141720] via-transparent to-black/30" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{p.badge}</span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-amber-950 text-xs font-black shadow-md">
                    Giá từ {p.startingPrice}
                  </div>
                </div>

                {/* Profile Body */}
                <div className="p-6 space-y-4 -mt-8 relative z-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header info with Avatar */}
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex items-end space-x-3">
                        <div className="relative">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#141720] rounded-full" title="Sẵn sàng nhận lịch" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center space-x-1">
                            <span>{p.name}</span>
                            <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                          </h3>
                          <p className="text-[11px] text-gray-400">{p.role}</p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-1 bg-[#0c0d12] border border-[#242938] px-2 py-1 rounded-xl text-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-amber-300">{p.rating}</span>
                        <span className="text-gray-500 text-[10px]">({p.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Location & Exp */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
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
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {stylesArr.map((st, sIdx) => (
                          <span key={sIdx} className="px-2.5 py-0.5 bg-[#0c0d12] border border-[#242938] text-amber-300 text-[10px] font-medium rounded-lg">
                            #{st.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Portfolio Thumbnails */}
                    {p.portfolio && (
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {p.portfolio.map((imgUrl, iIdx) => (
                          <div key={iIdx} className="h-16 rounded-xl overflow-hidden bg-[#0c0d12] border border-[#242938]">
                            <img
                              src={imgUrl}
                              alt="portfolio"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const FALLBACKS = [
                                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
                                  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80',
                                  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80'
                                ];
                                e.target.src = FALLBACKS[iIdx % FALLBACKS.length];
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-[#242938]/50 flex items-center space-x-2 mt-4">
                    <button
                      onClick={() => navigate(`/photographer/${p._id}`)}
                      className="flex-1 py-2.5 px-3 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    <button
                      onClick={() => {
                        const targetPath = `/bookings?phUserId=${p._id}`;
                        if (!isLoggedIn) {
                          openAuthModal(targetPath, 'login', 'client');
                        } else {
                          navigate(targetPath);
                        }
                      }}
                      className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md transition-all hover:scale-105"
                    >
                      <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>⚡ Đặt Lịch</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Studio Registration Banner Callout */}
        <div className="bg-gradient-to-r from-[#141720] via-[#10131c] to-[#1a1f2e] border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
              <Camera className="w-3.5 h-3.5" />
              <span>Dành Cho Nhiếp Ảnh Gia & Studio</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Bạn Là Nhiếp Ảnh Gia Chuyên Nghiệp?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Đăng ký tài khoản Studio để tạo Profile Portfolio cao cấp, tiếp cận hàng ngàn khách hàng tiềm năng và trải nghiệm quy trình chọn ảnh tự động 1-Click.
            </p>
          </div>

          <button
            onClick={() => openAuthModal('/app')}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-105 shrink-0 relative z-10"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>📸 Đăng Ký Studio Ngay</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PhotographersSection;
