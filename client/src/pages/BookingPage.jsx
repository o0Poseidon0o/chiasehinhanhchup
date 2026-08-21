import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Camera, CheckCircle2, User, Phone, Mail, MapPin, 
  Sparkles, ShieldCheck, ArrowRight, ArrowLeft, Clock, QrCode, Copy, Check, Lock,
  Users, Shirt, Scissors, Zap, BookOpen, Layers, AlertTriangle
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { categoryApi } from '../api/categoryApi';
import { photographerApi } from '../api/photographerApi';
import { useAuth } from '../context/AuthContext';

const CONTEXT_TYPES = [
  { id: 'outdoor', label: 'Ngoại cảnh (Outdoor)', desc: 'Công viên, Phố cổ, Khung cảnh tự nhiên' },
  { id: 'studio', label: 'Trong Studio', desc: 'Phông nền, Studio Hàn Quốc / Minimalism' },
  { id: 'home', label: 'Tại gia / Khách sạn', desc: 'Không gian riêng tư, ấm cúng' }
];

const TIME_SLOTS = [
  'Buổi Sáng (08:00 - 11:30)',
  'Buổi Chiều (14:00 - 17:30)',
  'Buổi Tối / Hoàng Hôn (17:30 - 20:30)'
];

const VISUAL_TIME_CARDS = [
  { 
    id: 'morning', 
    title: 'Buổi Sáng', 
    time: '08:00 - 11:30', 
    icon: '🌅', 
    tag: 'Nắng sớm tự nhiên', 
    desc: 'Trong trẻo, tươi sáng, thích hợp Outdoor & Gia đình' 
  },
  { 
    id: 'afternoon', 
    title: 'Buổi Trưa - Chiều', 
    time: '13:30 - 16:30', 
    icon: '☀️', 
    tag: 'Ánh sáng rực rỡ', 
    desc: 'Đầy đủ ánh sáng, tối ưu cho Studio & Lookbook' 
  },
  { 
    id: 'golden_hour', 
    title: 'Giờ Vàng Hoàng Hôn', 
    time: '16:30 - 18:30', 
    icon: '🌇', 
    tag: 'Khung giờ vàng (Best)', 
    desc: 'Nắng vàng ấm áp, lãng mạn cho Pre-wedding' 
  },
  { 
    id: 'night', 
    title: 'Buổi Tối & Flash', 
    time: '18:30 - 21:00', 
    icon: '🌙', 
    tag: 'Đèn LED & Đêm', 
    desc: 'Đèn thành phố, Street Style & Concept mộng mơ' 
  }
];

const ADDONS = [
  { id: 'makeup', label: 'Makeup & Làm Tóc Chuyên Nghiệp', price: '+ 350.000đ', icon: Scissors },
  { id: 'costume', label: 'Cho Thuê Trang Phục / Áo Dài / Concept', price: '+ 250.000đ', icon: Shirt },
  { id: 'fast_delivery', label: 'Giao Ảnh Hậu Kỳ Nhanh Trong 24h', price: '+ 200.000đ', icon: Zap },
  { id: 'photobook', label: 'In Photobook / Ảnh Ép Gỗ Cao Cấp', price: '+ 450.000đ', icon: BookOpen }
];

