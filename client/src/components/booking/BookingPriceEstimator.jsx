import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Check, 
  X, 
  ShieldCheck, 
  Clock, 
  Camera, 
  ChevronUp, 
  ChevronDown,
  Info
} from 'lucide-react';

/**
 * Trích xuất giá trị số (VNĐ) từ chuỗi giá gói chụp (VD: "Từ 1.500.000đ" -> 1500000)
 */
export const extractNumericPrice = (priceStr, defaultPrice = 1200000) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return defaultPrice;
  const cleaned = String(priceStr).replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : defaultPrice;
};

export const BookingPriceEstimator = ({
  selectedCategory,
  categories = [],
  selectedAddonIds = [],
  availableAddons = [],
  selectedPhotographer = null,
  bookingDate = '',
  timeSlot = '',
  contextLabel = '',
  peopleCount = '',
  onRemoveAddon = () => {},
  currentStep = 1,
  onProceedStep = null
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Tìm thông tin gói chụp đã chọn
  const matchedCategory = categories.find(c => c.title === selectedCategory) || categories[0];
  const basePrice = matchedCategory ? extractNumericPrice(matchedCategory.price, 1200000) : 1200000;
  const basePriceDisplay = matchedCategory?.price || `${basePrice.toLocaleString('vi-VN')}đ`;

  // Lọc các dịch vụ bổ sung đã được khách hàng tick chọn
  const activeSelectedAddons = availableAddons.filter(a => 
    selectedAddonIds.includes(a._id) || selectedAddonIds.includes(a.id)
  );

  const totalAddonsPrice = activeSelectedAddons.reduce((sum, item) => {
    return sum + (Number(item.price) || 0);
  }, 0);

  // Tổng chi phí tạm tính
  const estimatedTotal = basePrice + totalAddonsPrice;

  // Tiền đặt cọc giữ lịch dự kiến (cố định 500k hoặc 20% nếu đơn lớn)
  const depositAmount = estimatedTotal >= 3000000 
    ? Math.round((estimatedTotal * 0.2) / 50000) * 50000 
    : 500000;

  // Số tiền còn lại thanh toán tại buổi chụp
  const remainingAmount = Math.max(0, estimatedTotal - depositAmount);

  return (
    <aside className="w-full">
      {/* Desktop Sticky Card */}
      <div className="hidden lg:block sticky top-24 bg-[#14120f] border border-[#2e2a24] rounded-3xl p-6 shadow-2xl space-y-5 backdrop-blur-md relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#24211c] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm tracking-tight">Tạm Tính Chi Phí</h3>
              <p className="text-[11px] text-[#a2998a]">Ước tính theo thời gian thực</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            Live Counter
          </span>
        </div>

        {/* Selected Package (Base) */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#8e8576] block font-semibold uppercase tracking-wider">Gói Chụp Chính:</span>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {selectedCategory || 'Chụp Cá Nhân / Chân Dung'}
              </h4>
              {matchedCategory?.duration && (
                <span className="text-[11px] text-gray-400 block">
                  Thời lượng: {matchedCategory.duration}
                </span>
              )}
            </div>
            <span className="text-xs font-black text-gold-300 shrink-0">
              {basePriceDisplay}
            </span>
          </div>

          {/* Selected Studio info */}
          <div className="p-2.5 rounded-xl bg-[#0c0b09] border border-[#221f1c] text-xs text-gray-300 flex items-center space-x-2">
            <Camera className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span className="truncate text-[11px]">
              Studio: <strong className="text-white">{selectedPhotographer ? selectedPhotographer.name : 'Hệ thống tự đề xuất Studio'}</strong>
            </span>
          </div>
        </div>

        {/* Selected Addons Breakdown */}
        <div className="pt-3 border-t border-[#24211c] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8e8576] font-semibold uppercase tracking-wider">
              Dịch Vụ Bổ Sung ({activeSelectedAddons.length})
            </span>
            {totalAddonsPrice > 0 && (
              <span className="text-xs font-bold text-gold-400">
                + {totalAddonsPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {activeSelectedAddons.length === 0 ? (
            <p className="text-[11px] text-[#70685e] italic bg-[#0c0b09] p-2.5 rounded-xl border border-dashed border-[#24211c]">
              Chưa chọn dịch vụ đi kèm. Bạn có thể tick chọn Makeup, Trang phục, In ảnh tại Bước 3.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeSelectedAddons.map((addon) => (
                <div
                  key={addon._id || addon.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#0c0b09] border border-[#24211c] text-xs group transition-colors hover:border-gold-500/30"
                >
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                    <span className="truncate text-gray-200 text-[11px]">{addon.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[11px] font-bold text-gold-300">
                      +{(Number(addon.price) || 0).toLocaleString('vi-VN')}đ
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveAddon(addon._id || addon.id)}
                      className="text-gray-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                      title="Bỏ chọn dịch vụ này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking details preview */}
        {(bookingDate || timeSlot || contextLabel) && (
          <div className="pt-3 border-t border-[#24211c] space-y-1.5 text-[11px] text-[#a2998a]">
            {bookingDate && (
              <div className="flex justify-between">
                <span>Ngày chụp:</span>
                <strong className="text-gray-200">{bookingDate}</strong>
              </div>
            )}
            {timeSlot && (
              <div className="flex justify-between">
                <span>Khung giờ:</span>
                <strong className="text-gray-200">{timeSlot}</strong>
              </div>
            )}
            {contextLabel && (
              <div className="flex justify-between">
                <span>Bối cảnh:</span>
                <strong className="text-amber-300">{contextLabel}</strong>
              </div>
            )}
            {peopleCount && (
              <div className="flex justify-between">
                <span>Số người:</span>
                <strong className="text-gray-200">{peopleCount}</strong>
              </div>
            )}
          </div>
        )}

        {/* Total & Deposit Calculation Section */}
        <div className="pt-4 border-t border-[#24211c] space-y-3 bg-[#0c0b09]/60 -mx-6 -mb-6 p-6 rounded-b-3xl">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">
              Tổng Chi Phí Dự Kiến:
            </span>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500 bg-clip-text text-transparent">
                {estimatedTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          <div className="space-y-1 text-xs pt-1">
            <div className="flex justify-between text-[#a2998a]">
              <span>💳 Cọc giữ lịch (Tùy chọn):</span>
              <strong className="text-amber-300">{depositAmount.toLocaleString('vi-VN')}đ</strong>
            </div>
            <div className="flex justify-between text-[#a2998a]">
              <span>💵 Còn lại thanh toán khi chụp:</span>
              <strong className="text-white">{remainingAmount.toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-2 border-t border-[#201d19] space-y-1 text-[10px] text-[#7a7267]">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Giá minh bạch, không phụ phí phát sinh ẩn</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span>Hỗ trợ dời lịch miễn phí trước 24h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Floating Summary Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#14120f]/95 backdrop-blur-md border-t border-[#2e2a24] shadow-2xl p-3">
        {/* Expanded Drawer on Mobile */}
        {mobileExpanded && (
          <div className="pb-3 mb-3 border-b border-[#24211c] max-h-60 overflow-y-auto space-y-2 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Gói chụp:</span>
              <strong className="text-white">{selectedCategory} ({basePriceDisplay})</strong>
            </div>
            {activeSelectedAddons.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[#a2998a] block font-semibold text-[11px]">Dịch vụ đi kèm đã chọn:</span>
                {activeSelectedAddons.map(ad => (
                  <div key={ad._id || ad.id} className="flex justify-between text-[11px]">
                    <span className="text-gray-300 truncate">{ad.name}</span>
                    <span className="text-gold-400 font-bold shrink-0">
                      +{(Number(ad.price) || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-2 border-t border-[#24211c] flex justify-between text-xs">
              <span className="text-[#a2998a]">Tiền cọc giữ lịch:</span>
              <strong className="text-amber-300">{depositAmount.toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="flex items-center space-x-2 text-left"
          >
            <div>
              <div className="flex items-center space-x-1 text-[11px] text-[#a2998a]">
                <span>Tạm tính chi phí</span>
                {mobileExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </div>
              <div className="text-base font-black text-gold-400">
                {estimatedTotal.toLocaleString('vi-VN')}đ
              </div>
            </div>
          </button>

          {onProceedStep && (
            <button
              type="button"
              onClick={onProceedStep}
              className="px-5 py-2.5 bg-gradient-to-r from-gold-600 to-gold-500 text-gold-950 font-bold text-xs rounded-xl shadow-lg shadow-gold-500/20"
            >
              Tiếp tục bước {currentStep < 4 ? currentStep + 1 : 4}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
