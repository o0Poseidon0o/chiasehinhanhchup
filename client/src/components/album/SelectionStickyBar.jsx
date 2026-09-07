import React from 'react';
import { createPortal } from 'react-dom';
import { Heart, Send, Check, Eye, ChevronUp } from 'lucide-react';

export const SelectionStickyBar = ({
  selectedCount,
  selectedPhotos,
  maxSelect = 0,
  isClosed = false,
  onOpenSubmitModal,
  onSubmit,
  filterMode = 'all',
  onToggleFilter,
  isSubmitModalOpen = false,
}) => {
  if (isSubmitModalOpen) return null;

  const actualCount = typeof selectedCount === 'number' 
    ? selectedCount 
    : (Array.isArray(selectedPhotos) ? selectedPhotos.length : 0);
  const handleOpen = onOpenSubmitModal || onSubmit;
  const isLimitReached = maxSelect > 0 && actualCount >= maxSelect;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = (
    <aside 
      aria-label="Thanh tác vụ chọn ảnh"
      className="fixed bottom-[max(env(safe-area-inset-bottom),12px)] sm:bottom-6 left-2 right-2 sm:left-auto sm:right-auto sm:inset-x-0 mx-auto w-auto max-w-fit sm:max-w-2xl z-40 bg-[#12100e]/95 border border-gold-500/40 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] rounded-2xl sm:rounded-full px-3 sm:px-6 py-2 sm:py-3 transition-all duration-300 ring-1 ring-gold-500/20"
    >
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-6">
        {/* Left: Counter area with Heart Icon */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="relative bg-gradient-to-br from-gold-500/25 to-gold-600/10 border border-gold-500/40 text-gold-400 p-1.5 sm:p-2.5 rounded-xl sm:rounded-full shadow-inner">
            <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" />
            {actualCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-gold-500"></span>
              </span>
            )}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black text-white flex items-center space-x-1 leading-tight">
              <span className="text-[#a2998a] font-medium hidden sm:inline">Đã chọn:</span>
              <span className="text-gold-400 text-sm sm:text-base font-black">{actualCount}</span>
              {maxSelect > 0 ? (
                <span className="text-[#a2998a] font-normal text-xs">/{maxSelect}</span>
              ) : (
                <span className="text-[#a2998a] font-normal text-[11px]"> ảnh</span>
              )}
            </p>
            <p className="hidden sm:block text-[10px] sm:text-[11px] text-[#a2998a] leading-tight mt-0.5">
              {isClosed
                ? 'Album đã khóa'
                : maxSelect > 0
                ? isLimitReached
                  ? 'Đã đủ số lượng cho phép'
                  : `Còn được chọn thêm ${maxSelect - actualCount} ảnh`
                : 'Không giới hạn'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Nút lọc nhanh: Xem ảnh đã chọn */}
          {onToggleFilter && actualCount > 0 && (
            <button
              type="button"
              onClick={onToggleFilter}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs font-semibold flex items-center space-x-1 sm:space-x-1.5 transition-all border ${
                filterMode === 'selected'
                  ? 'bg-gold-500/20 text-gold-300 border-gold-500/50 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-[#d4cbba] border-white/10 hover:text-white'
              }`}
              title={filterMode === 'selected' ? 'Xem lại tất cả ảnh' : 'Chỉ xem các ảnh đã chọn'}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {filterMode === 'selected' ? 'Xem tất cả' : `Xem đã chọn (${actualCount})`}
              </span>
              <span className="sm:hidden text-[11px]">
                {filterMode === 'selected' ? 'Tất cả' : `${actualCount}`}
              </span>
            </button>
          )}

          {/* Nút hành động chính: GỬI LỰA CHỌN */}
          {!isClosed ? (
            <button
              disabled={actualCount === 0}
              onClick={handleOpen}
              className="bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 hover:from-amber-400 hover:to-gold-300 text-gold-950 font-black px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-full transition-all shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:scale-95 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:brightness-105"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="tracking-wide hidden sm:inline">GỬI LỰA CHỌN ({actualCount})</span>
              <span className="tracking-wide sm:hidden text-xs">GỬI ({actualCount})</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-full font-semibold">
              <Check className="w-4 h-4" />
              <span>Đã nộp</span>
            </div>
          )}

          {/* Quick scroll top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="hidden md:flex p-2 bg-white/5 hover:bg-white/10 text-[#a2998a] hover:text-white rounded-full border border-white/10 transition-all"
            title="Cuộn lên đầu trang"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default SelectionStickyBar;
