import React, { useState } from 'react';
import { Heart, MessageSquare, Download } from 'lucide-react';
import { cleanFileName } from '../../utils/formatters';

export const PhotoCard = ({
  image,
  index,
  isSelected,
  comment,
  allowDownload,
  allowComment,
  isClosed,
  onToggleSelect,
  onCommentChange,
  onOpenLightbox,
}) => {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const hasComment = Boolean(comment && comment.trim().length > 0);

  return (
    <div
      className={`group relative bg-[#13110f] border rounded-xl overflow-hidden shadow-md transition-all duration-300 flex flex-col ${
        isSelected
          ? 'border-gold-500/80 ring-1 ring-gold-500/40 shadow-gold-500/10'
          : 'border-[#221f1c] hover:border-[#3a352e]'
      }`}
    >
      {/* Container xem trước ảnh */}
      <div
        className="relative aspect-[3/4] bg-[#161412] cursor-zoom-in overflow-hidden"
        onClick={() => onOpenLightbox(index)}
      >
        <img
          src={image.thumbnailUrl}
          alt={image.fileName}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Tên file */}
        <div className="absolute bottom-2 left-2 text-[10px] bg-black/70 backdrop-blur-sm text-[#d4cbba] px-2 py-0.5 rounded font-mono truncate max-w-[85%]">
          {cleanFileName(image.fileName)}
        </div>

        {/* Huy hiệu đã chọn */}
        {isSelected && (
          <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-gold-500 text-gold-950 rounded-full flex items-center justify-center shadow-lg">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
        )}
      </div>

      {/* Thanh công cụ tương tác ở đáy card */}
      <div className="p-2 border-t border-[#1d1a18] flex items-center justify-between gap-1.5 bg-[#100f0d]">
        {/* Nút chọn ảnh */}
        <button
          disabled={isClosed}
          onClick={() => onToggleSelect(image)}
          className={`flex-grow py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all ${
            isSelected
              ? 'bg-gold-500 text-gold-950 shadow-sm'
              : 'bg-[#1a1816] hover:bg-[#221f1c] text-[#f5eedf] hover:text-gold-400 disabled:opacity-50'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSelected ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{isSelected ? 'Đã chọn' : 'Chọn'}</span>
        </button>

        {/* Nút bật/tắt ô ghi chú */}
        {allowComment && (
          <button
            onClick={() => setShowCommentBox((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs transition-all relative ${
              hasComment
                ? 'bg-gold-500/15 border border-gold-500/40 text-gold-400'
                : 'bg-[#1a1816] hover:bg-[#221f1c] text-[#a2998a] hover:text-[#f5eedf]'
            }`}
            title="Ghi chú yêu cầu chỉnh sửa ảnh"
          >
            <MessageSquare className="w-4 h-4" />
            {hasComment && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold-500 rounded-full" />
            )}
          </button>
        )}

        {/* Nút tải ảnh */}
        {allowDownload && (
          <a
            href={`https://docs.google.com/uc?export=download&id=${image.fileId}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-xs bg-[#1a1816] hover:bg-[#221f1c] text-[#a2998a] hover:text-[#f5eedf] transition-all"
            title="Tải file ảnh về máy"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Ô nhập ghi chú khi mở rộng */}
      {allowComment && showCommentBox && (
        <div className="p-2 border-t border-[#1d1a18] bg-[#0c0b0a] space-y-1.5 animate-fade-in">
          <textarea
            disabled={isClosed}
            value={comment || ''}
            onChange={(e) => onCommentChange(image.fileId, e.target.value)}
            placeholder="Ghi chú yêu cầu sửa ảnh này..."
            rows={2}
            className="w-full bg-[#13110f] border border-[#2b2722] rounded-lg p-2 text-xs focus:outline-none focus:border-gold-500 text-[#f5eedf] resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={() => setShowCommentBox(false)}
              className="text-[10px] text-gold-400 font-semibold hover:underline"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCard;
