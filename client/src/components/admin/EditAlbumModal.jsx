import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Check, 
  Download, 
  MessageSquare, 
  Lock, 
  Unlock, 
  Hash, 
  FileText, 
  Loader2, 
  Sparkles,
  AlertCircle,
  User,
  Phone
} from 'lucide-react';
import { albumApi } from '../../api/albumApi';

export const EditAlbumModal = ({
  isOpen,
  onClose,
  album,
  onSaved,
  token = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientPhone: '',
    clientNote: '',
    maxSelect: 0,
    allowDownload: true,
    allowComment: true,
    passcode: '',
    status: 'selecting'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (album) {
      setFormData({
        title: album.title || '',
        clientName: album.clientInfo?.name || '',
        clientPhone: album.clientInfo?.phone || '',
        clientNote: album.clientInfo?.note || '',
        maxSelect: album.maxSelect !== undefined ? album.maxSelect : 0,
        allowDownload: album.allowDownload !== undefined ? album.allowDownload : true,
        allowComment: album.allowComment !== undefined ? album.allowComment : true,
        passcode: album.passcode || '',
        status: album.status || 'selecting'
      });
      setError('');
      setSuccess(false);
    }
  }, [album, isOpen]);

  if (!isOpen || !album) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresetMax = (val) => {
    handleChange('maxSelect', val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const manageToken = token || album.manageToken;
      const res = await albumApi.updateSettings(album._id || album.id, manageToken, {
        title: formData.title,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientNote: formData.clientNote,
        maxSelect: Number(formData.maxSelect) || 0,
        allowDownload: formData.allowDownload,
        allowComment: formData.allowComment,
        passcode: formData.passcode,
        status: formData.status
      });

      setSuccess(true);
      if (onSaved) {
        onSaved(res.data || res);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật cài đặt album.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141720] border border-[#242938] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#242938] bg-[#10131a]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Chỉnh sửa Cài đặt Album</h3>
              <p className="text-xs text-[#94a3b8]">Cập nhật số lượng ảnh, quyền tải & ghi chú</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#1b1f2b] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3.5 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Đã lưu các thay đổi thành công!</span>
            </div>
          )}

          {/* 1. Tên Album */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-gold-400" />
              <span>Tên Album</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-[#0c0d10] border border-[#242938] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
              placeholder="Tên album..."
            />
          </div>

          {/* Thông tin Khách Hàng */}
          <div className="p-4 rounded-2xl bg-[#0c0d10]/80 border border-[#242938] space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#1b1f2e] pb-2">
              <User className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Thông Tin Khách Hàng
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tên khách */}
              <div className="space-y-1">
                <label className="block text-[11px] text-[#94a3b8]">Tên Khách Hàng / Cặp Đôi</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  placeholder="Anh Hoàng & Chị Mai"
                  className="w-full bg-[#141720] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* SĐT */}
              <div className="space-y-1">
                <label className="block text-[11px] text-[#94a3b8]">Số điện thoại / Zalo</label>
                <input
                  type="text"
                  value={formData.clientPhone}
                  onChange={(e) => handleChange('clientPhone', e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full bg-[#141720] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Ghi chú */}
            <div className="space-y-1">
              <label className="block text-[11px] text-[#94a3b8]">Ghi chú ban đầu từ Studio</label>
              <input
                type="text"
                value={formData.clientNote}
                onChange={(e) => handleChange('clientNote', e.target.value)}
                placeholder="Ví dụ: Ưu tiên tone màu ấm..."
                className="w-full bg-[#141720] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* 2. Số lượng ảnh chọn tối đa (maxSelect) */}
          <div className="space-y-2 bg-[#0c0d10]/60 p-4 rounded-2xl border border-[#242938]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider flex items-center space-x-1.5">
                <Hash className="w-3.5 h-3.5 text-gold-400" />
                <span>Số ảnh khách được chọn tối đa</span>
              </label>
              <span className="text-xs font-bold text-gold-400">
                {formData.maxSelect > 0 ? `${formData.maxSelect} ảnh` : 'Không giới hạn'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={formData.maxSelect}
                onChange={(e) => handleChange('maxSelect', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-28 bg-[#141720] border border-[#242938] rounded-xl px-3 py-2 text-sm text-white font-bold text-center focus:outline-none focus:border-gold-500"
              />
              <span className="text-xs text-[#94a3b8]">(Nhập 0 nếu không giới hạn)</span>
            </div>

            {/* Presets nhanh */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[0, 5, 10, 15, 20, 30, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePresetMax(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    formData.maxSelect === num
                      ? 'bg-gold-500 text-gold-950 font-bold'
                      : 'bg-[#1b1f2b] text-[#cbd5e1] hover:bg-[#232838]'
                  }`}
                >
                  {num === 0 ? 'Tất cả' : `${num} ảnh`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Cho phép tải ảnh & Cho phép viết ghi chú */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cho phép tải ảnh */}
            <label className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
              formData.allowDownload 
                ? 'bg-gold-500/10 border-gold-500/40 text-white' 
                : 'bg-[#0c0d10] border-[#242938] text-[#94a3b8]'
            }`}>
              <input
                type="checkbox"
                checked={formData.allowDownload}
                onChange={(e) => handleChange('allowDownload', e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#333a4f] bg-[#141720] text-gold-500 focus:ring-0 cursor-pointer"
              />
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <Download className="w-3.5 h-3.5 text-gold-400" />
                  <span>Cho phép tải ảnh</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] leading-tight">
                  Khách có thể tải từng ảnh hoặc toàn bộ ảnh về máy.
                </p>
              </div>
            </label>

            {/* Cho phép viết ghi chú */}
            <label className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
              formData.allowComment 
                ? 'bg-gold-500/10 border-gold-500/40 text-white' 
                : 'bg-[#0c0d10] border-[#242938] text-[#94a3b8]'
            }`}>
              <input
                type="checkbox"
                checked={formData.allowComment}
                onChange={(e) => handleChange('allowComment', e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#333a4f] bg-[#141720] text-gold-500 focus:ring-0 cursor-pointer"
              />
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                  <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                  <span>Cho phép viết ghi chú</span>
                </div>
                <p className="text-[11px] text-[#94a3b8] leading-tight">
                  Khách có thể nhập yêu cầu retouch/chỉnh sửa cho từng ảnh.
                </p>
              </div>
            </label>
          </div>

          {/* 4. Mã PIN bảo mật */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-gold-400" />
                <span>Mã PIN truy cập Album</span>
              </span>
              <span className="text-[11px] text-[#94a3b8] normal-case font-normal">
                Để trống nếu muốn khách vào xem tự do
              </span>
            </label>
            <input
              type="text"
              value={formData.passcode}
              onChange={(e) => handleChange('passcode', e.target.value)}
              className="w-full bg-[#0c0d10] border border-[#242938] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors font-mono tracking-wider"
              placeholder="Ví dụ: 1234, hoặc để trống..."
            />
          </div>

          {/* 5. Trạng thái Khóa / Mở khóa */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">
              Trạng thái Album
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('status', 'selecting')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                  formData.status !== 'locked'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0c0d10] border-[#242938] text-[#94a3b8] hover:text-white'
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Đang mở chọn ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => handleChange('status', 'locked')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                  formData.status === 'locked'
                    ? 'bg-red-500/15 border-red-500/40 text-red-300'
                    : 'bg-[#0c0d10] border-[#242938] text-[#94a3b8] hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa Album</span>
              </button>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-tight pt-1">
              * Khi khóa album, khách vẫn xem được ảnh nhưng không thể bấm chọn hoặc thay đổi danh sách ảnh đã gửi.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#242938]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#242938] hover:bg-[#1b1f2b] text-xs font-semibold text-[#cbd5e1] transition-all"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu Cài Đặt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAlbumModal;
