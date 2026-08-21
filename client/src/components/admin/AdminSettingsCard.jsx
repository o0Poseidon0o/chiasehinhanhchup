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
  Lock,
  Copy,
  Phone,
  Share2
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { EditAlbumModal } from './EditAlbumModal';
import { getPublicBaseUrl, generateClientShareText } from '../../utils/formatters';

export const AdminSettingsCard = ({ album, onSync, syncLoading, onUpdate, token = '' }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const totalCount = album.images?.length || 0;
  const clientUrl = `${getPublicBaseUrl()}/album/${album._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(clientUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    const msg = generateClientShareText({
      clientName: album.clientInfo?.name,
      albumTitle: album.title,
      clientUrl: clientUrl,
      passcode: album.passcode
    });
    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

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

          {/* Section: Gửi Link Cho Khách */}
          <div className="pt-3 border-t border-[#221f1c] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gold-300 uppercase tracking-wider flex items-center space-x-1">
                <Share2 className="w-3.5 h-3.5 text-gold-400" />
                <span>Gửi link cho Khách hàng</span>
              </span>
              <span className="text-[10px] text-[#8e8576]">Tương thích Vercel & Domain</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                readOnly
                value={clientUrl}
                className="w-full bg-[#13110f] border border-[#2b2722] text-xs font-mono text-gold-300 rounded-xl p-2.5 select-all focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-gold-500 hover:bg-gold-400 text-gold-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Đã copy!' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="bg-[#1e1a16] hover:bg-[#28231e] border border-gold-500/40 text-gold-200 hover:text-gold-100 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
                  title="Copy tin nhắn soạn sẵn kèm lời chào và link gửi Zalo"
                >
                  {copiedMsg ? <Check className="w-3.5 h-3.5 text-green-400" /> : <MessageSquare className="w-3.5 h-3.5 text-gold-400" />}
                  <span>{copiedMsg ? 'Đã copy!' : 'Tin Nhắn Zalo'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 pt-0.5">
                {album.clientInfo?.phone && (
                  <a
                    href={`https://zalo.me/${album.clientInfo.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mở Zalo Khách</span>
                  </a>
                )}
                <a
                  href={clientUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] text-[#a2998a] hover:text-gold-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <span>Xem Khách</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
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
