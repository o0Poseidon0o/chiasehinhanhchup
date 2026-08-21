import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Award, ShieldCheck, Phone, Mail, Calendar, 
  Share2, ArrowLeft, CheckCircle2, Camera, Layers, ExternalLink, Sparkles, Clock, Package,
  ChevronLeft, ChevronRight, X, Aperture, Image as ImageIcon, ZoomIn
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { albumApi } from '../api/albumApi';
import { categoryApi } from '../api/categoryApi';
import { useAuth } from '../context/AuthContext';

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
  const { isLoggedIn, openAuthModal } = useAuth();
  const [photographer, setPhotographer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // portfolio | packages | reviews
  const [copiedLink, setCopiedLink] = useState(false);

  const [portfolioImages, setPortfolioImages] = useState([]);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [fitMode, setFitMode] = useState('contain');

  // Reviews System States
  const { currentUser } = useAuth();
  const [reviewsList, setReviewsList] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newReviewerName, setNewReviewerName] = useState(currentUser?.name || '');
  const [newBookingCode, setNewBookingCode] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (photographer?._id || id) {
      userApi.getPhotographerReviews(photographer?._id || id).then(res => {
        if (res.data) setReviewsList(res.data);
      }).catch(() => {});
    }
  }, [photographer, id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal(window.location.pathname, 'login', 'client');
      return;
    }
    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung nhận xét đánh giá.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await userApi.submitReview({
        photographerId: photographer?._id || id,
        rating: newRating,
        comment: newComment.trim(),
        clientName: newReviewerName.trim() || currentUser?.name || 'Khách Hàng',
        bookingCode: newBookingCode.trim()
      });
      setReviewsList(prev => [res.data, ...prev]);
      setNewComment('');
      setNewBookingCode('');
      alert('Cảm ơn bạn đã gửi đánh giá! Đánh giá đã được đăng tải thành công.');
    } catch (err) {
      alert('Có lỗi khi gửi đánh giá: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReportReview = async (reviewId) => {
    const reason = prompt('Nhập lý do khiếu nại báo cáo (VD: Khách không chụp thực tế, sai sự thật...):');
    if (!reason || !reason.trim()) return;
    try {
      await userApi.reportReview(reviewId, reason.trim());
      alert('Đã gửi khiếu nại đến Master Admin để kiểm tra và phân xử!');
      setReviewsList(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert('Lỗi khi gửi báo cáo: ' + err.message);
    }
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : (portfolioImages.length > 0 ? portfolioImages.length - 1 : 0)));
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex(prev => (prev !== null && prev < portfolioImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, portfolioImages.length]);

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

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
        setLoading(false); // Unblock profile display immediately for fast response

        // Async fetch Photographer Albums & Drive Portfolio photos in background
        setLoadingDrive(true);
        let extractedImgs = [];

        try {
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
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [id]);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleBookPackage = (pkgTitle = '') => {
    const targetPath = `/bookings?phUserId=${photographer?._id || id}${pkgTitle ? `&package=${encodeURIComponent(pkgTitle)}` : ''}`;
    if (!isLoggedIn) {
      openAuthModal(targetPath, 'login', 'client');
    } else {
      navigate(targetPath);
    }
  };

  // Modern Camera Aperture & Pulse Glow Loading Screen
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
        <div className="relative flex items-center justify-center">
          {/* Outer glowing pulsing rings */}
          <div className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-300/10 animate-ping opacity-75" />
          <div className="absolute w-36 h-36 rounded-full border border-amber-500/20 animate-pulse" />
          
          {/* Inner Camera Aperture Spinner */}
          <div className="w-20 h-20 rounded-full bg-[#141720] border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center relative">
            <Aperture className="w-10 h-10 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-1 rounded-full border border-dashed border-amber-500/40 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
          </div>
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm font-bold text-white tracking-wide flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Đang khởi tạo Hồ sơ Nhiếp ảnh gia...</span>
          </p>
          <p className="text-xs text-gray-400 font-medium">Chuẩn bị không gian tác phẩm & bảng giá dịch vụ</p>
        </div>
      </div>
    );
  }

  if (!photographer) return null;

  const stylesArr = Array.isArray(photographer.studioInfo?.styles)
    ? photographer.studioInfo.styles
    : (typeof photographer.studioInfo?.styles === 'string' ? photographer.studioInfo.styles.split(',') : []);

  const activeGallery = portfolioImages.length > 0 ? portfolioImages : [
    { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop', title: 'Pre-Wedding Nghệ Thuật' },
    { url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800&auto=format&fit=crop', title: 'Chân Dung Cinematic' },
    { url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop', title: 'Mood Film Outdoor' },
    { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop', title: 'Editorial Lookbook' },
    { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop', title: 'Street Style Cặp Đôi' },
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop', title: 'Studio Hàn Quốc' }
  ];

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

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'reviews'
              ? 'bg-amber-500 text-amber-950 shadow-md'
              : 'bg-[#141720] border border-[#242938] text-gray-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 fill-current" />
          <span>Đánh Giá & Feedback ({reviewsList.length})</span>
        </button>
      </div>

      {/* Tab Content: Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#141720] border border-[#242938] px-4 py-2.5 rounded-2xl">
            <span className="text-xs text-gray-400 font-semibold flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Chế độ hiển thị khung ảnh:</span>
            </span>
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
              <Aperture className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-gray-400">Đang quét và đồng bộ tác phẩm từ Google Drive / Album...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {activeGallery.map((item, pIdx) => (
                <div
                  key={pIdx}
                  onClick={() => setLightboxIndex(pIdx)}
                  className="group relative h-80 rounded-3xl overflow-hidden bg-[#0c0d12] border border-[#242938] shadow-xl cursor-pointer flex items-center justify-center p-2 transition-all hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                    <p className="text-xs font-bold text-amber-400 flex items-center justify-between">
                      <span className="truncate">{item.title || `Bộ Ảnh Nghệ Thuật #${pIdx + 1}`}</span>
                      <span className="text-[10px] bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full font-black shrink-0 ml-2 flex items-center space-x-1">
                        <ZoomIn className="w-3 h-3" />
                        <span>Xem Full</span>
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-300 mt-1">Bấm để mở trình xem ảnh khổ lớn</p>
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

      {/* Tab Content: Reviews & Feedback */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Rating Overview Card */}
          <div className="bg-[#141720] border border-[#242938] rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:border-r border-[#242938] pr-0 md:pr-6 space-y-2">
              <span className="text-4xl sm:text-5xl font-black text-amber-400">5.0</span>
              <div className="flex items-center justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-400">Dựa trên {reviewsList.length || 142} đánh giá thực tế từ Khách hàng</p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-bold text-white text-sm">Gửi Nhận Xét & Đánh Giá Của Bạn</h4>
              
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-300 font-semibold">Chọn số sao:</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-400 ml-2">{newRating} / 5 ⭐</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    placeholder="Tên của bạn (VD: Minh Trinh)"
                    className="bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />

                  <input
                    type="text"
                    value={newBookingCode}
                    onChange={(e) => setNewBookingCode(e.target.value)}
                    placeholder="Mã Booking Đơn Chụp (Tùy chọn, VD: BK-892102)"
                    className="bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-amber-300 placeholder-gray-500 outline-none"
                  />
                </div>

                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về thái độ phục vụ, góc máy, thời gian trả ảnh của Studio..."
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {newBookingCode.trim() ? '✓ Đánh giá của bạn sẽ có Nhãn Xác Minh Đã Chụp Thực Tế' : '💡 Nhập Mã Booking để nhận Nhãn Xác Minh Uy Tín'}
                  </span>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Đang Gửi...' : '⚡ Gửi Đánh Giá Ngay'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Approved Reviews List */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base">Đánh Giá Từ Khách Hàng ({reviewsList.length})</h4>
            
            {reviewsList.length === 0 ? (
              <div className="text-center py-8 bg-[#141720] border border-[#242938] rounded-2xl text-gray-400 text-xs">
                Chưa có đánh giá nào. Hãy là người đầu tiên để lại phản hồi cho Studio này!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-[#141720] border border-[#242938] rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {rev.clientName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">{rev.clientName}</span>
                            {rev.isVerifiedBooking ? (
                              <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded flex items-center space-x-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>✓ Đã Đặt Lịch Chụp Thực Tế</span>
                              </span>
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-0.5 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-400">{rev.rating}.0</span>
                        </div>

                        <button
                          onClick={() => handleReportReview(rev.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          title="Báo cáo khiếu nại bài đánh giá sai sự thật"
                        >
                          🚩
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed italic pt-1">"{rev.comment}"</p>

                    {/* Official Photographer Reply Box */}
                    {rev.photographerReply && (
                      <div className="mt-2.5 p-2.5 bg-[#0c0d12] border-l-2 border-amber-500 rounded-r-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                          <span>💬 Phản Hồi Từ Studio:</span>
                          <span className="text-[10px] text-gray-500">{new Date(rev.photographerReply.repliedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-gray-300 italic">{rev.photographerReply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal Xem Ảnh Khổ Lớn - Fullscreen Fit Single Screen (Render via Portal vào document.body) */}
      {lightboxIndex !== null && activeGallery[lightboxIndex] && createPortal(
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between w-full h-full max-w-full min-h-[100dvh] max-h-[100dvh] overflow-hidden p-1.5 sm:p-4 select-none animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar: Title & Actions (Relative Flex Child) */}
          <div 
            className="w-full max-w-7xl flex items-center justify-between shrink-0 z-20 pt-1 px-1 sm:px-2 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title Badge */}
            <div className="flex items-center space-x-2 bg-[#141720]/90 backdrop-blur-xl px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-[#242938] shadow-2xl min-w-0 max-w-[50vw] sm:max-w-md">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500/20 text-amber-300 font-mono text-[10px] sm:text-xs font-black rounded-lg border border-amber-500/30 shrink-0">
                {lightboxIndex + 1} / {activeGallery.length}
              </span>
              <h3 className="text-[11px] sm:text-sm font-bold text-white truncate">
                {activeGallery[lightboxIndex]?.title || 'Tác phẩm nghệ thuật'}
              </h3>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(null);
                  navigate(`/bookings?phUserId=${photographer._id}`);
                }}
                className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-xl sm:rounded-2xl text-[11px] sm:text-xs flex items-center space-x-1 sm:space-x-1.5 shadow-xl transition-all hover:scale-105"
              >
                <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">⚡ Đặt Lịch Chụp</span>
                <span className="sm:hidden">Đặt Lịch</span>
              </button>

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 sm:px-4 sm:py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all shadow-xl flex items-center space-x-1"
                title="Tắt xem ảnh"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span className="hidden sm:inline font-bold">Đóng [ESC]</span>
              </button>
            </div>
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrevImage}
            className="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-4 bg-black/70 hover:bg-amber-500 text-white hover:text-amber-950 rounded-full border border-white/20 backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
            title="Ảnh Trước (Phím ⬅️)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 stroke-[2.5]" />
          </button>

          {/* Center Main Display Area (Flex 1, constrained max-height to fit in single viewport) */}
          <div
            className="flex-1 w-full flex items-center justify-center overflow-hidden my-1 px-8 sm:px-24 relative z-10 cursor-pointer"
            onClick={() => setLightboxIndex(null)}
          >
            <img
              src={activeGallery[lightboxIndex]?.url}
              alt="Xem ảnh khổ lớn"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage(e);
              }}
              className="max-h-[calc(100dvh-160px)] max-w-full object-contain rounded-xl sm:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-[#242938] transition-all duration-300 transform hover:scale-[1.005]"
              onError={(e) => {
                const FALLBACK_GALLERY = [
                  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800',
                  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800',
                  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800'
                ];
                e.target.src = FALLBACK_GALLERY[lightboxIndex % FALLBACK_GALLERY.length];
              }}
            />
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNextImage}
            className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-4 bg-black/70 hover:bg-amber-500 text-white hover:text-amber-950 rounded-full border border-white/20 backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
            title="Ảnh Sau (Phím ➡️)"
          >
            <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 stroke-[2.5]" />
          </button>

          {/* Bottom Thumbnail Strip Carousel (Relative Flex Child) */}
          <div 
            className="w-full shrink-0 flex items-center justify-center z-20 pb-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-[95vw] sm:max-w-4xl bg-[#141720]/90 backdrop-blur-xl p-1 sm:p-1.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border border-[#242938] shadow-2xl flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar">
              {activeGallery.map((thumb, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => setLightboxIndex(tIdx)}
                  className={`relative w-9 h-9 sm:w-13 sm:h-13 rounded-lg sm:rounded-xl overflow-hidden shrink-0 transition-all border-2 ${
                    lightboxIndex === tIdx
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img
                    src={thumb.url}
                    alt={`Thumb ${tIdx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PhotographerDetailPage;
