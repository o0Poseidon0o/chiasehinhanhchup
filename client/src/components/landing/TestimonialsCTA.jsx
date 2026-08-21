import React from 'react';
import { Star, Quote, Sparkles, Camera, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const REVIEWS = [
  {
    name: 'Khánh Linh & Minh Tuấn',
    role: 'Khách hàng chụp Pre-Wedding',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    comment: 'Quy trình đặt lịch rất tiện lợi, tìm được đúng anh photographer phong cách vintage mình thích. Giao ảnh cực nhanh, duyệt chọn ảnh trên điện thoại trực quan và không bị nén chất lượng.',
    rating: 5
  },
  {
    name: 'Hoàng Long Studio',
    role: 'Nhiếp ảnh gia chuyên nghiệp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    comment: 'Hệ thống Studio Workspace rất đỉnh, khách chọn ảnh xong mình có ngay danh sách file copy vào Lightroom lọc trong 3 giây. Tiết kiệm hơn 70% thời gian trao đổi so với trước đây.',
    rating: 5
  },
  {
    name: 'Thu Trang',
    role: 'Khách hàng chụp Lookbook & Doanh nghiệp',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    comment: 'Dịch vụ minh bạch, giá cả rõ ràng. Cả team công ty ai cũng khen bộ ảnh profile chuyên nghiệp và thần thái.',
    rating: 5
  }
];

export const TestimonialsCTA = () => {
  const { isLoggedIn, openAuthModal } = useAuth();

  return (
    <section className="py-16 sm:py-24 border-t border-[#242938] relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Testimonials Block */}
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Quote className="w-3.5 h-3.5" />
              <span>Cảm Nhận Khách Hàng</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Được Tin Dùng Bởi Hàng Nghìn Khách Hàng & Studio
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Niềm vui và sự hài lòng của khách hàng là thước đo thành công lớn nhất của chúng tôi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {REVIEWS.map((rev, i) => (
              <div
                key={i}
                className="bg-[#141720] border border-[#242938] hover:border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-[#242938]">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-11 h-11 rounded-full object-cover border border-amber-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">{rev.name}</h4>
                    <p className="text-[11px] text-amber-400">{rev.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Big Join Platform CTA Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 p-8 sm:p-12 text-amber-950 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <span className="px-3.5 py-1 rounded-full bg-black/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Dành Cho Studio & Freelance Photographers
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Gia Nhập Mạng Lưới Nhiếp Ảnh Gia Của Chúng Tôi Ngay Hôm Nay
            </h3>
            <p className="text-sm sm:text-base font-medium text-amber-950 max-w-2xl leading-relaxed">
              Mở rộng khách hàng tiềm năng trên khắp cả nước, sở hữu trang Portfolio chuyên nghiệp và hệ thống quản lý giao nhận ảnh hoàn toàn miễn phí.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => openAuthModal('/app')}
                className="px-7 py-3.5 rounded-2xl bg-black text-white hover:bg-gray-900 font-bold text-xs sm:text-sm shadow-xl flex items-center space-x-2 transition-all"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Đăng Nhập Studio / Tạo Album</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#album-lookup"
                className="px-6 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all"
              >
                Đăng Ký Tư Vấn Hợp Tác
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsCTA;
