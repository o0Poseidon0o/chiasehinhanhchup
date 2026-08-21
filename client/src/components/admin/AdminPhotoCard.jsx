import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { cleanFileName } from '../../utils/formatters';

export const AdminPhotoCard = ({ image, index, onOpenLightbox }) => {
  const hasComment = Boolean(image.comment && image.comment.trim().length > 0);

  const fallbackUrls = [
    image.thumbnailUrl,
    `https://drive.google.com/thumbnail?id=${image.fileId}&sz=w800`,
    `https://lh3.googleusercontent.com/d/${image.fileId}=s800`,
    `https://lh3.googleusercontent.com/u/0/d/${image.fileId}=w800`,
    `https://drive.google.com/uc?export=view&id=${image.fileId}`,
    `/api/albums/proxy-image/${image.fileId}?sz=800`
  ].filter(Boolean);

  const [srcIndex, setSrcIndex] = useState(0);

  const handleImageError = () => {
    if (srcIndex < fallbackUrls.length - 1) {
      setSrcIndex(prev => prev + 1);
    }
  };

  return (
    <div className="group bg-[#13110f] border border-[#221f1c] hover:border-gold-500/40 rounded-xl overflow-hidden shadow-md transition-all duration-300 flex flex-col">
      {/* Image Preview */}
      <div
        className="relative aspect-[3/4] bg-[#161412] cursor-zoom-in overflow-hidden"
        onClick={() => onOpenLightbox(index)}
      >
        <img
          src={fallbackUrls[srcIndex] || image.thumbnailUrl}
          alt={image.fileName}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* File Name overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] bg-black/75 backdrop-blur-sm text-gold-200 px-2 py-0.5 rounded font-mono truncate max-w-[85%]">
          {cleanFileName(image.fileName)}
        </div>
      </div>

      {/* Comments displaying area */}
      {hasComment ? (
        <div className="p-3 bg-[#100f0d] flex-grow flex flex-col justify-start border-t border-[#1d1a18]">
          <div className="flex items-center space-x-1 text-gold-400 mb-1">
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Yêu cầu sửa:</span>
          </div>
          <p className="text-xs text-[#d4cbba] italic leading-relaxed">
            "{image.comment}"
          </p>
        </div>
      ) : (
        <div className="p-3 bg-[#100f0d] border-t border-[#1d1a18] text-center flex-grow flex items-center justify-center text-[10px] text-[#6e665a] italic">
          Không có ghi chú thêm
        </div>
      )}
    </div>
  );
};

export default AdminPhotoCard;
