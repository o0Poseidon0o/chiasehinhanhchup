import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Settings, 
  RefreshCw, 
  Plus, 
  Image as ImageIcon, 
  User, 
  Phone, 
  AlertTriangle,
  FileText,
  Filter,
  FolderSync,
  Edit3,
  Download,
  MessageSquare,
  Hash,
  ShieldAlert,
  KeyRound,
  LogOut,
  Loader2,
  Users,
  Award,
  Camera,
  Sparkles,
  Calendar,
  Star
} from 'lucide-react';
import { albumApi } from '../api/albumApi';
import { getPublicBaseUrl } from '../utils/formatters';
import { EditAlbumModal } from '../components/admin/EditAlbumModal';
import { AdminUserManagement } from '../components/admin/AdminUserManagement';
import { AdminPhotographersHub } from '../components/admin/AdminPhotographersHub';
import { AdminCategoriesManagement } from '../components/admin/AdminCategoriesManagement';
import { AdminBookingsManagement } from '../components/admin/AdminBookingsManagement';
import { AdminReviewsManagement } from '../components/admin/AdminReviewsManagement';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('albums'); // 'albums' | 'photographers' | 'bookings' | 'users' | 'categories'
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [copiedLink, setCopiedLink] = useState(null);

  // State xác thực Admin
  const [isAuthorized, setIsAuthorized] = useState(Boolean(sessionStorage.getItem('adminPassword')));
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // State cho việc sửa cài đặt Album
  const [editingAlbum, setEditingAlbum] = useState(null);

  // State cho việc đồng bộ Drive từ Dashboard
  const [syncingId, setSyncingId] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [dashboardNotice, setDashboardNotice] = useState(null);

  // State cho Modal xác nhận xóa
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    album: null,
    isBulk: false,
    loading: false
  });

  const fetchAlbums = useCallback(async () => {
    if (!sessionStorage.getItem('adminPassword')) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await albumApi.getAll();
      setAlbums(res.data || []);
      setIsAuthorized(true);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách album.');
      if (err.message.includes('Mật khẩu Admin') || err.message.includes('401')) {
        sessionStorage.removeItem('adminPassword');
        setIsAuthorized(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) {
      setAuthError('Vui lòng nhập mật khẩu Admin.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      await albumApi.adminLogin(adminPasswordInput.trim());
      sessionStorage.setItem('adminPassword', adminPasswordInput.trim());
      setIsAuthorized(true);
      fetchAlbums();
    } catch (err) {
      setAuthError(err.message || 'Mật khẩu Admin không chính xác.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminPassword');
    setIsAuthorized(false);
    setAlbums([]);
  };

  /**
   * Tự động đồng bộ toàn bộ Album từ Google Drive một lượt
   */
  const handleSyncAll = async () => {
    try {
      setSyncingAll(true);
      const res = await albumApi.syncAll();
      setDashboardNotice({
        type: 'success',
        text: res.message || 'Đã đồng bộ toàn bộ album thành công!'
      });
      await fetchAlbums();
    } catch (err) {
      setDashboardNotice({
        type: 'error',
        text: `Lỗi đồng bộ toàn bộ: ${err.message}`
      });
    } finally {
      setSyncingAll(false);
      setTimeout(() => setDashboardNotice(null), 8000);
    }
  };

  /**
   * Đồng bộ ảnh từ Google Drive cho 1 album đơn lẻ
   */
  const handleSyncAlbum = async (album) => {
    try {
      setSyncingId(album._id);
      const res = await albumApi.syncDrivePhotos(album._id, album.manageToken);
      setDashboardNotice({
        type: 'success',
        text: `"${album.title}": ${res.message}`
      });
      await fetchAlbums();
    } catch (err) {
      setDashboardNotice({
        type: 'error',
        text: `Lỗi đồng bộ "${album.title}": ${err.message}`
      });
    } finally {
      setSyncingId(null);
      setTimeout(() => setDashboardNotice(null), 6000);
    }
  };

  /**
   * Sao chép link vào clipboard
   */
  const handleCopy = (text, type, id) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(`${type}-${id}`);
    setTimeout(() => {
      setCopiedLink(null);
    }, 2000);
  };

  /**
   * Chọn / Bỏ chọn 1 album
   */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Chọn / Bỏ chọn tất cả album đang hiển thị
   */
  const selectAllFiltered = (filtered) => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a._id));
    }
  };

  /**
   * Mở modal xóa đơn lẻ
   */
  const openDeleteSingle = (album) => {
    setDeleteModal({
      isOpen: true,
      album,
      isBulk: false,
      loading: false
    });
  };

  /**
   * Mở modal xóa nhiều album đã chọn
   */
  const openDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      album: null,
      isBulk: true,
      loading: false
    });
  };

  /**
   * Thực hiện xóa album sau khi xác nhận
   */
  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));
      if (deleteModal.isBulk) {
        await albumApi.deleteBulk(selectedIds);
        setSelectedIds([]);
      } else if (deleteModal.album) {
        await albumApi.deleteAlbum(deleteModal.album._id, deleteModal.album.manageToken);
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.album._id));
      }
      setDeleteModal({ isOpen: false, album: null, isBulk: false, loading: false });
      await fetchAlbums();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa album.');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Lọc danh sách album theo từ khóa tìm kiếm & trạng thái
   */
  const filteredAlbums = albums.filter((album) => {
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = (album.title || '').toLowerCase().includes(q);
    const clientNameMatch = (album.clientInfo?.name || '').toLowerCase().includes(q);
    const phoneMatch = (album.clientInfo?.phone || '').toLowerCase().includes(q);
    const matchesSearch = !q || titleMatch || clientNameMatch || phoneMatch;

    if (!matchesSearch) return false;

    if (statusFilter === 'selecting') return album.status === 'selecting';
    if (statusFilter === 'submitted') return album.status === 'submitted';
    if (statusFilter === 'locked') return album.status === 'locked';

    return true;
  });

  /**
   * Tính toán thống kê nhanh
   */
  const stats = {
    total: albums.length,
    selecting: albums.filter((a) => a.status === 'selecting').length,
    submitted: albums.filter((a) => a.status === 'submitted').length,
    locked: albums.filter((a) => a.status === 'locked').length,
    totalSelectedPhotos: albums.reduce((acc, a) => acc + (a.selectedCount || 0), 0)
  };

  const getStatusBadge = (status, selectedCount) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã chốt ({selectedCount} ảnh)</span>
          </span>
        );
      case 'locked':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 border border-zinc-600/30 text-zinc-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Đã khóa</span>
          </span>
        );
      case 'selecting':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gold-950/60 border border-gold-500/30 text-gold-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang chọn</span>
          </span>
        );
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 sm:p-8 bg-[#141210] border border-[#2b2722] rounded-3xl shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
        <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gold-100">Bảo Vệ Trang Quản Trị</h2>
          <p className="text-xs text-[#a2998a] leading-relaxed">
            Trang này dành riêng cho Admin/Chủ sở hữu. Vui lòng nhập Mật khẩu Admin để truy cập toàn bộ Album.
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-300 text-xs rounded-xl flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-400/60" />
            <input
              type="password"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              placeholder="Nhập mật khẩu Admin..."
              className="w-full bg-[#1a1816] border border-[#2b2722] rounded-xl pl-10 pr-4 py-3 text-sm text-[#f5eedf] focus:outline-none focus:border-gold-500 transition-all placeholder:text-[#554e44]"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <span>XÁC NHẬN ĐĂNG NHẬP</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  const getTabHeader = () => {
    switch (activeTab) {
      case 'bookings':
        return {
          icon: <Calendar className="w-5 h-5 text-gold-400" />,
          title: 'Quản Lý Lịch Booking & Tư Vấn',
          subtitle: 'Theo dõi đơn đặt lịch chụp từ khách hàng, duyệt lịch, phân bổ Studio & quản lý tiến độ.'
        };
      case 'photographers':
        return {
          icon: <Camera className="w-5 h-5 text-gold-400" />,
          title: 'Quản Lý Nhiếp Ảnh Gia & Duyệt Hồ Sơ',
          subtitle: 'Duyệt hồ sơ đăng ký nhiếp ảnh gia mới, theo dõi danh sách studio chuyên nghiệp.'
        };
      case 'users':
        return {
          icon: <Users className="w-5 h-5 text-gold-400" />,
          title: 'Quản Lý Khách Hàng & Phân Quyền',
          subtitle: 'Quản lý tài khoản hệ thống, cấp quyền Master Admin, Studio hoặc Khách hàng.'
        };
      case 'categories':
        return {
          icon: <Sparkles className="w-5 h-5 text-amber-300" />,
          title: 'Quản Lý Thể Loại & Giao Diện CMS',
          subtitle: 'Tùy chỉnh danh mục thể loại dịch vụ chụp ảnh và nội dung giao diện landing page.'
        };
      case 'reviews':
        return {
          icon: <Star className="w-5 h-5 text-gold-400 fill-gold-400" />,
          title: 'Quản Lý Đánh Giá & Điểm Uy Tín',
          subtitle: 'Kiểm duyệt nhận xét đánh giá từ Khách hàng, ẩn nhận xét rác và quản lý độ uy tín Studio.'
        };
      case 'albums':
      default:
        return {
          icon: <FolderKanban className="w-5 h-5 text-gold-400" />,
          title: 'Quản Lý Album & Dọn Dẹp',
          subtitle: 'Xem toàn bộ link album khách hàng, theo dõi trạng thái chọn ảnh, cập nhật từ Drive.'
        };
    }
  };

  const currentHeader = getTabHeader();

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Dynamic Header Bar per Active Tab */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#221f1c] pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
              {currentHeader.icon}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-100 tracking-tight">
              {currentHeader.title}
            </h1>
          </div>
          <p className="text-sm text-[#a2998a] max-w-2xl leading-relaxed">
            {currentHeader.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Nút Đồng bộ toàn bộ Album (Chỉ hiện khi chọn tab Albums) */}
          {activeTab === 'albums' && (
            <>
              <button
                onClick={handleSyncAll}
                disabled={syncingAll || loading || albums.length === 0}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1d1a17] hover:bg-[#282420] border border-gold-500/30 hover:border-gold-500/60 text-gold-300 font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 shadow-md hover:scale-[1.01]"
                title="Tự động quét và cập nhật ảnh mới từ Google Drive cho tất cả các album"
              >
                <FolderSync className={`w-4 h-4 text-gold-400 ${syncingAll ? 'animate-spin' : ''}`} />
                <span>{syncingAll ? 'Đang đồng bộ...' : 'Đồng bộ tất cả'}</span>
              </button>

              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold text-xs sm:text-sm shadow-lg shadow-gold-500/10 transition-all hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tạo Album Mới</span>
              </Link>
            </>
          )}

          <button
            onClick={fetchAlbums}
            disabled={loading || syncingAll}
            className="p-2.5 rounded-xl bg-[#1d1a17] hover:bg-[#282420] border border-[#2f2923] text-[#cfc5b4] transition-all hover:text-gold-300 disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          </button>

          <button
            onClick={handleAdminLogout}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#1d1a17] hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/50 text-red-300 text-xs sm:text-sm font-medium transition-all"
            title="Đăng xuất khỏi trang Admin"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation: Sleek 5-column Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-2 bg-[#12100e] rounded-2xl border border-[#2b2722] shadow-inner">
        <button
          onClick={() => setActiveTab('albums')}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'albums'
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-gold-950 shadow-md shadow-gold-500/20 scale-[1.01]'
              : 'text-[#a2998a] hover:text-white hover:bg-[#1a1714]'
          }`}
        >
          <FolderKanban className="w-4 h-4 shrink-0" />
          <span className="truncate">Kho Album ({albums.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'bookings'
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-gold-950 shadow-md shadow-gold-500/20 scale-[1.01]'
              : 'text-[#a2998a] hover:text-white hover:bg-[#1a1714]'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="truncate">Lịch Booking</span>
        </button>

        <button
          onClick={() => setActiveTab('photographers')}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'photographers'
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-gold-950 shadow-md shadow-gold-500/20 scale-[1.01]'
              : 'text-[#a2998a] hover:text-white hover:bg-[#1a1714]'
          }`}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span className="truncate">Nhiếp Ảnh Gia</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-gold-950 shadow-md shadow-gold-500/20 scale-[1.01]'
              : 'text-[#a2998a] hover:text-white hover:bg-[#1a1714]'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span className="truncate">Khách Hàng & User</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'categories'
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-gold-950 shadow-md shadow-gold-500/20 scale-[1.01]'
              : 'text-[#a2998a] hover:text-white hover:bg-[#1a1714]'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
          <span className="truncate">Thể Loại & CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'reviews'
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-gold-950 shadow-md shadow-gold-500/20 scale-[1.01]'
              : 'text-[#a2998a] hover:text-white hover:bg-[#1a1714]'
          }`}
        >
          <Star className="w-4 h-4 shrink-0 text-amber-300 fill-amber-300" />
          <span className="truncate">⭐ Đánh Giá & Uy Tín</span>
        </button>
      </div>

      {activeTab === 'bookings' ? (
        <AdminBookingsManagement />
      ) : activeTab === 'photographers' ? (
        <AdminPhotographersHub />
      ) : activeTab === 'users' ? (
        <AdminUserManagement />
      ) : activeTab === 'categories' ? (
        <AdminCategoriesManagement />
      ) : activeTab === 'reviews' ? (
        <AdminReviewsManagement />
      ) : (
        <>
      {/* Notice Banner */}
      {dashboardNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs sm:text-sm animate-fadeIn shadow-lg ${
            dashboardNotice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          {dashboardNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed font-medium">{dashboardNotice.text}</div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141210] p-5 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Tổng Album</span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-extrabold text-gold-100">{stats.total}</span>
            <FolderKanban className="w-5 h-5 text-gold-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-5 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Đang Chọn Ảnh</span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-extrabold text-gold-400">{stats.selecting}</span>
            <Clock className="w-5 h-5 text-gold-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-5 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Đã Gửi Chốt</span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-extrabold text-emerald-400">{stats.submitted}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-5 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Ảnh Khách Đã Chọn</span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-extrabold text-gold-200">{stats.totalSelectedPhotos}</span>
            <ImageIcon className="w-5 h-5 text-gold-400/50" />
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8474]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên album, tên khách, SĐT..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f0e0c] border border-[#2a251f] rounded-xl text-sm text-[#f5eedf] placeholder-[#6b6255] focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#8e8474] mr-1 hidden sm:block" />
          {[
            { id: 'all', label: 'Tất cả', count: stats.total },
            { id: 'selecting', label: 'Đang chọn', count: stats.selecting },
            { id: 'submitted', label: 'Đã chốt', count: stats.submitted },
            { id: 'locked', label: 'Đã khóa', count: stats.locked }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                statusFilter === tab.id
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                  : 'bg-[#1a1714] text-[#8e8474] hover:text-[#cfc5b4] border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-[#a2998a]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-gold-500/10 border border-gold-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-2 text-sm text-gold-200">
            <span className="font-bold">{selectedIds.length}</span>
            <span>album đã được chọn</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-1.5 rounded-xl bg-[#221f1c] hover:bg-[#2c2723] text-xs font-semibold text-[#a2998a] hover:text-[#cfc5b4] transition-colors"
            >
              Bỏ chọn tất cả
            </button>
            <button
              onClick={openDeleteBulk}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa {selectedIds.length} album đã chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Album List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gold-500" />
          <p className="text-sm text-[#8e8474]">Đang tải danh sách album...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-950/20 border border-red-500/20 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchAlbums}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-300 border border-red-500/30 transition-all"
          >
            Thử lại
          </button>
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#141210] rounded-3xl border border-[#24201b]">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gold-200">Không tìm thấy album nào</h2>
            <p className="text-xs text-[#8e8474] max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Không có album nào khớp với bộ lọc hiện tại. Thử xóa tìm kiếm hoặc chọn bộ lọc khác.'
                : 'Chưa có album nào được tạo. Hãy bấm nút dưới đây để tạo album đầu tiên.'}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-gold-950 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Album Ngay</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Row for Selection */}
          <div className="flex items-center justify-between px-4 text-xs font-semibold text-[#8e8474]">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredAlbums.length && filteredAlbums.length > 0}
                onChange={() => selectAllFiltered(filteredAlbums)}
                className="w-4 h-4 rounded border-[#3a332a] bg-[#141210] text-gold-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Chọn tất cả ({filteredAlbums.length} album)</span>
            </div>
            <span>Hành động</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-3">
            {filteredAlbums.map((album) => {
              const base = getPublicBaseUrl();
              const clientUrl = `${base}/album/${album._id}`;
              const manageUrl = `${base}/album/${album._id}/manage?token=${album.manageToken}`;
              const isSelected = selectedIds.includes(album._id);
              const formattedDate = album.createdAt 
                ? new Date(album.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Chưa rõ';

              const isSyncing = syncingId === album._id;

              return (
                <div
                  key={album._id}
                  className={`bg-[#141210] p-5 rounded-2xl border transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isSelected ? 'border-gold-500/50 bg-gold-500/[0.02]' : 'border-[#24201b] hover:border-[#3a332a]'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(album._id)}
                      className="w-4 h-4 mt-1 rounded border-[#3a332a] bg-[#0c0b0a] text-gold-500 focus:ring-0 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                    />

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-bold text-base text-gold-100 truncate max-w-md">
                          {album.title}
                        </h2>
                        {getStatusBadge(album.status, album.selectedCount)}
                        {album.hasPasscode && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#221f1c] text-[#a2998a] border border-[#332e29]">
                            PIN
                          </span>
                        )}
                      </div>

                      {/* Meta info bar */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#8e8474]">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-gold-400/70" />
                          <span>Tổng: <strong className="text-[#cfc5b4]">{album.imagesCount}</strong> ảnh</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />
                          <span>Đã chọn: <strong className="text-emerald-300">{album.selectedCount}</strong> ảnh</span>
                        </span>

                        <span className="flex items-center gap-1 bg-[#1a1714] px-2 py-0.5 rounded-md border border-[#26211a]">
                          <Hash className="w-3 h-3 text-gold-400" />
                          <span>Tối đa: <strong className="text-gold-200">{album.maxSelect > 0 ? `${album.maxSelect} ảnh` : 'Không giới hạn'}</strong></span>
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

                        <span>Ngày: <strong className="text-[#cfc5b4]">{formattedDate}</strong></span>
                      </div>

                      {/* Customer info if submitted */}
                      {album.clientInfo?.name && (
                        <div className="bg-[#0e0d0b] p-2.5 rounded-xl border border-[#221f1c] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#cfc5b4]">
                          <span className="flex items-center gap-1.5 font-medium text-gold-300">
                            <User className="w-3.5 h-3.5" />
                            {album.clientInfo.name}
                          </span>
                          {album.clientInfo.phone && (
                            <a 
                              href={`tel:${album.clientInfo.phone}`}
                              className="flex items-center gap-1.5 text-[#a2998a] hover:text-gold-400 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {album.clientInfo.phone}
                            </a>
                          )}
                          {album.clientInfo.note && (
                            <span className="flex items-center gap-1.5 text-[#8e8474] italic truncate max-w-xs">
                              <FileText className="w-3.5 h-3.5" />
                              "{album.clientInfo.note}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#221f1c] justify-end">
                    {/* Sửa Cài đặt nhanh (Modal) */}
                    <button
                      onClick={() => setEditingAlbum(album)}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 hover:border-gold-500/50 text-gold-300 hover:text-gold-200 text-xs font-bold transition-all"
                      title="Chỉnh sửa số ảnh chọn, quyền tải, ghi chú & mã PIN"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Cài đặt</span>
                    </button>

                    {/* Sync from Google Drive */}
                    <button
                      onClick={() => handleSyncAlbum(album)}
                      disabled={isSyncing}
                      className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#1a1714] hover:bg-[#26221d] border border-[#2b2722] hover:border-gold-500/40 text-[#cfc5b4] hover:text-gold-300 text-xs font-semibold transition-all disabled:opacity-50"
                      title="Đồng bộ lại khi bạn vừa upload thêm ảnh mới lên Google Drive"
                    >
                      <FolderSync className={`w-3.5 h-3.5 text-gold-400 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Đang quét...' : 'Đồng bộ'}</span>
                    </button>

                    {/* Copy Client Link */}
                    <button
                      onClick={() => handleCopy(clientUrl, 'client', album._id)}
                      className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#1a1714] hover:bg-[#26221d] border border-[#2b2722] text-[#cfc5b4] hover:text-gold-200 text-xs font-semibold transition-all"
                      title="Sao chép link gửi cho khách"
                    >
                      {copiedLink === `client-${album._id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Link Khách</span>
                        </>
                      )}
                    </button>

                    {/* View as Client */}
                    <a
                      href={clientUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#1a1714] hover:bg-[#26221d] border border-[#2b2722] text-[#8e8474] hover:text-gold-300 transition-all"
                      title="Mở giao diện khách hàng xem thử"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Go to Manage page */}
                    <Link
                      to={manageUrl}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#1a1714] hover:bg-[#26221d] border border-[#2b2722] text-[#cfc5b4] hover:text-gold-200 text-xs font-semibold transition-all"
                    >
                      <Settings className="w-3.5 h-3.5 text-gold-400" />
                      <span>Chi tiết</span>
                    </Link>

                    {/* Delete Album */}
                    <button
                      onClick={() => openDeleteSingle(album)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 transition-all"
                      title="Xóa album để giải phóng bộ nhớ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Cài Đặt Nhanh */}
      {editingAlbum && (
        <EditAlbumModal
          isOpen={Boolean(editingAlbum)}
          onClose={() => setEditingAlbum(null)}
          album={editingAlbum}
          token={editingAlbum.manageToken}
          onSaved={() => {
            fetchAlbums();
            setDashboardNotice({
              type: 'success',
              text: `Đã cập nhật cài đặt cho album "${editingAlbum.title}" thành công!`
            });
            setTimeout(() => setDashboardNotice(null), 5000);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#181512] border border-[#2e2821] max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-rose-200">
                  {deleteModal.isBulk ? `Xóa ${selectedIds.length} Album Đã Chọn` : 'Xác Nhận Xóa Album'}
                </h3>
                <span className="text-xs text-rose-400/80">Hành động này không thể hoàn tác</span>
              </div>
            </div>

            <div className="text-sm text-[#cfc5b4] bg-[#100e0c] p-4 rounded-2xl border border-[#26211a] space-y-2">
              {deleteModal.isBulk ? (
                <p>
                  Bạn có chắc chắn muốn xóa vĩnh viễn <strong className="text-gold-200">{selectedIds.length} album</strong> đã chọn không? Link khách hàng của các album này sẽ ngừng hoạt động ngay lập tức.
                </p>
              ) : (
                <p>
                  Bạn có chắc chắn muốn xóa album <strong className="text-gold-200">"{deleteModal.album?.title}"</strong> không? Link gửi cho khách hàng sẽ không thể truy cập sau khi xóa.
                </p>
              )}
              <p className="text-xs text-[#8e8474]">
                Việc xóa album cũ giúp giải phóng bộ nhớ database và giữ danh sách của bạn luôn gọn gàng.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, album: null, isBulk: false, loading: false })}
                disabled={deleteModal.loading}
                className="px-4 py-2.5 rounded-xl bg-[#221f1c] hover:bg-[#2c2723] text-[#a2998a] hover:text-[#cfc5b4] text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteModal.loading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteModal.loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{deleteModal.isBulk ? `Xóa ${selectedIds.length} album` : 'Xác nhận xóa'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
