import React, { useState, useEffect } from 'react';
import {
  Mail,
  KeyRound,
  Send,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Server,
  Globe
} from 'lucide-react';
import { settingApi } from '../../api/settingApi';

export const AdminEmailSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const [formData, setFormData] = useState({
    emailUser: '',
    emailPass: '',
    emailSenderName: 'Photodate.vn - Nền Tảng Nhiếp Ảnh',
    emailService: 'gmail', // 'gmail' | 'custom'
    emailHost: '',
    emailPort: 587,
    emailSecure: false,
    isConfigured: false,
    hasPassword: false
  });

  const [testEmail, setTestEmail] = useState('');

  const fetchEmailSettings = async () => {
    try {
      setLoading(true);
      const res = await settingApi.getEmailSettings();
      if (res && res.data) {
        const isCustom = res.data.emailService === 'custom' || res.data.emailService === 'smtp';
        setFormData({
          emailUser: res.data.emailUser || '',
          emailPass: res.data.hasPassword ? '••••••••••••••••' : '',
          emailSenderName: res.data.emailSenderName || 'Photodate.vn - Nền Tảng Nhiếp Ảnh',
          emailService: isCustom ? 'custom' : 'gmail',
          emailHost: res.data.emailHost || '',
          emailPort: res.data.emailPort || 587,
          emailSecure: Boolean(res.data.emailSecure),
          isConfigured: Boolean(res.data.isConfigured),
          hasPassword: Boolean(res.data.hasPassword)
        });
        if (res.data.emailUser) {
          setTestEmail(res.data.emailUser);
        }
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Không thể tải thông tin cấu hình Email.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.emailUser.trim()) {
      setNotice({ type: 'error', text: 'Vui lòng nhập địa chỉ Email / Tài khoản gửi thư.' });
      return;
    }

    if (formData.emailService === 'custom' && !formData.emailHost.trim()) {
      setNotice({ type: 'error', text: 'Vui lòng nhập địa chỉ máy chủ SMTP (Host) khi sử dụng máy chủ riêng.' });
      return;
    }

    setSaving(true);
    setNotice(null);
    setTestResult(null);

    try {
      const payload = {
        emailUser: formData.emailUser.trim(),
        emailSenderName: formData.emailSenderName.trim(),
        emailService: formData.emailService,
        emailHost: formData.emailHost.trim(),
        emailPort: Number(formData.emailPort) || 587,
        emailSecure: Boolean(formData.emailSecure)
      };

      // Chỉ gửi emailPass nếu người dùng đã thay đổi (không phải placeholder ••••)
      if (formData.emailPass && !formData.emailPass.includes('•••')) {
        payload.emailPass = formData.emailPass.trim().replace(/\s+/g, '');
      }

      const res = await settingApi.updateEmailSettings(payload);
      setNotice({ type: 'success', text: res.message || 'Đã lưu cấu hình Email thành công!' });
      await fetchEmailSettings();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Lỗi khi lưu cấu hình Email.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail || !testEmail.trim()) {
      setTestResult({ type: 'error', text: 'Vui lòng nhập địa chỉ email nhận thư thử nghiệm.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await settingApi.testEmailSettings(testEmail.trim());
      setTestResult({
        type: 'success',
        text: res.message || `Gửi thư thử nghiệm thành công tới: ${testEmail}! Hãy kiểm tra hộp thư.`
      });
    } catch (err) {
      setTestResult({
        type: 'error',
        text: err.message || 'Kiểm tra gửi thư thất bại. Vui lòng kiểm tra lại thông tin Host, Port hoặc Mật khẩu.'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#14120e] border border-[#24201b] rounded-3xl p-12 text-center text-[#8e8474] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-500" />
        <p className="text-sm">Đang tải cấu hình Email hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#181512] via-[#201c17] to-[#181512] border border-[#332b21] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Hệ Thống Gửi Thư Tự Động
              </span>
              {formData.isConfigured ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Đã Kết Nối Gmail</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Chưa Cấu Hình
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
              <Mail className="w-6 h-6 text-amber-400" />
              <span>Cấu Hình Email Gửi Thư (Gmail / SMTP)</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#a2998a] max-w-2xl leading-relaxed">
              Master Admin có thể tự do thay đổi tài khoản Gmail làm email chính thức để tự động gửi mã OTP đặt lại mật khẩu cho Nhiếp ảnh gia, Khách hàng và Quản trị viên.
            </p>
          </div>

          <button
            onClick={fetchEmailSettings}
            className="self-start sm:self-center p-3 bg-[#0c0d12] hover:bg-[#1a1714] border border-[#2b251f] text-[#a2998a] hover:text-white rounded-2xl transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thông báo kết quả */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs sm:text-sm animate-fadeIn shadow-lg ${
            notice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed font-medium">{notice.text}</div>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-[#14120e] border border-[#24201b] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Service Type Selector */}
        <div className="space-y-2 pb-5 border-b border-[#24201b]">
          <label className="block text-xs font-bold text-white flex items-center space-x-1.5">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Phương thức gửi email (Email Service Provider)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, emailService: 'gmail' })}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                formData.emailService === 'gmail'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                  : 'bg-[#0c0a08] border-[#2b251f] text-[#8e8474] hover:text-white hover:border-[#443a2f]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                formData.emailService === 'gmail' ? 'bg-amber-500 text-amber-950 font-bold' : 'bg-[#1a1714] text-[#8e8474]'
              }`}>
                G
              </div>
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Gmail (Google Workspace)</span>
                  {formData.emailService === 'gmail' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="text-[11px] text-[#8e8474]">
                  Sử dụng tài khoản Gmail và Mật khẩu ứng dụng 16 số. Cài đặt nhanh trong 2 phút.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, emailService: 'custom' })}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                formData.emailService === 'custom'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                  : 'bg-[#0c0a08] border-[#2b251f] text-[#8e8474] hover:text-white hover:border-[#443a2f]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                formData.emailService === 'custom' ? 'bg-amber-500 text-amber-950 font-bold' : 'bg-[#1a1714] text-[#8e8474]'
              }`}>
                <Globe className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Máy Chủ SMTP Riêng / Mail Công Ty</span>
                  {formData.emailService === 'custom' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="text-[11px] text-[#8e8474]">
                  Hỗ trợ bất kỳ máy chủ SMTP (Tên miền riêng, SendGrid, Amazon SES, Office 365, Mail Hosting...).
                </div>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Custom SMTP Fields */}
          {formData.emailService === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#0c0a08] border border-[#2b251f]">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-white flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span>Máy chủ SMTP (Host) *</span>
                </label>
                <input
                  type="text"
                  required={formData.emailService === 'custom'}
                  value={formData.emailHost}
                  onChange={(e) => setFormData({ ...formData, emailHost: e.target.value })}
                  placeholder="VD: smtp.domain.vn hoặc mail.company.com"
                  className="w-full bg-[#14120e] border border-[#332b21] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#5a5245] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white">
                  <span>Cổng (Port) *</span>
                </label>
                <input
                  type="number"
                  required={formData.emailService === 'custom'}
                  value={formData.emailPort}
                  onChange={(e) => {
                    const port = parseInt(e.target.value, 10);
                    setFormData({
                      ...formData,
                      emailPort: e.target.value,
                      emailSecure: port === 465 ? true : formData.emailSecure
                    });
                  }}
                  placeholder="587 hoặc 465"
                  className="w-full bg-[#14120e] border border-[#332b21] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#5a5245] outline-none"
                />
              </div>

              <div className="sm:col-span-3 flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="smtpSecureCheckbox"
                  checked={formData.emailSecure}
                  onChange={(e) => setFormData({ ...formData, emailSecure: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="smtpSecureCheckbox" className="text-xs text-[#a2998a] cursor-pointer">
                  Sử dụng kết nối bảo mật SSL / TLS trực tiếp (Bật khi dùng cổng <strong className="text-white">465</strong>, Tắt khi dùng cổng <strong className="text-white">587</strong> với STARTTLS)
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Account / Username */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>
                  {formData.emailService === 'custom' ? 'Tài khoản đăng nhập / Email gửi thư *' : 'Tài khoản Gmail gửi thư *'}
                </span>
              </label>
              <input
                type="text"
                required
                value={formData.emailUser}
                onChange={(e) => setFormData({ ...formData, emailUser: e.target.value })}
                placeholder={formData.emailService === 'custom' ? 'lienhe@domain.vn' : 'VD: photostudio@gmail.com'}
                className="w-full bg-[#0c0a08] border border-[#332b21] focus:border-amber-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-[#5a5245] outline-none transition-all"
              />
              <p className="text-[11px] text-[#8e8474]">
                {formData.emailService === 'custom'
                  ? 'Tài khoản xác thực trên máy chủ SMTP của công ty hoặc dịch vụ email riêng.'
                  : 'Địa chỉ Gmail hoặc Google Workspace dùng để gửi thư tới người dùng.'}
              </p>
            </div>

            {/* 2. Sender Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Tên thương hiệu hiển thị người gửi</span>
              </label>
              <input
                type="text"
                required
                value={formData.emailSenderName}
                onChange={(e) => setFormData({ ...formData, emailSenderName: e.target.value })}
                placeholder="VD: Photodate.vn - Nền Tảng Nhiếp Ảnh"
                className="w-full bg-[#0c0a08] border border-[#332b21] focus:border-amber-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-[#5a5245] outline-none transition-all"
              />
              <p className="text-[11px] text-[#8e8474]">
                Tên hiển thị trong hòm thư đến của khách (người gửi: "{formData.emailSenderName}").
              </p>
            </div>

            {/* 3. Password */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-white flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>
                    {formData.emailService === 'custom'
                      ? 'Mật khẩu / Token xác thực máy chủ SMTP *'
                      : 'Mật khẩu ứng dụng Gmail (Google App Password - 16 ký tự) *'}
                  </span>
                </label>
                {formData.hasPassword && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã lưu mật khẩu</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!formData.hasPassword}
                  value={formData.emailPass}
                  onChange={(e) => setFormData({ ...formData, emailPass: e.target.value })}
                  placeholder={formData.hasPassword ? '•••••••••••••••• (Để trống nếu giữ nguyên)' : formData.emailService === 'custom' ? 'Nhập mật khẩu SMTP...' : 'VD: abcd efgh ijkl mnop'}
                  className="w-full bg-[#0c0a08] border border-[#332b21] focus:border-amber-500 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white font-mono placeholder-[#5a5245] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e8474] hover:text-white p-1 transition-colors"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#8e8474]">
                {formData.emailService === 'custom'
                  ? 'Mật khẩu hòm thư hoặc API Key do dịch vụ SMTP cấp.'
                  : '⚠️ Đây là Mật khẩu ứng dụng 16 chữ cái do Google cấp (không phải mật khẩu đăng nhập tài khoản thông thường). Xem hướng dẫn tạo bên dưới.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-[#24201b]">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu cấu hình...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Cấu Hình Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Testing Section */}
      <div className="bg-[#14120e] border border-[#24201b] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Kiểm Tra Kết Nối & Gửi Thử (Test Email)</h3>
            <p className="text-xs text-[#8e8474]">
              Gửi một email kiểm tra ngay lập tức để xác thực xem Gmail và Mật khẩu ứng dụng đã hoạt động chuẩn xác hay chưa.
            </p>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs sm:text-sm animate-fadeIn ${
              testResult.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            {testResult.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed font-medium">{testResult.text}</div>
          </div>
        )}

        <form onSubmit={handleTestEmail} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8474]" />
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Nhập email nhận thư thử nghiệm..."
              className="w-full bg-[#0c0a08] border border-[#332b21] focus:border-amber-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#5a5245] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={testing || !formData.isConfigured}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50 shrink-0"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang gửi thử...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi Thử Email</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Guide Card */}
      <div className="bg-[#14120e] border border-[#24201b] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2.5 text-amber-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Hướng Dẫn Lấy Mật Khẩu Ứng Dụng (Google App Password) Trong 2 Phút
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#0c0a08] border border-[#24201b] rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-white">Bật Xác Minh 2 Bước</h4>
            <p className="text-[11px] text-[#8e8474] leading-relaxed">
              Truy cập tài khoản Google của bạn &gt; vào mục <strong>Bảo mật (Security)</strong> &gt; bật tính năng <strong>Xác minh 2 bước</strong>.
            </p>
          </div>

          <div className="bg-[#0c0a08] border border-[#24201b] rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-white">Tạo Mật Khẩu Ứng Dụng</h4>
            <p className="text-[11px] text-[#8e8474] leading-relaxed">
              Tìm kiếm <strong>"Mật khẩu ứng dụng" (App Passwords)</strong> &gt; Đặt tên ứng dụng là <strong>"Photodate Mail"</strong> &gt; Nhấn <strong>Tạo</strong>.
            </p>
          </div>

          <div className="bg-[#0c0a08] border border-[#24201b] rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-white">Dán Vào Hệ Thống</h4>
            <p className="text-[11px] text-[#8e8474] leading-relaxed">
              Google sẽ cung cấp mã 16 chữ cái (dạng: <code>xxxx xxxx xxxx xxxx</code>). Hãy sao chép và dán vào ô Mật khẩu ở trên, sau đó nhấn <strong>Lưu Cấu Hình</strong>.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline"
          >
            <span>Mở trang Cài đặt Mật khẩu ứng dụng của Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailSettings;
