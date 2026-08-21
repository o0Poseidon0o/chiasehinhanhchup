import React from 'react';
import { Sparkles, Calendar, UserCheck, Camera, CheckSquare, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Calendar,
    title: 'Chọn Gói Chụp & Yêu Cầu',
    desc: 'Lựa chọn thể loại, địa điểm chụp, thời gian dự kiến và mức ngân sách mong muốn.'
  },
  {
    step: '02',
    icon: UserCheck,
    title: 'Ghép Nối Nhiếp Ảnh Gia',
    desc: 'Xem hồ sơ năng lực, đánh giá và báo giá chi tiết từ các photographer phù hợp nhất.'
  },
  {
    step: '03',
    icon: Camera,
    title: 'Thực Hiện Buổi Chụp',
    desc: 'Trải nghiệm buổi chụp thoải mái, sáng tạo và nhận link kho ảnh gốc chỉ sau 24-48 giờ.'
  },
  {
    step: '04',
    icon: CheckSquare,
    title: 'Duyệt Chọn Ảnh Trực Tuyến',
    desc: 'Khách hàng nhập mã PIN xem ảnh, bấm chọn ảnh ưng ý trên điện thoại để Studio tiến hành hậu kỳ hoàn thiện.'
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quy Trình Hoạt Động</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Chỉ 4 Bước Đơn Giản Để Có Bộ Ảnh Hoàn Hảo
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Nhanh chóng, minh bạch và hoàn toàn tự động từ lúc đặt lịch đến khi nhận ảnh hoàn thiện.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-[#141720] border border-[#242938] hover:border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#0c0d12] border border-[#242938] group-hover:border-amber-500/40 rounded-2xl text-amber-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-[#2b3245] group-hover:text-amber-500/50 transition-colors">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
