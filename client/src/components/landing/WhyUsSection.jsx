import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Lock, 
  Layers, 
  Smile, 
  Award, 
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

const FEATURES = [
  {
    icon: Award,
    title: 'Nhiếp Ảnh Gia Chọn Lọc',
    desc: 'Hồ sơ năng lực (Portfolio), phong cách và kinh nghiệm chụp thực tế được đội ngũ chuyên môn kiểm duyệt khắt khe.'
  },
  {
    icon: Sparkles,
    title: 'Minh Bạch Giá & Phong Cách',
    desc: 'Khách hàng chủ động lựa chọn gói chụp theo ngân sách hoặc đưa ra mức giá mong muốn, không lo phát sinh phụ phí.'
  },
  {
    icon: Zap,
    title: 'Hệ Thống Duyệt Ảnh SelectPhoto',
    desc: 'Công nghệ giao kho ảnh riêng tư: Khách hàng lướt xem, bấm tim chọn ảnh trên điện thoại siêu mượt và tải file gốc tốc độ cao.'
  },
  {
    icon: Lock,
    title: 'Bảo Mật & Riêng Tư Tuyệt Đối',
    desc: 'Mỗi album được mã hóa với Passcode riêng biệt. Chỉ những ai được cấp quyền mới có thể xem và tải ảnh.'
  }
];

export const WhyUsSection = () => {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ưu Điểm Vượt Trội</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tại Sao Nên Chọn Nền Tảng Của Chúng Tôi?
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Chúng tôi giải quyết mọi trở ngại trong việc tìm kiếm photographer, tối ưu quy trình từ đặt lịch đến nhận thành phẩm cuối cùng.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#141720] border border-[#242938] hover:border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="p-3.5 bg-[#0c0d12] border border-[#242938] group-hover:border-amber-500/40 rounded-2xl text-amber-400 w-fit transition-colors shadow-inner">
                  <Icon className="w-6 h-6" />
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

        {/* Highlight Banner / Bridge between public & studio app */}
        <div className="bg-gradient-to-r from-[#171b26] via-[#1c2233] to-[#171b26] border border-[#2d364d] rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ImageIcon className="w-4 h-4" />
              <span>Dành Riêng Cho Studio & Nhiếp Ảnh Gia</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Bạn là Photographer cần nền tảng giao ảnh chuyên nghiệp?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
              Tạo album khách hàng không giới hạn từ Google Drive, đồng bộ ảnh tức thì, khách chọn ảnh xuất danh sách tên file chính xác 100% để import ngay vào Lightroom.
            </p>
          </div>

          <a
            href="#album-lookup"
            className="shrink-0 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-200"
          >
            Trải Nghiệm Ngay
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
