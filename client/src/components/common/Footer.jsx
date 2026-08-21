import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Footer = () => {
  const { openAuthModal } = useAuth();

  return (
    <footer className="border-t border-[#242938] bg-[#0c0d12] pt-14 pb-8 text-xs text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Col 1: Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <img
                src="/Photodate.svg"
                alt="Photodate Logo"
                className="w-8 h-8 rounded-lg object-contain shadow-md"
              />
              <span className="font-extrabold text-lg text-white tracking-tight">
                Photodate<span className="text-amber-400">.vn</span>
              </span>
            </Link>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Nền tảng trực tuyến kết nối khách hàng với các Nhiếp ảnh gia & Studio hàng đầu Việt Nam. Tích hợp giải pháp duyệt chọn ảnh SelectPhoto bảo mật, tốc độ cao.
            </p>

            <div className="flex items-center space-x-3 pt-1 text-gray-300">
              <a href="#" className="p-2 rounded-xl bg-[#141720] hover:bg-[#1c2230] border border-[#242938] text-gray-300 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="p-2 rounded-xl bg-[#141720] hover:bg-[#1c2230] border border-[#242938] text-gray-300 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="p-2 rounded-xl bg-[#141720] hover:bg-[#1c2230] border border-[#242938] text-gray-300 hover:text-white transition-colors">
                TikTok
              </a>
              <a href="#" className="p-2 rounded-xl bg-[#141720] hover:bg-[#1c2230] border border-[#242938] text-gray-300 hover:text-white transition-colors">
                Zalo
              </a>
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Dịch Vụ Chụp Ảnh</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#categories-section" className="hover:text-amber-400 transition-colors">Chụp Chân Dung / Cá Nhân</a></li>
              <li><a href="#categories-section" className="hover:text-amber-400 transition-colors">Chụp Cặp Đôi & Cưới</a></li>
              <li><a href="#categories-section" className="hover:text-amber-400 transition-colors">Chụp Gia Đình & Bé Yêu</a></li>
              <li><a href="#categories-section" className="hover:text-amber-400 transition-colors">Kỷ Yếu Học Sinh Sinh Viên</a></li>
              <li><a href="#categories-section" className="hover:text-amber-400 transition-colors">Sự Kiện & Doanh Nghiệp</a></li>
              <li><a href="#categories-section" className="hover:text-amber-400 transition-colors">Lookbook & Thời Trang</a></li>
            </ul>
          </div>

          {/* Col 3: For Photographers & Studios */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Dành Cho Studio</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => openAuthModal('/app')} className="hover:text-amber-400 transition-colors text-left">
                  Studio Workspace (Tạo Album)
                </button>
              </li>
              <li>
                <button onClick={() => openAuthModal('/admin')} className="hover:text-amber-400 transition-colors text-left">
                  Quản Trị Kho Album
                </button>
              </li>
              <li><a href="#album-lookup" className="hover:text-amber-400 transition-colors">Tra Cứu Mã Album Khách</a></li>
              <li><a href="#photographers-section" className="hover:text-amber-400 transition-colors">Đăng Ký Đối Tác Chụp Ảnh</a></li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Hỗ Trợ Khách Hàng</h4>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Hotline: <strong>1900 6868</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>contact@potonow.vn</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#242938] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            © {new Date().getFullYear()} Potonow.vn Platform & SelectPhoto Pro. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:underline">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#" className="hover:underline">Chính sách bảo mật</a>
            <span>•</span>
            <button onClick={() => openAuthModal('/admin')} className="hover:text-amber-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Quản trị hệ thống</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
