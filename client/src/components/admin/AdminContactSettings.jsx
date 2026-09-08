import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Send, 
  MessageCircle, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  Eye,
  Settings,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { settingApi } from '../../api/settingApi';

export const AdminContactSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const [formData, setFormData] = useState({
    hotline: '0777908179',
    hotlineDisplay: '0777 908 179',
    hotlineHours: '8h - 22h hàng ngày',
    enableHotline: true,

    telegramUrl: 'https://t.me/photodate',
    telegramSubtext: 'Chat Telegram 24/7',
    enableTelegram: true,

    zaloUrl: 'https://zalo.me/0777908179',
    zaloSubtext: 'Phản hồi sau 1 phút',
    enableZalo: false,

    messengerUrl: 'https://m.me/photodate.vn',
    messengerSubtext: 'Hỗ trợ 24/7',
    enableMessenger: false,

    supportPillText: 'Tư vấn hỗ trợ',
    supportPillSubtext: 'Trả lời tức thì • 24/7',
    enableSupportPill: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await settingApi.getContactSettings();
      if (res && res.data) {
        setFormData(prev => ({
          ...prev,
          ...res.data
        }));
      }
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Lỗi khi tải cấu hình liên hệ.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const res = await settingApi.updateContactSettings(formData);
      setNotice({ type: 'success', message: 'Đã cập nhật các link liên hệ và cấu hình Floating Button thành công!' });
      
      // Dispatch custom event để FloatingContactButton trên web cập nhật ngay lập tức mà không cần F5
      window.dispatchEvent(new CustomEvent('contact_settings_updated', { detail: res.data || formData }));
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Lỗi khi lưu cấu hình.' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="w-8 h-8 text-gold-400 animate-spin" />
        <p className="text-gray-400 text-sm">Đang tải cài đặt liên hệ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Notice Alert */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3 text-sm animate-fadeIn shadow-lg ${
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
          <span className="leading-relaxed font-medium">{notice.message}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Settings Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">

          {/* Section 1: Hotline */}
          <div className="bg-[#141210] border border-[#24201b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#24201b] pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Kênh 1: Hotline Gọi Điện Trực Tiếp</h3>
                  <p className="text-xs text-gray-400">Khách bấm vào sẽ gọi điện trực tiếp trên điện thoại</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableHotline: !formData.enableHotline })}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  formData.enableHotline
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <span>{formData.enableHotline ? '🟢 Đang Bật' : '⚪ Đang Tắt'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Số điện thoại gọi (Chỉ số) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hotline}
                  onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                  placeholder="0777908179"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-gold-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Chữ số hiển thị trên nút *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hotlineDisplay}
                  onChange={(e) => setFormData({ ...formData, hotlineDisplay: e.target.value })}
                  placeholder="0777 908 179"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-gold-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none font-mono font-bold text-amber-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Thời gian trực hotline (Hiển thị dòng phụ)
                </label>
                <input
                  type="text"
                  value={formData.hotlineHours}
                  onChange={(e) => setFormData({ ...formData, hotlineHours: e.target.value })}
                  placeholder="8h - 22h hàng ngày"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-gold-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Telegram (Mới thêm) */}
          <div className="bg-[#141210] border border-[#24201b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#24201b] pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base">Kênh 2: Telegram (Khuyên dùng)</h3>
                    <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 font-extrabold text-[10px] rounded-md border border-sky-500/30">Mới</span>
                  </div>
                  <p className="text-xs text-gray-400">Liên hệ qua ứng dụng Telegram bảo mật, phản hồi nhanh</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableTelegram: !formData.enableTelegram })}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  formData.enableTelegram
                    ? 'bg-sky-950/80 border-sky-500/50 text-sky-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <span>{formData.enableTelegram ? '🟢 Đang Bật' : '⚪ Đang Tắt'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Link Telegram hoặc Username *
                </label>
                <input
                  type="text"
                  value={formData.telegramUrl}
                  onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                  placeholder="https://t.me/photodate hoặc @photodate"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none font-mono"
                />
                <span className="text-[11px] text-gray-500 block mt-1">VD: https://t.me/your_telegram_name hoặc @username</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Dòng ghi chú phụ
                </label>
                <input
                  type="text"
                  value={formData.telegramSubtext}
                  onChange={(e) => setFormData({ ...formData, telegramSubtext: e.target.value })}
                  placeholder="Chat Telegram 24/7"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Zalo */}
          <div className="bg-[#141210] border border-[#24201b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#24201b] pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs">
                  Zalo
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Kênh 3: Zalo</h3>
                  <p className="text-xs text-gray-400">Nếu chưa có tài khoản Zalo OA / Zalo cá nhân, bạn có thể TẮT kênh này</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableZalo: !formData.enableZalo })}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  formData.enableZalo
                    ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <span>{formData.enableZalo ? '🟢 Đang Bật' : '⚪ Đang Tắt (Chưa làm)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Link Zalo hoặc Số Zalo
                </label>
                <input
                  type="text"
                  value={formData.zaloUrl}
                  onChange={(e) => setFormData({ ...formData, zaloUrl: e.target.value })}
                  placeholder="https://zalo.me/0777908179 hoặc 0777908179"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Dòng ghi chú phụ
                </label>
                <input
                  type="text"
                  value={formData.zaloSubtext}
                  onChange={(e) => setFormData({ ...formData, zaloSubtext: e.target.value })}
                  placeholder="Phản hồi sau 1 phút"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Facebook Messenger */}
          <div className="bg-[#141210] border border-[#24201b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#24201b] pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-xs">
                  FB
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Kênh 4: Facebook Messenger</h3>
                  <p className="text-xs text-gray-400">Nếu chưa lập Fanpage / Messenger, bạn có thể TẮT kênh này</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableMessenger: !formData.enableMessenger })}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  formData.enableMessenger
                    ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <span>{formData.enableMessenger ? '🟢 Đang Bật' : '⚪ Đang Tắt (Chưa làm)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Link Messenger hoặc Fanpage
                </label>
                <input
                  type="text"
                  value={formData.messengerUrl}
                  onChange={(e) => setFormData({ ...formData, messengerUrl: e.target.value })}
                  placeholder="https://m.me/photodate.vn hoặc photodate.vn"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Dòng ghi chú phụ
                </label>
                <input
                  type="text"
                  value={formData.messengerSubtext}
                  onChange={(e) => setFormData({ ...formData, messengerSubtext: e.target.value })}
                  placeholder="Hỗ trợ 24/7"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Support Pill & Button Style */}
          <div className="bg-[#141210] border border-[#24201b] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#24201b] pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Thẻ Phụ: "Tư Vấn Hỗ Trợ 24/7"</h3>
                  <p className="text-xs text-gray-400">Thẻ pill xanh nằm cạnh nút tròn chat nổi ở góc màn hình</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableSupportPill: !formData.enableSupportPill })}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  formData.enableSupportPill
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <span>{formData.enableSupportPill ? '🟢 Bật Thẻ Phụ' : '⚪ Ẩn Thẻ Phụ'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tiêu đề chính</label>
                <input
                  type="text"
                  value={formData.supportPillText}
                  onChange={(e) => setFormData({ ...formData, supportPillText: e.target.value })}
                  placeholder="Tư vấn hỗ trợ"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Phụ đề dòng dưới</label>
                <input
                  type="text"
                  value={formData.supportPillSubtext}
                  onChange={(e) => setFormData({ ...formData, supportPillSubtext: e.target.value })}
                  placeholder="Trả lời tức thì • 24/7"
                  className="w-full bg-[#100e0c] border border-[#2b2722] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={fetchData}
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-[#1d1a17] hover:bg-[#282420] border border-[#3b342d] text-gray-300 font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Khôi Phục Dữ Liệu Gốc</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-gold-600 via-gold-500 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-gold-950 font-black text-sm shadow-xl shadow-gold-500/20 transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Đang Lưu Cài Đặt...' : '⚡ LƯU CẤU HÌNH LIÊN HỆ NGAY'}</span>
            </button>
          </div>
        </form>

        {/* Right Preview Column: Live interactive simulation */}
        <div className="lg:col-span-4 bg-[#141210] border border-[#24201b] rounded-2xl p-5 space-y-4 shadow-xl sticky top-24">
          <div className="flex items-center justify-between border-b border-[#24201b] pb-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-gold-400" />
              <h3 className="font-bold text-white text-sm">Xem Trước Trực Quan (Live)</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Real-time Preview</span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Giao diện Floating Button sẽ hiển thị thực tế trên website như bên dưới:
          </p>

          {/* Preview Canvas */}
          <div className="bg-[#0b0c10] border border-[#1e2330] rounded-2xl p-6 min-h-[360px] flex flex-col justify-end items-end relative overflow-hidden shadow-inner">
            {/* Background mockup element */}
            <div className="absolute top-4 left-4 right-4 text-center opacity-30 pointer-events-none">
              <div className="h-4 bg-gray-700 rounded-md w-3/4 mx-auto mb-2" />
              <div className="h-3 bg-gray-800 rounded-md w-1/2 mx-auto" />
            </div>

            {/* Simulated Floating Menu */}
            <div className="space-y-2 mb-3 flex flex-col items-end w-full">
              {formData.enableHotline && (
                <div className="flex items-center bg-white text-gray-900 border-2 border-[#006a38] rounded-full pl-1.5 pr-3 py-1 shadow-lg max-w-fit">
                  <div className="w-7 h-7 rounded-full bg-[#006a38] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 fill-current stroke-0" />
                  </div>
                  <div className="ml-2 text-left leading-none">
                    <p className="text-xs font-black text-[#006a38]">Hotline: {formData.hotlineDisplay || formData.hotline}</p>
                    <p className="text-[9px] text-gray-500">({formData.hotlineHours})</p>
                  </div>
                </div>
              )}

              {formData.enableTelegram && (
                <div className="flex items-center bg-white text-gray-900 border-2 border-[#24A1DE] rounded-full pl-1.5 pr-3 py-1 shadow-lg max-w-fit">
                  <div className="w-7 h-7 rounded-full bg-[#24A1DE] text-white flex items-center justify-center shrink-0">
                    <Send className="w-3.5 h-3.5 fill-current stroke-0" />
                  </div>
                  <div className="ml-2 text-left leading-none">
                    <p className="text-xs font-black text-[#24A1DE]">Chat Telegram</p>
                    <p className="text-[9px] text-gray-500">({formData.telegramSubtext})</p>
                  </div>
                </div>
              )}

              {formData.enableZalo && (
                <div className="flex items-center bg-white text-gray-900 border-2 border-[#0068FF] rounded-full pl-1.5 pr-3 py-1 shadow-lg max-w-fit">
                  <div className="w-7 h-7 rounded-full bg-[#0068FF] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                    Zalo
                  </div>
                  <div className="ml-2 text-left leading-none">
                    <p className="text-xs font-black text-[#0068FF]">Tư vấn Zalo</p>
                    <p className="text-[9px] text-gray-500">({formData.zaloSubtext})</p>
                  </div>
                </div>
              )}

              {formData.enableMessenger && (
                <div className="flex items-center bg-white text-gray-900 border-2 border-[#0078FF] rounded-full pl-1.5 pr-3 py-1 shadow-lg max-w-fit">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00C6FF] to-[#A033FF] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                    FB
                  </div>
                  <div className="ml-2 text-left leading-none">
                    <p className="text-xs font-black text-[#0078FF]">Chat Messenger</p>
                    <p className="text-[9px] text-gray-500">({formData.messengerSubtext})</p>
                  </div>
                </div>
              )}

              {!formData.enableHotline && !formData.enableTelegram && !formData.enableZalo && !formData.enableMessenger && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 text-center w-full">
                  ⚠️ Chưa bật kênh liên hệ nào. Vui lòng bật ít nhất 1 kênh (Hotline hoặc Telegram).
                </div>
              )}
            </div>

            {/* Simulated Trigger */}
            <div className="flex items-center space-x-2">
              {formData.enableSupportPill && (
                <div className="bg-[#006a38] text-white px-3 py-1.5 rounded-full border border-emerald-400/40 flex items-center space-x-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <div className="text-left leading-none">
                    <p className="text-[11px] font-bold text-white">{formData.supportPillText}</p>
                    <p className="text-[9px] text-emerald-200">{formData.supportPillSubtext}</p>
                  </div>
                </div>
              )}

              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#006a38] to-[#10b981] border-2 border-white flex items-center justify-center text-white shadow-xl">
                <MessageCircle className="w-5 h-5 fill-current stroke-0" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#191613] rounded-xl border border-[#2b2722] text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gold-300 flex items-center space-x-1">
              <span>💡 Mẹo vận hành:</span>
            </p>
            <p>
              • Bạn có thể tạm thời <strong>TẮT Zalo & Facebook</strong>, chỉ để <strong>Hotline & Telegram</strong>.
            </p>
            <p>
              • Khi nào tạo xong Fanpage và Zalo OA, chỉ cần quay lại trang này bật ON và dán link vào là xong.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactSettings;
