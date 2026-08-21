import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  KeyRound,
  Camera,
  ShieldCheck,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  User,
  Mail,
  Phone,
  Globe,
  Award,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    redirectAfterAuth,
    authModalInitialTab = 'login',
    authModalInitialRole = 'photographer'
  } = useAuth();

  const navigate = useNavigate();

  // Mode: 'login' | 'register'
  const [tab, setTab] = useState('login');
  // Role for register/login: 'photographer' | 'client' | 'admin'
  const [role, setRole] = useState('photographer');

  // Form states
  const [loginData, setLoginData] = useState({
    emailOrPhone: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'photographer',
    studioInfo: {
      avatar: '',
      portfolioUrl: '',
      experience: '2-3 năm',
      equipment: '',
      styles: 'Chân dung, Cặp đôi',
      location: 'Hà Nội',
      bio: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingNotice, setPendingNotice] = useState(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalInitialTab || 'login');
      setRole(authModalInitialRole || 'photographer');
      setError('');
      setPendingNotice(null);
    }
  }, [isAuthModalOpen, authModalInitialTab, authModalInitialRole]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({
        emailOrPhone: loginData.emailOrPhone,
        password: loginData.password,
        role
      });

      closeAuthModal();

      if (res.user.role === 'photographer') {
        navigate('/app');
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (redirectAfterAuth && redirectAfterAuth !== '/admin') {
        navigate(redirectAfterAuth);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        role: role,
        studioInfo: role === 'photographer' ? registerData.studioInfo : {}
      };

      const res = await register(payload);

      if (role === 'photographer') {
        setPendingNotice({
          name: registerData.name,
          email: registerData.email
        });
      } else {
        // Tự động đăng nhập cho khách hàng
        await login({
          emailOrPhone: registerData.email,
          password: registerData.password,
          role: 'client'
        });
        closeAuthModal();
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#141720] border border-[#2b3245] rounded-3xl shadow-2xl text-[#f8fafc] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow background effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 z-20 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-4 max-h-full">

        {/* MÀN HÌNH THÔNG BÁO CHỜ DUYỆT (CHO PHOTOGRAPHER) */}
        {pendingNotice ? (
          <div className="text-center space-y-5 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full uppercase tracking-wider">
                Đang Chờ Phê Duyệt Hồ Sơ
              </span>
              <h3 className="text-2xl font-black text-white">
                Cảm ơn bạn, {pendingNotice.name}!
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
                Hồ sơ năng lực & Portfolio của bạn đã được gửi đến Ban Quản Trị để kiểm duyệt chuyên môn. Sau khi được duyệt (trong vòng 24h), bạn có thể đăng nhập và tạo album ngay.
              </p>
            </div>

            <div className="p-4 bg-[#0c0d12] border border-[#242938] rounded-2xl text-xs text-gray-400 text-left space-y-1">
              <div>• Email tài khoản: <strong className="text-white">{pendingNotice.email}</strong></div>
              <div>• Hotline hỗ trợ duyệt nhanh: <strong className="text-amber-400">1900 6868</strong></div>
            </div>

            <button
              onClick={() => {
                setPendingNotice(null);
                setTab('login');
              }}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-2xl text-sm transition-all"
            >
              Về Màn Hình Đăng Nhập
            </button>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex mb-1">
                <img
                  src="/Photodate.svg"
                  alt="Photodate Logo"
                  className="w-12 h-12 rounded-2xl object-contain shadow-lg"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {tab === 'login' ? 'Đăng Nhập Hệ Thống' : 'Đăng Ký Tài Khoản'}
              </h3>
              <p className="text-xs text-gray-400">
                {tab === 'login'
                  ? 'Truy cập Studio Workspace hoặc Bảng điều khiển quản trị'
                  : 'Gia nhập mạng lưới Nhiếp ảnh gia chuyên nghiệp & Khách hàng'}
              </p>
            </div>

            {/* Mode Switcher: Login vs Register */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0c0d12] rounded-2xl border border-[#242938] mb-5">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${tab === 'login'
                    ? 'bg-amber-500 text-amber-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                Đăng Nhập
              </button>

              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${tab === 'register'
                    ? 'bg-amber-500 text-amber-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                Đăng Ký Mới
              </button>
            </div>

            {/* Role Switcher (For Registration) */}
            {tab === 'register' && (
              <div className="space-y-1.5 mb-5">
                <label className="block text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  Bạn muốn đăng ký với vai trò gì?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('photographer')}
                    className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${role === 'photographer'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-[#242938] bg-[#0c0d12] text-gray-400 hover:text-white'
                      }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Nhiếp Ảnh Gia / Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${role === 'client'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-[#242938] bg-[#0c0d12] text-gray-400 hover:text-white'
                      }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Khách Hàng Chụp Ảnh</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: FORM ĐĂNG NHẬP */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Email, Số điện thoại
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={loginData.emailOrPhone}
                      onChange={(e) => setLoginData({ ...loginData, emailOrPhone: e.target.value })}
                      placeholder="VD: studio@potonow.vn hoặc 0912345678"
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Nhập mật khẩu..."
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng Nhập Vào Hệ Thống</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: FORM ĐĂNG KÝ */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Họ tên */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    {role === 'photographer' ? 'Tên Nhiếp Ảnh Gia / Studio *' : 'Họ và tên *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder={role === 'photographer' ? 'VD: Minh Hoàng Studio' : 'VD: Nguyễn Thị Mai'}
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* Email & SĐT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-300">Email *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-300">Số điện thoại / Zalo *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        placeholder="0912 345 678"
                        className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Mật khẩu */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">Mật khẩu khởi tạo * (tối thiểu 6 ký tự)</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* FIELDS DÀNH RIÊNG CHO NHIẾP ẢNH GIA / STUDIO */}
                {role === 'photographer' && (
                  <div className="bg-[#0c0d12] border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase">
                      <Award className="w-4 h-4" />
                      <span>Hồ sơ năng lực (Để Admin kiểm duyệt)</span>
                    </div>

                    {/* Ảnh đại diện Avatar Studio / Photographer */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-300">
                        Ảnh Đại Diện / Logo Studio <span className="text-amber-400 font-normal">(Up file hoặc dán URL)</span>
                      </label>
                      <div className="flex items-center space-x-3 bg-[#141720] p-2.5 rounded-xl border border-[#2b3245]">
                        <div className="relative w-11 h-11 rounded-xl bg-[#1c2230] border border-amber-500/40 overflow-hidden shrink-0 flex items-center justify-center">
                          {registerData.studioInfo.avatar ? (
                            <img
                              src={registerData.studioInfo.avatar}
                              alt="Avatar Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'; }}
                            />
                          ) : (
                            <Camera className="w-5 h-5 text-amber-400/70" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center space-x-2">
                            <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all flex items-center space-x-1.5 shrink-0">
                              <Camera className="w-3.5 h-3.5" />
                              <span>Tải ảnh từ máy</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 3 * 1024 * 1024) {
                                      alert('Dung lượng ảnh tối đa 3MB.');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setRegisterData({
                                        ...registerData,
                                        studioInfo: { ...registerData.studioInfo, avatar: reader.result }
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <span className="text-[10px] text-gray-400">hoặc dán URL</span>
                          </div>
                          <input
                            type="url"
                            value={registerData.studioInfo.avatar || ''}
                            onChange={(e) => setRegisterData({
                              ...registerData,
                              studioInfo: { ...registerData.studioInfo, avatar: e.target.value }
                            })}
                            placeholder="https://example.com/avatar.jpg"
                            className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-gray-500 outline-none truncate"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Link Portfolio */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-300">
                        Link Portfolio / Facebook / Instagram tác phẩm <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          required
                          value={registerData.studioInfo.portfolioUrl}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            studioInfo: { ...registerData.studioInfo, portfolioUrl: e.target.value }
                          })}
                          placeholder="https://instagram.com/yourstudio hoặc link drive/behance"
                          className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Kinh nghiệm, Khu vực & Thể loại (DROPDOWNS) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">Số năm kinh nghiệm *</label>
                        <select
                          value={registerData.studioInfo.experience || '3 - 5 năm (Chuyên nghiệp)'}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            studioInfo: { ...registerData.studioInfo, experience: e.target.value }
                          })}
                          className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="Dưới 1 năm (Mới vào nghề)">Dưới 1 năm (Mới vào nghề)</option>
                          <option value="1 - 2 năm">1 - 2 năm kinh nghiệm</option>
                          <option value="3 - 5 năm (Chuyên nghiệp)">3 - 5 năm (Chuyên nghiệp)</option>
                          <option value="5 - 10 năm (Kỳ cựu)">5 - 10 năm (Kỳ cựu)</option>
                          <option value="Trên 10 năm (Master / Chuyên gia)">Trên 10 năm (Master / Chuyên gia)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">Khu vực hoạt động *</label>
                        <select
                          value={registerData.studioInfo.location || 'Hà Nội'}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            studioInfo: { ...registerData.studioInfo, location: e.target.value }
                          })}
                          className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Nha Trang">Nha Trang</option>
                          <option value="Đà Lạt">Đà Lạt</option>
                          <option value="Hải Phòng">Hải Phòng</option>
                          <option value="Cần Thơ">Cần Thơ</option>
                          <option value="Huế">Huế</option>
                          <option value="Quảng Ninh">Quảng Ninh</option>
                          <option value="Bình Dương">Bình Dương</option>
                          <option value="Toàn quốc (Nhận chụp xa)">Toàn quốc (Nhận chụp xa)</option>
                        </select>
                      </div>
                    </div>

                    {/* Thể loại sở trường (CHỌN NHIỀU TAG) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <label className="font-semibold text-gray-300">
                          Thể loại sở trường <span className="text-amber-400 font-bold">(Chọn nhiều) *</span>
                        </label>
                        <span className="text-[10px] text-gray-400">Bấm để chọn/bỏ chọn</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {[
                          'Chân dung nghệ thuật',
                          'Ảnh cưới & Pre-wedding',
                          'Kỷ yếu & Sinh viên',
                          'Gia đình & Em bé',
                          'Sự kiện & Doanh nghiệp',
                          'Lookbook & Thời trang',
                          'Đường phố & Phóng sự'
                        ].map(style => {
                          const currentStr = registerData.studioInfo.styles || '';
                          const isSelected = currentStr.includes(style);
                          return (
                            <button
                              key={style}
                              type="button"
                              onClick={() => {
                                const currentList = currentStr ? currentStr.split(',').map(s => s.trim()).filter(Boolean) : [];
                                const nextList = isSelected
                                  ? currentList.filter(s => s !== style)
                                  : [...currentList, style];
                                setRegisterData({
                                  ...registerData,
                                  studioInfo: { ...registerData.studioInfo, styles: nextList.join(', ') }
                                });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${isSelected
                                  ? 'bg-amber-500 text-amber-950 font-bold shadow-md scale-105'
                                  : 'bg-[#141720] hover:bg-[#1c2230] border border-[#2b3245] text-gray-400 hover:text-white'
                                }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {style}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi hồ sơ...</span>
                    </>
                  ) : (
                    <>
                      <span>{role === 'photographer' ? 'Gửi Hồ Sơ Xét Duyệt' : 'Hoàn Tất Đăng Ký'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Modal Footer Note */}
            <div className="mt-5 pt-3.5 border-t border-[#242938] text-center text-xs text-gray-400">
              <span>Khách hàng có mã xem ảnh? </span>
              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  const el = document.getElementById('album-lookup');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/#album-lookup');
                }}
                className="text-amber-400 font-semibold hover:underline"
              >
                Tra cứu Album tại đây
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
