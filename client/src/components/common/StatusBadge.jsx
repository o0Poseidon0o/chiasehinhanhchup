import React from 'react';
import { Lock, CheckCircle2, Clock } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'locked':
      return (
        <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full border border-red-500/30 text-red-400 bg-red-500/10 font-semibold">
          <Lock className="w-3 h-3" />
          <span>Đã Khóa</span>
        </span>
      );
    case 'submitted':
      return (
        <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full border border-green-500/30 text-green-400 bg-green-500/10 font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          <span>Đã Chốt Chọn</span>
        </span>
      );
    case 'selecting':
    default:
      return (
        <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full border border-gold-500/30 text-gold-400 bg-gold-500/10 font-semibold animate-pulse">
          <Clock className="w-3 h-3" />
          <span>Đang Chọn Ảnh</span>
        </span>
      );
  }
};

export default StatusBadge;
