import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Award, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  FileText, 
  Camera, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  X, 
  Loader2,
  Sparkles,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';
import { photographerApi } from '../../api/photographerApi';
import { userApi } from '../../api/userApi';
import { formatDate } from '../../utils/formatters';

export const AdminBookingsManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [photographerFilter, setPhotographerFilter] = useState('all');
  const [notice, setNotice] = useState(null);

  // Edit Modal State
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    photographerId: '',
    photographerName: '',
    category: '',
    bookingDate: '',
    location: '',
    budget: '',
    note: '',
    status: 'pending'
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    booking: null,
    loading: false
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [bkRes, phRes] = await Promise.all([
        photographerApi.getBookings(),
        userApi.getActivePhotographers().catch(() => ({ data: [] }))
      ]);
      setBookings(bkRes.data || []);
      setPhotographers(phRes.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách lịch booking.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Quick Status Change
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await photographerApi.updateBookingStatus(bookingId, newStatus);
      setNotice({ type: 'success', message: `Đã cập nhật trạng thái đơn sang "${newStatus}"!` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Lỗi khi đổi trạng thái đơn.' });
    } finally {
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Open Edit Modal
  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setEditFormData({
      clientName: booking.clientName || '',
      clientPhone: booking.clientPhone || '',
      clientEmail: booking.clientEmail || '',
      photographerId: booking.photographerId || '',
      photographerName: booking.photographerName || '',
      category: booking.category || 'Chân dung',
      bookingDate: booking.bookingDate || '',
      location: booking.location || '',
      budget: booking.budget || '',
      note: booking.note || '',
      status: booking.status || 'pending'
    });
    setEditError('');
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.clientName.trim() || !editFormData.clientPhone.trim()) {
      setEditError('Họ tên và số điện thoại là bắt buộc.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      await photographerApi.updateBooking(editingBooking._id, editFormData);
      setNotice({ type: 'success', message: 'Đã cập nhật chi tiết đơn booking thành công!' });
      setEditingBooking(null);
      await fetchData();
    } catch (err) {
      setEditError(err.message || 'Lỗi khi lưu thông tin booking.');
    } finally {
      setEditLoading(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Confirm Delete
  const confirmDeleteBooking = async () => {
    if (!deleteModal.booking) return;
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const targetId = deleteModal.booking._id;
      const targetPhone = deleteModal.booking.clientPhone;
      await photographerApi.deleteBooking(targetId);

      try {
        const saved = localStorage.getItem('user_my_bookings');
        if (saved) {
          const list = JSON.parse(saved);
          const updated = list.filter(b => 
            String(b._id) !== String(targetId) && 
            !b.code?.includes(String(targetId).slice(-6).toUpperCase()) &&
            !(b.customerPhone && b.customerPhone === targetPhone && b.categoryTitle === deleteModal.booking.category)
          );
          localStorage.setItem('user_my_bookings', JSON.stringify(updated));
        }
      } catch (_) {}

      setNotice({ type: 'success', message: 'Đã xóa đơn booking thành công.' });
      setDeleteModal({ isOpen: false, booking: null, loading: false });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa booking.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    } finally {
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Filter logic
  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (photographerFilter !== 'all' && b.photographerId !== photographerFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClient = b.clientName?.toLowerCase().includes(q);
      const matchPhone = b.clientPhone?.includes(q);
      const matchEmail = b.clientEmail?.toLowerCase().includes(q);
      const matchPhotographer = b.photographerName?.toLowerCase().includes(q);
      const matchCategory = b.category?.toLowerCase().includes(q);
      const matchLocation = b.location?.toLowerCase().includes(q);
      if (!matchClient && !matchPhone && !matchEmail && !matchPhotographer && !matchCategory && !matchLocation) {
        return false;
      }
    }
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs sm:text-sm animate-fadeIn shadow-lg ${
            notice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed font-medium">{notice.message}</div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Tổng Đơn Booking</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-gold-100">{stats.total}</span>
            <Calendar className="w-4 h-4 text-gold-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Chờ Xác Nhận</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-purple-400">{stats.pending}</span>
            <Clock className="w-4 h-4 text-purple-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Đã Xác Nhận</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-400">{stats.confirmed}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Hoàn Thành Chụp</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-blue-400">{stats.completed}</span>
            <Award className="w-4 h-4 text-blue-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Đã Hủy Đơn</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-red-400">{stats.cancelled}</span>
            <XCircle className="w-4 h-4 text-red-400/50" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8474]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khách, SĐT, studio, gói..."
            className="w-full pl-10 pr-4 py-2 bg-[#0f0e0c] border border-[#2a251f] rounded-xl text-xs sm:text-sm text-[#f5eedf] placeholder-[#6b6255] focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Photographer Filter */}
          <select
            value={photographerFilter}
            onChange={(e) => setPhotographerFilter(e.target.value)}
            className="bg-[#0f0e0c] border border-[#2a251f] text-xs text-gold-300 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">Tất cả Studio / Nhiếp Ảnh Gia</option>
            {photographers.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.studioInfo?.location || 'Toàn quốc'})
              </option>
            ))}
          </select>

          {/* Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'Tất cả', count: stats.total },
              { id: 'pending', label: 'Chờ duyệt', count: stats.pending },
              { id: 'confirmed', label: 'Đã xác nhận', count: stats.confirmed },
              { id: 'completed', label: 'Hoàn thành', count: stats.completed },
              { id: 'cancelled', label: 'Đã hủy', count: stats.cancelled }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1 ${
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

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-[#1a1714] hover:bg-[#221f1c] border border-[#2b2722] text-gold-300 rounded-xl transition-all"
            title="Làm mới danh sách booking"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gold-500" />
          <p className="text-sm text-[#8e8474]">Đang tải toàn bộ dữ liệu booking hệ thống...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#141210] rounded-3xl border border-[#24201b]">
          <Calendar className="w-12 h-12 mx-auto text-gold-500/40" />
          <h3 className="text-base font-bold text-gold-200">Không tìm thấy đơn booking nào</h3>
          <p className="text-xs text-[#8e8474] max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || photographerFilter !== 'all'
              ? 'Không có đơn nào khớp với bộ lọc hiện tại. Thử chọn lại bộ lọc hoặc xóa tìm kiếm.'
              : 'Hiện chưa có khách hàng nào gửi đơn đặt lịch qua hệ thống.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map(b => {
            const dateStr = b.createdAt ? formatDate(b.createdAt) : 'Chưa rõ';

            return (
              <div
                key={b._id}
                className="bg-[#141210] border border-[#24201b] hover:border-[#3a332a] rounded-2xl p-5 shadow-lg transition-all space-y-3"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#24201b] pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gold-500/10 text-gold-300 border border-gold-500/30">
                      {b.category || 'Gói Chụp'}
                    </span>
                    <h4 className="text-base font-bold text-gold-100">
                      Khách: <strong className="text-white">{b.clientName}</strong>
                    </h4>
                    <span className="text-xs text-[#8e8474]">• Đặt lúc: {dateStr}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
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
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Cột 1: Thông tin khách hàng */}
                  <div className="bg-[#0c0d10] p-3 rounded-xl border border-[#221f1c] space-y-1.5">
                    <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider block mb-1">
                      1. Thông Tin Khách Hàng
                    </span>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <User className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <strong className="text-white">{b.clientName}</strong>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <a
                        href={`https://zalo.me/${(b.clientPhone || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-300 hover:underline font-mono font-bold"
                      >
                        {b.clientPhone}
                      </a>
                      <a
                        href={`tel:${b.clientPhone}`}
                        className="text-[10px] text-gray-400 hover:text-white px-1.5 py-0.5 bg-[#1a1816] rounded border border-[#2b2722]"
                      >
                        Gọi điện
                      </a>
                    </div>
                    {b.clientEmail && (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{b.clientEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Cột 2: Studio phụ trách & Chi tiết chụp */}
                  <div className="bg-[#0c0d10] p-3 rounded-xl border border-[#221f1c] space-y-1.5">
                    <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider block mb-1">
                      2. Studio & Buổi Chụp
                    </span>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Camera className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <span>Studio: <strong className="text-gold-200">{b.photographerName || 'Chưa phân bổ'}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Ngày chụp: <strong className="text-white">{b.bookingDate || 'Chưa đặt ngày'}</strong></span>
                    </div>
                    {(b.timeSlot || (b.note && String(b.note).includes('Khung giờ:'))) && (
                      <div className="flex items-center space-x-2 text-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Khung giờ: <strong className="text-amber-400 font-bold">{b.timeSlot || (b.note && String(b.note).match(/Khung giờ:\s*([^\]]+)/) ? String(b.note).match(/Khung giờ:\s*([^\]]+)/)[1] : '')}</strong></span>
                      </div>
                    )}
                    {b.location && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{b.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Cột 3: Ngân sách & Ghi chú */}
                  <div className="bg-[#0c0d10] p-3 rounded-xl border border-[#221f1c] space-y-1.5">
                    <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider block mb-1">
                      3. Ngân Sách & Yêu Cầu
                    </span>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Ngân sách: <strong className="text-emerald-400">{b.budget || 'Tiêu chuẩn'}</strong></span>
                    </div>
                    <div className="flex items-start space-x-2 text-gray-400">
                      <FileText className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                      <span className="italic line-clamp-2">
                        {b.note ? `"${b.note}"` : 'Không có ghi chú thêm.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#24201b]">
                  {/* Quick status switch */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] text-[#8e8474] font-semibold mr-1">Chuyển trạng thái:</span>
                    {b.status !== 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(b._id, 'confirmed')}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg"
                      >
                        ✓ Xác Nhận
                      </button>
                    )}
                    {b.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(b._id, 'completed')}
                        className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-lg"
                      >
                        🎯 Đã Chụp Xong
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(b._id, 'cancelled')}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold rounded-lg"
                      >
                        ✗ Hủy Đơn
                      </button>
                    )}
                  </div>

                  {/* Edit & Delete & Contact */}
                  <div className="flex items-center space-x-2">
                    {/* Tạo Album Khách */}
                    <button
                      onClick={() => navigate(`/app?clientName=${encodeURIComponent(b.clientName || '')}&clientPhone=${encodeURIComponent(b.clientPhone || '')}&title=${encodeURIComponent(`Album ${b.clientName || 'Khách'} - ${b.category || 'Chụp Ảnh'}`)}&note=${encodeURIComponent(b.note || '')}`)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-bold rounded-xl transition-colors"
                      title="Mở form tạo album cho khách hàng này với Tên và SĐT đã tự động điền sẵn"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
                      <span>Tạo Album</span>
                    </button>

                    {/* Chat Zalo */}
                    {b.clientPhone && (
                      <a
                        href={`https://zalo.me/${b.clientPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-xl"
                      >
                        <span>Chat Zalo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Sửa thông tin booking */}
                    <button
                      onClick={() => openEditModal(b)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-bold rounded-xl"
                      title="Chỉnh sửa thông tin booking để hỗ trợ khách"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Đơn</span>
                    </button>

                    {/* Xóa booking */}
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, booking: b, loading: false })}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl"
                      title="Xóa đơn booking này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Chỉnh Sửa Chi Tiết Đơn Booking */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-[#181512] border border-[#2e2821] max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#2e2821] pb-3">
              <div className="flex items-center space-x-2 text-gold-300">
                <Edit3 className="w-5 h-5 text-gold-400" />
                <h3 className="font-bold text-base text-gold-100">Chỉnh Sửa Chi Tiết Đơn Booking</h3>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Họ Tên Khách Hàng *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.clientName}
                    onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                    className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Số Điện Thoại / Zalo *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.clientPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, clientPhone: e.target.value })}
                    className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Khách Hàng</label>
                <input
                  type="email"
                  value={editFormData.clientEmail}
                  onChange={(e) => setEditFormData({ ...editFormData, clientEmail: e.target.value })}
                  placeholder="khachhang@gmail.com"
                  className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Gán Cho Studio / Nhiếp Ảnh Gia</label>
                  <select
                    value={editFormData.photographerId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const selected = photographers.find(p => p._id === pId);
                      setEditFormData({
                        ...editFormData,
                        photographerId: pId,
                        photographerName: selected ? selected.name : 'Hệ thống Studio'
                      });
                    }}
                    className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none cursor-pointer focus:border-gold-500"
                  >
                    <option value="">-- Hệ thống tự đề xuất --</option>
                    {photographers.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.studioInfo?.location || 'Toàn quốc'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Gói / Thể Loại Chụp</label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Ngày Chụp Dự Kiến</label>
                  <input
                    type="date"
                    value={editFormData.bookingDate}
                    onChange={(e) => setEditFormData({ ...editFormData, bookingDate: e.target.value })}
                    className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Trạng Thái Đơn</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none cursor-pointer focus:border-gold-500"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="completed">Đã chụp xong</option>
                    <option value="cancelled">Đã hủy đơn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Địa Điểm Chụp</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Ngân Sách</label>
                  <input
                    type="text"
                    value={editFormData.budget}
                    onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                    className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl px-3 py-2 text-white outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Ghi Chú / Yêu Cầu Của Khách</label>
                <textarea
                  rows={2}
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                  className="w-full bg-[#100e0c] border border-[#2b2722] rounded-xl p-2.5 text-white outline-none focus:border-gold-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#2e2821]">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-xl bg-[#221f1c] hover:bg-[#2c2723] text-gray-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-gold-950 font-bold shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Booking */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#181512] border border-[#2e2821] max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-rose-200">Xác Nhận Xóa Đơn Booking</h3>
                <span className="text-xs text-rose-400/80">Hành động này không thể hoàn tác</span>
              </div>
            </div>

            <div className="text-sm text-[#cfc5b4] bg-[#100e0c] p-4 rounded-2xl border border-[#26211a] space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa đơn đặt lịch của khách hàng <strong className="text-gold-200">"{deleteModal.booking?.clientName}"</strong> ({deleteModal.booking?.clientPhone}) không?
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, booking: null, loading: false })}
                disabled={deleteModal.loading}
                className="px-4 py-2.5 rounded-xl bg-[#221f1c] hover:bg-[#2c2723] text-xs font-semibold text-[#a2998a] hover:text-[#cfc5b4]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteBooking}
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

export default AdminBookingsManagement;
