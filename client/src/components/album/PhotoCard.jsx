import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Download, Check, Edit2, Trash2, X } from 'lucide-react';
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
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [draftComment, setDraftComment] = useState(comment || '');

  // Cập nhật draft nếu comment từ props thay đổi
  useEffect(() => {
    setDraftComment(comment || '');
  }, [comment]);

  const hasComment = Boolean(comment && comment.trim().length > 0);

  const handleSaveComment = () => {
    if (isClosed) return;
    const trimmed = draftComment.trim();
    if (onCommentChange) {
      onCommentChange(image.fileId, trimmed, true); // true = tự động tick chọn ảnh nếu vừa thêm ghi chú
    }
    setIsEditingComment(false);
  };

  const handleDeleteComment = () => {
    if (isClosed) return;
    setDraftComment('');
    if (onCommentChange) {
      onCommentChange(image.fileId, '');
    }
    setIsEditingComment(false);
  };

  const handleCancelComment = () => {
    setDraftComment(comment || '');
    setIsEditingComment(false);
  };

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
            onClick={() => setIsEditingComment((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs transition-all relative flex items-center gap-1 ${
              hasComment
                ? 'bg-gold-500/15 border border-gold-500/40 text-gold-400 font-medium'
                : 'bg-[#1a1816] hover:bg-[#221f1c] text-[#a2998a] hover:text-[#f5eedf]'
            }`}
            title={hasComment ? 'Xem/Sửa ghi chú cho ảnh này' : 'Thêm ghi chú yêu cầu chỉnh sửa ảnh'}
          >
            <MessageSquare className="w-4 h-4" />
            {hasComment && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold-500 rounded-full ring-2 ring-[#100f0d]" />
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

      {/* Hiển thị ghi chú đã lưu (nếu có ghi chú và không ở chế độ sửa) */}
      {allowComment && hasComment && !isEditingComment && (
        <div className="px-2.5 py-2 border-t border-[#1d1a18] bg-[#141210] flex items-start justify-between gap-1.5 text-xs animate-fade-in">
          <div className="flex items-start space-x-1.5 overflow-hidden text-gold-200/90 text-[11px] leading-snug">
            <MessageSquare className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
            <span className="italic line-clamp-2">{comment}</span>
          </div>
          {!isClosed && (
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => setIsEditingComment(true)}
                className="p-1 text-[#a2998a] hover:text-gold-300 hover:bg-[#221f1c] rounded transition-all"
                title="Sửa ghi chú"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={handleDeleteComment}
                className="p-1 text-[#a2998a] hover:text-rose-400 hover:bg-[#221f1c] rounded transition-all"
                title="Xóa ghi chú"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ô nhập / sửa ghi chú khi mở rộng */}
      {allowComment && isEditingComment && (
        <div className="p-2.5 border-t border-[#1d1a18] bg-[#0c0b0a] space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gold-300">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-gold-400" />
              {hasComment ? 'Sửa ghi chú' : 'Thêm ghi chú mới'}
            </span>
            <button
              onClick={handleCancelComment}
              className="text-[#8e8576] hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            disabled={isClosed}
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            placeholder="Ghi chú yêu cầu sửa ảnh (ví dụ: bóp eo, xóa mụn, chỉnh màu...)"
            rows={2}
            className="w-full bg-[#13110f] border border-[#2b2722] rounded-lg p-2 text-xs focus:outline-none focus:border-gold-500 text-[#f5eedf] resize-none"
            autoFocus
          />
          <div className="flex items-center justify-end space-x-1.5">
            {hasComment && (
              <button
                type="button"
                onClick={handleDeleteComment}
                disabled={isClosed}
                className="px-2 py-1 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-rose-300 rounded-md text-[10px] font-medium transition-all flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCancelComment}
              className="px-2 py-1 bg-[#1a1816] hover:bg-[#221f1c] text-[#a2998a] border border-[#2b2722] rounded-md text-[10px] font-medium transition-all"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveComment}
              disabled={isClosed}
              className="px-2.5 py-1 bg-gold-500 hover:bg-gold-400 text-gold-950 rounded-md text-[10px] font-bold transition-all shadow-sm flex items-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>Lưu Ghi Chú</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCard;

