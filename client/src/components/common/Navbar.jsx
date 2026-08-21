import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  PlusCircle,
  FolderKanban,
  Search,
  Lock,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, isPhotographer, currentUser, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isWorkspace = location.pathname === '/app' || location.pathname === '/create' || location.pathname === '/workspace';
  const isAdminPage = location.pathname === '/admin' || location.pathname === '/dashboard';

  const handleNavClick = (anchorId) => {
    setMobileMenuOpen(false);
    if (!isHome) {
      navigate(`/#${anchorId}`);
    } else {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStudioWorkspaceClick = () => {
    setMobileMenuOpen(false);
    if (isLoggedIn) {
      navigate('/app');
    } else {
      openAuthModal('/app');
    }
  };

  const handleAdminClick = () => {
    setMobileMenuOpen(false);
    if (isLoggedIn && isAdmin) {
      navigate('/admin');
    } else {
      openAuthModal('/admin');
    }
  };

  return (
    <header className="border-b border-[#242938] bg-[#0c0d12]/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group shrink-0">
          <img
            src="/Photodate.svg"
            alt="Photodate Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-md group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight">
                Photodate<span className="text-amber-400">.vn</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-400 block tracking-wider uppercase font-semibold">
              Nền tảng kết nối & Duyệt ảnh
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links (Potonow Style) */}
        <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm text-gray-300">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl transition-colors ${isHome ? 'text-amber-400 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
          >
            Trang Chủ
          </Link>
          <Link
            to="/photographers"
            className={`px-3 py-2 rounded-xl transition-colors ${location.pathname.startsWith('/photographer') ? 'text-amber-400 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
          >
            Nhiếp Ảnh Gia
          </Link>
          <Link
            to="/bookings"
            className={`px-3 py-2 rounded-xl transition-colors ${location.pathname === '/bookings' ? 'text-amber-400 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
          >
            Đặt Lịch Chụp
          </Link>
          <button
            onClick={() => handleNavClick('categories-section')}
            className="px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Gói Chụp Ảnh
          </button>
          <button
            onClick={() => handleNavClick('album-lookup')}
            className="px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center space-x-1 text-amber-400"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tra Cứu Album</span>
          </button>
        </nav>

        {/* Right Actions & Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Nếu là Nhiếp Ảnh Gia: Nút vào Studio Workspace riêng của họ */}
          {isLoggedIn && isPhotographer && (
            <button
              onClick={handleStudioWorkspaceClick}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md ${isWorkspace
                ? 'bg-amber-500 text-amber-950 shadow-amber-500/20'
                : 'bg-[#141720] hover:bg-[#1c2230] border border-amber-500/40 text-amber-300 hover:text-white'
                }`}
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Studio Của Tôi</span>
            </button>
          )}

          {/* Nếu là Master Admin: Hiển thị cả 2 nút (👑 Master Admin + Studio Workspace) */}
          {isLoggedIn && isAdmin && (
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={handleAdminClick}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${isAdminPage
                  ? 'bg-amber-500 text-amber-950 shadow-md'
                  : 'bg-[#141720] hover:bg-[#1c2230] border border-amber-500/50 text-amber-400 hover:text-white'
                  }`}
              >
                <FolderKanban className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">👑 Master Admin</span>
              </button>

              <button
                onClick={handleStudioWorkspaceClick}
                className={`hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${isWorkspace
                  ? 'bg-amber-500 text-amber-950 font-bold'
                  : 'bg-[#141720] hover:bg-[#1c2230] border border-[#2b3245] text-gray-300 hover:text-white'
                  }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Studio Workspace</span>
              </button>
            </div>
          )}

          {/* Khi chưa đăng nhập */}
          {!isLoggedIn && (
            <button
              onClick={handleStudioWorkspaceClick}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#141720] hover:bg-[#1c2230] border border-[#2b3245] hover:border-amber-500/50 text-white transition-all shadow-md shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Studio Workspace</span>
              <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />
            </button>
          )}

          {/* Auth State Button */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2 shrink-0">
              <div className="hidden lg:flex flex-col items-end leading-tight">
                <span className="text-xs font-bold text-white max-w-[110px] truncate">{currentUser?.name || 'Tài khoản'}</span>
                <span className={`text-[10px] font-extrabold uppercase ${currentUser?.role === 'admin'
                  ? 'text-amber-400'
                  : currentUser?.role === 'photographer'
                    ? 'text-purple-400'
                    : 'text-blue-400'
                  }`}>
                  {currentUser?.role === 'admin' ? 'Master Admin' : currentUser?.role === 'photographer' ? 'Photographer' : 'Khách Hàng'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal(null, 'register', 'photographer')}
                className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold text-gray-300 hover:text-amber-300 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <span>Đăng Ký Đối Tác</span>
              </button>
              <button
                onClick={() => openAuthModal(null, 'login')}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/15"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#141720] border border-[#242938] text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#242938] bg-[#0c0d12] px-4 py-5 space-y-3 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            Trang Chủ
          </Link>
          <button
            onClick={() => handleNavClick('categories-section')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            Gói Chụp Ảnh
          </button>
          <button
            onClick={() => handleNavClick('photographers-section')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            Nhiếp Ảnh Gia
          </button>
          <button
            onClick={() => handleNavClick('album-lookup')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-amber-400 hover:bg-white/5 flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Tra Cứu Album Khách Hàng</span>
          </button>

          <div className="pt-3 border-t border-[#242938] space-y-2">
            <button
              onClick={handleStudioWorkspaceClick}
              className="w-full py-2.5 px-3 bg-[#141720] border border-[#2b3245] text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Vào Studio Workspace (Tạo Album)</span>
              {!isLoggedIn && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <button
              onClick={handleAdminClick}
              className="w-full py-2.5 px-3 bg-[#141720] border border-[#2b3245] text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2"
            >
              <FolderKanban className="w-4 h-4 text-amber-400" />
              <span>Quản Lý Danh Sách Album</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
