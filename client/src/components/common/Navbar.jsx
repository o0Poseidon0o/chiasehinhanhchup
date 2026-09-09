import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck,
  Calendar,
  ChevronDown,
  MapPin,
  Compass,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MyBookingsModal } from '../booking/MyBookingsModal';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, isPhotographer, isClient, currentUser, logout, openAuthModal } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [studioDropdownOpen, setStudioDropdownOpen] = useState(false);

  const exploreRef = useRef(null);
  const studioRef = useRef(null);

  const isHome = location.pathname === '/';
  const isWorkspace = location.pathname === '/app' || location.pathname === '/create' || location.pathname === '/workspace';
  const isAdminPage = location.pathname === '/admin' || location.pathname === '/dashboard';

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreDropdownOpen(false);
      }
      if (studioRef.current && !studioRef.current.contains(e.target)) {
        setStudioDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng dropdown khi chuyển trang
  useEffect(() => {
    setExploreDropdownOpen(false);
    setStudioDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (anchorId) => {
    setMobileMenuOpen(false);
    setExploreDropdownOpen(false);
    if (!isHome) {
      navigate(`/#${anchorId}`);
    } else {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStudioWorkspaceClick = () => {
    setMobileMenuOpen(false);
    setStudioDropdownOpen(false);
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
    <header className="border-b border-[#242938] bg-[#0c0d12]/95 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
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
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold tracking-wider uppercase leading-none mt-0.5">
              Nền Tảng Kết Nối & Duyệt Ảnh
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links (Tối ưu gọn gàng với Dropdown Khám Phá) */}
        <nav className="hidden lg:flex items-center space-x-1.5 font-medium text-sm text-gray-300">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl transition-colors ${
              isHome ? 'text-amber-400 font-bold bg-white/5' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            Trang Chủ
          </Link>

          {/* Mega Dropdown: Khám Phá (Gộp Địa Điểm, NAG, Gói Chụp, Đặt Lịch) */}
          <div className="relative" ref={exploreRef}>
            <button
              onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                exploreDropdownOpen || location.pathname.startsWith('/photographer') || location.pathname === '/bookings'
                  ? 'text-amber-400 font-bold bg-white/5'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Khám Phá</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${exploreDropdownOpen ? 'rotate-180 text-amber-400' : 'text-gray-400'}`} />
            </button>

            {/* Dropdown Menu */}
            {exploreDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 p-2 bg-[#12151e] border border-[#232938] rounded-2xl shadow-2xl space-y-1 animate-fadeIn z-50">
                {/* 1. Địa Điểm Chụp Ảnh Đẹp (Mới) */}
                <button
                  onClick={() => handleNavClick('location-guides-section')}
                  className="w-full flex items-start space-x-3 p-2.5 rounded-xl hover:bg-amber-500/10 text-left transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-amber-950 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-300">
                      Địa Điểm Chụp Đẹp
                    </span>
                    <span className="text-[11px] text-gray-400 line-clamp-1">
                      Cẩm nang tọa độ sống ảo 3 miền
                    </span>
                  </div>
                </button>

                {/* 2. Nhiếp Ảnh Gia */}
                <Link
                  to="/photographers"
                  onClick={() => setExploreDropdownOpen(false)}
                  className="w-full flex items-start space-x-3 p-2.5 rounded-xl hover:bg-amber-500/10 text-left transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-300">
                      Nhiếp Ảnh Gia
                    </span>
                    <span className="text-[11px] text-gray-400 line-clamp-1">
                      Hồ sơ & portfolio chất lượng cao
                    </span>
                  </div>
                </Link>

                {/* 3. Gói Chụp Ảnh */}
                <button
                  onClick={() => handleNavClick('categories-section')}
                  className="w-full flex items-start space-x-3 p-2.5 rounded-xl hover:bg-amber-500/10 text-left transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-gold-500/15 text-amber-300 shrink-0 group-hover:bg-amber-400 group-hover:text-amber-950 transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-300">
                      Gói Chụp & Thể Loại
                    </span>
                    <span className="text-[11px] text-gray-400 line-clamp-1">
                      Bảng giá các gói và phong cách
                    </span>
                  </div>
                </button>

                {/* 4. Đặt Lịch Chụp */}
                <Link
                  to="/bookings"
                  onClick={() => setExploreDropdownOpen(false)}
                  className="w-full flex items-start space-x-3 p-2.5 rounded-xl hover:bg-amber-500/10 text-left transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-300">
                      Đặt Lịch Chụp
                    </span>
                    <span className="text-[11px] text-gray-400 line-clamp-1">
                      Tư vấn concept & đặt lịch trực tuyến
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Nút Tra Cứu Album Nổi Bật */}
          <button
            onClick={() => handleNavClick('album-lookup')}
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors cursor-pointer flex items-center space-x-1.5 text-amber-400 font-semibold"
            title="Nhập SĐT hoặc Mã Album để xem ảnh khách hàng"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Tra Cứu Album</span>
          </button>
        </nav>

        {/* Right Actions & Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Nếu là Khách Hàng: Nút vào Không Gian Khách Hàng */}
          {isLoggedIn && isClient && (
            <button
              onClick={() => navigate('/app')}
              className={`hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md ${
                isWorkspace
                  ? 'bg-amber-500 text-amber-950 shadow-amber-500/20'
                  : 'bg-[#141720] hover:bg-[#1c2230] border border-amber-500/40 text-amber-300 hover:text-white'
              }`}
              title="Vào Không Gian Khách Hàng (Xem Đơn & Album của bạn)"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Đơn & Album Của Tôi</span>
            </button>
          )}

          {/* Nếu là Nhiếp Ảnh Gia: Nút vào Studio Workspace riêng */}
          {isLoggedIn && isPhotographer && (
            <button
              onClick={handleStudioWorkspaceClick}
              className={`hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md ${
                isWorkspace
                  ? 'bg-amber-500 text-amber-950 shadow-amber-500/20'
                  : 'bg-[#141720] hover:bg-[#1c2230] border border-amber-500/40 text-amber-300 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Studio Của Tôi</span>
            </button>
          )}

          {/* Nếu là Master Admin: Nút vào Admin */}
          {isLoggedIn && isAdmin && (
            <div className="hidden sm:flex items-center space-x-1.5 shrink-0">
              <button
                onClick={handleAdminClick}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
                  isAdminPage
                    ? 'bg-amber-500 text-amber-950 shadow-md'
                    : 'bg-[#141720] hover:bg-[#1c2230] border border-amber-500/50 text-amber-400 hover:text-white'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">👑 Master Admin</span>
              </button>

              <button
                onClick={handleStudioWorkspaceClick}
                className={`hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isWorkspace
                    ? 'bg-amber-500 text-amber-950 font-bold'
                    : 'bg-[#141720] hover:bg-[#1c2230] border border-[#2b3245] text-gray-300 hover:text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Studio Workspace</span>
              </button>
            </div>
          )}

          {/* KHI CHƯA ĐĂNG NHẬP: Gộp "Studio Workspace" & "Đăng Ký Đối Tác" thành 1 Dropdown Tinh Tế */}
          {!isLoggedIn && (
            <div className="relative hidden sm:block" ref={studioRef}>
              <button
                onClick={() => setStudioDropdownOpen(!studioDropdownOpen)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#141720] hover:bg-[#1c2230] border border-[#2b3245] hover:border-amber-500/40 text-gray-200 hover:text-white transition-all shadow-md shrink-0"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Dành Cho Studio</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${studioDropdownOpen ? 'rotate-180 text-amber-400' : 'text-gray-400'}`} />
              </button>

              {studioDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 p-2 bg-[#12151e] border border-[#232938] rounded-2xl shadow-2xl space-y-1 animate-fadeIn z-50">
                  <button
                    onClick={() => {
                      setStudioDropdownOpen(false);
                      openAuthModal(null, 'register', 'photographer');
                    }}
                    className="w-full flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-amber-500/10 text-left transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-amber-950 transition-colors">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white group-hover:text-amber-300">
                        Đăng Ký Đối Tác NAG
                      </span>
                      <span className="text-[11px] text-gray-400 line-clamp-1">
                        Gia nhập mạng lưới nhận lịch chụp
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleStudioWorkspaceClick}
                    className="w-full flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-white/10 text-gray-300 shrink-0 group-hover:bg-white/20 group-hover:text-white transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white group-hover:text-amber-300 flex items-center space-x-1">
                        <span>Vào Studio Workspace</span>
                      </span>
                      <span className="text-[11px] text-gray-400 line-clamp-1">
                        Quản lý đơn, tải & duyệt ảnh
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Auth State Button (Đăng Nhập / Profile) */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => navigate(isAdmin ? '/admin' : '/app')}
                className="hidden lg:flex flex-col items-end leading-tight hover:opacity-80 transition-opacity text-left cursor-pointer"
                title="Xem không gian tài khoản của bạn"
              >
                <span className="text-xs font-bold text-white max-w-[120px] truncate">{currentUser?.name || 'Tài khoản'}</span>
                <span className={`text-[10px] font-extrabold uppercase ${
                  currentUser?.role === 'admin'
                    ? 'text-amber-400'
                    : currentUser?.role === 'photographer'
                      ? 'text-purple-400'
                      : 'text-blue-400'
                }`}>
                  {currentUser?.role === 'admin' ? 'Master Admin' : currentUser?.role === 'photographer' ? 'Photographer' : 'Khách Hàng'}
                </span>
              </button>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal(null, 'login')}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/15 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
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

          {/* Địa Điểm Chụp Đẹp */}
          <button
            onClick={() => handleNavClick('location-guides-section')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-amber-400 hover:bg-white/5 flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Địa Điểm Chụp Đẹp (Location Guides)</span>
          </button>

          <Link
            to="/photographers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            Nhiếp Ảnh Gia
          </Link>

          <Link
            to="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            Đặt Lịch Chụp
          </Link>

          <button
            onClick={() => handleNavClick('categories-section')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/5"
          >
            Gói Chụp Ảnh & Thể Loại
          </button>

          <button
            onClick={() => handleNavClick('album-lookup')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-amber-400 hover:bg-white/5 flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Tra Cứu Album Khách Hàng</span>
          </button>

          {/* Nếu là Khách Hàng: Đơn & Album Của Tôi */}
          {isLoggedIn && isClient && (
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-bold text-amber-300 hover:bg-white/5 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Đơn & Album Của Tôi</span>
            </Link>
          )}

          <div className="pt-3 border-t border-[#242938] space-y-2">
            {/* Nút Master Admin nổi bật ở Mobile Menu */}
            {isLoggedIn && isAdmin && (
              <button
                onClick={handleAdminClick}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 rounded-xl text-sm font-black flex items-center justify-center space-x-2 shadow-md"
              >
                <FolderKanban className="w-4 h-4 shrink-0" />
                <span>👑 Trang Quản Lý Master Admin</span>
              </button>
            )}

            {/* Nếu là Khách Hàng: Nút vào Không Gian Khách Hàng */}
            {isLoggedIn && isClient && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/app');
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>Vào Không Gian Khách Hàng</span>
              </button>
            )}

            {/* Nếu chưa đăng nhập: Đăng ký đối tác & Vào Studio */}
            {!isLoggedIn && (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal(null, 'register', 'photographer');
                  }}
                  className="w-full py-2.5 px-3 bg-[#141720] border border-[#2b3245] text-amber-300 hover:text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2"
                >
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Đăng Ký Đối Tác Nhiếp Ảnh Gia</span>
                </button>

                <button
                  onClick={handleStudioWorkspaceClick}
                  className="w-full py-2.5 px-3 bg-[#141720] border border-[#2b3245] text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Vào Studio Workspace</span>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </>
            )}

            {/* Nếu là Photographer đã đăng nhập */}
            {isLoggedIn && isPhotographer && (
              <button
                onClick={handleStudioWorkspaceClick}
                className="w-full py-2.5 px-3 bg-[#141720] border border-[#2b3245] text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Studio Của Tôi (Tạo Album)</span>
              </button>
            )}

            {/* Nút Đăng Xuất An Toàn trên Mobile Drawer */}
            {isLoggedIn && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Lịch Sử Đặt Lịch Của Tôi */}
      <MyBookingsModal
        isOpen={myBookingsOpen}
        onClose={() => setMyBookingsOpen(false)}
      />
    </header>
  );
};

export default Navbar;
