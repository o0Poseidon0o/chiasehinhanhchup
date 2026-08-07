import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
      <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      <p className="text-sm text-[#a2998a] font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
