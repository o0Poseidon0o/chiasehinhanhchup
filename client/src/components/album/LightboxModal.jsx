import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Heart, MessageSquare, Download, Check, Edit2, Trash2 } from 'lucide-react';

export const LightboxModal = ({
  images = [],
  currentIndex = -1,
  onClose,
  onNavigate,
  selectedPhotos = [],
  comments = {},
  allowComment = true,
  allowDownload = true,
  isClosed = false,
  onToggleSelect,
  onCommentChange,
}) => {
  if (currentIndex < 0 || currentIndex >= images.length) return null;

  const currentImage = images[currentIndex];
  const isSelected = selectedPhotos.some((p) => p.fileId === currentImage.fileId);
  const currentComment = comments[currentImage.fileId] || '';

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(currentComment);

  // Đồng bộ draft khi đổi ảnh hoặc comment thay đổi
  useEffect(() => {
    setDraft(currentComment);
    setIsEditing(false);
  }, [currentIndex, currentComment]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (currentIndex >= 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [currentIndex]);

  const handleSave = () => {
    if (isClosed) return;
    if (onCommentChange) {
      onCommentChange(currentImage.fileId, draft.trim(), true);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (isClosed) return;
    setDraft('');
    if (onCommentChange) {
      onCommentChange(currentImage.fileId, '');
    }
    setIsEditing(false);
  };

  // Bắt sự kiện phím bấm bàn phím (Left, Right, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Không chuyển ảnh nếu đang gõ chữ trong ô ghi chú
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  const lightboxFallbackUrls = [
    currentImage.embedUrl,
    currentImage.thumbnailUrl,
    `https://drive.google.com/thumbnail?id=${currentImage.fileId}&sz=w1600`,
    `https://lh3.googleusercontent.com/d/${currentImage.fileId}=s1600`,
    `https://lh3.googleusercontent.com/u/0/d/${currentImage.fileId}=w1600`,
    `https://drive.google.com/uc?export=view&id=${currentImage.fileId}`,
    `/api/albums/proxy-image/${currentImage.fileId}?sz=1600`
  ].filter(Boolean);

  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => {
    setSrcIndex(0);
  }, [currentIndex]);

  const handleImageError = () => {
    if (srcIndex < lightboxFallbackUrls.length - 1) {
      setSrcIndex(prev => prev + 1);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between w-full h-full max-w-full min-h-[100dvh] max-h-[100dvh] overflow-hidden p-1.5 sm:p-4 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Lightbox Header Bar (Top, Flex 0) */}
      <div 
        className="w-full max-w-7xl flex items-center justify-between shrink-0 z-20 pt-1 px-1 sm:px-2 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left File Info */}
        <div className="flex items-center space-x-2 bg-[#141720]/90 backdrop-blur-xl px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-[#242938] shadow-2xl min-w-0 max-w-[45vw] sm:max-w-md">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500/20 text-amber-300 font-mono text-[10px] sm:text-xs font-black rounded-lg border border-amber-500/30 shrink-0">
            {currentIndex + 1} / {images.length}
          </span>
          <p className="text-[11px] sm:text-sm font-bold text-white truncate">
            {currentImage.fileName || `Ảnh #${currentIndex + 1}`}
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Nút chọn ảnh ngay trong lightbox */}
          <button
            disabled={isClosed}
            type="button"
            onClick={() => onToggleSelect && onToggleSelect(currentImage)}
            className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black flex items-center space-x-1 sm:space-x-1.5 shadow-xl transition-all hover:scale-105 ${
              isSelected
                ? 'bg-amber-500 text-amber-950 shadow-amber-500/20'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isSelected ? 'Đã Chọn' : 'Chọn Ảnh Này'}</span>
            <span className="sm:hidden">{isSelected ? 'Đã Chọn' : 'Chọn'}</span>
          </button>

          {/* Nút tải ảnh */}
          {allowDownload && (
            <a
              href={`https://docs.google.com/uc?export=download&id=${currentImage.fileId}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl sm:rounded-2xl transition-all text-white shadow-xl"
              title="Tải ảnh gốc về máy"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          )}

          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:px-4 sm:py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all shadow-xl flex items-center space-x-1"
            title="Tắt xem ảnh"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span className="hidden sm:inline font-bold">Đóng [ESC]</span>
          </button>
        </div>
      </div>

      {/* Left Arrow Button */}
      <button
        disabled={currentIndex === 0}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(currentIndex - 1);
        }}
        className="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-4 bg-black/70 hover:bg-amber-500 text-white hover:text-amber-950 disabled:opacity-20 rounded-full border border-white/20 backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
        title="Ảnh Trước (Phím ⬅️)"
      >
        <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 stroke-[2.5]" />
      </button>

      {/* Center Main Preview Area */}
      <div
        className="flex-1 w-full flex items-center justify-center overflow-hidden my-1 px-8 sm:px-24 relative z-10 cursor-pointer"
        onClick={onClose}
      >
        <img
          src={lightboxFallbackUrls[srcIndex] || currentImage.embedUrl || currentImage.thumbnailUrl}
          alt={currentImage.fileName}
          referrerPolicy="no-referrer"
          onError={handleImageError}
          onClick={(e) => {
            e.stopPropagation();
            if (currentIndex < images.length - 1) {
              onNavigate(currentIndex + 1);
            }
          }}
          className="max-h-[calc(100dvh-200px)] max-w-full object-contain rounded-xl sm:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-[#242938] transition-all duration-300 transform hover:scale-[1.005]"
        />
      </div>

      {/* Right Arrow Button */}
      <button
        disabled={currentIndex === images.length - 1}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(currentIndex + 1);
        }}
        className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-4 bg-black/70 hover:bg-amber-500 text-white hover:text-amber-950 disabled:opacity-20 rounded-full border border-white/20 backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
        title="Ảnh Sau (Phím ➡️)"
      >
        <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 stroke-[2.5]" />
      </button>

      {/* Bottom Thumbnail Strip Carousel */}
      <div 
        className="w-full shrink-0 flex items-center justify-center z-20 mb-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-[95vw] sm:max-w-4xl bg-[#141720]/90 backdrop-blur-xl p-1 sm:p-1.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border border-[#242938] shadow-2xl flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar">
          {images.map((img, tIdx) => {
            const isThumbSelected = selectedPhotos.some(p => p.fileId === img.fileId);
            return (
              <button
                key={img.fileId || tIdx}
                type="button"
                onClick={() => onNavigate(tIdx)}
                className={`relative w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shrink-0 transition-all border-2 ${
                  currentIndex === tIdx
                    ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img
                  src={img.thumbnailUrl || img.embedUrl}
                  alt={`Thumb ${tIdx}`}
                  className="w-full h-full object-cover"
                />
                {isThumbSelected && (
                  <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <Heart className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-amber-950 fill-amber-950" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox Footer Ghi chú sửa ảnh */}
      {allowComment && (
        <div 
          className="w-full shrink-0 z-20 bg-[#141720]/95 backdrop-blur-xl border-t border-[#242938] p-2 sm:p-2.5 px-2 sm:px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-4xl mx-auto flex flex-row items-center gap-1.5 sm:gap-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-amber-400 text-xs font-semibold shrink-0">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Ghi chú:</span>
            </div>

            {currentComment && !isEditing ? (
              <div className="flex-grow w-full flex items-center justify-between bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-1 text-xs">
                <span className="text-gray-200 italic truncate text-[11px] sm:text-xs">"{currentComment}"</span>
                {!isClosed && (
                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Sửa</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-rose-300 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-grow w-full flex items-center gap-1.5">
                <input
                  type="text"
                  disabled={isClosed}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ghi chú sửa ảnh (bóp eo, xóa mụn...)"
                  className="flex-grow min-w-0 bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-1.5 text-[11px] sm:text-xs focus:outline-none focus:border-amber-400 text-white placeholder-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
                {!isClosed && (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black text-[11px] sm:text-xs rounded-xl transition-all shrink-0 flex items-center space-x-1 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden sm:inline">Lưu Ghi Chú</span>
                    <span className="sm:hidden">Lưu</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default LightboxModal;


