import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Camera, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Users, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HeroSection = () => {
  const { isLoggedIn, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('hanoi');
  const [budget, setBudget] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    const photographersEl = document.getElementById('photographers-section');
    if (photographersEl) {
      photographersEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-4 sm:pt-8 pb-14 sm:pb-20 overflow-hidden">
      {/* Background Glows & Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto text-center space-y-8">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs sm:text-sm font-medium shadow-sm backdrop-blur-md animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Nền Tảng Kết Nối Nhiếp Ảnh Gia & Khách Hàng Chuyên Nghiệp</span>
          <span className="bg-amber-400/20 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Matching The <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400 bg-clip-text text-transparent">Creative Souls</span>
            <br />
            Lưu Giữ Trọn Vẹn Từng Khoảnh Khắc
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Khám phá và đặt lịch cùng hàng trăm Nhiếp ảnh gia tài năng trên toàn quốc. Trải nghiệm hệ thống giao nhận & duyệt chọn ảnh bảo mật, tốc độ cao.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#categories-section"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 flex items-center space-x-2 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Khám Phá Gói Chụp</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            onClick={() => {
              if (isLoggedIn) {
                navigate('/app');
              } else {
                openAuthModal('/app');
              }
            }}
            className="px-6 py-3.5 rounded-2xl bg-[#141720]/80 hover:bg-[#1c2230] border border-[#2b3245] hover:border-amber-500/40 text-gray-200 hover:text-white font-semibold text-sm sm:text-base backdrop-blur-md flex items-center space-x-2 transition-all duration-200"
          >
            <img src="/Photodate.svg" alt="Photodate Logo" className="w-5 h-5 rounded-md object-contain" />
            <span>Studio Workspace {isLoggedIn ? '(Đã Đăng Nhập)' : '(Cần Phân Quyền)'}</span>
          </button>
        </div>

        {/* Quick Booking / Search Filter Box (Potonow Style) */}
        <div className="pt-6">
          <form 
            onSubmit={handleSearch}
            className="bg-[#141720]/90 backdrop-blur-xl border border-[#282f42] rounded-3xl p-3 sm:p-4 shadow-2xl max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left"
          >
            {/* Category Select */}
            <div className="bg-[#0c0d12] border border-[#242938] rounded-2xl p-2.5 space-y-1">
              <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Thể Loại Chụp
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent text-sm text-white font-medium outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#141720]">Tất cả thể loại</option>
                <option value="personal" className="bg-[#141720]">Chân Dung / Cá Nhân</option>
                <option value="couple" className="bg-[#141720]">Cặp Đôi / Cưới</option>
                <option value="family" className="bg-[#141720]">Gia Đình</option>
                <option value="graduation" className="bg-[#141720]">Kỷ Yếu / Học Sinh</option>
                <option value="event" className="bg-[#141720]">Sự Kiện & Doanh Nghiệp</option>
                <option value="fashion" className="bg-[#141720]">Lookbook / Thời Trang</option>
              </select>
            </div>

            {/* Location Select */}
            <div className="bg-[#0c0d12] border border-[#242938] rounded-2xl p-2.5 space-y-1">
              <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Khu Vực / Tỉnh Thành
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm text-white font-medium outline-none cursor-pointer"
              >
                <option value="hanoi" className="bg-[#141720]">Hà Nội</option>
                <option value="hcm" className="bg-[#141720]">TP. Hồ Chí Minh</option>
                <option value="danang" className="bg-[#141720]">Đà Nẵng / Hội An</option>
                <option value="dalat" className="bg-[#141720]">Đà Lạt</option>
                <option value="all" className="bg-[#141720]">Toàn Quốc</option>
              </select>
            </div>

            {/* Budget Range */}
            <div className="bg-[#0c0d12] border border-[#242938] rounded-2xl p-2.5 space-y-1">
              <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Ngân Sách Dự Kiến
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent text-sm text-white font-medium outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#141720]">Mọi mức giá</option>
                <option value="tier1" className="bg-[#141720]">Dưới 1.500.000đ</option>
                <option value="tier2" className="bg-[#141720]">1.500.000đ - 3.500.000đ</option>
                <option value="tier3" className="bg-[#141720]">Trên 3.500.000đ</option>
              </select>
            </div>

            {/* Submit Search Button */}
            <button
              type="submit"
              className="w-full h-full min-h-[48px] bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl flex items-center justify-center space-x-2 text-sm shadow-md transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              <span>Tìm Nhiếp Ảnh Gia</span>
            </button>
          </form>
        </div>

        {/* Quick Stats Bar */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-[#242938]">
          <div className="text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">500+</div>
            <div className="text-xs text-gray-400">Nhiếp ảnh gia chuyên nghiệp</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">12.000+</div>
            <div className="text-xs text-gray-400">Buổi chụp hoàn tất</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">99.4%</div>
            <div className="text-xs text-gray-400">Khách hàng đánh giá 5 sao</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">24/7</div>
            <div className="text-xs text-gray-400">Duyệt ảnh online bảo mật</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
