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
  ArrowLeft,
  UserCheck,
  User,
  Mail,
  Phone,
  Globe,
  Award,
  CheckCircle2,
  Clock,
  RefreshCw,
  Send,
  Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { addressApi } from '../../api/addressApi';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    redirectAfterAuth,
    authModalInitialTab = 'login',
    authModalInitialRole = 'photographer'
  } = useAuth();

  const navigate = useNavigate();

  // Mode: 'login' | 'register' | 'forgot' | 'reset'
  const [tab, setTab] = useState('login');
  // Role for register/login: 'photographer' | 'client' | 'admin'
  const [role, setRole] = useState('photographer');

  // Form states
  const [loginData, setLoginData] = useState({
    emailOrPhone: '',
    password: ''
  });

  // Forgot & Reset Password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'photographer',
    address: '',
    province: 'Hà Nội',
    ward: '',
    studioInfo: {
      avatar: '',
      portfolioUrl: '',
      experience: '2-3 năm',
      equipment: '',
      styles: 'Chân dung nghệ thuật',
      location: 'Hà Nội',
      province: 'Hà Nội',
      ward: '',
      address: '',
      startingPrice: '',
      bio: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingNotice, setPendingNotice] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    let mounted = true;
    addressApi.getProvinces()
      .then(res => {
        if (mounted && res.data?.success && Array.isArray(res.data.data)) {
          setProvinces(res.data.data);
          const defaultProv = res.data.data.find(p => p.name.includes('Hà Nội')) || res.data.data[0];
          if (defaultProv) {
            addressApi.getWards(defaultProv.provinceId)
              .then(wRes => {
                if (mounted && wRes.data?.success && Array.isArray(wRes.data.data)) {
                  setWards(wRes.data.data);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleProvinceSelect = async (provName) => {
    const found = provinces.find(p => p.name === provName);
    const provId = found ? found.provinceId : null;
    setRegisterData(prev => ({
      ...prev,
      province: provName,
      ward: '',
      studioInfo: {
        ...prev.studioInfo,
        location: provName,
        province: provName,
        ward: ''
      }
    }));
    if (provId) {
      try {
        setLoadingWards(true);
        const res = await addressApi.getWards(provId);
        const list = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
        setWards(list);
      } catch (_) {
        setWards([]);
      } finally {
        setLoadingWards(false);
      }
    } else {
      setWards([]);
    }
  };

  // Tự động bắt URL query param nếu người dùng click link từ email (vd: ?action=reset-password&token=xxx&email=yyy)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const token = params.get('token');
      const email = params.get('email');
      if (action === 'reset-password' || token) {
        if (email) setForgotEmail(email);
        if (token) setResetToken(token);
        setTab('reset');
        setError('');
        if (!isAuthModalOpen && typeof openAuthModal === 'function') {
          openAuthModal(null, 'reset');
        }
      }
    } catch (_) {}
  }, []);

  // Bộ đếm ngược gửi lại mã OTP (60s)
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(c => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalInitialTab || 'login');
      setRole(authModalInitialRole || 'photographer');
      setError('');
      setPendingNotice(null);
    }
  }, [isAuthModalOpen, authModalInitialTab, authModalInitialRole]);

  // Xử lý gửi yêu cầu quên mật khẩu
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.trim()) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    setError('');
    setResetSuccessMessage('');
    setLoading(true);
    try {
      const res = await userApi.forgotPassword(forgotEmail.trim());
      setTab('reset');
      setResendCountdown(60);
      setResetSuccessMessage(res.message || 'Mã xác thực 6 số đã được gửi tới email của bạn!');
    } catch (err) {
      setError(err.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendCode = async () => {
    if (resendCountdown > 0 || loading) return;
    setError('');
    setResetSuccessMessage('');
    setLoading(true);
    try {
      const res = await userApi.forgotPassword(forgotEmail.trim());
      setResendCountdown(60);
      setResetSuccessMessage('Đã gửi lại mã OTP mới. Vui lòng kiểm tra hộp thư!');
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã.');
    } finally {
      setLoading(false);
    }
  };

  // Đặt lại mật khẩu mới
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccessMessage('');

    if (!resetCode && !resetToken) {
      setError('Vui lòng nhập mã xác thực OTP 6 chữ số đã nhận qua email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);
    try {
      const res = await userApi.resetPassword({
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        token: resetToken,
        newPassword
      });

      setResetSuccessMessage(res.message || 'Đặt lại mật khẩu thành công!');
      setLoginData(prev => ({ ...prev, emailOrPhone: forgotEmail.trim(), password: '' }));
      setResetCode('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');

      // Chuyển sang màn hình đăng nhập sau 1.5s
      setTimeout(() => {
        setTab('login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

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
        navigate('/app');
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
      const fullAddr = [
        registerData.address.trim(),
        registerData.ward.trim(),
        registerData.province.trim()
      ].filter(Boolean).join(', ');

      const payload = {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        address: fullAddr || registerData.address,
        province: registerData.province,
        ward: registerData.ward,
        role: role,
        studioInfo: role === 'photographer' ? {
          ...registerData.studioInfo,
          location: registerData.province || registerData.studioInfo.location,
          province: registerData.province,
          ward: registerData.ward,
          address: registerData.address
        } : {}
      };

      const res = await register(payload);

      if (role === 'photographer') {
        if (res.user?.status === 'active' || res.autoApprove) {
          // Tự động đăng nhập cho Nhiếp ảnh gia vào thẳng Studio Workspace để trải nghiệm
          await login({
            emailOrPhone: registerData.email,
            password: registerData.password,
            role: 'photographer'
          });
          closeAuthModal();
          navigate('/app');
        } else {
          setPendingNotice({
            name: registerData.name,
            email: registerData.email
          });
        }
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
              <div>• Hotline hỗ trợ duyệt nhanh: <strong className="text-amber-400">0777908179</strong></div>
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
                {tab === 'login'
                  ? 'Đăng Nhập Hệ Thống'
                  : tab === 'register'
                  ? 'Đăng Ký Tài Khoản'
                  : tab === 'forgot'
                  ? 'Khôi Phục Mật Khẩu'
                  : 'Thiết Lập Mật Khẩu Mới'}
              </h3>
              <p className="text-xs text-gray-400">
                {tab === 'login'
                  ? 'Truy cập Studio Workspace hoặc Bảng điều khiển quản trị'
                  : tab === 'register'
                  ? 'Gia nhập mạng lưới Nhiếp ảnh gia chuyên nghiệp & Khách hàng'
                  : tab === 'forgot'
                  ? 'Nhập email của bạn để nhận mã xác thực OTP đặt lại mật khẩu'
                  : 'Nhập mã 6 số từ email và thiết lập mật khẩu mới cho tài khoản'}
              </p>
            </div>

            {/* Back Button khi đang ở màn hình Quên / Đặt lại mật khẩu */}
            {(tab === 'forgot' || tab === 'reset') && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setError('');
                    setResetSuccessMessage('');
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại Đăng nhập</span>
                </button>
              </div>
            )}

            {/* Mode Switcher: Chỉ hiện khi ở chế độ Login hoặc Register */}
            {(tab === 'login' || tab === 'register') && (
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0c0d12] rounded-2xl border border-[#242938] mb-5">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); setResetSuccessMessage(''); }}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${tab === 'login'
                      ? 'bg-amber-500 text-amber-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Đăng Nhập
                </button>

                <button
                  type="button"
                  onClick={() => { setTab('register'); setError(''); setResetSuccessMessage(''); }}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${tab === 'register'
                      ? 'bg-amber-500 text-amber-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Đăng Ký Mới
                </button>
              </div>
            )}

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
                {resetSuccessMessage && (
                  <div className="flex items-start space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span className="leading-relaxed">{resetSuccessMessage}</span>
                  </div>
                )}

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
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-200">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginData.emailOrPhone?.includes('@') ? loginData.emailOrPhone : '');
                        setTab('forgot');
                        setError('');
                        setResetSuccessMessage('');
                      }}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
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

            {/* TAB: QUÊN MẬT KHẨU (GỬI OTP) */}
            {tab === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Địa chỉ Email tài khoản
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="VD: studio@potonow.vn hoặc email của bạn"
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Hệ thống sẽ gửi mã xác thực 6 chữ số và liên kết đặt lại mật khẩu đến hòm thư này.
                  </p>
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
                      <span>Đang gửi mã xác thực...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi Mã Xác Nhận Qua Email</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB: ĐẶT LẠI MẬT KHẨU MỚI (VỚI OTP) */}
            {tab === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4 animate-fade-in">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span className="leading-relaxed">
                    Mã OTP 6 số đã được gửi tới: <strong className="text-white">{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư (cả mục Spam/Quảng cáo).
                  </span>
                </div>

                {/* Mã OTP 6 số */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Mã xác thực OTP (6 chữ số)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="VD: 123456"
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-10 pr-4 py-3 text-base text-white tracking-widest font-mono placeholder-gray-600 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Mật khẩu mới (Tối thiểu 6 ký tự)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-200">
                    Xác nhận lại mật khẩu mới
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {resetSuccessMessage && (
                  <div className="flex items-start space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span className="leading-relaxed">{resetSuccessMessage}</span>
                  </div>
                )}

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
                      <span>Đang cập nhật mật khẩu...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đặt Lại Mật Khẩu Mới</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    disabled={resendCountdown > 0 || loading}
                    onClick={handleResendCode}
                    className="text-xs font-semibold text-gray-400 hover:text-amber-400 disabled:opacity-50 transition-colors"
                  >
                    {resendCountdown > 0 ? (
                      <span>Chưa nhận được mã? Gửi lại sau <strong className="text-amber-400">{resendCountdown}s</strong></span>
                    ) : (
                      <span>Chưa nhận được mã? <strong className="text-amber-400">Gửi lại mã OTP ngay</strong></span>
                    )}
                  </button>
                </div>
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

                {/* KHU VỰC CƯ TRÚ DÀNH CHO KHÁCH HÀNG */}
                {role === 'client' && (
                  <div className="bg-[#0c0d12] border border-[#2b3245] rounded-2xl p-3.5 space-y-2.5">
                    <label className="block text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>Khu Vực & Địa Chỉ Cư Trú (Khách Hàng)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[11px] text-gray-400">Tỉnh / Thành phố *</span>
                        <select
                          value={registerData.province}
                          onChange={(e) => handleProvinceSelect(e.target.value)}
                          className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="">-- Chọn Tỉnh / Thành --</option>
                          {provinces.map((p) => (
                            <option key={p.provinceId} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-gray-400">Phường / Xã</span>
                        <select
                          value={registerData.ward}
                          onChange={(e) => setRegisterData({ ...registerData, ward: e.target.value })}
                          disabled={!registerData.province || wards.length === 0}
                          className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer disabled:opacity-40"
                        >
                          <option value="">{loadingWards ? 'Đang tải...' : '-- Chọn Phường / Xã --'}</option>
                          {wards.map((w) => (
                            <option key={w.wardId} value={w.name}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-gray-400">Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà...)</span>
                      <input
                        type="text"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        placeholder="VD: Số 25 Tôn Đức Thắng, Căn hộ A12..."
                        className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* HỒ SƠ NĂNG LỰC & STUDIO DÀNH RIÊNG CHO NHIẾP ẢNH GIA */}
                {role === 'photographer' && (
                  <div className="bg-[#0c0d12] border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase">
                      <Award className="w-4 h-4" />
                      <span>Hồ sơ năng lực & Thông tin Studio</span>
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

                    {/* Địa chỉ cơ sở & Khu vực hoạt động của Studio */}
                    <div className="space-y-2 bg-[#141720] p-3 rounded-xl border border-[#2b3245]">
                      <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-300">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Khu Vực & Địa Chỉ Cơ Sở / Studio</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-gray-400">Tỉnh / Thành phố *</label>
                          <select
                            value={registerData.province}
                            onChange={(e) => handleProvinceSelect(e.target.value)}
                            className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer"
                          >
                            {provinces.length > 0 ? (
                              provinces.map((p) => (
                                <option key={p.provinceId} value={p.name}>{p.name}</option>
                              ))
                            ) : (
                              <option value="Hà Nội">Hà Nội</option>
                            )}
                            <option value="Toàn quốc (Nhận chụp xa)">Toàn quốc (Nhận chụp xa)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-gray-400">Phường / Xã</label>
                          <select
                            value={registerData.ward}
                            onChange={(e) => setRegisterData({ ...registerData, ward: e.target.value })}
                            disabled={!registerData.province || wards.length === 0}
                            className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer disabled:opacity-40"
                          >
                            <option value="">{loadingWards ? 'Đang tải...' : '-- Chọn Phường / Xã --'}</option>
                            {wards.map((w) => (
                              <option key={w.wardId} value={w.name}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-gray-400">Địa chỉ cụ thể Studio (Số nhà, ngõ ngách, tên đường)</label>
                        <input
                          type="text"
                          value={registerData.address}
                          onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                          placeholder="VD: Số 88 Phố Huế, Tầng 3 Studio..."
                          className="w-full bg-[#0c0d12] border border-[#2b3245] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Giới thiệu bản thân & Hồ sơ năng lực (Bio) */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-300">
                        Giới thiệu Hồ Sơ Năng Lực & Phong Cách Chụp (Bio)
                      </label>
                      <textarea
                        rows={2}
                        value={registerData.studioInfo.bio}
                        onChange={(e) => setRegisterData({
                          ...registerData,
                          studioInfo: { ...registerData.studioInfo, bio: e.target.value }
                        })}
                        placeholder="Giới thiệu đôi nét về bản thân, phong cách bấm máy, kinh nghiệm tác nghiệp..."
                        className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 outline-none"
                      />
                    </div>

                    {/* Thiết bị tác nghiệp & Giá khởi điểm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">Thiết bị máy ảnh / Lens chính</label>
                        <input
                          type="text"
                          value={registerData.studioInfo.equipment}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            studioInfo: { ...registerData.studioInfo, equipment: e.target.value }
                          })}
                          placeholder="Sony A7IV, Canon R6, 24-70 GM..."
                          className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">Bảng giá khởi điểm (tham khảo)</label>
                        <input
                          type="text"
                          value={registerData.studioInfo.startingPrice}
                          onChange={(e) => setRegisterData({
                            ...registerData,
                            studioInfo: { ...registerData.studioInfo, startingPrice: e.target.value }
                          })}
                          placeholder="VD: Từ 1.200.000đ"
                          className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Kinh nghiệm & Link Portfolio */}
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
                        <label className="block text-[11px] font-semibold text-gray-300">
                          Link Portfolio tác phẩm <span className="text-gray-400 font-normal text-[10px]">(Tùy chọn)</span>
                        </label>
                        <div className="relative">
                          <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            value={registerData.studioInfo.portfolioUrl}
                            onChange={(e) => setRegisterData({
                              ...registerData,
                              studioInfo: { ...registerData.studioInfo, portfolioUrl: e.target.value }
                            })}
                            placeholder="https://instagram.com/..."
                            className="w-full bg-[#141720] border border-[#2b3245] focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                          />
                        </div>
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
