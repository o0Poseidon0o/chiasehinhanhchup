import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Loader2, 
  Camera, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { photographerApi } from '../../api/photographerApi';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

export const BookingModal = ({ isOpen, onClose, preselectedPhotographer = null, initialCategory = null }) => {
  const { currentUser } = useAuth();
  const [photographers, setPhotographers] = useState([]);
  const [formData, setFormData] = useState({
    photographerId: '',
    photographerName: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    category: initialCategory || 'Chân Dung Nghệ Thuật',
    bookingDate: '',
    location: 'Hà Nội',
    budget: '1.500.000đ - 3.000.000đ',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      
      // Auto-fill from currentUser if available
      setFormData(prev => ({
        ...prev,
        clientName: currentUser?.name || prev.clientName,
        clientPhone: currentUser?.phone || prev.clientPhone,
        clientEmail: currentUser?.email || prev.clientEmail,
        category: initialCategory || prev.category
      }));

      // Load active photographers
      userApi.getActivePhotographers().then(res => {
        const list = res.data || [];
        setPhotographers(list);

        if (preselectedPhotographer) {
          setFormData(prev => ({
            ...prev,
            photographerId: preselectedPhotographer._id || '',
            photographerName: preselectedPhotographer.name || '',
            location: preselectedPhotographer.studioInfo?.location || prev.location
          }));
        } else if (list.length > 0 && !formData.photographerId) {
          setFormData(prev => ({
            ...prev,
            photographerId: list[0]._id,
            photographerName: list[0].name
          }));
        }
      }).catch(() => {});
    }
  }, [isOpen, preselectedPhotographer, initialCategory, currentUser]);

  if (!isOpen) return null;

  const handlePhotographerChange = (e) => {
    const pId = e.target.value;
    const selected = photographers.find(p => p._id === pId);
    setFormData(prev => ({
      ...prev,
      photographerId: pId,
      photographerName: selected ? selected.name : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.clientPhone.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại / Zalo.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await photographerApi.createBooking(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Không thể gửi yêu cầu đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#141720] border border-[#2b3245] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#f8fafc] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Gửi Yêu Cầu Thành Công!</h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto">
                Yêu cầu đặt lịch chụp gói <strong>"{formData.category}"</strong> đã được gửi tới <strong>{formData.photographerName || 'Nhiếp ảnh gia'}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#0c0d12] rounded-2xl border border-[#242938] text-xs text-left space-y-1.5 text-gray-300">
              <div>• Khách hàng: <strong className="text-white">{formData.clientName}</strong></div>
              <div>• Số điện thoại: <strong className="text-amber-400">{formData.clientPhone}</strong></div>
              {formData.bookingDate && <div>• Ngày dự kiến: <strong className="text-white">{formData.bookingDate}</strong></div>}
              <div>• Địa điểm: <strong className="text-white">{formData.location}</strong></div>
            </div>

            <p className="text-[11px] text-gray-400 italic">
              Nhiếp ảnh gia sẽ liên hệ tư vấn và gửi báo giá chi tiết qua Zalo/SĐT của bạn trong ít phút.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 font-bold rounded-xl text-xs sm:text-sm"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Đặt Lịch Chụp Ảnh Trực Tuyến</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Chọn Nhiếp Ảnh Gia & Đặt Lịch
              </h3>
              <p className="text-xs text-gray-400">
                Gửi yêu cầu chụp ảnh trực tiếp tới Studio đối tác đã được kiểm duyệt chuyên môn
              </p>
            </div>

            {/* CHỌN NHIẾP ẢNH GIA */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider">
                1. Chọn Nhiếp Ảnh Gia / Studio Bạn Ưa Thích *
              </label>
              <div className="relative">
                <Camera className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  required
                  value={formData.photographerId}
                  onChange={handlePhotographerChange}
                  className="w-full bg-[#0c0d12] border border-amber-500/40 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none cursor-pointer"
                >
                  <option value="">-- Chọn Nhiếp Ảnh Gia --</option>
                  {photographers.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {p.studioInfo?.location || 'Toàn quốc'} ({p.studioInfo?.experience || 'Chuyên nghiệp'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* THÔNG TIN KHÁCH HÀNG */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Họ và tên của bạn *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="VD: Nguyễn Thị Mai"
                    className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Số điện thoại / Zalo *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="0912 345 678"
                    className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* GÓI CHỤP & NGÀY CHỤP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Gói chụp mong muốn</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-[#2b3245] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Chân Dung Nghệ Thuật">Chân Dung Nghệ Thuật</option>
                  <option value="Ảnh Cưới & Pre-wedding">Ảnh Cưới & Pre-wedding</option>
                  <option value="Kỷ Yếu & Học Sinh/Sinh Viên">Kỷ Yếu & Học Sinh/Sinh Viên</option>
                  <option value="Gia Đình & Bé Yêu">Gia Đình & Bé Yêu</option>
                  <option value="Sự Kiện & Doanh Nghiệp">Sự Kiện & Doanh Nghiệp</option>
                  <option value="Lookbook & Thời Trang">Lookbook & Thời Trang</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Ngày dự kiến chụp</label>
                <input
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-[#2b3245] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* KHU VỰC & NGÂN SÁCH (DROPDOWNS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Khu vực chụp ảnh</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-[#2b3245] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
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
                  <option value="Khác / Đi xa">Khác / Đi xa</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Ngân sách dự kiến</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-[#2b3245] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Dưới 1.500.000đ">Dưới 1.500.000đ</option>
                  <option value="1.500.000đ - 3.000.000đ">1.500.000đ - 3.000.000đ</option>
                  <option value="3.000.000đ - 6.000.000đ">3.000.000đ - 6.000.000đ</option>
                  <option value="6.000.000đ - 12.000.000đ">6.000.000đ - 12.000.000đ</option>
                  <option value="Trên 12.000.000đ (Cao cấp)">Trên 12.000.000đ (Cao cấp)</option>
                </select>
              </div>
            </div>

            {/* GHI CHÚ */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300">Ghi chú hoặc ý tưởng buổi chụp</label>
              <textarea
                rows={2}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="VD: Tone màu ấm, chụp ngoại cảnh chiều hoàng hôn..."
                className="w-full bg-[#0c0d12] border border-[#2b3245] rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi yêu cầu...</span>
                </>
              ) : (
                <>
                  <span>Gửi Yêu Cầu Đặt Lịch Chụp</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
