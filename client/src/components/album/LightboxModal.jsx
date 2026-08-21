import React, { useState, useEffect } from 'react';
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

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between select-none animate-fade-in">
      {/* Lightbox Header */}
      <div className="p-4 flex items-center justify-between text-white border-b border-white/10 bg-black/40 backdrop-blur-md z-10">
        <div>
          <p className="text-sm font-semibold text-gold-100">{currentImage.fileName}</p>
          <p className="text-[10px] text-[#a2998a]">
            Ảnh {currentIndex + 1} / {images.length}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Nút chọn ảnh ngay trong lightbox */}
          <button
            disabled={isClosed}
            onClick={() => onToggleSelect && onToggleSelect(currentImage)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isSelected
                ? 'bg-gold-500 text-gold-950 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
            <span>{isSelected ? 'Đã Chọn' : 'Chọn Ảnh Này'}</span>
          </button>

          {/* Nút tải ảnh */}
          {allowDownload && (
            <a
              href={`https://docs.google.com/uc?export=download&id=${currentImage.fileId}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
              title="Tải ảnh gốc về máy"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lightbox Main Preview */}
      <div className="flex-grow flex items-center justify-between relative px-4 sm:px-12 overflow-hidden">
        <button
          disabled={currentIndex === 0}
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 z-10 p-2.5 bg-black/50 hover:bg-gold-500 hover:text-gold-950 text-white disabled:opacity-20 rounded-full transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="w-full h-[70vh] flex items-center justify-center p-2">
          <img
            src={lightboxFallbackUrls[srcIndex] || currentImage.embedUrl || currentImage.thumbnailUrl}
            alt={currentImage.fileName}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl transition-opacity duration-300"
          />
        </div>

        <button
          disabled={currentIndex === images.length - 1}
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 z-10 p-2.5 bg-black/50 hover:bg-gold-500 hover:text-gold-950 text-white disabled:opacity-20 rounded-full transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Lightbox Footer Ghi chú */}
      {allowComment && (
        <div className="p-3 sm:p-4 bg-[#0c0b0a] border-t border-[#221f1c]">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center space-x-1.5 text-gold-400 text-xs font-semibold shrink-0">
              <MessageSquare className="w-4 h-4" />
              <span>Ghi chú sửa ảnh:</span>
            </div>

            {currentComment && !isEditing ? (
              <div className="flex-grow w-full flex items-center justify-between bg-[#161412] border border-[#2b2722] rounded-xl px-4 py-2 text-xs">
                <span className="text-[#f5eedf] italic truncate">"{currentComment}"</span>
                {!isClosed && (
                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-2.5 py-1 bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-300 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-2.5 py-1 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-rose-300 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-grow w-full flex items-center gap-2">
                <input
                  type="text"
                  disabled={isClosed}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Nhập yêu cầu chỉnh sửa (ví dụ: bóp eo, xóa mụn, làm sáng...)"
                  className="flex-grow bg-[#161412] border border-[#2b2722] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-gold-500 text-[#f5eedf]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
                {!isClosed && (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-gold-950 font-bold text-xs rounded-xl transition-all shrink-0 flex items-center space-x-1 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Ghi Chú</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LightboxModal;

