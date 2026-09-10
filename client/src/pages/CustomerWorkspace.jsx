import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  FolderOpen,
  User,
  Clock,
  MapPin,
  Sparkles,
  Camera,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  RefreshCw,
  LogOut,
  ExternalLink,
  Lock,
  PlusCircle,
  XCircle,
  ShieldCheck,
  Tag,
  FileImage,
  Layers,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { photographerApi } from '../api/photographerApi';
import { albumApi } from '../api/albumApi';
import { userApi } from '../api/userApi';
import { AddressSelector } from '../components/common/AddressSelector';

export const CustomerWorkspace = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateCurrentUser } = useAuth();

  // Active Tab: 'bookings' | 'albums' | 'profile'
  const [activeTab, setActiveTab] = useState('bookings');

  // Loading & Notice states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Albums state
  const [albums, setAlbums] = useState([]);
  const [albumSearch, setAlbumSearch] = useState('');
  const [lookupInput, setLookupInput] = useState('');
  const [lookupPasscode, setLookupPasscode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: currentUser?.address || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const showToast = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /**
   * Tải toàn bộ dữ liệu Đơn Booking và Album của khách hàng
   */
  const loadCustomerData = useCallback(async () => {
    try {
      const userPhone = (currentUser?.phone || '').replace(/\D/g, '');
      const userEmail = (currentUser?.email || '').trim().toLowerCase();

      // 1. Tải đơn booking từ Server & LocalStorage
      let localBookings = [];
      try {
        const saved = localStorage.getItem('user_my_bookings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Lọc nghiêm ngặt: chỉ giữ đơn thuộc về khách hàng hiện tại
            localBookings = parsed.filter(b => {
              const bPhone = (b.customerPhone || b.clientPhone || '').replace(/\D/g, '');
              const bEmail = (b.customerEmail || b.clientEmail || '').trim().toLowerCase();
              const phoneMatch = userPhone && bPhone && (bPhone.includes(userPhone) || userPhone.includes(bPhone));
              const emailMatch = userEmail && bEmail && bEmail === userEmail;
              return phoneMatch || emailMatch;
            });
          }
        }
      } catch (_) {}

      let realBookings = [];
      try {
        // Chỉ lấy các đơn của khách hàng này từ backend theo số điện thoại hoặc email
        if (userPhone || userEmail) {
          const res = await photographerApi.getClientBookings({ phone: userPhone, email: userEmail });
          realBookings = res.data || [];
        }
      } catch (_) {}

      const statusMap = {
        confirmed: '✓ Đã Xác Nhận',
        completed: '📸 Đã Chụp Xong',
        cancelled: '❌ Đã Hủy',
        pending: '⏳ Chờ Xác Nhận'
      };

      // Dùng Map với key là Mã Booking (BK-XXXXXX) chuẩn hóa để không bao giờ bị nhân đôi thẻ
      const mergedMap = new Map();

      // Nạp local bookings trước
      localBookings.forEach(b => {
        const canonicalCode = b.code || (b._id ? `BK-${b._id.slice(-6).toUpperCase()}` : `local_${Math.random()}`);
        mergedMap.set(canonicalCode, { ...b, code: canonicalCode });
      });

      // Hợp nhất server bookings (server data ghi đè trạng thái mới nhất cho cùng mã booking)
      realBookings.forEach(rb => {
        const rbCode = `BK-${(rb._id || '').slice(-6).toUpperCase()}`;

        const mappedItem = {
          _id: rb._id,
          code: rbCode,
          photographerId: rb.photographerId || 'ph_default',
          photographerName: rb.photographerName || 'Studio Photodate',
          categoryTitle: rb.category || 'Gói Chụp Ảnh',
          bookingDate: rb.bookingDate || 'Chưa xếp ngày',
          timeSlot: rb.timeSlot || 'Chưa chọn giờ',
          cityLocation: rb.location || 'Hà Nội',
          detailedLocation: '',
          customerPhone: rb.clientPhone || '',
          customerEmail: rb.clientEmail || '',
          customerName: rb.clientName || '',
          status: statusMap[rb.status] || rb.status || '⏳ Chờ Xác Nhận',
          note: rb.note || '',
          createdAt: rb.createdAt || new Date().toISOString()
        };

        mergedMap.set(rbCode, { ...(mergedMap.get(rbCode) || {}), ...mappedItem });
      });

      let allMergedList = Array.from(mergedMap.values());

      // Lọc booking thuộc về khách hàng này một cách nghiêm ngặt (không bao giờ lộ đơn người khác)
      let finalBookings = [];
      if (userPhone || userEmail) {
        finalBookings = allMergedList.filter(b => {
          const bPhone = (b.customerPhone || b.clientPhone || '').replace(/\D/g, '');
          const bEmail = (b.customerEmail || b.clientEmail || '').trim().toLowerCase();
          const phoneMatch = userPhone && bPhone && (bPhone.includes(userPhone) || userPhone.includes(bPhone));
          const emailMatch = userEmail && bEmail && bEmail === userEmail;
          return phoneMatch || emailMatch;
        });
      }

      // Sắp xếp booking mới nhất lên đầu
      finalBookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setBookings(finalBookings);

      // Cập nhật lại localStorage với dữ liệu chuẩn hóa từ server (loại bỏ thời gian cũ sai lệch)
      try {
        if (finalBookings.length > 0) {
          localStorage.setItem('user_my_bookings', JSON.stringify(finalBookings));
        }
      } catch (_) {}

      // 2. Tải danh sách Album của khách
      try {
        const albumRes = await albumApi.getClientAlbums({
          phone: currentUser?.phone || '',
          email: currentUser?.email || ''
        });
        const serverAlbums = albumRes.data || [];

        // Lấy thêm danh sách album đã lưu ở local nếu có
        let localSavedAlbumIds = [];
        try {
          const raw = localStorage.getItem('client_pinned_albums');
          if (raw) localSavedAlbumIds = JSON.parse(raw);
        } catch (_) {}

        setAlbums(serverAlbums);
      } catch (_) {
        setAlbums([]);
      }

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu khách hàng:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // Cập nhật profile form khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCustomerData();
  };

  /**
   * Ghim thêm album vào kho bằng Mã Album hoặc Link
   */
  const handlePinAlbum = async (e) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;

    let cleanId = lookupInput.trim();
    if (cleanId.includes('/album/')) {
      const parts = cleanId.split('/album/');
      cleanId = parts[1].split('?')[0].split('/')[0];
    }

    setLookupLoading(true);
    try {
      const res = await albumApi.getAlbum(cleanId, lookupPasscode.trim());
      if (res.album) {
        const exists = albums.some(a => a._id === res.album._id);
        if (!exists) {
          const newAlbumItem = {
            _id: res.album._id,
            title: res.album.title,
            status: res.album.status || 'selecting',
            createdAt: res.album.createdAt,
            hasPasscode: Boolean(res.album.passcode),
            passcode: lookupPasscode.trim(),
            maxSelect: res.album.maxSelect || 0,
            allowDownload: res.album.allowDownload !== undefined ? res.album.allowDownload : true,
            imagesCount: Array.isArray(res.album.images) ? res.album.images.length : 0,
            selectedCount: Array.isArray(res.album.selectedImages) ? res.album.selectedImages.length : 0,
            clientInfo: res.album.clientInfo || {},
            photographerName: res.album.photographerName || 'Studio Photodate',
            coverImage: res.album.coverImage || (res.album.images?.[0]?.thumbnailUrl) || ''
          };
          setAlbums(prev => [newAlbumItem, ...prev]);

          // Lưu local pinned
          try {
            const raw = localStorage.getItem('client_pinned_albums') || '[]';
            const parsed = JSON.parse(raw);
            if (!parsed.includes(res.album._id)) {
              localStorage.setItem('client_pinned_albums', JSON.stringify([...parsed, res.album._id]));
            }
          } catch (_) {}
        }
        showToast('success', `Đã liên kết thành công Album "${res.album.title}" vào tài khoản của bạn!`);
        setLookupInput('');
        setLookupPasscode('');
      }
    } catch (err) {
      showToast('error', err.message || 'Không tìm thấy Album với mã này hoặc mã bảo vệ không chính xác.');
    } finally {
      setLookupLoading(false);
    }
  };

  /**
   * Hủy lịch booking (nếu đang ở trạng thái pending)
   */
  const handleCancelBooking = async (booking) => {
    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy đơn booking "${booking.code || booking.categoryTitle}" không?`);
    if (!confirmCancel) return;

    try {
      if (booking._id) {
        await photographerApi.updateBookingStatus(booking._id, 'cancelled');
      }

      // Cập nhật local state
      setBookings(prev => prev.map(b => {
        if (b._id === booking._id || b.code === booking.code) {
          return { ...b, status: '❌ Đã Hủy' };
        }
        return b;
      }));

      // Cập nhật localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('user_my_bookings') || '[]');
        const updated = saved.map(b => {
          if (b._id === booking._id || b.code === booking.code) {
            return { ...b, status: '❌ Đã Hủy' };
          }
          return b;
        });
        localStorage.setItem('user_my_bookings', JSON.stringify(updated));
      } catch (_) {}

      showToast('success', 'Đã hủy đơn booking thành công.');
    } catch (err) {
      showToast('error', 'Không thể hủy đơn. Vui lòng liên hệ Studio trực tiếp để được hỗ trợ.');
    }
  };

  /**
   * Lưu thông tin cá nhân khách hàng
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim() || !profileData.phone.trim()) {
      showToast('error', 'Vui lòng nhập đầy đủ Họ tên và Số điện thoại.');
      return;
    }

    setProfileSaving(true);
    try {
      if (currentUser?._id) {
        await userApi.updateProfile(currentUser._id, {
          name: profileData.name.trim(),
          phone: profileData.phone.trim(),
          address: profileData.address.trim()
        });
      }

      updateCurrentUser({
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
        address: profileData.address.trim()
      });

      showToast('success', 'Cập nhật thông tin khách hàng thành công!');
    } catch (err) {
      showToast('error', err.message || 'Không thể lưu thông tin hồ sơ.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Tính toán thống kê tổng quan
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => (b.status || '').includes('Chờ') || b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => (b.status || '').includes('Đã Xác Nhận') || b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => (b.status || '').includes('Đã Chụp') || b.status === 'completed').length;

    const totalAlbums = albums.length;
    const totalSelected = albums.reduce((acc, a) => acc + (a.selectedCount || 0), 0);

    const studioNames = new Set();
    bookings.forEach(b => {
      if (b.photographerName) studioNames.add(b.photographerName);
    });
    albums.forEach(a => {
      if (a.photographerName) studioNames.add(a.photographerName);
    });

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalAlbums,
      totalSelected,
      totalStudios: studioNames.size || (totalBookings > 0 ? 1 : 0)
    };
  }, [bookings, albums]);

  // Lọc danh sách booking theo bộ lọc và tìm kiếm
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const bStatus = (b.status || '').toLowerCase();
      if (bookingFilter === 'pending' && !bStatus.includes('chờ') && b.status !== 'pending') return false;
      if (bookingFilter === 'confirmed' && !bStatus.includes('xác nhận') && b.status !== 'confirmed') return false;
      if (bookingFilter === 'completed' && !bStatus.includes('chụp') && b.status !== 'completed') return false;
      if (bookingFilter === 'cancelled' && !bStatus.includes('hủy') && b.status !== 'cancelled') return false;

      if (bookingSearch.trim()) {
        const q = bookingSearch.trim().toLowerCase();
        const codeMatch = (b.code || '').toLowerCase().includes(q);
        const nameMatch = (b.photographerName || '').toLowerCase().includes(q);
        const catMatch = (b.categoryTitle || '').toLowerCase().includes(q);
        const locMatch = (b.cityLocation || '').toLowerCase().includes(q);
        return codeMatch || nameMatch || catMatch || locMatch;
      }

      return true;
    });
  }, [bookings, bookingFilter, bookingSearch]);

  // Lọc danh sách album theo tìm kiếm
  const filteredAlbums = useMemo(() => {
    if (!albumSearch.trim()) return albums;
    const q = albumSearch.trim().toLowerCase();
    return albums.filter(a =>
      (a.title || '').toLowerCase().includes(q) ||
      (a.photographerName || '').toLowerCase().includes(q) ||
      (a._id || '').toLowerCase().includes(q)
    );
  }, [albums, albumSearch]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">

      {/* Toast Notice */}
      {notice && (
        <div className={`fixed top-24 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center space-x-3 text-sm animate-fade-in ${
          notice.type === 'error'
            ? 'bg-red-500/15 border-red-500/30 text-red-300'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
        }`}>
          {notice.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Top Banner: Không Gian Khách Hàng */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#141720] via-[#10131c] to-[#0c0d12] border border-[#242938] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="px-3 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TÀI KHOẢN KHÁCH HÀNG</span>
              </span>
              {(currentUser?.phone || currentUser?.email) && (
                <span className="text-xs text-gray-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                  {currentUser?.phone || currentUser?.email}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">{currentUser?.name || 'Quý Khách'}</span> 👋
            </h1>

            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Không gian cá nhân dành riêng cho bạn: Dễ dàng theo dõi tiến độ đơn chụp ảnh, tra cứu và nhận trọn bộ Album ảnh, tick chọn ảnh đẹp nhất để Studio chỉnh sửa.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => navigate('/bookings')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Đặt Lịch Chụp Mới</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-[#171b26] hover:bg-[#202636] border border-[#2e374d] rounded-xl text-gray-300 hover:text-white transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={logout}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards - 4 Thống kê cá nhân cho Khách Hàng */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Card 1: Đơn Đặt Lịch */}
        <div
          onClick={() => setActiveTab('bookings')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-[#181d2a] border-amber-500/50 shadow-lg shadow-amber-500/5'
              : 'bg-[#12151e] border-[#222838] hover:border-[#323b52]'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đơn Booking</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalBookings}</div>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            {stats.pendingBookings > 0 ? (
              <span className="text-amber-300 font-semibold">{stats.pendingBookings} đơn chờ duyệt</span>
            ) : (
              `${stats.confirmedBookings} đơn đã xác nhận`
            )}
          </p>
        </div>

        {/* Card 2: Kho Album Của Bạn */}
        <div
          onClick={() => setActiveTab('albums')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'albums'
              ? 'bg-[#181d2a] border-blue-500/50 shadow-lg shadow-blue-500/5'
              : 'bg-[#12151e] border-[#222838] hover:border-[#323b52]'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kho Album Ảnh</span>
            <FolderOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalAlbums}</div>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            {stats.totalAlbums > 0 ? 'Sẵn sàng xem & chọn ảnh' : 'Chưa có album liên kết'}
          </p>
        </div>

        {/* Card 3: Ảnh Đã Chọn Lọc */}
        <div className="p-4 sm:p-5 rounded-2xl border bg-[#12151e] border-[#222838]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ảnh Đã Chọn</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalSelected}</div>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            Tổng ảnh đã gửi yêu cầu retouch
          </p>
        </div>

        {/* Card 4: Studio Hợp Tác */}
        <div className="p-4 sm:p-5 rounded-2xl border bg-[#12151e] border-[#222838]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Studio Đã Đặt</span>
            <Camera className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalStudios}</div>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
            Đối tác chụp ảnh cùng bạn
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center space-x-2 border-b border-[#242938] pb-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Đơn Đặt Lịch Của Tôi</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
            activeTab === 'bookings' ? 'bg-amber-950 text-amber-300' : 'bg-white/10 text-gray-300'
          }`}>
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('albums')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'albums'
              ? 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Kho Album Ảnh Của Tôi</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
            activeTab === 'albums' ? 'bg-amber-950 text-amber-300' : 'bg-white/10 text-gray-300'
          }`}>
            {albums.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Thông Tin Cá Nhân</span>
        </button>
      </div>

      {/* TAB 1: ĐƠN ĐẶT LỊCH CỦA TÔI */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Tất Cả' },
                { id: 'pending', label: '⏳ Chờ Xác Nhận' },
                { id: 'confirmed', label: '✓ Đã Xác Nhận' },
                { id: 'completed', label: '📸 Đã Chụp Xong' },
                { id: 'cancelled', label: '❌ Đã Hủy' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    bookingFilter === f.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'bg-[#141722] hover:bg-[#1d2232] text-gray-300 border border-[#2b3347]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, Studio, gói..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#141722] border border-[#2b3347] focus:border-amber-400 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="py-16 text-center bg-[#12151f] border border-[#242b3d] rounded-3xl p-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Chưa có đơn đặt lịch nào phù hợp</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                {bookings.length === 0
                  ? 'Bạn chưa có lịch hẹn chụp ảnh nào được ghi nhận. Hãy khám phá ngay các Nhiếp ảnh gia chuyên nghiệp!'
                  : 'Không tìm thấy đơn đặt lịch nào khớp với bộ lọc hiện tại.'}
              </p>
              <button
                onClick={() => navigate('/bookings')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 font-bold rounded-xl text-xs sm:text-sm shadow-md hover:scale-105 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Đặt Lịch Chụp Ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredBookings.map((b, idx) => {
                const isPending = (b.status || '').includes('Chờ') || b.status === 'pending';
                const isConfirmed = (b.status || '').includes('Xác Nhận') || b.status === 'confirmed';
                const isCompleted = (b.status || '').includes('Chụp') || b.status === 'completed';
                const isCancelled = (b.status || '').includes('Hủy') || b.status === 'cancelled';

                return (
                  <div
                    key={b._id || b.code || idx}
                    className="bg-[#141722] border border-[#252c3f] hover:border-[#384360] rounded-2xl p-5 sm:p-6 transition-all space-y-4 shadow-lg flex flex-col justify-between"
                  >
                    {/* Header: Code & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-amber-400 text-sm tracking-wide">
                            {b.code || `BK-${(b._id || '').slice(-6).toUpperCase()}`}
                          </span>
                          <button
                            onClick={() => copyToClipboard(b.code || b._id, b.code || idx)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Sao chép mã đơn"
                          >
                            {copiedKey === (b.code || idx) ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Đặt lúc: {b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isCompleted
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : isCancelled
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {b.status || '⏳ Chờ Xác Nhận'}
                      </span>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-2.5 pt-2 border-t border-[#1f2636] text-xs sm:text-sm">
                      <div className="flex items-center justify-between text-gray-200">
                        <span className="text-gray-400 font-medium">Studio / Nhiếp Ảnh Gia:</span>
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>{b.photographerName || 'Studio Photodate'}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-200">
                        <span className="text-gray-400 font-medium">Gói Chụp Ảnh:</span>
                        <span className="font-semibold text-amber-300">
                          {b.categoryTitle || b.category || 'Chụp Ảnh'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-200">
                        <span className="text-gray-400 font-medium">Ngày & Khung Giờ:</span>
                        <span className="text-gray-200 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            <strong className="text-white">{b.bookingDate || b.date}</strong>
                            {b.timeSlot && <span className="text-amber-300 ml-1.5 font-medium">• {b.timeSlot}</span>}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-200">
                        <span className="text-gray-400 font-medium">Địa Điểm:</span>
                        <span className="text-gray-300 truncate max-w-[220px] flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{b.cityLocation || b.location || 'Hà Nội'}</span>
                        </span>
                      </div>

                      {b.note && (
                        <div className="p-2.5 bg-[#0e1017] rounded-xl border border-[#222838] text-xs text-gray-300 italic">
                          "{b.note}"
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-[#1f2636] flex items-center justify-between gap-2">
                      <a
                        href={`https://zalo.me/${(b.customerPhone || '0988888888').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1b2130] hover:bg-[#252e42] border border-[#2f3952] rounded-xl text-xs font-semibold text-gray-200 hover:text-white transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Liên Hệ Studio</span>
                      </a>

                      {isPending && (
                        <button
                          onClick={() => handleCancelBooking(b)}
                          className="px-2.5 py-1.5 text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          Hủy Đơn
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KHO ALBUM ẢNH CỦA TÔI */}
      {activeTab === 'albums' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Lookup Box: Nhập mã để ghim nhanh album mới */}
          <div className="bg-[#141722] border border-[#2b3347] rounded-3xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Ghim Thêm Album Mới Của Bạn</span>
            </div>
            <p className="text-xs text-gray-400">
              Nếu Studio gửi mã Album hoặc đường link riêng, hãy nhập vào đây để lưu vĩnh viễn vào tài khoản của bạn.
            </p>
            <form onSubmit={handlePinAlbum} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <input
                type="text"
                placeholder="Dán link hoặc Mã Album (VD: 676abc...)"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#0d0e14] border border-[#2b3347] focus:border-amber-400 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
              />
              <input
                type="text"
                placeholder="Mã PIN/Passcode (nếu có)"
                value={lookupPasscode}
                onChange={(e) => setLookupPasscode(e.target.value)}
                className="sm:w-44 px-4 py-2.5 bg-[#0d0e14] border border-[#2b3347] focus:border-amber-400 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
              />
              <button
                type="submit"
                disabled={lookupLoading || !lookupInput.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-amber-950 font-bold rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap"
              >
                {lookupLoading ? 'Đang kiểm tra...' : 'Ghim Vào Kho'}
              </button>
            </form>
          </div>

          {/* Search Box */}
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-gray-300">
              Danh Sách Album Bàn Giao ({filteredAlbums.length})
            </h3>
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên album..."
                value={albumSearch}
                onChange={(e) => setAlbumSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#141722] border border-[#2b3347] focus:border-amber-400 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>

          {/* Album Cards Grid */}
          {filteredAlbums.length === 0 ? (
            <div className="py-16 text-center bg-[#12151f] border border-[#242b3d] rounded-3xl p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Chưa có album ảnh nào</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                Sau khi buổi chụp hoàn tất, Studio sẽ tải ảnh lên và gắn số điện thoại/email của bạn. Album sẽ tự động hiển thị tại đây!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAlbums.map((album) => {
                const isSelecting = album.status === 'selecting';
                const hasSelected = (album.selectedCount || 0) > 0;

                return (
                  <div
                    key={album._id}
                    className="bg-[#141722] border border-[#252c3f] hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-44 bg-[#0a0b10] overflow-hidden">
                      {album.coverImage ? (
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                          <FileImage className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs">Chưa có ảnh bìa</span>
                        </div>
                      )}

                      {/* Status Tag on Image */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                          isSelecting
                            ? 'bg-amber-500/90 text-amber-950'
                            : 'bg-emerald-500/90 text-emerald-950'
                        }`}>
                          {isSelecting ? 'Đang Chọn Ảnh' : 'Đã Chốt Danh Sách'}
                        </span>
                      </div>

                      {album.hasPasscode && (
                        <div className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-amber-300">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Album Info */}
                    <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors line-clamp-1">
                          {album.title}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center space-x-1">
                          <Camera className="w-3 h-3 text-gray-500" />
                          <span>{album.photographerName || 'Studio Photodate'}</span>
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="pt-2 border-t border-[#1f2636] flex items-center justify-between text-xs text-gray-400">
                        <span>Tổng: <strong className="text-white">{album.imagesCount || 0}</strong> ảnh</span>
                        <span>Đã chọn: <strong className="text-amber-400">{album.selectedCount || 0}</strong> ảnh</span>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => navigate(`/album/${album._id}${album.passcode ? `?passcode=${encodeURIComponent(album.passcode)}` : ''}`)}
                        className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] transition-all"
                      >
                        <span>Vào Xem & Chọn Ảnh</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HỒ SƠ & THÔNG TIN KHÁCH HÀNG */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-[#141722] border border-[#252c3f] rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-amber-400" />
              <span>Thông Tin Cá Nhân Của Bạn</span>
            </h3>
            <p className="text-xs text-gray-400">
              Thông tin này giúp Studio liên hệ gửi ảnh và tự động điền nhanh mỗi khi bạn đặt lịch chụp mới.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Họ và Tên Khách Hàng <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-4 py-2.5 bg-[#0d0e14] border border-[#2b3347] focus:border-amber-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Số Điện Thoại / Zalo <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="VD: 0988888888"
                  className="w-full px-4 py-2.5 bg-[#0d0e14] border border-[#2b3347] focus:border-amber-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Email Nhận Thông Báo
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  title="Email đăng nhập không thể thay đổi"
                  className="w-full px-4 py-2.5 bg-[#0d0e14]/50 border border-[#202534] rounded-xl text-sm text-gray-400 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Địa Chỉ / Khu Vực Cư Trú & Chụp Ảnh</span>
                {profileData.address && (
                  <span className="text-[11px] text-amber-400 font-normal">
                    Hiện tại: {profileData.address}
                  </span>
                )}
              </label>
              <AddressSelector
                value={profileData.address}
                onChange={(addr) => {
                  setProfileData(prev => ({
                    ...prev,
                    address: addr.fullAddress || prev.address
                  }));
                }}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-sm shadow-md transition-all flex items-center space-x-2"
              >
                {profileSaving ? (
                  <span>Đang Lưu...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Lưu Thay Đổi Thông Tin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default CustomerWorkspace;
