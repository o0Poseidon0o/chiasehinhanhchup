import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#221f1c] bg-[#090807] py-8 text-center text-xs text-[#6e665a]">
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        <p className="text-[#8e8576]">
          SelectPhoto Pro — Nền tảng chia sẻ và chọn ảnh trực tuyến siêu tốc dành cho Nhiếp ảnh gia & Studio.
        </p>
        <div className="flex items-center justify-center space-x-3 text-[11px] text-[#554e44]">
          <span>Tương thích tìm kiếm ảnh nhanh trên Adobe Lightroom, Bridge & Photoshop.</span>
          <span>•</span>
          <Link to="/admin" className="hover:text-gold-400 flex items-center space-x-1 transition-colors">
            <ShieldAlert className="w-3 h-3" />
            <span>Khu vực Quản trị</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
