import React, { useState } from 'react';
import { X, User, Phone, FileText, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';

export const SubmitModal = ({
  isOpen = true,
  onClose,
  selectedCount = 0,
  selectedImages = [],
  initialClientInfo = {},
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: initialClientInfo?.name || '',
    phone: initialClientInfo?.phone || '',
    note: initialClientInfo?.note || ''
  });

  if (!isOpen) return null;

  // Đếm số ảnh có ghi chú riêng
  const photosWithCommentsCount = selectedImages.filter(
    (img) => img.comment && img.comment.trim().length > 0
  ).length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      note: formData.note.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#141210] border border-[#2b2722] rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#221f1c] pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gold-100">Xác Nhận Chốt Chọn Ảnh</h3>
              <p className="text-xs text-[#a2998a]">
                Đã chọn <strong className="text-gold-300 font-bold">{selectedCount}</strong> bức ảnh
                {photosWithCommentsCount > 0 && (
                  <span className="text-gold-400/90 ml-1">
                    ({photosWithCommentsCount} ảnh có ghi chú riêng)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a2998a] hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold flex items-center justify-between">
              <span>Họ và tên của bạn</span>
              <span className="text-[10px] text-[#70685c] font-normal lowercase">(tùy chọn)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gold-400/60" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Nguyễn Văn A (có thể bỏ qua)"
                className="w-full bg-[#1a1816] border border-[#2b2722] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5eedf] focus:outline-none focus:border-gold-500 transition-all placeholder:text-[#554e44]"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold flex items-center justify-between">
              <span>Số điện thoại liên hệ</span>
              <span className="text-[10px] text-[#70685c] font-normal lowercase">(tùy chọn)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gold-400/60" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ví dụ: 0912 345 678 (có thể bỏ qua)"
                className="w-full bg-[#1a1816] border border-[#2b2722] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5eedf] focus:outline-none focus:border-gold-500 transition-all placeholder:text-[#554e44]"
              />
            </div>
          </div>

          {/* Ghi chú chung */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold flex items-center justify-between">
              <span>Lời nhắn hoặc yêu cầu chung</span>
              <span className="text-[10px] text-[#70685c] font-normal lowercase">(tùy chọn)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gold-400/60" />
              <textarea
                name="note"
                rows={3}
                value={formData.note}
                onChange={handleChange}
                placeholder="Ví dụ: Chỉnh tone màu ấm giúp mình, ưu tiên ảnh gia đình trước..."
                className="w-full bg-[#1a1816] border border-[#2b2722] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5eedf] focus:outline-none focus:border-gold-500 transition-all resize-none placeholder:text-[#554e44]"
              />
            </div>
          </div>

          {/* Preview ảnh có ghi chú riêng nếu có */}
          {photosWithCommentsCount > 0 && (
            <div className="p-3 bg-[#0d0c0a] border border-[#221f1c] rounded-xl text-xs space-y-1.5 max-h-28 overflow-y-auto">
              <div className="text-[11px] font-bold text-gold-300 flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>Ghi chú riêng cho từng ảnh ({photosWithCommentsCount}):</span>
              </div>
              {selectedImages
                .filter((img) => img.comment && img.comment.trim().length > 0)
                .map((img) => (
                  <div key={img.fileId} className="text-[11px] text-[#a2998a] flex items-baseline justify-between gap-2 border-b border-[#1a1816] pb-1 last:border-none">
                    <span className="font-mono truncate text-[#cfc5b4] max-w-[50%]">{img.fileName}:</span>
                    <span className="italic truncate text-gold-200/90 max-w-[50%]">"{img.comment}"</span>
                  </div>
                ))}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] text-[#a2998a] py-2.5 rounded-xl text-xs font-semibold transition-all"
            >
              Xem lại ảnh
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>GỬI LỰA CHỌN</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitModal;
