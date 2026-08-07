import React, { useState } from 'react';
import { X, User, Phone, FileText, Loader2, CheckCircle2 } from 'lucide-react';

export const SubmitModal = ({
  isOpen,
  onClose,
  selectedCount,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    note: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Vui lòng điền đầy đủ Họ Tên và Số Điện Thoại.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#141210] border border-[#2b2722] rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#221f1c] pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gold-100">Xác Nhận Chốt Chọn Ảnh</h3>
              <p className="text-xs text-[#a2998a]">Bạn đã chọn <strong className="text-gold-400">{selectedCount}</strong> bức ảnh</p>
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
            <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold">
              Họ và tên của bạn <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gold-400/60" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full bg-[#1a1816] border border-[#2b2722] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5eedf] focus:outline-none focus:border-gold-500 transition-all"
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold">
              Số điện thoại liên hệ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gold-400/60" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ví dụ: 0912 345 678"
                className="w-full bg-[#1a1816] border border-[#2b2722] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5eedf] focus:outline-none focus:border-gold-500 transition-all"
              />
            </div>
          </div>

          {/* Ghi chú chung */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-[#a2998a] font-semibold">
              Lời nhắn hoặc yêu cầu chung
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gold-400/60" />
              <textarea
                name="note"
                rows={3}
                value={formData.note}
                onChange={handleChange}
                placeholder="Ví dụ: Chỉnh tone màu ấm giúp mình, ưu tiên ảnh gia đình..."
                className="w-full bg-[#1a1816] border border-[#2b2722] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5eedf] focus:outline-none focus:border-gold-500 transition-all resize-none"
              />
            </div>
          </div>

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
