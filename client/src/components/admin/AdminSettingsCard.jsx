import React from 'react';
import { ExternalLink, Settings } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const AdminSettingsCard = ({ album }) => {
  const totalCount = album.images?.length || 0;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 border border-[#2b2722]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400 border-b border-[#221f1c] pb-2 flex items-center space-x-1.5">
        <Settings className="w-4 h-4" />
        <span>Cài đặt Album</span>
      </h3>

      <div className="text-xs space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[#a2998a]">Mã PIN bảo mật:</span>
          <span className="font-mono text-gold-200 font-semibold bg-[#1a1816] px-2 py-0.5 rounded border border-[#2b2722]">
            {album.passcode || 'Không cài đặt'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#a2998a]">Tổng số ảnh trong Drive:</span>
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
