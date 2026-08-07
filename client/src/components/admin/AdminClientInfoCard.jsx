import React from 'react';
import { User, Phone, Calendar, FileText, Info } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminClientInfoCard = ({ clientInfo }) => {
  const hasSubmitted = Boolean(clientInfo && clientInfo.name);

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 border border-[#2b2722]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400 border-b border-[#221f1c] pb-2 flex items-center space-x-1.5">
        <User className="w-4 h-4" />
        <span>Thông tin Khách hàng</span>
      </h3>

      {hasSubmitted ? (
        <div className="space-y-3.5 text-xs">
          {/* Tên */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gold-500/10 border border-gold-500/25 rounded-xl text-gold-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-[#a2998a]">Họ & Tên</p>
              <p className="font-bold text-[#f5eedf] text-sm">{clientInfo.name}</p>
            </div>
          </div>

          {/* SĐT */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gold-500/10 border border-gold-500/25 rounded-xl text-gold-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-[#a2998a]">Số điện thoại</p>
              <a
                href={`tel:${clientInfo.phone}`}
                className="font-bold text-[#f5eedf] hover:text-gold-400 hover:underline"
              >
                {clientInfo.phone}
              </a>
            </div>
          </div>

          {/* Thời gian */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gold-500/10 border border-gold-500/25 rounded-xl text-gold-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-[#a2998a]">Thời gian chốt chọn</p>
              <p className="font-semibold text-[#f5eedf]">
                {formatDate(clientInfo.submittedAt) || 'Vừa xong'}
              </p>
            </div>
          </div>

          {/* Lời nhắn */}
          {clientInfo.note && (
            <div className="flex items-start space-x-3 pt-1">
              <div className="p-2 bg-gold-500/10 border border-gold-500/25 rounded-xl text-gold-400 shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex-grow">
                <p className="text-[10px] text-[#a2998a]">Lời nhắn chung của khách</p>
                <p className="text-xs text-[#d4cbba] mt-1 bg-[#13110f] border border-[#221f1c] p-2.5 rounded-xl italic leading-relaxed">
                  "{clientInfo.note}"
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-[#6e665a] space-y-2">
          <Info className="w-6 h-6 mx-auto opacity-40 text-gold-400" />
          <p>Khách hàng chưa gửi chốt danh sách chọn ảnh.</p>
        </div>
      )}
    </div>
  );
};

export default AdminClientInfoCard;
