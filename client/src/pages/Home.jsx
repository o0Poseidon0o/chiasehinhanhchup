import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderOpen, 
  Lock, 
  Settings, 
  Download, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  PlusCircle 
} from 'lucide-react';
import { albumApi } from '../api/albumApi';
import { getPublicBaseUrl } from '../utils/formatters';

export const Home = () => {
  const [formData, setFormData] = useState({
    title: '',
    driveFolderUrl: '',
    passcode: '',
    maxSelect: 0,
    allowDownload: true,
    allowComment: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const [copiedClient, setCopiedClient] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fillMockData = () => {
    setFormData({
      title: 'Demo Album Cưới Hoàng & Mai - Studio Khát Vọng',
      driveFolderUrl: 'mock',
      passcode: '1234',
      maxSelect: 4,
      allowDownload: true,
      allowComment: true,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await albumApi.create(formData);
      setSuccessData(result.data);
    } catch (err) {
      setError(err.message || 'Không thể tạo album.');
    } finally {
      setLoading(false);
    }
  };

  const getClientUrl = () => {
    if (!successData) return '';
    const base = getPublicBaseUrl();
    return `${base}/album/${successData.albumId}`;
  };

  const getAdminUrl = () => {
    if (!successData) return '';
    const base = getPublicBaseUrl();
    return `${base}/album/${successData.albumId}/manage?token=${successData.manageToken}`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'client') {
      setCopiedClient(true);
      setTimeout(() => setCopiedClient(false), 2000);
    } else {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2000);
    }
  };

  const resetForm = () => {
    setSuccessData(null);
    setFormData({
      title: '',
      driveFolderUrl: '',
      passcode: '',
      maxSelect: 0,
      allowDownload: true,
      allowComment: true,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quy trình chọn ảnh tự động & tốc độ cao</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gold-100 tracking-tight">
          Tạo Album Chọn Ảnh Cho Khách Hàng
        </h1>
        <p className="text-sm text-[#a2998a] max-w-xl mx-auto leading-relaxed">
          Chỉ cần dán link thư mục Google Drive, hệ thống sẽ tự động tạo thư viện ảnh trực tuyến để khách hàng xem, thả tim chọn ảnh, ghi chú chỉnh sửa và gửi lại cho bạn.
        </p>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-start space-x-3 text-red-300 text-xs sm:text-sm animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* FORM HOẶC MÀN HÌNH THÀNH CÔNG */}
      {!successData ? (
        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden border border-[#2b2722]"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

          {/* Quick Mock Demo Fill Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={fillMockData}
              className="text-[11px] text-gold-400 hover:text-gold-300 font-semibold flex items-center space-x-1 hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              <span>Điền dữ liệu mẫu (Mock demo) để thử nghiệm ngay</span>
            </button>
          </div>

          {/* Tên Album */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold">
              Tên Album <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Ví dụ: Album Cưới Tú & Thư - Studio XYZ"
              className="w-full bg-[#161412] border border-[#2b2722] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-all text-[#f5eedf]"
            />
          </div>

          {/* Google Drive URL */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold">
              Đường dẫn thư mục Google Drive <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FolderOpen className="absolute left-4 top-3.5 w-4 h-4 text-gold-400/60" />
              <input
                type="text"
                name="driveFolderUrl"
                required
                value={formData.driveFolderUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/drive/folders/1A2B3C... hoặc 'mock'"
                className="w-full bg-[#161412] border border-[#2b2722] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-all text-[#f5eedf]"
              />
            </div>
            <p className="text-[11px] text-[#8e8576] leading-normal">
              💡 Thư mục Google Drive phải bật quyền chia sẻ:{' '}
              <strong className="text-[#d4cbba]">"Bất kỳ ai có đường liên kết đều có thể xem (Viewer)"</strong>.
            </p>
          </div>

          {/* Config options grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Mã PIN */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold flex items-center justify-between">
                <span>Mã PIN truy cập</span>
                <span className="text-[10px] text-[#6e665a] normal-case">Không bắt buộc</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gold-400/60" />
                <input
                  type="text"
                  name="passcode"
                  value={formData.passcode}
                  onChange={handleChange}
                  placeholder="Ví dụ: 1234"
                  maxLength={10}
                  className="w-full bg-[#161412] border border-[#2b2722] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-all text-[#f5eedf] font-mono tracking-widest"
                />
              </div>
              <p className="text-[10px] text-[#6e665a]">Mật khẩu số giúp khách hàng bảo mật ảnh riêng tư.</p>
            </div>

            {/* Giới hạn chọn */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold flex items-center justify-between">
                <span>Số ảnh khách được chọn tối đa</span>
                <span className="text-[10px] text-[#6e665a] normal-case">0 là không giới hạn</span>
              </label>
              <div className="relative">
                <Settings className="absolute left-4 top-3.5 w-4 h-4 text-gold-400/60" />
                <input
                  type="number"
                  name="maxSelect"
                  min={0}
                  value={formData.maxSelect}
                  onChange={handleChange}
                  placeholder="Ví dụ: 30"
                  className="w-full bg-[#161412] border border-[#2b2722] rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-gold-500 transition-all text-[#f5eedf]"
                />
              </div>
              <p className="text-[10px] text-[#6e665a]">Giới hạn số lượng ảnh khách được phép tích chọn chốt gửi.</p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="bg-[#13110f]/60 border border-[#25221e] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cho phép tải ảnh */}
            <label className="flex items-center space-x-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                name="allowDownload"
                checked={formData.allowDownload}
                onChange={handleChange}
                className="w-4.5 h-4.5 rounded accent-gold-500 bg-[#161412] border-[#2b2722]"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#f5eedf] flex items-center space-x-1">
                  <Download className="w-3.5 h-3.5 text-gold-400" />
                  <span>Cho phép tải ảnh</span>
                </span>
                <span className="text-[10px] text-[#8e8576]">Khách có thể tải file preview chất lượng cao về máy.</span>
              </div>
            </label>

            {/* Cho phép viết ghi chú */}
            <label className="flex items-center space-x-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                name="allowComment"
                checked={formData.allowComment}
                onChange={handleChange}
                className="w-4.5 h-4.5 rounded accent-gold-500 bg-[#161412] border-[#2b2722]"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#f5eedf] flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                  <span>Cho phép viết ghi chú</span>
                </span>
                <span className="text-[10px] text-[#8e8576]">Khách ghi chú yêu cầu chỉnh sửa trên từng ảnh.</span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 hover:opacity-95 text-gold-950 font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-gold-500/15 flex items-center justify-center space-x-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Đang quét thư mục Drive và tạo album...</span>
              </>
            ) : (
              <span>TẠO ALBUM CHỌN ẢNH NHANH</span>
            )}
          </button>
        </form>
      ) : (
        /* SUCCESS SCREEN */
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-8 animate-fade-in shadow-2xl relative overflow-hidden border border-gold-500/30">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-green-500 via-gold-400 to-green-500" />

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400 mb-2">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gold-100">Tạo Album Thành Công!</h2>
            <p className="text-sm text-[#a2998a]">
              {successData.title} • <strong className="text-gold-400">{successData.imagesCount} hình ảnh</strong>
            </p>
          </div>

          <div className="space-y-6 pt-2">
            {/* 1. Link gửi cho Khách hàng */}
            <div className="bg-[#141210] border border-[#2b2722] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                  1. Link gửi cho Khách hàng
                </span>
                <span className="text-[11px] text-[#8e8576]">Khách mở link này để chọn ảnh</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getClientUrl()}
                  className="flex-grow bg-[#0c0b0a] border border-[#221f1c] text-xs font-mono text-[#f5eedf] rounded-lg px-3 py-2.5 select-all focus:outline-none"
                />
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(getClientUrl(), 'client')}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-gold-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
                  >
                    {copiedClient ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedClient ? 'Đã copy' : 'Copy link'}</span>
                  </button>
                  <a
                    href={getClientUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#1e1c19] hover:bg-[#282522] border border-[#2b2722] text-[#f5eedf] rounded-lg transition-all"
                    title="Mở tab mới"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {formData.passcode && (
                <div className="text-xs text-gold-300 bg-gold-500/10 border border-gold-500/20 px-3 py-2 rounded-lg flex items-center justify-between">
                  <span>Mã PIN khách cần nhập:</span>
                  <strong className="font-mono text-sm tracking-widest text-gold-200">{formData.passcode}</strong>
                </div>
              )}
            </div>

            {/* 2. Link Quản Trị dành riêng cho Nhiếp ảnh gia / Studio */}
            <div className="bg-[#141210] border border-gold-500/25 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                  2. Link Quản trị (Dành riêng cho bạn)
                </span>
                <span className="text-[11px] text-red-400">Không gửi link này cho khách</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getAdminUrl()}
                  className="flex-grow bg-[#0c0b0a] border border-[#221f1c] text-xs font-mono text-[#f5eedf] rounded-lg px-3 py-2.5 select-all focus:outline-none"
                />
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(getAdminUrl(), 'admin')}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-[#25221e] hover:bg-[#302c27] text-gold-300 font-bold border border-gold-500/30 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    {copiedAdmin ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAdmin ? 'Đã copy' : 'Copy link quản trị'}</span>
                  </button>
                  <a
                    href={getAdminUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#1e1c19] hover:bg-[#282522] border border-[#2b2722] text-[#f5eedf] rounded-lg transition-all"
                    title="Mở trang quản trị"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <p className="text-[11px] text-[#8e8576] leading-relaxed">
                💡 Trang quản trị cho phép bạn xem thông tin khách nộp, copy danh sách tên file vào Lightroom, tải file BAT gom ảnh tự động và khóa/mở khóa album.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/admin"
                className="bg-gold-500 hover:bg-gold-400 text-gold-950 font-bold py-3 px-6 rounded-xl transition-all flex items-center space-x-2 text-xs shadow-md shadow-gold-500/10"
              >
                <span>Xem Tất Cả Album Trong Dashboard</span>
              </Link>
              <button
                onClick={resetForm}
                className="bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] hover:border-gold-500/30 text-[#f5eedf] font-semibold py-3 px-6 rounded-xl transition-all flex items-center space-x-2 text-xs"
              >
                <PlusCircle className="w-4 h-4 text-gold-400" />
                <span>Tạo thêm một Album khác</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer shortcut to Dashboard */}
      {!successData && (
        <div className="text-center pt-2">
          <Link
            to="/admin"
            className="inline-flex items-center space-x-2 text-xs text-[#a2998a] hover:text-gold-300 transition-colors"
          >
            <span>👉 Bạn muốn xem và xóa bớt các album cũ đã tạo?</span>
            <strong className="text-gold-400 underline">Vào trang Quản Lý Album</strong>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