export const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, openAuthModal } = useAuth();

  const preFilledPhId = searchParams.get('phUserId');
  const preFilledPackage = searchParams.get('package');

  // Stepper state (1: Studio & Category, 2: Context & Schedule, 3: Addons & Concept, 4: Contact & Receipt)
  const [step, setStep] = useState(1);
  const [photographers, setPhotographers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [contextType, setContextType] = useState('outdoor');
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  
  // Visual Time Slot States
  const [timeMode, setTimeMode] = useState('preset'); // 'preset' | 'range' | 'custom'
  const [selectedTimeCard, setSelectedTimeCard] = useState('golden_hour');
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('18:30');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeSlot, setCustomTimeSlot] = useState('');

  const [peopleCount, setPeopleCount] = useState('1 - 2 người');
  const [cityLocation, setCityLocation] = useState('Hà Nội');
  const [detailedLocation, setDetailedLocation] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [conceptNote, setConceptNote] = useState('');

  // Conflict Detection States
  const [existingBookings, setExistingBookings] = useState([]);
  const [bookingConflict, setBookingConflict] = useState(null);

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours > 0 && mins > 0) return `${hours} tiếng ${mins} phút`;
    if (hours > 0) return `${hours} tiếng`;
    return `${mins} phút`;
  };
  
  // Customer Contact State (Tự động điền từ currentUser nếu đã đăng nhập)
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  
  // Đồng bộ khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !customerName) setCustomerName(currentUser.name);
      if (currentUser.phone && !customerPhone) setCustomerPhone(currentUser.phone);
      if (currentUser.email && !customerEmail) setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  // Time range overlap helper functions
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  const extractTimeRangeFromBooking = (b) => {
    if (!b) return { start: '08:00', end: '18:00' };
    let start = '08:00', end = '18:00';
    const text = `${b.timeSlot || ''} ${b.note || ''} ${b.conceptNote || ''}`;
    const rangeMatch = text.match(/(\d{1,2}:\d{2})\s*(?:➔|-|to)\s*(\d{1,2}:\d{2})/i);
    if (rangeMatch) {
      start = rangeMatch[1];
      end = rangeMatch[2];
    } else if (text.includes('Sáng')) {
      start = '08:00'; end = '11:30';
    } else if (text.includes('Chiều')) {
      start = '13:30'; end = '16:30';
    } else if (text.includes('Tối') || text.includes('Hoàng Hôn')) {
      start = '16:30'; end = '20:30';
    }
    return { start, end };
  };

  const doTimeRangesOverlap = (start1, end1, start2, end2) => {
    const s1 = parseTimeToMinutes(start1);
    const e1 = parseTimeToMinutes(end1);
    const s2 = parseTimeToMinutes(start2);
    const e2 = parseTimeToMinutes(end2);
    if (s1 === 0 || e1 === 0 || s2 === 0 || e2 === 0) return true;
    return Math.max(s1, s2) < Math.min(e1, e2);
  };

  // Fetch real-time existing bookings from server to populate existingBookings for conflict checking
  useEffect(() => {
    let isMounted = true;
    photographerApi.getBookings({ all: 'true' })
      .then(res => {
        if (isMounted) {
          setExistingBookings(res.data || []);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [step, bookingDate]);

  // Check double-booking conflict with accurate time overlap detection
  useEffect(() => {
    if (selectedPhotographer?._id && bookingDate) {
      const activeStart = startTime || '16:30';
      const activeEnd = endTime || '18:30';

      const conflict = (existingBookings || []).find(b => {
        if (!b) return false;
        const bPhId = b.photographerId ? String(b.photographerId) : '';
        const targetPhId = selectedPhotographer?._id ? String(selectedPhotographer._id) : (selectedPhotographer?.id ? String(selectedPhotographer.id) : '');
        
        const isPhMatch = (bPhId && targetPhId && bPhId === targetPhId) || 
                          (b.photographerName && selectedPhotographer?.name && b.photographerName === selectedPhotographer.name);
                          
        const isDateMatch = b.bookingDate === bookingDate;
        const isActive = b.status !== 'cancelled' && b.status !== '❌ Đã Hủy';
        if (!isPhMatch || !isDateMatch || !isActive) return false;

        const bRange = extractTimeRangeFromBooking(b);
        return doTimeRangesOverlap(activeStart, activeEnd, bRange.start, bRange.end);
      });

      if (conflict) {
        const isConfirmed = conflict.status === 'confirmed' || 
                            conflict.status === 'completed' || 
                            (conflict.status || '').includes('Xác nhận') || 
                            (conflict.status || '').includes('Xác Nhận');
        setBookingConflict({ ...conflict, isConfirmed });
      } else {
        setBookingConflict(null);
      }
    } else {
      setBookingConflict(null);
    }
  }, [selectedPhotographer, bookingDate, startTime, endTime, existingBookings]);

  // Receipt State
  const [bookingReceipt, setBookingReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    Promise.all([
      userApi.getActivePhotographers().catch(() => ({ data: [] })),
      categoryApi.getAll().catch(() => ({ data: [] }))
    ]).then(([phRes, catRes]) => {
      if (!isMounted) return;
      const phList = phRes.data || [];
      const catList = catRes.data || [];
      
      setPhotographers(phList);
      setCategories(catList);

      if (preFilledPhId) {
        const found = phList.find(p => String(p._id) === String(preFilledPhId) || String(p.id) === String(preFilledPhId));
        if (found) {
          setSelectedPhotographer(found);
          setStep(2);
        }
      }

      if (preFilledPackage) {
        setSelectedCategory(preFilledPackage);
      } else if (catList.length > 0) {
        setSelectedCategory(catList[0].title);
      }
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [preFilledPhId, preFilledPackage]);

  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Vui lòng điền họ tên và số điện thoại liên hệ.');
      return;
    }

    setSubmitting(true);

    try {
      const effectiveTimeSlot = `${startTime} ➔ ${endTime} (⏱️ Dự kiến ${calculateDuration(startTime, endTime) || '2 tiếng'})`;

      const addonLabels = ADDONS.filter(a => selectedAddons.includes(a.id)).map(a => a.label);
      const noteParts = [
        `[Bối cảnh: ${CONTEXT_TYPES.find(c => c.id === contextType)?.label || contextType}]`,
        `[Khung giờ: ${effectiveTimeSlot}]`,
        `[Số người: ${peopleCount}]`
      ];
      if (addonLabels.length > 0) {
        noteParts.push(`[Dịch vụ thêm: ${addonLabels.join(', ')}]`);
      }
      if (conceptNote.trim()) {
        noteParts.push(`[Ghi chú: ${conceptNote.trim()}]`);
      }

      // Real-time pre-submit conflict check against database
      try {
        const freshRes = await photographerApi.getBookings();
        const freshBookings = freshRes.data || [];
        const freshConflict = freshBookings.find(b => {
          const isPhMatch = String(b.photographerId) === String(selectedPhotographer?._id) || b.photographerName === selectedPhotographer?.name;
          const isDateMatch = b.bookingDate === bookingDate;
          const isConfirmed = b.status === 'confirmed' || b.status === 'completed' || (b.status || '').includes('Xác nhận');
          if (!isPhMatch || !isDateMatch || !isConfirmed) return false;

          const bRange = extractTimeRangeFromBooking(b);
          return doTimeRangesOverlap(startTime, endTime, bRange.start, bRange.end);
        });

        if (freshConflict) {
          setSubmitting(false);
          setBookingConflict({ ...freshConflict, isConfirmed: true });
          setStep(2);
          alert(`🛑 Studio "${selectedPhotographer?.name || 'Đã Chọn'}" ĐÃ CHỐT LỊCH CHÍNH THỨC VỚI KHÁCH KHÁC vào khung giờ ${startTime} ➔ ${endTime} ngày ${bookingDate}.\n\nHệ thống đã chuyển về Bước 2. Vui lòng chọn ngày/giờ khác hoặc chọn Nhiếp ảnh gia khác!`);
          return;
        }
      } catch (_) {}

      const payload = {
        photographerId: selectedPhotographer?._id || '',
        photographerName: selectedPhotographer?.name || 'Hệ thống Studio tự đề xuất',
        clientName: customerName.trim(),
        clientPhone: customerPhone.trim(),
        clientEmail: customerEmail ? customerEmail.trim() : '',
        category: selectedCategory || 'Chụp Cá Nhân / Chân Dung',
        bookingDate: bookingDate || new Date().toISOString().split('T')[0],
        timeSlot: effectiveTimeSlot,
        location: `${cityLocation}${detailedLocation ? ` - ${detailedLocation}` : ''}`,
        budget: addonLabels.length > 0 ? `Gói cơ bản + ${addonLabels.length} dịch vụ thêm` : 'Gói tiêu chuẩn',
        note: noteParts.join(' ')
      };

      const res = await photographerApi.createBooking(payload);
      const createdBooking = res.data || {};
      const bookingCode = `BK-${(createdBooking._id || '').slice(-6).toUpperCase() || Math.floor(100000 + Math.random() * 900000)}`;

      const receiptData = {
        code: bookingCode,
        photographerId: selectedPhotographer?._id || 'ph_default_1',
        photographerName: selectedPhotographer?.name || 'Hệ thống tự đề xuất Studio phù hợp',
        categoryTitle: selectedCategory || 'Chụp Cá Nhân / Chân Dung',
        contextLabel: CONTEXT_TYPES.find(c => c.id === contextType)?.label || 'Ngoại cảnh',
        date: bookingDate || new Date().toISOString().split('T')[0],
        bookingDate: bookingDate || new Date().toISOString().split('T')[0],
        timeSlot,
        peopleCount,
        cityLocation,
        detailedLocation: detailedLocation || 'Studio hoặc ngoại cảnh tùy chọn',
        addonLabels,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : '',
        status: '⏳ Chờ Xác Nhận',
        depositAmount: '500.000đ',
        createdAt: new Date().toISOString()
      };

      setBookingReceipt(receiptData);

      try {
        const existing = JSON.parse(localStorage.getItem('user_my_bookings') || '[]');
        localStorage.setItem('user_my_bookings', JSON.stringify([receiptData, ...existing]));
      } catch (_) {}
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra khi gửi yêu cầu đặt lịch. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!bookingReceipt) return;
    navigator.clipboard.writeText(bookingReceipt.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-32 space-y-4 animate-fade-in">
        <Clock className="w-10 h-10 animate-spin text-amber-400 mx-auto" />
        <p className="text-xs text-gray-400">Đang tải danh sách Studio & Thể loại chụp...</p>
      </div>
    );
  }

  // Khách hàng bắt buộc phải đăng nhập mới được Booking
  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-[#141720] border border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            Yêu Cầu Đăng Nhập Khách Hàng
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white pt-2">
            Đăng Nhập Để Đặt Lịch Chụp Ảnh
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Bạn cần đăng nhập hoặc đăng ký tài khoản Khách Hàng để thực hiện đặt lịch chụp. Đăng nhập giúp bạn dễ dàng theo dõi trạng thái đơn hàng, chọn ảnh và làm việc trực tiếp với Studio.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('/bookings', 'login', 'client')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Đăng Nhập Ngay</span>
          </button>
          <button
            onClick={() => openAuthModal('/bookings', 'register', 'client')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] hover:border-amber-500/40 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all"
          >
            Tạo Tài Khoản Khách Hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-br from-[#141720] via-[#10131c] to-[#0c0d12] border border-[#242938] rounded-3xl p-8 sm:p-10 text-center space-y-3 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Đặt Lịch Chụp Ảnh Chi Tiết Chuẩn Potonow</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Lên Kế Hoạch & Đặt Lịch Chụp
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          Tự do tùy chỉnh gói chụp, chọn bối cảnh, dịch vụ đi kèm và thời gian chụp linh hoạt. Studio sẽ liên hệ xác nhận chi tiết ngay sau khi hoàn tất.
        </p>
      </div>

      {/* Stepper Header (4 Steps) */}
      {!bookingReceipt && (
        <div className="grid grid-cols-4 gap-2 bg-[#141720] border border-[#242938] p-3 rounded-2xl">
          {[
            { num: 1, title: 'Studio & Thể Loại' },
            { num: 2, title: 'Bối Cảnh & Thời Gian' },
            { num: 3, title: 'Dịch Vụ Đi Kèm' },
            { num: 4, title: 'Xác Nhận Đặt Lịch' }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`p-3 rounded-xl text-left transition-all ${
                step === s.num
                  ? 'bg-amber-500 text-amber-950 shadow-md font-bold'
                  : step > s.num
                  ? 'bg-amber-500/10 text-amber-300 font-semibold'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <p className="text-[10px] uppercase font-black tracking-wider">Bước {s.num}</p>
              <p className="text-xs sm:text-sm truncate">{s.title}</p>
            </button>
          ))}
        </div>
      )}

      {/* Booking Form / Receipt Content */}
      {bookingReceipt ? (
        /* RECEIPT CARD AFTER SUCCESS */
        <div className="bg-[#141720] border border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-8 animate-fade-in text-center">
          <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Đã Ghi Nhận Đặt Lịch Chụp Thành Công!</h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Studio sẽ liên hệ qua SĐT <strong className="text-amber-400">{bookingReceipt.customerPhone}</strong> trong vòng 15 phút để xác nhận chi tiết.
            </p>
          </div>

          {/* Booking Pass Receipt */}
          <div className="bg-[#0c0d12] border border-[#242938] rounded-2xl p-6 text-left max-w-md mx-auto space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#242938] pb-3">
              <span className="text-xs text-gray-400 font-semibold">Mã Booking Đơn Chụp:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-black text-amber-400 text-base">{bookingReceipt.code}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-[#141720] border border-[#242938] hover:border-amber-400 text-gray-300 hover:text-white rounded-lg text-xs transition-colors"
                  title="Sao chép mã"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-gray-300">
              <p className="flex justify-between">
                <span className="text-gray-400">Studio / Nhiếp ảnh gia:</span>
                <strong className="text-white">{bookingReceipt.photographerName}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Gói / Thể loại chụp:</span>
                <strong className="text-white">{bookingReceipt.categoryTitle}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Bối cảnh chụp:</span>
                <strong className="text-amber-300">{bookingReceipt.contextLabel}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Thời gian chụp:</span>
                <strong className="text-amber-300">{bookingReceipt.date} ({bookingReceipt.timeSlot})</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Khu vực / Địa điểm:</span>
                <strong className="text-white">{bookingReceipt.cityLocation} - {bookingReceipt.detailedLocation}</strong>
              </p>

              {bookingReceipt.addonLabels.length > 0 && (
                <div className="pt-2 border-t border-[#242938]">
                  <span className="text-gray-400 block mb-1">Dịch vụ đi kèm:</span>
                  <div className="flex flex-wrap gap-1">
                    {bookingReceipt.addonLabels.map((ad, aIdx) => (
                      <span key={aIdx} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] rounded-lg">
                        +{ad}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Deposit Section */}
            <div className="pt-3 border-t border-[#242938] text-center space-y-2">
              <p className="text-[11px] text-amber-400 font-bold">Quét QR Đặt Cọc 500k Giữ Lịch (Tùy chọn)</p>
              <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BOOKING_${bookingReceipt.code}`}
                  alt="QR Deposit"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] text-gray-500">Nội dung CK: <span className="font-mono text-gray-300">{bookingReceipt.code} - {bookingReceipt.customerPhone}</span></p>
            </div>
          </div>

          {/* Action buttons including ⭐ Review Now button */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const phId = bookingReceipt.photographerId || 'ph_default_1';
                navigate(`/photographers/${phId}?tab=reviews&bookingCode=${bookingReceipt.code}`);
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>⭐ Đánh Giá Studio Với Mã Booking Này</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-white font-bold rounded-2xl text-xs sm:text-sm"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      ) : (
        /* STEPPER FORM */
        <div className="bg-[#141720] border border-[#242938] rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* STEP 1: SELECT PHOTOGRAPHER & CATEGORY */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Bước 1: Chọn Studio & Thể Loai Chụp</h3>
                <p className="text-xs text-gray-400">Chọn Studio bạn yêu thích hoặc để Hệ thống tự đề xuất</p>
              </div>

              {/* Photographer Selection Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-300">1. Lựa Chọn Nhiếp Ảnh Gia / Studio *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPhotographer(null)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPhotographer === null
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-[#0c0d12] border-[#242938] hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">Hệ Thống Tự Đề Xuất Studio</h4>
                        <p className="text-[11px] text-gray-400">Đề xuất Studio phù hợp nhất theo khu vực</p>
                      </div>
                    </div>
                  </div>

                  {photographers.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => setSelectedPhotographer(p)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedPhotographer?._id === p._id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                          : 'bg-[#0c0d12] border-[#242938] hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.studioInfo?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-amber-400/40"
                        />
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm">{p.name}</h4>
                          <p className="text-[11px] text-gray-400">{p.studioInfo?.location || 'Toàn quốc'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Selection Grid */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-gray-300">2. Chọn Gói / Thể Loại Chụp Ảnh *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.length === 0 ? (
                    ['Chụp Cá Nhân / Chân Dung', 'Cặp Đôi & Pre-Wedding', 'Ảnh Gia Đình & Bé Yêu', 'Lookbook & Thời Trang'].map((title, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedCategory(title)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedCategory === title
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                            : 'bg-[#0c0d12] border-[#242938] hover:border-gray-600 text-gray-300'
                        }`}
                      >
                        <h4 className="font-bold text-white text-xs sm:text-sm">{title}</h4>
                        <p className="text-[11px] text-gray-400 mt-1">Sản phẩm: File gốc + Ảnh retouch chuyên nghiệp</p>
                      </div>
                    ))
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat._id || cat.id}
                        onClick={() => setSelectedCategory(cat.title)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedCategory === cat.title
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                            : 'bg-[#0c0d12] border-[#242938] hover:border-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white text-xs sm:text-sm">{cat.title}</h4>
                          <span className="text-xs font-black text-amber-400">{cat.price}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 truncate">{cat.subtitle}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20"
                >
                  <span>Tiếp Tục: Chọn Bối Cảnh & Thời Gian</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONTEXT, LOCATION & TIME */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Bước 2: Bối Cảnh, Địa Điểm & Thời Gian Chụp</h3>
                <p className="text-xs text-gray-400">Chọn môi trường chụp và khung giờ mong muốn</p>
              </div>

              {/* Context Type Select */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-300">1. Bối Cảnh Chụp (Shooting Context) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CONTEXT_TYPES.map((ctx) => (
                    <div
                      key={ctx.id}
                      onClick={() => setContextType(ctx.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        contextType === ctx.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                          : 'bg-[#0c0d12] border-[#242938] hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <h4 className="font-bold text-white text-xs sm:text-sm">{ctx.label}</h4>
                      <p className="text-[11px] text-gray-400 mt-1">{ctx.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Tỉnh / Thành Phố *</label>
                  <select
                    value={cityLocation}
                    onChange={(e) => setCityLocation(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none cursor-pointer"
                  >
                    {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt', 'Hải Phòng', 'Cần Thơ'].map((c, i) => (
                      <option key={i} value={c} className="bg-[#141720] text-white">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Quận / Huyện hoặc Địa Điểm Cụ Thể</label>
                  <input
                    type="text"
                    value={detailedLocation}
                    onChange={(e) => setDetailedLocation(e.target.value)}
                    placeholder="VD: Quận Cầu Giấy, Studio Phố Cổ, Bãi Đá Sông Hồng..."
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Double Booking Conflict Warning Card */}
              {bookingConflict && (
                <div className={`p-4 rounded-2xl space-y-3 animate-fade-in border ${
                  bookingConflict.isConfirmed
                    ? 'bg-rose-950/60 border-rose-500/80 text-rose-200 ring-2 ring-rose-500/40'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                }`}>
                  <div className="flex items-start space-x-3 text-xs sm:text-sm">
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${bookingConflict.isConfirmed ? 'text-rose-400' : 'text-amber-400'}`} />
                    <div>
                      <p className="font-extrabold text-sm">
                        {bookingConflict.isConfirmed
                          ? `🛑 Studio "${selectedPhotographer?.name || 'Đã Chọn'}" ĐÃ CHỐT LỊCH CHÍNH THỨC VỚI KHÁCH KHÁC!`
                          : `⚠️ Studio "${selectedPhotographer?.name || 'Đã Chọn'}" Đang Có Đơn Chờ Duyệt Khung Giờ Này`}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed">
                        {bookingConflict.isConfirmed ? (
                          <>
                            Studio đã xác nhận đơn chụp vào ngày <strong className="text-rose-300 font-bold">{bookingDate}</strong> (khung giờ <strong className="text-white">{startTime} ➔ {endTime}</strong>).
                            <br /><span className="text-rose-300 font-bold">Hệ thống đã khóa khung giờ này. Vui lòng đổi giờ/ngày hoặc chọn Nhiếp ảnh gia khả dụng khác bên dưới để tiếp tục:</span>
                          </>
                        ) : (
                          <>
                            Studio hiện có đơn chờ xác nhận vào ngày <strong className="text-amber-300">{bookingDate}</strong>. Bạn vẫn có thể gửi đơn hoặc chọn Studio khả dụng khác bên dưới:
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Alternative Photographers Quick Switch */}
                  <div className={`space-y-1.5 pt-2 border-t ${bookingConflict.isConfirmed ? 'border-rose-500/30' : 'border-amber-500/20'}`}>
                    <span className="text-[11px] font-bold text-gray-300 block">⚡ Gợi ý chọn nhanh Nhiếp ảnh gia khác đang rảnh lịch:</span>
                    <div className="flex flex-wrap gap-2">
                      {photographers.filter(p => String(p._id) !== String(selectedPhotographer?._id)).slice(0, 4).map(altP => (
                        <button
                          key={altP._id}
                          type="button"
                          onClick={() => setSelectedPhotographer(altP)}
                          className="px-3 py-1.5 bg-[#141720] hover:bg-emerald-500/20 border border-[#242938] hover:border-emerald-500 text-white hover:text-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow"
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{altP.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Ngày Chụp Dự Kiến *</label>
                  <div className="relative">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onClick={(e) => {
                        try { if (e.target.showPicker) e.target.showPicker(); } catch (_) {}
                      }}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none cursor-pointer"
                    />
                    <Calendar className="absolute right-3.5 top-3.5 w-4 h-4 text-amber-400 pointer-events-none" />
                  </div>
                </div>

              {/* Clean Visual Dual Clock Time Picker (Start Time - End Time) */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-gray-300">
                  2. Lựa Chọn Khung Giờ Chụp Ảnh (Từ... Đến...) *
                </label>
                
                <div className="bg-[#0c0d12] border border-[#242938] rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        🕒 Giờ Bắt Đầu Chụp *
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onClick={(e) => { try { if (e.target.showPicker) e.target.showPicker(); } catch (_) {} }}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-[#141720] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        🏁 Giờ Kết Thúc Chụp *
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onClick={(e) => { try { if (e.target.showPicker) e.target.showPicker(); } catch (_) {} }}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-[#141720] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Timeline summary indicator */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
                    <span className="font-bold">⏱️ Khung giờ đã chọn: {startTime} ➔ {endTime}</span>
                    <span className="px-2.5 py-1 bg-amber-500 text-amber-950 font-black rounded-lg text-[11px]">
                      Thời lượng: {calculateDuration(startTime, endTime) || '2 tiếng'}
                    </span>
                  </div>
                </div>
              </div>
              </div>

              {/* People count */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Số Lượng Người Tham Gia Chụp</label>
                <select
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none cursor-pointer"
                >
                  {['1 - 2 người', '3 - 5 người (Gia đình / Nhóm nhỏ)', '6 - 10 người', 'Nhóm > 10 người (Kỷ yếu / Sự kiện)'].map((p, i) => (
                    <option key={i} value={p} className="bg-[#141720] text-white">{p}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-300 font-bold rounded-2xl text-xs flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay Lại</span>
                </button>
                <button
                  disabled={Boolean(bookingConflict?.isConfirmed)}
                  onClick={() => {
                    if (bookingConflict?.isConfirmed) {
                      alert('Khung giờ này Studio đã chốt chính thức với khách khác. Vui lòng đổi giờ/ngày hoặc chọn Nhiếp ảnh gia khác!');
                      return;
                    }
                    setStep(3);
                  }}
                  className={`px-6 py-3 font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 transition-all ${
                    bookingConflict?.isConfirmed
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 opacity-60 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/20'
                  }`}
                >
                  <span>{bookingConflict?.isConfirmed ? '🛑 Khung Giờ Đã Kín (Không Thể Đặt)' : 'Tiếp Tục: Chọn Dịch Vụ Đi Kèm'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ADDONS & CONCEPT NOTE */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Bước 3: Dịch Vụ Bổ Sung & Ghi Chú Ý Tưởng</h3>
                <p className="text-xs text-gray-400">Tùy chọn dịch vụ trang điểm, trang phục hoặc in ấn photobook</p>
              </div>

              {/* Addons Multi Select */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-300">Dịch Vụ Bổ Sung (Add-on Services)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADDONS.map((ad) => {
                    const IconComp = ad.icon;
                    const isSelected = selectedAddons.includes(ad.id);
                    return (
                      <div
                        key={ad.id}
                        onClick={() => toggleAddon(ad.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                            : 'bg-[#0c0d12] border-[#242938] hover:border-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComp className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <h4 className="font-bold text-white text-xs sm:text-sm">{ad.label}</h4>
                            <p className="text-[11px] text-amber-400 font-semibold">{ad.price}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Concept Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Ghi Chú Ý Tưởng Concept / Yêu Cầu Đặc Biệt</label>
                <textarea
                  rows={3}
                  value={conceptNote}
                  onChange={(e) => setConceptNote(e.target.value)}
                  placeholder="VD: Tone màu Hàn Quốc nhẹ nhàng, chụp ngoại cảnh phố cổ, cần chuẩn bị 2 bộ trang phục..."
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-300 font-bold rounded-2xl text-xs flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay Lại</span>
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20"
                >
                  <span>Tiếp Tục: Điền Thông Tin Liên Hệ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & CONFIRM */}
          {step === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Bước 4: Thông Tin Liên Hệ Khách Hàng & Xác Nhận</h3>
                <p className="text-xs text-gray-400">Studio sẽ nhắn tin/gọi điện xác nhận ngay sau khi nhận đơn</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Họ và Tên Khách Hàng *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Số Điện Thoại / Zalo Liên Hệ *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Nhận Mã Booking & Link Chọn Ảnh (Tùy chọn)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="VD: khachhang@gmail.com"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#0c0d12] border border-[#242938] rounded-2xl p-5 space-y-2 text-xs text-gray-300">
                <p className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-2">Tóm Tắt Đơn Đặt Lịch:</p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Studio:</span>
                  <strong className="text-white">{selectedPhotographer?.name || 'Hệ thống tự đề xuất'}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Gói chụp:</span>
                  <strong className="text-white">{selectedCategory}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Bối cảnh:</span>
                  <strong className="text-amber-300">{CONTEXT_TYPES.find(c => c.id === contextType)?.label}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Thời gian & Địa điểm:</span>
                  <strong className="text-amber-300">{bookingDate || 'Chưa chọn'} ({timeSlot}) - {cityLocation}</strong>
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-300 font-bold rounded-2xl text-xs flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay Lại</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-105"
                >
                  {submitting ? <span>Đang Tạo Đơn...</span> : <span>⚡ HOÀN TẤT ĐẶT LỊCH CHỤP</span>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingPage;
