import React from 'react';
import { Heart, Send, Check } from 'lucide-react';

export const SelectionStickyBar = ({
  selectedCount,
  selectedPhotos,
  maxSelect = 0,
  isClosed = false,
  onOpenSubmitModal,
  onSubmit,
}) => {
  const actualCount = typeof selectedCount === 'number' 
    ? selectedCount 
    : (Array.isArray(selectedPhotos) ? selectedPhotos.length : 0);
  const handleOpen = onOpenSubmitModal || onSubmit;
  const isLimitReached = maxSelect > 0 && actualCount >= maxSelect;

  return (
    <div className="fixed bottom-0 left-0 w-full glass-panel border-t border-[#221f1c] py-3.5 px-4 sm:px-6 z-40 shadow-2xl backdrop-blur-xl bg-[#0c0b0a]/90">
      <div className="max-w-7xl w-full mx-auto flex flex-row items-center justify-between gap-4">
        {/* Counter area */}
        <div className="flex items-center space-x-3">
          <div className="bg-gold-500/15 border border-gold-500/30 text-gold-400 p-2.5 rounded-xl hidden sm:block">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-gold-100 flex items-center space-x-1.5">
              <span>Đã chọn:</span>
              <span className="text-gold-400 text-base">{actualCount}</span>
              {maxSelect > 0 && (
                <span className="text-[#a2998a] font-normal text-xs">/ {maxSelect} ảnh</span>
              )}
            </p>
            <p className="text-[10px] text-[#8e8576]">
              {isClosed
                ? 'Album đã ở trạng thái khóa/đã nộp lựa chọn.'
                : maxSelect > 0
                ? isLimitReached
                  ? 'Đã đạt giới hạn số lượng ảnh cho phép.'
                  : `Bạn có thể chọn thêm ${maxSelect - actualCount} ảnh nữa.`
                : 'Không giới hạn số lượng ảnh được chọn.'}
            </p>
          </div>
        </div>

        {/* Action button */}
        {!isClosed ? (
          <button
            disabled={actualCount === 0}
            onClick={handleOpen}
            className="bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-gold-500/10 flex items-center space-x-2 text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>GỬI LỰA CHỌN ({actualCount})</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3.5 py-2 rounded-xl font-semibold">
            <Check className="w-4 h-4" />
            <span>Đã ghi nhận lựa chọn</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionStickyBar;
