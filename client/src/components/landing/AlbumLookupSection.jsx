import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  KeyRound, 
  FolderOpen, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Phone,
  Send
} from 'lucide-react';
import { photographerApi } from '../../api/photographerApi';
import { userApi } from '../../api/userApi';

export const AlbumLookupSection = () => {
  const navigate = useNavigate();
  const [albumIdOrUrl, setAlbumIdOrUrl] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  // Photographer list for selection
  const [photographers, setPhotographers] = useState([]);

  // Booking consultation form state
  const [bookingForm, setBookingForm] = useState({
    photographerId: '',
    name: '',
    phone: '',
    category: 'personal',
    note: ''
  });
  const [bookingSent, setBookingSent] = useState(false);

  React.useEffect(() => {
    userApi.getActivePhotographers().then(res => {
      setPhotographers(res.data || []);
    }).catch(() => {});
  }, []);

  const handleLookup = (e) => {
    e.preventDefault();
    setError('');

    const query = albumIdOrUrl.trim();
    if (!query) {
      setError('Vui lòng nhập Mã Album hoặc đường link được chia sẻ.');
      return;
    }

    // Extract ID from full URL if pasted
    let cleanId = query;
    if (query.includes('/album/')) {
      const parts = query.split('/album/');
      cleanId = parts[1].split('?')[0].split('/')[0];
    }

    if (!cleanId) {
      setError('Định dạng mã album không hợp lệ.');
      return;
    }

    navigate(`/album/${cleanId}${passcode ? `?passcode=${encodeURIComponent(passcode.trim())}` : ''}`);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) {
      return;
    }
    try {
      await photographerApi.createBooking({
        photographerId: bookingForm.photographerId || '',
        clientName: bookingForm.name,
        clientPhone: bookingForm.phone,
        category: bookingForm.category === 'wedding' ? 'Ảnh Cưới Studio & Ngoại Cảnh' : bookingForm.category === 'fashion' ? 'Lookbook & Thời Trang' : bookingForm.category === 'event' ? 'Sự Kiện & Doanh Nghiệp' : 'Chân Dung & Nghệ Thuật',
        note: bookingForm.note
      });
      setBookingSent(true);
      setTimeout(() => {
        setBookingSent(false);
        setBookingForm({ photographerId: '', name: '', phone: '', category: 'personal', note: '' });
      }, 5000);
    } catch (_) {
      setBookingSent(true);
    }
  };

  return (
    <section id="album-lookup" className="py-16 sm:py-24 border-t border-[#242938] relative">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Tra Cứu Album Khách Hàng */}
          <div className="bg-gradient-to-br from-[#141720] to-[#10131a] border border-[#282f42] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Dành Cho Khách Hàng</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Tra Cứu Kho Ảnh Của Bạn
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Nhập Mã Album hoặc dán đường dẫn link mà Studio / Nhiếp ảnh gia đã gửi cho bạn để truy cập ngay thư viện ảnh riêng tư.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-200">
                  Mã Album hoặc Link Album
                </label>
                <div className="relative">
                  <FolderOpen className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={albumIdOrUrl}
                    onChange={(e) => setAlbumIdOrUrl(e.target.value)}
                    placeholder="VD: 65e8a9... hoặc dán toàn bộ đường link"
                    className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-200">
                  Mã PIN / Passcode (Nếu có)
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Nhập mã PIN nếu album yêu cầu bảo mật..."
                    className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all duration-200"
              >
                <span>Vào Xem & Chọn Ảnh</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center space-x-2 text-[11px] text-gray-400 pt-2 border-t border-[#242938]">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Dữ liệu hình ảnh được bảo mật và truyền tải trực tiếp qua giao thức an toàn.</span>
            </div>
          </div>

          {/* Card 2: Đăng Ký Tư Vấn Buổi Chụp Nhanh */}
          <div className="bg-[#141720] border border-[#282f42] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Đặt Lịch Siêu Tốc</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Tư Vấn & Đặt Lịch Chụp Miễn Phí
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Để lại thông tin, đội ngũ Potonow sẽ liên hệ hỗ trợ bạn chọn nhiếp ảnh gia và báo giá chi tiết trong vòng 15 phút.
              </p>
            </div>

            {bookingSent ? (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3 my-auto">
                <div className="inline-flex p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-emerald-300">Đã Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-xs text-gray-300">
                  Chuyên viên tư vấn sẽ liên hệ lại với bạn qua số điện thoại sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3">
                {/* Chọn Nhiếp ảnh gia */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-amber-400">Chọn Nhiếp ảnh gia / Studio (Tùy chọn)</label>
                  <select
                    value={bookingForm.photographerId}
                    onChange={(e) => setBookingForm({ ...bookingForm, photographerId: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-amber-500/40 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="">-- Hệ thống tự động đề xuất tốt nhất --</option>
                    {photographers.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.studioInfo?.location || 'Toàn quốc'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-300">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-300">Số điện thoại / Zalo *</label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">Thể loại chụp bạn quan tâm</label>
                  <select
                    value={bookingForm.category}
                    onChange={(e) => setBookingForm({ ...bookingForm, category: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
                  >
                    <option value="personal">Chụp Chân Dung / Cá Nhân</option>
                    <option value="couple">Cặp Đôi & Pre-Wedding</option>
                    <option value="family">Gia Đình & Bé Yêu</option>
                    <option value="graduation">Kỷ Yếu / Học Sinh - Sinh Viên</option>
                    <option value="event">Sự Kiện & Doanh Nghiệp</option>
                    <option value="fashion">Lookbook & Thời Trang</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">Ghi chú thêm (Địa điểm, ngày chụp mong muốn...)</label>
                  <textarea
                    rows="2"
                    value={bookingForm.note}
                    onChange={(e) => setBookingForm({ ...bookingForm, note: e.target.value })}
                    placeholder="VD: Chụp ngoại cảnh Hồ Tây chiều thứ 7 tuần này..."
                    className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Yêu Cầu Tư Vấn Ngay</span>
                </button>
              </form>
            )}

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-[#242938]">
              <span>Hotline hỗ trợ: <strong className="text-amber-400">1900 6868</strong></span>
              <span>Thời gian làm việc: 08:00 - 22:00</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AlbumLookupSection;
