import React, { useState } from 'react';
import { 
  ExternalLink, 
  Settings, 
  FolderSync, 
  FolderOpen, 
  Edit3, 
  Download, 
  MessageSquare, 
  Check, 
  X, 
  Hash, 
  Lock 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { EditAlbumModal } from './EditAlbumModal';

export const AdminSettingsCard = ({ album, onSync, syncLoading, onUpdate, token = '' }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const totalCount = album.images?.length || 0;

  return (
    <>
      <div className="glass-panel rounded-2xl p-5 space-y-4 border border-[#2b2722]">
        <div className="flex items-center justify-between border-b border-[#221f1c] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-gold-500/10 text-gold-400">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Cài đặt Album
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 hover:border-gold-500/50 text-gold-300 hover:text-gold-200 text-xs font-bold transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa</span>
          </button>
        </div>

        <div className="text-xs space-y-3">
          {/* Tổng số ảnh */}
          <div className="flex justify-between items-center py-1">
            <span className="text-[#a2998a]">Tổng số ảnh hiện có:</span>
            <span className="text-[#f5eedf] font-bold">{totalCount} ảnh</span>
          </div>

          {/* Số lượng chốt tối đa */}
          <div className="flex justify-between items-center py-1">
            <span className="text-[#a2998a] flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5 text-gold-400" />
              <span>Số ảnh chọn tối đa:</span>
            </span>
            <span className="text-gold-300 font-bold bg-[#1a1816] px-2.5 py-0.5 rounded border border-[#2b2722]">
              {album.maxSelect > 0 ? `${album.maxSelect} ảnh` : 'Không giới hạn'}
            </span>
          </div>

          {/* Cho phép tải ảnh */}
          <div className="flex justify-between items-center py-1">
            <span className="text-[#a2998a] flex items-center space-x-1">
              <Download className="w-3.5 h-3.5 text-gold-400" />
              <span>Cho phép tải ảnh:</span>
            </span>
            {album.allowDownload !== false ? (
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                <Check className="w-3 h-3" />
                <span>Bật</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-red-400 font-semibold bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                <X className="w-3 h-3" />
                <span>Tắt</span>
              </span>
            )}
          </div>

          {/* Cho phép viết ghi chú */}
          <div className="flex justify-between items-center py-1">
            <span className="text-[#a2998a] flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
              <span>Cho phép viết ghi chú:</span>
            </span>
            {album.allowComment !== false ? (
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                <Check className="w-3 h-3" />
                <span>Bật</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-red-400 font-semibold bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                <X className="w-3 h-3" />
                <span>Tắt</span>
              </span>
            )}
          </div>

          {/* Mã PIN */}
          <div className="flex justify-between items-center py-1">
            <span className="text-[#a2998a] flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              <span>Mã PIN bảo mật:</span>
            </span>
            <span className="font-mono text-gold-200 font-semibold bg-[#1a1816] px-2 py-0.5 rounded border border-[#2b2722]">
              {album.passcode || 'Không cài đặt'}
            </span>
          </div>

          {/* Trạng thái */}
          <div className="flex justify-between items-center py-1">
            <span className="text-[#a2998a]">Trạng thái album:</span>
            <StatusBadge status={album.status} />
          </div>

          {/* Google drive & sync actions */}
          {album.driveFolderUrl && album.driveFolderUrl !== 'mock' && (
            <div className="pt-3 border-t border-[#221f1c] space-y-2">
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
              className="w-full bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] py-2.5 rounded-xl text-center flex items-center justify-center space-x-1.5 text-xs text-[#a2998a] hover:text-gold-200 transition-all"
            >
              <span>Xem giao diện Khách hàng</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Modal Chỉnh Sửa Cài Đặt */}
      {showEditModal && (
        <EditAlbumModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          album={album}
          token={token || album.manageToken}
          onSaved={(updated) => {
            if (onUpdate) onUpdate(updated);
          }}
        />
      )}
    </>
  );
};

export default AdminSettingsCard;
