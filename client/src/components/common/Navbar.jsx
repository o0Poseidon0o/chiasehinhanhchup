import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, PlusCircle, FolderKanban } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname === '/admin' || location.pathname === '/dashboard';

  return (
    <header className="border-b border-[#221f1c] bg-[#0c0b0a]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="p-2 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-xl text-gold-950 shadow-md group-hover:scale-105 transition-transform duration-200">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-gold-100 tracking-tight block leading-tight">
              SelectPhoto<span className="text-gold-400">Pro</span>
            </span>
            <span className="text-[10px] text-[#a2998a] block tracking-wider uppercase font-medium">
              Chia sẻ & Chọn ảnh chuyên nghiệp
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center space-x-2.5">
          <Link 
            to="/admin" 
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isAdmin 
                ? 'bg-gold-500 text-gold-950 shadow-md shadow-gold-500/10' 
                : 'bg-[#161412] hover:bg-[#221f1c] border border-[#2b2722] hover:border-gold-500/40 text-gold-200'
            }`}
          >
            <FolderKanban className={`w-4 h-4 ${isAdmin ? 'text-gold-950' : 'text-gold-400'}`} />
            <span>Quản Lý Album</span>
          </Link>

          {!isHome && (
            <Link 
              to="/" 
              className="flex items-center space-x-1.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-gold-500/10"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Mới</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
