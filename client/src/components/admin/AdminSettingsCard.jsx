import React from 'react';
import { ExternalLink, Settings, FolderSync, FolderOpen } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const AdminSettingsCard = ({ album, onSync, syncLoading }) => {
  const totalCount = album.images?.length || 0;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 border border-[#2b2722]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400 border-b border-[#221f1c] pb-2 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Settings className="w-4 h-4" />
          <span>Cài đặt & Thư Mục</span>
        </div>
      </h3>

      <div className="text-xs space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[#a2998a]">Mã PIN bảo mật:</span>
          <span className="font-mono text-gold-200 font-semibold bg-[#1a1816] px-2 py-0.5 rounded border border-[#2b2722]">
            {album.passcode || 'Không cài đặt'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#a2998a]">Tổng số ảnh hiện tại:</span>
          <span className="text-[#f5eedf] font-semibold">{totalCount} ảnh</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#a2998a]">Số lượng chốt tối đa:</span>
          <span className="text-[#f5eedf] font-semibold">
            {album.maxSelect > 0 ? `${album.maxSelect} ảnh` : 'Không giới hạn'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#a2998a]">Trạng thái:</span>
          <StatusBadge status={album.status} />
        </div>

        {album.driveFolderUrl && album.driveFolderUrl !== 'mock' && (
          <div className="pt-2 border-t border-[#221f1c] space-y-2">
            <a
              href={album.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#141210] hover:bg-[#1c1916] border border-[#26211a] hover:border-[#383127] p-2.5 rounded-xl flex items-center justify-between text-xs text-[#a2998a] hover:text-gold-300 transition-all group"
            >
              <div className="flex items-center space-x-2 truncate pr-2">
                <FolderOpen className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="truncate">Mở Google Drive gốc</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
            </a>

            {onSync && (
              <button
                type="button"
                onClick={onSync}
                disabled={syncLoading}
                className="w-full bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 hover:border-gold-500/50 py-2.5 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold text-gold-300 hover:text-gold-200 transition-all disabled:opacity-50"
              >
                <FolderSync className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                <span>{syncLoading ? 'Đang quét ảnh mới...' : 'Đồng bộ ảnh từ Drive'}</span>
              </button>
            )}
            <p className="text-[10px] text-[#787063] leading-relaxed italic">
              * Khi bạn tải thêm ảnh vào Google Drive, bấm nút trên để cập nhật danh sách ảnh cho link khách hàng.
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-[#221f1c]">
          <a
            href={`/album/${album._id}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] py-2 rounded-xl text-center flex items-center justify-center space-x-1.5 text-xs text-[#a2998a] hover:text-gold-200 transition-all"
          >
            <span>Xem giao diện Khách hàng</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsCard;
