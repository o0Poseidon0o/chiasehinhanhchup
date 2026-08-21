import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  X, Calendar, Copy, Check, Star, ShieldCheck, Clock, MapPin, 
  Sparkles, Camera, ArrowRight, User, Phone, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { photographerApi } from '../../api/photographerApi';

export const MyBookingsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchMyBookings = async () => {
    let localList = [];
    try {
      const saved = localStorage.getItem('user_my_bookings');
      if (saved) localList = JSON.parse(saved);
    } catch (_) {}

    const statusTextMap = {
      confirmed: '✓ Đã Xác Nhận',
      completed: '📸 Đã Chụp Xong',
      cancelled: '❌ Đã Hủy',
      pending: '⏳ Chờ Xác Nhận'
    };

    try {
      const apiRes = await photographerApi.getBookings();
      const realBookings = apiRes.data || [];

      // Start with all local device bookings
      const mergedList = [...localList];

      // Merge server bookings into mergedList
      realBookings.forEach(rb => {
        const rbCode = `BK-${(rb._id || '').slice(-6).toUpperCase()}`;
        const matchIndex = mergedList.findIndex(b => 
          (rb._id && String(rb._id) === String(b._id)) ||
          (b.code && b.code === rbCode) ||
          (rb.clientPhone && (b.customerPhone || b.clientPhone) && rb.clientPhone.trim() === (b.customerPhone || b.clientPhone).trim() && rb.category === b.categoryTitle)
        );

        const mappedItem = {
          _id: rb._id || (matchIndex >= 0 ? mergedList[matchIndex]._id : ''),
          code: rbCode || (matchIndex >= 0 ? mergedList[matchIndex].code : 'BK-LOCAL'),
          photographerId: rb.photographerId || (matchIndex >= 0 ? mergedList[matchIndex].photographerId : 'ph_default_1'),
          photographerName: rb.photographerName || (matchIndex >= 0 ? mergedList[matchIndex].photographerName : 'Studio Đã Chọn'),
          categoryTitle: rb.category || (matchIndex >= 0 ? mergedList[matchIndex].categoryTitle : 'Gói Chụp Ảnh'),
          bookingDate: rb.bookingDate || (matchIndex >= 0 ? mergedList[matchIndex].bookingDate : 'Chưa xếp'),
          timeSlot: rb.timeSlot || (matchIndex >= 0 ? mergedList[matchIndex].timeSlot : ''),
          cityLocation: rb.location || (matchIndex >= 0 ? mergedList[matchIndex].cityLocation : 'Hà Nội'),
          detailedLocation: '',
          customerPhone: rb.clientPhone || (matchIndex >= 0 ? mergedList[matchIndex].customerPhone : ''),
          customerEmail: rb.clientEmail || (matchIndex >= 0 ? mergedList[matchIndex].customerEmail : ''),
          status: statusTextMap[rb.status] || rb.status || '⏳ Chờ Xác Nhận',
          createdAt: rb.createdAt || new Date().toISOString()
        };

        if (matchIndex >= 0) {
          mergedList[matchIndex] = { ...mergedList[matchIndex], ...mappedItem };
        } else {
          mergedList.push(mappedItem);
        }
      });

      // Filter by current logged in user phone or email if logged in
      let finalDisplay = mergedList;
      if (currentUser?.phone || currentUser?.email) {
        const userPhone = (currentUser.phone || '').replace(/\D/g, '');
        const userEmail = (currentUser.email || '').trim().toLowerCase();

        const filtered = mergedList.filter(b => {
          const bPhone = (b.customerPhone || b.clientPhone || '').replace(/\D/g, '');
          const bEmail = (b.customerEmail || b.clientEmail || '').trim().toLowerCase();
          const matchP = userPhone && bPhone && (bPhone.includes(userPhone) || userPhone.includes(bPhone));
          const matchE = userEmail && bEmail && bEmail === userEmail;
          return matchP || matchE || (!bPhone && !bEmail);
        });

        // Fallback to mergedList if filtering returned empty but mergedList has bookings
        finalDisplay = filtered.length > 0 ? filtered : mergedList;
      }

      setBookings(finalDisplay);
      try {
        localStorage.setItem('user_my_bookings', JSON.stringify(finalDisplay));
      } catch (_) {}

    } catch (err) {
      setBookings(localList);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyBookings();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGoToReview = (b) => {
    onClose();
    const phId = b.photographerId || 'ph_default_1';
    navigate(`/photographers/${phId}?tab=reviews&bookingCode=${b.code}`);
  };

  return createPortal(
    <div 
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 w-full h-full max-w-full min-h-[100dvh] max-h-[100dvh] overflow-hidden select-none animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#141210] border border-[#2b2722] rounded-3xl w-full max-w-2xl max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#2b2722] flex items-center justify-between bg-[#1a1714]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gold-100">Lịch Sử Đặt Lịch Của Tôi</h3>
              <p className="text-xs text-[#a2998a]">Xem mã Booking đơn chụp & viết Đánh giá Verified cho Studio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#2b2722] hover:bg-[#38332d] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {bookings.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-gold-200">Bạn chưa có đơn Đặt lịch chụp nào</p>
                <p className="text-xs text-[#8e8474] max-w-sm mx-auto">
                  Hãy chọn Nhiếp ảnh gia yêu thích và tạo đơn đặt lịch chụp đầu tiên để nhận Mã Booking Verified!
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 inline-flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>⚡ Đặt Lịch Chụp Ngay</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.code || b.id}
                  className="bg-[#1a1714] border border-[#2b2722] hover:border-gold-500/40 rounded-2xl p-4 space-y-3 transition-all"
                >
                  {/* Top row: Code & Status */}
                  <div className="flex items-center justify-between border-b border-[#292420] pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 font-semibold">Mã Booking:</span>
                      <span className="font-mono font-black text-amber-400 text-sm">{b.code}</span>
                      <button
                        onClick={() => handleCopyCode(b.code)}
                        className="p-1 bg-[#231f1a] hover:bg-[#332e27] border border-[#3b342d] text-gold-300 rounded-lg text-xs transition-colors flex items-center space-x-1"
                        title="Sao chép mã booking"
                      >
                        {copiedCode === b.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center space-x-1 border ${
                      (b.status || '').includes('Xác Nhận') && !(b.status || '').includes('Chờ')
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : (b.status || '').includes('Chụp Xong') || (b.status || '').includes('hoàn thành')
                        ? 'bg-blue-950/60 border-blue-500/40 text-blue-400'
                        : (b.status || '').includes('Hủy')
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{b.status || '⏳ Chờ Xác Nhận'}</span>
                    </span>
                  </div>

                  {/* Details info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Studio: <strong className="text-white">{b.photographerName || 'Studio Đã Chọn'}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Ngày chụp: <strong className="text-white">{b.bookingDate || 'Chưa xếp'}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Gói: <strong className="text-white">{b.categoryTitle || 'Gói Nghệ Thuật'}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Địa điểm: <strong className="text-white">{b.detailedLocation || b.cityLocation || 'Hà Nội'}</strong></span>
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#292420]">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đơn chụp này đủ điều kiện nhận Nhãn Đã Xác Minh</span>
                    </span>

                    <button
                      onClick={() => handleGoToReview(b)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1 transition-all hover:scale-105"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>⭐ Viết Đánh Giá Studio Ngay</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1a1714] border-t border-[#2b2722] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2b2722] hover:bg-[#38332d] text-gold-200 text-xs font-bold rounded-xl transition-colors"
          >
            Đóng Cửa Sổ
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default MyBookingsModal;
