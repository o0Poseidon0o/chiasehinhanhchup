import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FolderOpen, 
  Lock, 
  Settings, 
  Download, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  PlusCircle,
  User,
  Phone,
  Camera,
  LogOut,
  FolderKanban,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Award,
  Globe,
  MapPin,
  Briefcase,
  X,
  FileText,
  Trash2,
  Layers,
  FolderSync,
  Edit3,
  Hash,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { albumApi } from '../api/albumApi';
import { photographerApi } from '../api/photographerApi';
import { userApi } from '../api/userApi';
import { getPublicBaseUrl, formatDate, generateClientShareText } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { EditAlbumModal } from '../components/admin/EditAlbumModal';

export const StudioWorkspace = () => {
  const { currentUser, logout } = useAuth();
  const [searchParams] = useSearchParams();

  // Tab: 'albums' | 'clients' | 'bookings' | 'profile'
  const [activeTab, setActiveTab] = useState('albums');

  // Stats & Overview
  const [overview, setOverview] = useState({
    totalAlbums: 0,
    submittedAlbums: 0,
    selectingAlbums: 0,
    totalSelectedPhotos: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0
  });

  // Data states
  const [albums, setAlbums] = useState([]);
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notice, setNotice] = useState(null);

  // Edit Album Modal State
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [deleteAlbumModal, setDeleteAlbumModal] = useState({
    isOpen: false,
    album: null,
    loading: false
  });

  // Modal Create Album State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    driveFolderUrl: '',
    clientName: '',
    clientPhone: '',
    clientNote: '',
    passcode: '',
    maxSelect: 0,
    allowDownload: true,
    allowComment: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdSuccess, setCreatedSuccess] = useState(null);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState(null);

  // Open Create Modal from Booking or Client
  const handleOpenCreateFromBooking = useCallback((booking) => {
    setCreateFormData({
      title: booking.title || `Album ${booking.clientName || 'Khách'} - ${booking.category || 'Chụp Ảnh'}`,
      driveFolderUrl: '',
      clientName: booking.clientName || '',
      clientPhone: booking.clientPhone || '',
      clientNote: booking.note || '',
      passcode: '',
      maxSelect: 0,
      allowDownload: true,
      allowComment: true
    });
    setCreatedSuccess(null);
    setCreateError('');
    setIsCreateModalOpen(true);
  }, []);

  // Listen to searchParams on mount/change
  useEffect(() => {
    const clientName = searchParams.get('clientName');
    const clientPhone = searchParams.get('clientPhone');
    const title = searchParams.get('title');
    const note = searchParams.get('note');
    if (clientName || clientPhone) {
      handleOpenCreateFromBooking({
        clientName,
        clientPhone,
        title,
        note
      });
    }
  }, [searchParams, handleOpenCreateFromBooking]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    studioInfo: {
      avatar: currentUser?.studioInfo?.avatar || '',
      avatarPosition: currentUser?.studioInfo?.avatarPosition || 'center',
      avatarPositionY: currentUser?.studioInfo?.avatarPositionY ?? 50,
      coverImage: currentUser?.studioInfo?.coverImage || '',
      coverPosition: currentUser?.studioInfo?.coverPosition || 'center',
      coverPositionY: currentUser?.studioInfo?.coverPositionY ?? 50,
      coverFit: currentUser?.studioInfo?.coverFit || 'cover',
      startingPrice: currentUser?.studioInfo?.startingPrice || '',
      portfolioUrl: currentUser?.studioInfo?.portfolioUrl || '',
      experience: currentUser?.studioInfo?.experience || '',
      equipment: currentUser?.studioInfo?.equipment || '',
      styles: currentUser?.studioInfo?.styles || '',
      location: currentUser?.studioInfo?.location || '',
      bio: currentUser?.studioInfo?.bio || ''
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [testDriveStatus, setTestDriveStatus] = useState(null);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        studioInfo: {
          avatar: currentUser.studioInfo?.avatar || '',
          avatarPosition: currentUser.studioInfo?.avatarPosition || 'center',
          avatarPositionY: currentUser.studioInfo?.avatarPositionY ?? 50,
          coverImage: currentUser.studioInfo?.coverImage || '',
          coverPosition: currentUser.studioInfo?.coverPosition || 'center',
          coverPositionY: currentUser.studioInfo?.coverPositionY ?? 50,
          coverFit: currentUser.studioInfo?.coverFit || 'cover',
          startingPrice: currentUser.studioInfo?.startingPrice || '',
          portfolioUrl: currentUser.studioInfo?.portfolioUrl || '',
          experience: currentUser.studioInfo?.experience || '',
          equipment: currentUser.studioInfo?.equipment || '',
          styles: currentUser.studioInfo?.styles || '',
          location: currentUser.studioInfo?.location || '',
          bio: currentUser.studioInfo?.bio || ''
        }
      });
    }
  }, [currentUser]);

  // Load all photographer data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ovRes, albRes, cliRes, bkRes] = await Promise.all([
        photographerApi.getOverview(),
        photographerApi.getAlbums(),
        photographerApi.getClients(),
        photographerApi.getBookings()
      ]);
      setOverview(ovRes.data || {});
      setAlbums(albRes.data || []);
      setClients(cliRes.data || []);
      setBookings(bkRes.data || []);
    } catch (err) {
      console.error('Fetch photographer data error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Copy link
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle Create Album Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      const payload = {
        ...createFormData,
        photographerId: currentUser?._id || 'photographer_pro',
        photographerName: currentUser?.name || 'Studio Pro',
        photographerEmail: currentUser?.email || ''
      };

      const res = await albumApi.create(payload);
      setCreatedSuccess(res.data);
      setNotice({ type: 'success', message: `Đã tạo album "${res.data.title}" thành công!` });
      await fetchData();
    } catch (err) {
      setCreateError(err.message || 'Không thể tạo album. Vui lòng kiểm tra lại link Google Drive.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Create Demo Album
  const handleCreateDemoAlbum = async () => {
    try {
      setLoading(true);
      const demoPayload = {
        title: 'Bộ Ảnh Pre-Wedding Hàn Quốc (Album Mẫu Demo)',
        driveFolderUrl: 'https://drive.google.com/drive/folders/demo-potonow-sample',
        clientName: 'Nguyễn Hà & Minh Triết',
        clientPhone: '0987654321',
        clientNote: 'Yêu cầu tone màu ấm tự nhiên, chốt 20 hình đẹp nhất.',
        passcode: '8888',
        maxSelect: 20,
        photographerId: currentUser?._id || 'photographer_pro',
        photographerName: currentUser?.name || 'Studio Partner',
        photographerEmail: currentUser?.email || ''
      };

      const res = await albumApi.create(demoPayload);
      setNotice({ type: 'success', message: `Đã khởi tạo Album Mẫu "${res.data?.title || 'Demo'}" thành công!` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể tạo album mẫu.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Booking Status
  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      await photographerApi.updateBookingStatus(bookingId, newStatus);
      setNotice({ type: 'success', message: 'Đã cập nhật trạng thái lịch booking thành công!' });

      try {
        const saved = localStorage.getItem('user_my_bookings');
        if (saved) {
          const list = JSON.parse(saved);
          const statusTextMap = {
            confirmed: '✓ Đã Xác Nhận',
            completed: '📸 Đã Chụp Xong',
            cancelled: '❌ Đã Hủy',
            pending: '⏳ Chờ Xác Nhận'
          };
          const updated = list.map(b => {
            const matchCode = b.code && (String(bookingId).includes(b.code) || b.code.includes(String(bookingId).slice(-6).toUpperCase()));
            if (String(b._id) === String(bookingId) || matchCode) {
              return { ...b, status: statusTextMap[newStatus] || newStatus };
            }
            return b;
          });
          localStorage.setItem('user_my_bookings', JSON.stringify(updated));
        }
      } catch (_) {}

      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể cập nhật lịch.' });
    }
  };

  // Đồng bộ ảnh từ Google Drive cho 1 album đơn lẻ
  const handleSyncAlbum = async (album) => {
    try {
      setSyncingId(album._id);
      const res = await albumApi.syncDrivePhotos(album._id, album.manageToken);
      setNotice({
        type: 'success',
        message: `"${album.title}": ${res.message || 'Đồng bộ ảnh Google Drive thành công!'}`
      });
      await fetchData();
    } catch (err) {
      setNotice({
        type: 'error',
        message: `Lỗi đồng bộ "${album.title}": ${err.message}`
      });
    } finally {
      setSyncingId(null);
      setTimeout(() => setNotice(null), 6000);
    }
  };

  // Xóa Album
  const confirmDeleteAlbum = async () => {
    if (!deleteAlbumModal.album) return;
    try {
      setDeleteAlbumModal(prev => ({ ...prev, loading: true }));
      await albumApi.deleteAlbum(deleteAlbumModal.album._id, deleteAlbumModal.album.manageToken);
      setNotice({ type: 'success', message: `Đã xóa album "${deleteAlbumModal.album.title}" thành công!` });
      setDeleteAlbumModal({ isOpen: false, album: null, loading: false });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa album.');
      setDeleteAlbumModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle Update Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?._id || currentUser._id === 'master_admin') {
      setNotice({ type: 'info', message: 'Tài khoản Master Admin không cần cập nhật hồ sơ Studio.' });
      return;
    }
    setProfileLoading(true);
    try {
      const res = await userApi.updateProfile(currentUser._id, profileForm);
      if (res.user) {
        sessionStorage.setItem('user', JSON.stringify(res.user));
      }
      setNotice({ type: 'success', message: 'Đã lưu cập nhật hồ sơ Studio & Avatar thành công!' });
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể lưu thông tin.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Export Clients to CSV
  const handleExportClientsCSV = () => {
    if (clients.length === 0) return;
    const headers = ['Họ Tên Khách', 'Số Điện Thoại', 'Email', 'Album Đã Chụp', 'Tổng Ảnh Đã Chọn', 'Hoạt Động Gần Nhất'];
    const rows = clients.map(c => [
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.albums?.map(a => a.albumTitle).join('; ') || ''}"`,
      `"${c.totalSelectedPhotos || 0}"`,
      `"${formatDate(c.latestActivity)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_ba_khach_hang_${currentUser?.name || 'studio'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Albums
  const filteredAlbums = albums.filter(a => {
    if (statusFilter === 'selecting' && a.status !== 'selecting') return false;
    if (statusFilter === 'submitted' && a.status !== 'submitted') return false;
    if (statusFilter === 'locked' && a.status !== 'locked') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title?.toLowerCase().includes(q);
      const matchClient = a.clientInfo?.name?.toLowerCase().includes(q);
      const matchPhone = a.clientInfo?.phone?.includes(q);
      if (!matchTitle && !matchClient && !matchPhone) return false;
    }
    return true;
  });

  // Filtered Clients
  const filteredClients = clients.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchPhone = c.phone?.includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.clientName?.toLowerCase().includes(q);
      const matchPhone = b.clientPhone?.includes(q);
      const matchCat = b.category?.toLowerCase().includes(q);
      const matchLoc = b.location?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCat && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 1. STUDIO HEADER & QUICK STATS BAR */}
      <div className="bg-gradient-to-r from-[#141720] via-[#1a1f2c] to-[#141720] border border-[#2b3245] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 uppercase tracking-wider shadow-sm">
                Studio Workspace & CRM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                🔒 Dữ Liệu Cách Ly Riêng Tư
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {currentUser?.email}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {currentUser?.name || 'Không Gian Làm Việc Studio'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
              Không gian quản lý bảo mật của riêng bạn: Chỉ hiển thị Kho Album, Khách Hàng CRM và Lịch Booking chụp ảnh do Khách Hàng đặt riêng Studio của bạn.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap">
            <button
              onClick={() => {
                setCreatedSuccess(null);
                setCreateError('');
                setIsCreateModalOpen(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Tạo Album Mới</span>
            </button>

            <button
              onClick={fetchData}
              title="Làm mới dữ liệu"
              className="p-3 bg-[#0c0d12] hover:bg-[#202738] border border-[#2b3245] text-gray-300 rounded-2xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATS COUNTERS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#242938]">
          <div className="bg-[#0c0d12]/70 border border-[#242938] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
              <span>Kho Album</span>
              <FolderKanban className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{overview.totalAlbums || albums.length}</div>
            <div className="text-[11px] text-gray-400">{overview.submittedAlbums || 0} album đã chốt</div>
          </div>

          <div className="bg-[#0c0d12]/70 border border-[#242938] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
              <span>Khách Hàng Của Tôi</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">{clients.length}</div>
            <div className="text-[11px] text-gray-400">Danh bạ khách hàng riêng</div>
          </div>

          <div className="bg-[#0c0d12]/70 border border-[#242938] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
              <span>Lịch Booking</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 flex items-center space-x-1.5">
              <span>{overview.totalBookings || bookings.length}</span>
              {overview.pendingBookings > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-purple-500 text-purple-950">
                  +{overview.pendingBookings} MỚI
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-400">{overview.confirmedBookings || 0} lịch đã xác nhận</div>
          </div>

          <div className="bg-[#0c0d12]/70 border border-[#242938] rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
              <span>Ảnh Khách Đã Chọn</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{overview.totalSelectedPhotos || 0}</div>
            <div className="text-[11px] text-gray-400">Tất cả album đã nộp</div>
          </div>
        </div>
      </div>

      {/* NOTICE BANNER */}
      {notice && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm animate-fade-in ${
          notice.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : notice.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. TAB NAVIGATION (4 MAIN TABS) */}
      <div className="flex items-center space-x-2 bg-[#141720] p-1.5 rounded-2xl border border-[#242938] overflow-x-auto">
        <button
          onClick={() => { setActiveTab('albums'); setSearchQuery(''); }}
          className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'albums'
              ? 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>📁 Kho Album Của Tôi ({albums.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('clients'); setSearchQuery(''); }}
          className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Khách Hàng Của Tôi ({clients.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('bookings'); setSearchQuery(''); }}
          className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Lịch Booking & Tư Vấn ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>⚙️ Hồ Sơ Studio</span>
        </button>
      </div>

      {/* TAB 1: KHO ALBUM CỦA TÔI */}
      {activeTab === 'albums' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141720] border border-[#242938] rounded-2xl p-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên album, khách..."
                className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'selecting', label: 'Đang chọn' },
                { id: 'submitted', label: 'Đã chốt' },
                { id: 'locked', label: 'Đã khóa' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    statusFilter === f.id
                      ? 'bg-amber-500 text-amber-950 font-bold'
                      : 'bg-[#0c0d12] text-gray-400 hover:text-white border border-[#242938]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Albums Grid */}
          {filteredAlbums.length === 0 ? (
            <div className="text-center py-16 bg-[#141720] border border-[#242938] rounded-3xl space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Kho Album Của Bạn Đang Trống</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Bấm <strong>"Tạo Album Mới"</strong> để gắn đường link Google Drive của bạn, hoặc bấm <strong>"Tạo Album Mẫu Demo"</strong> để thử nghiệm ngay quy trình gửi link và khách chốt ảnh!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo Album Mới</span>
                </button>
                <button
                  onClick={handleCreateDemoAlbum}
                  className="px-5 py-2.5 bg-[#0c0d12] hover:bg-[#1a202c] border border-amber-500/40 text-amber-300 hover:text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>⚡ Tạo Album Mẫu Demo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlbums.map(album => {
                const clientUrl = `${getPublicBaseUrl()}/album/${album._id}`;
                const manageUrl = `${getPublicBaseUrl()}/album/${album._id}/manage?token=${album.manageToken}`;
                const isSyncing = syncingId === album._id;

                return (
                  <div
                    key={album._id}
                    className="bg-[#141720] border border-[#242938] hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left side info */}
                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Header Row: Title & Status */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-bold text-base text-white truncate max-w-lg">
                          {album.title}
                        </h4>

                        {album.status === 'submitted' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã chốt ({album.selectedCount || 0} ảnh)</span>
                          </span>
                        ) : album.status === 'locked' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-800 border border-zinc-600/30 text-zinc-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Đã khóa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Đang chọn</span>
                          </span>
                        )}

                        {album.passcode && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#221f1c] text-gray-300 border border-[#332e29]">
                            PIN
                          </span>
                        )}
                      </div>

                      {/* Meta Info Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400/70" />
                          <span>Tổng: <strong className="text-gray-200">{album.photoCount || album.images?.length || 0}</strong> ảnh</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />
                          <span>Đã chọn: <strong className="text-emerald-300">{album.selectedCount || 0}</strong> ảnh</span>
                        </span>

                        <span className="flex items-center gap-1 bg-[#0c0d12] px-2 py-0.5 rounded-md border border-[#242938]">
                          <Hash className="w-3 h-3 text-amber-400" />
                          <span>Tối đa: <strong className="text-amber-300">{album.maxSelect > 0 ? `${album.maxSelect} ảnh` : 'Không giới hạn'}</strong></span>
                        </span>

                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] ${
                          album.allowDownload !== false ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' : 'bg-red-950/30 border-red-500/20 text-red-300'
                        }`}>
                          <Download className="w-3 h-3" />
                          <span>Tải ảnh: {album.allowDownload !== false ? 'Bật' : 'Tắt'}</span>
                        </span>

                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] ${
                          album.allowComment !== false ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' : 'bg-red-950/30 border-red-500/20 text-red-300'
                        }`}>
                          <MessageSquare className="w-3 h-3" />
                          <span>Ghi chú: {album.allowComment !== false ? 'Bật' : 'Tắt'}</span>
                        </span>

                        <span>Ngày: <strong className="text-gray-300">{formatDate(album.createdAt)}</strong></span>
                      </div>

                      {/* Client info banner box matching user screenshot */}
                      {album.clientInfo?.name && (
                        <div className="bg-[#0c0d12] p-2.5 rounded-xl border border-[#242938] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300">
                          <span className="flex items-center gap-1.5 font-bold text-white">
                            <User className="w-3.5 h-3.5 text-amber-400" />
                            {album.clientInfo.name}
                          </span>
                          {album.clientInfo.phone && (
                            <a 
                              href={`https://zalo.me/${album.clientInfo.phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-400 font-mono transition-colors font-semibold"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {album.clientInfo.phone}
                            </a>
                          )}
                          {album.clientInfo.note && (
                            <span className="flex items-center gap-1.5 text-gray-400 italic truncate max-w-sm">
                              <FileText className="w-3.5 h-3.5 text-gray-500" />
                              "{album.clientInfo.note}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#242938] justify-end">
                      {/* Cài đặt button */}
                      <button
                        onClick={() => setEditingAlbum(album)}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all"
                        title="Chỉnh sửa số ảnh chọn, quyền tải, ghi chú & mã PIN"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Cài đặt</span>
                      </button>

                      {/* Đồng bộ Drive */}
                      <button
                        onClick={() => handleSyncAlbum(album)}
                        disabled={isSyncing}
                        className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#0c0d12] hover:bg-[#1a202c] border border-[#242938] hover:border-amber-500/40 text-gray-300 hover:text-amber-300 text-xs font-semibold transition-all disabled:opacity-50"
                        title="Đồng bộ lại khi bạn vừa upload thêm ảnh mới lên Google Drive"
                      >
                        <FolderSync className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Đang quét...' : 'Đồng bộ'}</span>
                      </button>

                      {/* Copy Link Khách */}
                      <button
                        onClick={() => handleCopy(clientUrl, `client_${album._id}`)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#0c0d12] hover:bg-[#1a202c] border border-[#242938] text-gray-300 hover:text-white text-xs font-semibold transition-all"
                        title="Sao chép link gửi cho khách"
                      >
                        {copiedKey === `client_${album._id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                            <span>Link Khách</span>
                          </>
                        )}
                      </button>

                      {/* View as Client */}
                      <a
                        href={clientUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#0c0d12] hover:bg-[#1a202c] border border-[#242938] text-gray-400 hover:text-white transition-all"
                        title="Mở giao diện khách hàng xem thử"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Go to Manage page */}
                      <Link
                        to={manageUrl}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
                      >
                        <Settings className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chi tiết</span>
                      </Link>

                      {/* Delete Album */}
                      <button
                        onClick={() => setDeleteAlbumModal({ isOpen: true, album, loading: false })}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all"
                        title="Xóa album để giải phóng bộ nhớ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KHÁCH HÀNG CỦA TÔI (CUSTOMER CRM) */}
      {activeTab === 'clients' && (
        <div className="bg-[#141720] border border-[#242938] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Danh Bạ Khách Hàng Của Studio</h3>
              <p className="text-xs text-gray-400">
                Tất cả khách hàng đã từng đặt lịch hoặc nộp ảnh chọn với studio của bạn
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportClientsCSV}
                className="px-4 py-2 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Xuất Danh Bạ (CSV)</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên khách, số điện thoại, email..."
              className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#242938]">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0c0d12] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#242938]">
                <tr>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Số Điện Thoại / Zalo</th>
                  <th className="py-3 px-4">Album Đã Chụp</th>
                  <th className="py-3 px-4 text-center">Tổng Ảnh Đã Chọn</th>
                  <th className="py-3 px-4">Ghi Chú Của Khách</th>
                  <th className="py-3 px-4 text-right">Liên Hệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242938]">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                      Chưa có khách hàng nào trong danh bạ.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                            {client.name ? client.name.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <span>{client.name}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold">
                        {client.phone || <span className="text-gray-500 italic">Chưa có</span>}
                      </td>

                      {/* Albums */}
                      <td className="py-3.5 px-4">
                        {client.albums && client.albums.length > 0 ? (
                          <div className="space-y-1">
                            {client.albums.map((a, aIdx) => (
                              <Link
                                key={aIdx}
                                to={`/album/${a.albumId}`}
                                target="_blank"
                                className="block text-gray-300 hover:text-amber-400 font-medium truncate max-w-[200px]"
                              >
                                • {a.albumTitle}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Đặt lịch trực tiếp</span>
                        )}
                      </td>

                      {/* Selected Photos */}
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400 text-sm">
                        {client.totalSelectedPhotos || 0}
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 text-gray-400 italic max-w-[220px] truncate">
                        {client.albums?.[0]?.note || client.bookings?.[0]?.note || '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenCreateFromBooking({
                              clientName: client.name,
                              clientPhone: client.phone,
                              category: 'Ảnh Chọn',
                              note: client.albums?.[0]?.note || client.bookings?.[0]?.note || ''
                            })}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold rounded-xl text-[11px] transition-colors"
                            title="Tạo Album mới với thông tin khách này"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Tạo Album</span>
                          </button>

                          {client.phone ? (
                            <a
                              href={`https://zalo.me/${client.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] shadow-sm transition-colors"
                            >
                              <span>Chat Zalo</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LỊCH BOOKING & TƯ VẤN */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141720] border border-[#242938] rounded-2xl p-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên khách, SĐT, địa điểm..."
                className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'pending', label: 'Chờ duyệt' },
                { id: 'confirmed', label: 'Đã xác nhận' },
                { id: 'completed', label: 'Hoàn thành' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    statusFilter === f.id
                      ? 'bg-amber-500 text-amber-950 font-bold'
                      : 'bg-[#0c0d12] text-gray-400 hover:text-white border border-[#242938]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-[#141720] border border-[#242938] rounded-3xl space-y-3">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Chưa có lịch đặt chụp nào</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Khi khách hàng gửi yêu cầu tư vấn hoặc đặt lịch với bạn trên trang chủ, thông tin sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookings.map(b => (
                <div
                  key={b._id}
                  className="bg-[#141720] border border-[#242938] rounded-3xl p-5 space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          {b.category}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">{b.clientName}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : b.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                      }`}>
                        {b.status === 'confirmed' ? '✓ Đã xác nhận' : b.status === 'completed' ? '🎯 Đã chụp xong' : b.status === 'cancelled' ? '✗ Đã hủy' : '⏳ Chờ xác nhận'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#0c0d12] rounded-xl border border-[#242938] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-400">SĐT / Zalo:</span>
                        <a href={`https://zalo.me/${b.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-amber-400 font-mono font-bold hover:underline">
                          {b.clientPhone}
                        </a>
                      </div>
                      {b.bookingDate && (
                        <div className="flex items-center justify-between text-gray-300">
                          <span className="text-gray-400">Ngày dự kiến:</span>
                          <span className="text-white font-semibold">{b.bookingDate}</span>
                        </div>
                      )}
                      {(b.timeSlot || (b.note && String(b.note).includes('Khung giờ:'))) && (
                        <div className="flex items-center justify-between text-amber-300">
                          <span className="text-gray-400">Khung giờ:</span>
                          <span className="text-amber-400 font-bold">
                            {b.timeSlot || (b.note && String(b.note).match(/Khung giờ:\s*([^\]]+)/) ? String(b.note).match(/Khung giờ:\s*([^\]]+)/)[1] : '')}
                          </span>
                        </div>
                      )}
                      {b.location && (
                        <div className="flex items-center justify-between text-gray-300">
                          <span className="text-gray-400">Địa điểm:</span>
                          <span>{b.location}</span>
                        </div>
                      )}
                      {b.budget && (
                        <div className="flex items-center justify-between text-gray-300">
                          <span className="text-gray-400">Ngân sách:</span>
                          <span className="text-emerald-400 font-bold">{b.budget}</span>
                        </div>
                      )}
                      {b.note && (
                        <div className="text-[11px] text-gray-400 italic pt-1 border-t border-[#1a1f2c]">
                          Ghi chú: "{b.note}"
                        </div>
                      )}
                    </div>

                    {/* Conflict check warning badge */}
                    {(() => {
                      if (b.status !== 'pending' && b.status !== 'selecting' && b.status !== '⏳ Chờ xác nhận') return null;
                      
                      const parseTimeToMinutes = (tStr) => {
                        const match = String(tStr || '').match(/(\d{1,2}):(\d{2})/);
                        return match ? parseInt(match[1], 10) * 60 + parseInt(match[2], 10) : 0;
                      };
                      const extractRange = (item) => {
                        const text = `${item.timeSlot || ''} ${item.note || ''} ${item.conceptNote || ''}`;
                        const m = text.match(/(\d{1,2}:\d{2})\s*(?:➔|-|to)\s*(\d{1,2}:\d{2})/i);
                        return m ? { start: m[1], end: m[2] } : { start: '08:00', end: '18:00' };
                      };
                      const doOverlap = (s1, e1, s2, e2) => {
                        const minS1 = parseTimeToMinutes(s1), minE1 = parseTimeToMinutes(e1);
                        const minS2 = parseTimeToMinutes(s2), minE2 = parseTimeToMinutes(e2);
                        if (!minS1 || !minE1 || !minS2 || !minE2) return true;
                        return Math.max(minS1, minS2) < Math.min(minE1, minE2);
                      };

                      const curRange = extractRange(b);
                      const conflict = (bookings || []).find(cb => {
                        if (String(cb._id) === String(b._id)) return false;
                        const isConfirmed = cb.status === 'confirmed' || cb.status === 'completed' || (cb.status || '').includes('Xác nhận');
                        if (!isConfirmed) return false;
                        if (cb.bookingDate !== b.bookingDate) return false;
                        const cbRange = extractRange(cb);
                        return doOverlap(curRange.start, curRange.end, cbRange.start, cbRange.end);
                      });

                      if (!conflict) return null;

                      return (
                        <div className="p-3 bg-rose-950/70 border border-rose-500/60 rounded-xl space-y-1 text-xs text-rose-200 animate-pulse">
                          <div className="flex items-center space-x-1.5 font-bold text-rose-300">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>⚠️ TRÙNG LỊCH VỚI ĐƠN ĐÃ CHỐT</span>
                          </div>
                          <p className="text-[11px] leading-snug">
                            Khung giờ này ngày <strong className="text-white">{b.bookingDate}</strong> đã được chốt chính thức cho khách <strong className="text-amber-300">{conflict.clientName}</strong> ({conflict.clientPhone}).
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#242938]">
                    {/* Nút Tạo Album Cho Khách Này */}
                    <button
                      onClick={() => handleOpenCreateFromBooking(b)}
                      className="py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm transition-colors"
                      title="Tạo album từ link Drive với thông tin khách đã điền sẵn"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tạo Album Khách</span>
                    </button>

                    {b.status !== 'confirmed' && (
                      <button
                        onClick={() => handleBookingStatus(b._id, 'confirmed')}
                        className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Xác Nhận Lịch</span>
                      </button>
                    )}

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleBookingStatus(b._id, 'completed')}
                        className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-400 text-blue-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Đã Chụp Xong</span>
                      </button>
                    )}

                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => handleBookingStatus(b._id, 'cancelled')}
                        className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HỒ SƠ NĂNG LỰC STUDIO */}
      {activeTab === 'profile' && (
        <div className="bg-[#141720] border border-[#242938] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in max-w-2xl">
          <div>
            <h3 className="text-xl font-bold text-white">Hồ Sơ Năng Lực Studio</h3>
            <p className="text-xs text-gray-400">
              Thông tin hiển thị cho khách hàng và hồ sơ xét duyệt với Ban Quản Trị
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Avatar, Ảnh Bìa & Giá Khởi Điểm */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300">Ảnh Đại Diện (Avatar), Ảnh Bìa (Banner Studio) & Giá Khởi Điểm</label>
              
              {/* Row 1: Avatar & Starting Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0c0d12] p-4 rounded-2xl border border-[#242938]">
                {/* Avatar Uploader & Drag Alignment */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-amber-400 block">1. Ảnh Đại Diện (Avatar)</span>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-16 h-16 rounded-2xl bg-[#1c2230] border-2 border-dashed border-amber-500/40 overflow-hidden shrink-0 flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none group"
                      onMouseDown={(e) => {
                        if (!profileForm.studioInfo.avatar) return;
                        setIsDraggingAvatar(true);
                        const startY = e.clientY;
                        const initialPos = profileForm.studioInfo.avatarPositionY ?? 50;
                        const handleMouseMove = (moveEvent) => {
                          const deltaY = moveEvent.clientY - startY;
                          let newPos = Math.round(initialPos + deltaY * 1.2);
                          if (newPos < 0) newPos = 0;
                          if (newPos > 100) newPos = 100;
                          setProfileForm(prev => ({
                            ...prev,
                            studioInfo: { ...prev.studioInfo, avatarPositionY: newPos }
                          }));
                        };
                        const handleMouseUp = () => {
                          setIsDraggingAvatar(false);
                          window.removeEventListener('mousemove', handleMouseMove);
                          window.removeEventListener('mouseup', handleMouseUp);
                        };
                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      {profileForm.studioInfo.avatar ? (
                        <img
                          src={profileForm.studioInfo.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover pointer-events-none"
                          style={{ objectPosition: `50% ${profileForm.studioInfo.avatarPositionY ?? 50}%` }}
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'; }}
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-amber-400/60" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-[9px] font-bold text-amber-300">✋ Kéo ảnh</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 3 * 1024 * 1024) {
                                  alert('Dung lượng ảnh tối đa 3MB.');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProfileForm({
                                    ...profileForm,
                                    studioInfo: { ...profileForm.studioInfo, avatar: reader.result }
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Slider Căn vị trí Avatar */}
                      <div className="flex items-center space-x-2 pt-0.5">
                        <span className="text-[10px] text-gray-400 font-medium shrink-0">Căn vị trí:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={profileForm.studioInfo.avatarPositionY ?? 50}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            studioInfo: { ...profileForm.studioInfo, avatarPositionY: parseInt(e.target.value) }
                          })}
                          className="w-full h-1.5 bg-[#141720] rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">{profileForm.studioInfo.avatarPositionY ?? 50}%</span>
                      </div>

                      <input
                        type="url"
                        value={profileForm.studioInfo.avatar || ''}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          studioInfo: { ...profileForm.studioInfo, avatar: e.target.value }
                        })}
                        placeholder="Hoặc dán URL ảnh Avatar..."
                        className="w-full bg-[#141720] border border-[#242938] rounded-xl px-2.5 py-1 text-[11px] text-white outline-none truncate"
                      />
                    </div>
                  </div>
                </div>

                {/* Starting Price */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-amber-400 block">2. Giá Khởi Điểm Tham Khảo</span>
                  <input
                    type="text"
                    value={profileForm.studioInfo.startingPrice || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      studioInfo: { ...profileForm.studioInfo, startingPrice: e.target.value }
                    })}
                    placeholder="VD: 1.500.000đ"
                    className="w-full bg-[#141720] border border-[#242938] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                  <p className="text-[10px] text-gray-400">Hiển thị cho khách hàng xem ở trang tìm kiếm Nhiếp ảnh gia.</p>
                </div>
              </div>

              {/* Row 2: Banner / Cover Image Uploader & Interactive Drag Reposition */}
              <div className="bg-[#0c0d12] p-4 rounded-2xl border border-[#242938] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-400 block">3. Ảnh Bìa Studio (Banner Header Trang Cá Nhân)</span>
                  <span className="text-[10px] text-amber-300/90 font-medium">✋ Kéo giữ chuột vào ảnh để di chuyển vị trí</span>
                </div>

                {/* Banner Drag & Reposition Preview */}
                <div
                  className="h-36 w-full rounded-2xl overflow-hidden bg-[#1c2230] border-2 border-dashed border-amber-500/40 relative cursor-grab active:cursor-grabbing select-none group"
                  onMouseDown={(e) => {
                    if (!profileForm.studioInfo.coverImage) return;
                    setIsDraggingBanner(true);
                    const startY = e.clientY;
                    const initialPos = profileForm.studioInfo.coverPositionY ?? 50;
                    const handleMouseMove = (moveEvent) => {
                      const deltaY = moveEvent.clientY - startY;
                      let newPos = Math.round(initialPos + deltaY * 0.4);
                      if (newPos < 0) newPos = 0;
                      if (newPos > 100) newPos = 100;
                      setProfileForm(prev => ({
                        ...prev,
                        studioInfo: { ...prev.studioInfo, coverPositionY: newPos }
                      }));
                    };
                    const handleMouseUp = () => {
                      setIsDraggingBanner(false);
                      window.removeEventListener('mousemove', handleMouseMove);
                      window.removeEventListener('mouseup', handleMouseUp);
                    };
                    window.addEventListener('mousemove', handleMouseMove);
                    window.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  {profileForm.studioInfo.coverImage ? (
                    <img
                      src={profileForm.studioInfo.coverImage}
                      alt="Banner Header"
                      className={`w-full h-full pointer-events-none ${
                        profileForm.studioInfo.coverFit === 'contain' ? 'object-contain' : 'object-cover'
                      }`}
                      style={{ objectPosition: `50% ${profileForm.studioInfo.coverPositionY ?? 50}%` }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                      <Camera className="w-8 h-8 text-amber-400/50 mb-1" />
                      <span>Chưa chọn ảnh bìa (Hệ thống sẽ tự lấy ảnh từ Google Drive)</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-amber-300 bg-black/75 px-3 py-1.5 rounded-xl border border-amber-500/30">
                      {isDraggingBanner ? '✊ Đang di chuyển góc ảnh...' : '✋ Nhấn & Kéo chuột lên/xuống để di chuyển góc ảnh bìa'}
                    </span>
                  </div>
                </div>

                {/* Range Slider for Banner */}
                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">⬆️ Căn Đỉnh</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={profileForm.studioInfo.coverPositionY ?? 50}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      studioInfo: { ...profileForm.studioInfo, coverPositionY: parseInt(e.target.value) }
                    })}
                    className="w-full h-1.5 bg-[#141720] rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-[10px] font-bold text-gray-400 shrink-0">⬇️ Căn Đáy</span>
                  <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0 w-8 text-right">
                    {profileForm.studioInfo.coverPositionY ?? 50}%
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <label className="cursor-pointer shrink-0 w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all">
                    <Camera className="w-4 h-4" />
                    <span>Tải Ảnh Bìa Từ Máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Dung lượng ảnh tối đa 5MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileForm({
                              ...profileForm,
                              studioInfo: { ...profileForm.studioInfo, coverImage: reader.result }
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <input
                    type="url"
                    value={profileForm.studioInfo.coverImage || ''}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      studioInfo: { ...profileForm.studioInfo, coverImage: e.target.value }
                    })}
                    placeholder="Hoặc dán đường link URL ảnh bìa (VD: https://...)"
                    className="w-full bg-[#141720] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                {/* Căn Chỉnh Vị Trí & Khung Ảnh Bìa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#242938]/60">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Căn Vị Trí Cắt Ảnh Banner:</label>
                    <select
                      value={profileForm.studioInfo.coverPosition || 'center'}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        studioInfo: { ...profileForm.studioInfo, coverPosition: e.target.value }
                      })}
                      className="w-full bg-[#141720] border border-[#242938] text-amber-300 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                    >
                      <option value="center">🎯 Căn Giữa (Center)</option>
                      <option value="top">⬆️ Căn Đỉnh Trên (Top - Ưu tiên khuôn mặt)</option>
                      <option value="bottom">⬇️ Căn Đáy Dưới (Bottom - Ưu tiên chân dung)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Chế Độ Khung Banner:</label>
                    <select
                      value={profileForm.studioInfo.coverFit || 'cover'}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        studioInfo: { ...profileForm.studioInfo, coverFit: e.target.value }
                      })}
                      className="w-full bg-[#141720] border border-[#242938] text-amber-300 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                    >
                      <option value="cover">✂️ Lấp Đầy Khung (Cover - Tràn viền)</option>
                      <option value="contain">🖼️ Trọn Vẹn Gốc (Contain - Giữ tỷ lệ ảnh)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Studio / Nhiếp Ảnh Gia</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Số điện thoại / Zalo</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Khu vực hoạt động</label>
                <select
                  value={profileForm.studioInfo.location || 'Hà Nội'}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    studioInfo: { ...profileForm.studioInfo, location: e.target.value }
                  })}
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Nha Trang">Nha Trang</option>
                  <option value="Đà Lạt">Đà Lạt</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Huế">Huế</option>
                  <option value="Quảng Ninh">Quảng Ninh</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Toàn quốc (Nhận chụp xa)">Toàn quốc (Nhận chụp xa)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">Link Google Drive Thư Mục Tác Phẩm</label>
                <button
                  type="button"
                  onClick={async () => {
                    const url = profileForm.studioInfo.portfolioUrl;
                    if (!url || !url.includes('drive.google.com')) {
                      setTestDriveStatus({ type: 'error', message: 'Vui lòng dán đường link thư mục Google Drive.' });
                      return;
                    }
                    setTestDriveStatus({ type: 'loading', message: 'Đang kiểm tra quyền truy cập Google Drive...' });
                    try {
                      const res = await albumApi.parseDriveFolder(url);
                      if (res.images && res.images.length > 0) {
                        setTestDriveStatus({ type: 'success', message: `✅ Quét thành công ${res.images.length} bức ảnh nghệ thuật từ thư mục Google Drive của bạn!` });
                      } else {
                        setTestDriveStatus({ type: 'warning', message: '⚠️ Thư mục Google Drive đang ở chế độ Riêng tư (Private) hoặc chưa có ảnh. Vui lòng vào Google Drive -> Chia sẻ -> Đổi quyền thành "Bất kỳ ai có liên kết đều có thể xem".' });
                      }
                    } catch (err) {
                      setTestDriveStatus({ type: 'error', message: '⚠️ Thư mục Google Drive đang ở chế độ Riêng tư (Private). Vui lòng vào Google Drive -> Chia sẻ -> Đổi quyền thành "Bất kỳ ai có liên kết đều có thể xem".' });
                    }
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold rounded-lg transition-all flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Kiểm Tra Link Drive</span>
                </button>
              </div>
              <input
                type="url"
                value={profileForm.studioInfo.portfolioUrl}
                onChange={(e) => {
                  setTestDriveStatus(null);
                  setProfileForm({
                    ...profileForm,
                    studioInfo: { ...profileForm.studioInfo, portfolioUrl: e.target.value }
                  });
                }}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
              {testDriveStatus && (
                <div className={`mt-2 p-3 rounded-xl text-xs flex items-start space-x-2 ${
                  testDriveStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' :
                  testDriveStatus.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' :
                  testDriveStatus.type === 'loading' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300' :
                  'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}>
                  <span>{testDriveStatus.message}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Số năm kinh nghiệm</label>
                <select
                  value={profileForm.studioInfo.experience || '3 - 5 năm (Chuyên nghiệp)'}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    studioInfo: { ...profileForm.studioInfo, experience: e.target.value }
                  })}
                  className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Dưới 1 năm (Mới vào nghề)">Dưới 1 năm (Mới vào nghề)</option>
                  <option value="1 - 2 năm">1 - 2 năm kinh nghiệm</option>
                  <option value="3 - 5 năm (Chuyên nghiệp)">3 - 5 năm (Chuyên nghiệp)</option>
                  <option value="5 - 10 năm (Kỳ cựu)">5 - 10 năm (Kỳ cựu)</option>
                  <option value="Trên 10 năm (Master / Chuyên gia)">Trên 10 năm (Master / Chuyên gia)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Thiết bị máy ảnh / Lens</label>
                <input
                  type="text"
                  value={profileForm.studioInfo.equipment}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    studioInfo: { ...profileForm.studioInfo, equipment: e.target.value }
                  })}
                  placeholder="Sony A7IV, Canon R6..."
                  className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Thể loại sở trường (CHỌN NHIỀU TAG) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-gray-300">
                  Các thể loại sở trường <span className="text-amber-400 font-bold">(Có thể chọn nhiều) *</span>
                </label>
                <span className="text-[11px] text-gray-400">Bấm để chọn/bỏ chọn</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Chân dung nghệ thuật',
                  'Ảnh cưới & Pre-wedding',
                  'Kỷ yếu & Sinh viên',
                  'Gia đình & Em bé',
                  'Sự kiện & Doanh nghiệp',
                  'Lookbook & Thời trang',
                  'Đường phố & Phóng sự'
                ].map(style => {
                  const currentStr = profileForm.studioInfo.styles || '';
                  const isSelected = currentStr.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        const currentList = currentStr ? currentStr.split(',').map(s => s.trim()).filter(Boolean) : [];
                        const nextList = isSelected 
                          ? currentList.filter(s => s !== style)
                          : [...currentList, style];
                        setProfileForm({
                          ...profileForm,
                          studioInfo: { ...profileForm.studioInfo, styles: nextList.join(', ') }
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-amber-950 font-bold shadow-md scale-105'
                          : 'bg-[#0c0d12] hover:bg-[#1a202c] border border-[#242938] text-gray-400 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Giới thiệu ngắn về phong cách chụp</label>
              <textarea
                rows={3}
                value={profileForm.studioInfo.bio}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  studioInfo: { ...profileForm.studioInfo, bio: e.target.value }
                })}
                placeholder="Chia sẻ về góc máy, cảm xúc và phong cách đặc trưng của bạn..."
                className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center space-x-2"
            >
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu Thay Đổi Hồ Sơ</span>}
            </button>
          </form>
        </div>
      )}

      {/* 3. MODAL TẠO ALBUM MỚI TỪ GOOGLE DRIVE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#141720] border border-[#2b3245] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#f8fafc] my-8">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {createdSuccess ? (
              <div className="text-center space-y-4 py-3 animate-fade-in">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Tạo Album Thành Công!</h3>
                <p className="text-xs text-gray-300">
                  Album <strong>"{createdSuccess.title}"</strong> đã sẵn sàng với <strong>{createdSuccess.imagesCount || 0} ảnh</strong>.
                </p>

                <div className="p-3 bg-[#0c0d12] rounded-2xl border border-[#242938] text-xs space-y-3 text-left">
                  <div>
                    <span className="text-gray-400">Link gửi khách chọn ảnh:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        readOnly
                        value={`${getPublicBaseUrl()}/album/${createdSuccess.albumId}`}
                        className="w-full bg-[#141720] border border-[#2b3245] rounded-lg px-2.5 py-1.5 text-xs text-amber-300 outline-none select-all"
                      />
                      <button
                        onClick={() => handleCopy(`${getPublicBaseUrl()}/album/${createdSuccess.albumId}`, 'modal_client')}
                        className="px-3 py-1.5 bg-amber-500 text-amber-950 font-bold rounded-lg shrink-0"
                      >
                        {copiedKey === 'modal_client' ? 'Đã copy link!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#242938] flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Soạn sẵn tin nhắn cho khách:</span>
                    <button
                      onClick={() => {
                        const msg = generateClientShareText({
                          clientName: formClientName,
                          albumTitle: formTitle,
                          clientUrl: `${getPublicBaseUrl()}/album/${createdSuccess.albumId}`,
                          passcode: formPasscode
                        });
                        handleCopy(msg, 'modal_msg');
                      }}
                      className="px-3 py-1.5 bg-[#1f2430] hover:bg-[#282e3d] border border-amber-500/30 text-amber-300 font-bold rounded-lg text-xs"
                    >
                      {copiedKey === 'modal_msg' ? 'Đã copy tin nhắn!' : 'Copy Tin Nhắn Zalo'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Link
                    to={`/album/${createdSuccess.albumId}`}
                    target="_blank"
                    className="flex-1 py-3 bg-[#0c0d12] hover:bg-[#1a202c] border border-[#242938] rounded-xl text-xs font-bold text-center text-white"
                  >
                    Xem Trang Khách
                  </Link>
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setCreatedSuccess(null);
                    }}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl text-xs font-bold"
                  >
                    Hoàn Tất
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Tạo Album Mới Từ Google Drive</h3>
                  <p className="text-xs text-gray-400">Dán link thư mục Google Drive chứa ảnh gốc để quét tự động</p>
                </div>

                {/* Chọn nhanh từ Lịch Booking để Tự động điền Tên & SĐT */}
                {bookings.length > 0 && (
                  <div className="p-3 bg-[#0c0d12] rounded-2xl border border-amber-500/30 space-y-1.5 shadow-inner">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chọn nhanh từ Đơn Booking (Tự động điền Tên & SĐT tránh sai sót):</span>
                    </span>
                    <select
                      onChange={(e) => {
                        const bId = e.target.value;
                        if (!bId) return;
                        const b = bookings.find(item => item._id === bId);
                        if (b) {
                          setCreateFormData(prev => ({
                            ...prev,
                            title: `Album ${b.clientName} - ${b.category || 'Chụp Ảnh'}`,
                            clientName: b.clientName || '',
                            clientPhone: b.clientPhone || '',
                            clientNote: b.note || ''
                          }));
                        }
                      }}
                      className="w-full bg-[#141720] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-amber-500"
                    >
                      <option value="">-- Bấm vào đây để chọn khách từ danh sách Booking --</option>
                      {bookings.map(b => (
                        <option key={b._id} value={b._id}>
                          👤 {b.clientName} ({b.clientPhone}) — Gói: {b.category} [{b.bookingDate || 'Chưa hẹn ngày'}]
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Album / Buổi Chụp *</label>
                  <input
                    type="text"
                    required
                    value={createFormData.title}
                    onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                    placeholder="VD: Album Cưới Tuấn & Lan - Tràng An"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Link Thư Mục Google Drive *</label>
                  <input
                    type="text"
                    required
                    value={createFormData.driveFolderUrl}
                    onChange={(e) => setCreateFormData({ ...createFormData, driveFolderUrl: e.target.value })}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                  <span className="text-[10px] text-gray-500">Đảm bảo thư mục Drive đã bật quyền "Bất kỳ ai có đường liên kết đều có thể xem"</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                      <span>Tên Khách Hàng</span>
                      {createFormData.clientName && (
                        <span className="text-[10px] text-emerald-400 font-normal">✓ Đã có sẵn</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={createFormData.clientName}
                      onChange={(e) => setCreateFormData({ ...createFormData, clientName: e.target.value })}
                      placeholder="VD: Chị Lan"
                      className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                      <span>SĐT / Zalo Khách</span>
                      {createFormData.clientPhone && (
                        <span className="text-[10px] text-emerald-400 font-normal">✓ Đã có sẵn</span>
                      )}
                    </label>
                    <input
                      type="tel"
                      value={createFormData.clientPhone}
                      onChange={(e) => setCreateFormData({ ...createFormData, clientPhone: e.target.value })}
                      placeholder="0912345678"
                      className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Mã Passcode (Nếu có)</label>
                    <input
                      type="text"
                      value={createFormData.passcode}
                      onChange={(e) => setCreateFormData({ ...createFormData, passcode: e.target.value })}
                      placeholder="VD: 1234"
                      className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Số Ảnh Tối Đa Khách Chọn</label>
                    <input
                      type="number"
                      min={0}
                      value={createFormData.maxSelect}
                      onChange={(e) => setCreateFormData({ ...createFormData, maxSelect: Number(e.target.value) })}
                      placeholder="0 = Không giới hạn"
                      className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {createError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang quét ảnh từ Google Drive...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tạo Album & Quét Ảnh Ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Cài Đặt Nhanh Cho Nhiếp Ảnh Gia */}
      {editingAlbum && (
        <EditAlbumModal
          isOpen={Boolean(editingAlbum)}
          onClose={() => setEditingAlbum(null)}
          album={editingAlbum}
          token={editingAlbum.manageToken}
          onSaved={() => {
            fetchData();
            setNotice({
              type: 'success',
              message: `Đã cập nhật cài đặt cho album "${editingAlbum.title}" thành công!`
            });
            setTimeout(() => setNotice(null), 5000);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteAlbumModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141720] border border-[#2e2821] max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Xác Nhận Xóa Album</h3>
                <span className="text-xs text-red-400/80">Hành động này không thể hoàn tác</span>
              </div>
            </div>

            <div className="text-sm text-gray-300 bg-[#0c0d12] p-4 rounded-2xl border border-[#242938] space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa album <strong className="text-amber-400">"{deleteAlbumModal.album?.title}"</strong> không? Link gửi cho khách hàng sẽ không thể truy cập sau khi xóa.
              </p>
              <p className="text-xs text-gray-400">
                Việc xóa album giúp dọn dẹp không gian quản lý và giải phóng dung lượng.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteAlbumModal({ isOpen: false, album: null, loading: false })}
                disabled={deleteAlbumModal.loading}
                className="px-4 py-2.5 rounded-xl bg-[#0c0d12] hover:bg-[#1a202c] text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteAlbum}
                disabled={deleteAlbumModal.loading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {deleteAlbumModal.loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioWorkspace;
