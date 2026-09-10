import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  AlertCircle,
  Building2,
  Home
} from 'lucide-react';
import { photographerApi } from '../../api/photographerApi';
import { userApi } from '../../api/userApi';
import { addressApi } from '../../api/addressApi';
import { useAuth } from '../../context/AuthContext';

export const BookingModal = ({ isOpen, onClose, preselectedPhotographer = null, initialPhotographer = null, initialCategory = null }) => {
  const activePhotographer = preselectedPhotographer || initialPhotographer;
  const { currentUser } = useAuth();
  const [photographers, setPhotographers] = useState([]);
  
  // Dữ liệu địa giới hành chính từ Database nội bộ Photodate
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [formData, setFormData] = useState({
    photographerId: '',
    photographerName: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    category: initialCategory || 'Chân Dung Nghệ Thuật',
    bookingDate: '',
    timeSlot: 'Buổi Trưa - Chiều (13:30 - 16:30)',
    provinceId: '',
    provinceName: '',
    wardId: '',
    wardName: '',
    detailedAddress: '',
    location: '',
    budget: '1.500.000đ - 3.000.000đ',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Khóa cuộn trang khi mở modal & hỗ trợ phím Escape để đóng
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Tải danh sách tỉnh thành từ DB nội bộ & danh sách NAG khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setSuccess(false);

    // Điền trước thông tin khách hàng nếu đã đăng nhập
    setFormData(prev => ({
      ...prev,
      clientName: currentUser?.name || prev.clientName,
      clientPhone: currentUser?.phone || prev.clientPhone,
      clientEmail: currentUser?.email || prev.clientEmail,
      category: initialCategory || prev.category
    }));

    // Tải danh sách Tỉnh/Thành từ Database
    setLoadingProvinces(true);
    addressApi.getProvinces()
      .then(res => {
        const provList = res.data || [];
        setProvinces(provList);

        // Tự động nhận diện Tỉnh theo NAG nếu có
        if (activePhotographer?.studioInfo?.location && provList.length > 0) {
          const locStr = activePhotographer.studioInfo.location.toLowerCase();
          const matched = provList.find(p => 
            locStr.includes(p.name.toLowerCase()) || 
            (Array.isArray(p.extensionNames) && p.extensionNames.some(ext => locStr.includes(ext.toLowerCase())))
          );

          if (matched) {
            setFormData(prev => ({
              ...prev,
              provinceId: matched.provinceId,
              provinceName: matched.name,
              location: matched.name
            }));

            // Tự động tải phường/xã của tỉnh đó
            addressApi.getWards(matched.provinceId).then(wRes => {
              setWards(wRes.data || []);
            }).catch(() => {});
          }
        }
      })
      .catch(err => console.error('Lỗi tải danh mục tỉnh:', err))
      .finally(() => setLoadingProvinces(false));

    // Tải danh sách Nhiếp Ảnh Gia
    userApi.getActivePhotographers().then(res => {
      const list = res.data || [];
      setPhotographers(list);

      if (activePhotographer) {
        setFormData(prev => ({
          ...prev,
          photographerId: activePhotographer._id || '',
          photographerName: activePhotographer.name || ''
        }));
      } else if (list.length > 0 && !formData.photographerId) {
        setFormData(prev => ({
          ...prev,
          photographerId: list[0]._id,
          photographerName: list[0].name
        }));
      }
    }).catch(() => {});
  }, [isOpen, activePhotographer, initialCategory, currentUser]);

  if (!isOpen) return null;

  // Ghép chuỗi địa điểm đầy đủ để hiển thị và lưu
  const composeLocation = (provName, wName, detail) => {
    const parts = [
      (detail || '').trim(),
      (wName || '').trim(),
      (provName || '').trim()
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handlePhotographerChange = (e) => {
    const pId = e.target.value;
    const selected = photographers.find(p => p._id === pId);
    setFormData(prev => ({
      ...prev,
      photographerId: pId,
      photographerName: selected ? selected.name : ''
    }));
  };

  const handleProvinceChange = async (e) => {
    const pId = e.target.value;
    const found = provinces.find(p => String(p.provinceId) === String(pId));
    const provName = found ? found.name : '';

    const newLocation = composeLocation(provName, '', formData.detailedAddress);

    setFormData(prev => ({
      ...prev,
      provinceId: pId,
      provinceName: provName,
      wardId: '',
      wardName: '',
      location: newLocation
    }));

    if (!pId) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    try {
      const res = await addressApi.getWards(pId);
      setWards(res.data || []);
    } catch (err) {
      console.error('Lỗi tải phường xã:', err);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleWardChange = (e) => {
    const wId = e.target.value;
    const found = wards.find(w => String(w.wardId) === String(wId));
    const wName = found ? found.name : '';

    const newLocation = composeLocation(formData.provinceName, wName, formData.detailedAddress);

    setFormData(prev => ({
      ...prev,
      wardId: wId,
      wardName: wName,
      location: newLocation
    }));
  };

  const handleDetailedAddressChange = (e) => {
    const detail = e.target.value;
    const newLocation = composeLocation(formData.provinceName, formData.wardName, detail);

    setFormData(prev => ({
      ...prev,
      detailedAddress: detail,
      location: newLocation
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.clientPhone.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại / Zalo.');
      return;
    }

    if (!formData.provinceId && !formData.location.trim()) {
      setError('Vui lòng chọn Tỉnh / Thành phố nơi bạn muốn chụp ảnh.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Kiểm tra xung đột trước khi gửi: Nếu NAG đã có lịch 'confirmed' ngày đó thì cảnh báo ngay
      try {
        const res = await photographerApi.getBookings({ all: 'true' });
        const list = res.data || [];
        const conflict = list.find(b => {
          if (!b || b.status !== 'confirmed') return false;
          const isPhMatch = (formData.photographerId && String(b.photographerId) === String(formData.photographerId)) ||
                            (formData.photographerName && b.photographerName === formData.photographerName);
          if (!isPhMatch) return false;
          if (b.bookingDate !== formData.bookingDate) return false;

          // Nếu cả 2 đều có timeSlot thì kiểm tra từ khóa khung giờ
          if (formData.timeSlot && b.timeSlot) {
            const t1 = formData.timeSlot.slice(0, 10);
            const t2 = b.timeSlot.slice(0, 10);
            return t1 === t2;
          }
          return true;
        });

        if (conflict) {
          setError(`Nhiếp ảnh gia ${formData.photographerName || 'đã chọn'} đã có lịch chụp chính thức được chốt vào ngày ${formData.bookingDate}. Vui lòng chọn ngày/giờ khác hoặc trao đổi trực tiếp!`);
          setLoading(false);
          return;
        }
      } catch (_) {}

      await photographerApi.createBooking(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Không thể gửi yêu cầu đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Render modal trực tiếp vào document.body bằng createPortal
  return typeof document !== 'undefined' ? createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-[#141720] border border-[#2b3245] rounded-3xl p-5 sm:p-8 shadow-2xl text-[#f8fafc] my-auto max-h-[92vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors z-20"
          title="Đóng (Esc)"
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
              <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
                Yêu cầu đặt lịch chụp gói <strong>"{formData.category}"</strong> đã được gửi tới <strong>{formData.photographerName || 'Nhiếp ảnh gia'}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#0c0d12] rounded-2xl border border-[#242938] text-xs text-left space-y-2 text-gray-300">
              <div>• Khách hàng: <strong className="text-white">{formData.clientName}</strong></div>
              <div>• Số điện thoại / Zalo: <strong className="text-amber-400">{formData.clientPhone}</strong></div>
              {formData.bookingDate && <div>• Ngày dự kiến: <strong className="text-white">{formData.bookingDate}</strong></div>}
              {formData.timeSlot && <div>• Khung giờ: <strong className="text-amber-400">{formData.timeSlot}</strong></div>}
              {formData.location && (
                <div>
                  • Địa điểm chụp: <strong className="text-amber-300">{formData.location}</strong>
                </div>
              )}
              {formData.budget && <div>• Ngân sách: <strong className="text-emerald-400">{formData.budget}</strong></div>}
            </div>

            <p className="text-[11px] text-gray-400">
              Nhiếp ảnh gia sẽ liên hệ lại qua Số điện thoại / Zalo của bạn trong thời gian sớm nhất để xác nhận và trao đổi chi tiết buổi chụp.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs transition-colors"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Photodate Booking Match</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Đặt Lịch Chụp Ảnh
              </h2>
              <p className="text-xs text-gray-400">
                Kết nối trực tiếp cùng Nhiếp ảnh gia chuyên nghiệp trên toàn quốc
              </p>
            </div>

            {/* CHỌN NHIẾP ẢNH GIA */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300">Nhiếp ảnh gia phụ trách *</label>
              <div className="relative">
                <Camera className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                <select
                  value={formData.photographerId}
                  onChange={handlePhotographerChange}
                  className="w-full bg-[#0c0d12] border border-amber-500/40 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none cursor-pointer appearance-none"
                >
                  <option value="">-- Chọn Nhiếp Ảnh Gia --</option>
                  {photographers.map(p => (
                    <option key={p._id} value={p._id} className="bg-[#141720]">
                      {p.name} — {p.studioInfo?.location || 'Toàn quốc'} ({p.studioInfo?.experience || 'Chuyên nghiệp'})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                  ▼
                </div>
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

            {/* GÓI CHỤP, NGÀY CHỤP & KHUNG GIỜ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Gói chụp</label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer appearance-none truncate"
                  >
                    <option value="Chân Dung Nghệ Thuật" className="bg-[#141720]">Chân Dung</option>
                    <option value="Ảnh Cưới & Pre-wedding" className="bg-[#141720]">Ảnh Cưới</option>
                    <option value="Kỷ Yếu & Học Sinh/Sinh Viên" className="bg-[#141720]">Kỷ Yếu</option>
                    <option value="Gia Đình & Bé Yêu" className="bg-[#141720]">Gia Đình</option>
                    <option value="Sự Kiện & Doanh Nghiệp" className="bg-[#141720]">Sự Kiện</option>
                    <option value="Lookbook & Thời Trang" className="bg-[#141720]">Lookbook</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Ngày dự kiến</label>
                <input
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">Khung giờ</label>
                <div className="relative">
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer appearance-none truncate"
                  >
                    <option value="Buổi Sáng (08:00 - 11:30)" className="bg-[#141720]">Sáng (08:00 - 11:30)</option>
                    <option value="Buổi Trưa - Chiều (13:30 - 16:30)" className="bg-[#141720]">Chiều (13:30 - 16:30)</option>
                    <option value="Giờ Vàng Hoàng Hôn (16:30 - 18:30)" className="bg-[#141720]">Hoàng Hôn (16:30 - 18:30)</option>
                    <option value="Buổi Tối & Flash (18:30 - 21:00)" className="bg-[#141720]">Tối & Đèn (18:30 - 21:00)</option>
                    <option value="Thỏa thuận trực tiếp" className="bg-[#141720]">Thỏa thuận riêng</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* ĐỊA ĐIỂM CHỤP ẢNH (TỈNH/THÀNH & PHƯỜNG/XÃ TỪ DATABASE NỘI BỘ PHOTODATE) */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#0c0d12] border border-[#242938]">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Khu Vực & Địa Điểm Chụp Ảnh</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Chọn Tỉnh / Thành phố */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-300 flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-amber-400/80" />
                    <span>Tỉnh / Thành phố <span className="text-rose-400">*</span></span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.provinceId}
                      onChange={handleProvinceChange}
                      disabled={loadingProvinces}
                      className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer appearance-none disabled:opacity-50"
                    >
                      <option value="">
                        {loadingProvinces ? 'Đang tải tỉnh thành...' : '-- Chọn Tỉnh / Thành phố --'}
                      </option>
                      {provinces.map((prov) => (
                        <option key={prov.provinceId} value={prov.provinceId} className="bg-[#141720]">
                          {prov.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Chọn Phường / Xã */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-300 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-amber-400/80" />
                    <span>Phường / Xã</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.wardId}
                      onChange={handleWardChange}
                      disabled={!formData.provinceId || loadingWards}
                      className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.provinceId 
                          ? '-- Chọn Tỉnh trước --' 
                          : loadingWards 
                            ? 'Đang tải phường/xã...' 
                            : '-- Chọn Phường / Xã --'}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.wardId} value={ward.wardId} className="bg-[#141720]">
                          {ward.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Nhập chi tiết tên quán cafe, studio hoặc ngoại cảnh */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-300 flex items-center space-x-1">
                  <Home className="w-3 h-3 text-amber-400/80" />
                  <span>Điểm chụp cụ thể / Quán cafe / Studio (Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={formData.detailedAddress}
                  onChange={handleDetailedAddressChange}
                  placeholder="VD: Phim trường Smiley Ville, Hồ Tây, Cafe Acoustic, Studio tại nhà..."
                  className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>

              {/* Tóm tắt địa điểm đã chọn */}
              {formData.location && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 flex items-start space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Địa điểm ghi nhận: </span>
                    <span>{formData.location}</span>
                  </div>
                </div>
              )}
            </div>

            {/* NGÂN SÁCH DỰ KIẾN */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300">Ngân sách dự kiến</label>
              <div className="relative">
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer appearance-none"
                >
                  <option value="Dưới 1.500.000đ" className="bg-[#141720]">Dưới 1.500.000đ</option>
                  <option value="1.500.000đ - 3.000.000đ" className="bg-[#141720]">1.500.000đ - 3.000.000đ</option>
                  <option value="3.000.000đ - 6.000.000đ" className="bg-[#141720]">3.000.000đ - 6.000.000đ</option>
                  <option value="6.000.000đ - 12.000.000đ" className="bg-[#141720]">6.000.000đ - 12.000.000đ</option>
                  <option value="Trên 12.000.000đ (Cao cấp)" className="bg-[#141720]">Trên 12.000.000đ (Cao cấp)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                  ▼
                </div>
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
                className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 outline-none"
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
    </div>,
    document.body
  ) : null;
};

export default BookingModal;
