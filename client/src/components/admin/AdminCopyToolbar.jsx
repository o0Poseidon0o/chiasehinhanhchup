import React, { useState } from 'react';
import { Copy, Check, Terminal, FileSpreadsheet } from 'lucide-react';
import { formatFileList, downloadBatScript, downloadCsv } from '../../utils/exportUtils';

export const AdminCopyToolbar = ({ selectedImages = [], albumTitle = 'album' }) => {
  const [separator, setSeparator] = useState('comma');
  const [copied, setCopied] = useState(false);

  const selectedCount = selectedImages.length;
  const fileListString = formatFileList(selectedImages, separator);

  const handleCopy = () => {
    if (!fileListString) return;
    navigator.clipboard.writeText(fileListString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4 border border-[#2b2722]">
      {/* Header & Delimiter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#221f1c] pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-2">
          <span>📋 Copy danh sách tên file ({selectedCount} ảnh đã chọn)</span>
        </h3>

        {/* Bộ chọn dấu phân cách */}
        <div className="flex bg-[#161412] p-1 rounded-xl border border-[#2b2722] text-xs">
          <button
            onClick={() => setSeparator('comma')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              separator === 'comma'
                ? 'bg-gold-500 text-gold-950 shadow-sm'
                : 'text-[#a2998a] hover:text-[#f5eedf]'
            }`}
          >
            Dấu phẩy ( , )
          </button>
          <button
            onClick={() => setSeparator('space')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              separator === 'space'
                ? 'bg-gold-500 text-gold-950 shadow-sm'
                : 'text-[#a2998a] hover:text-[#f5eedf]'
            }`}
          >
            Khoảng cách ( )
          </button>
          <button
            onClick={() => setSeparator('newline')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              separator === 'newline'
                ? 'bg-gold-500 text-gold-950 shadow-sm'
                : 'text-[#a2998a] hover:text-[#f5eedf]'
            }`}
          >
            Xuống dòng
          </button>
        </div>
      </div>

      {selectedCount > 0 ? (
        <div className="space-y-4">
          <textarea
            readOnly
            rows={3}
            value={fileListString}
            className="w-full bg-[#13110f] border border-[#2b2722] rounded-xl p-3 text-xs font-mono text-gold-300 focus:outline-none select-all"
          />

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-gold-500/10 flex items-center justify-center space-x-2 text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-950" />
                <span>ĐÃ COPY DANH SÁCH TÊN FILE THÀNH CÔNG!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY DANH SÁCH TÊN FILE CHỌN</span>
              </>
            )}
          </button>

          {/* Quick export tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => downloadBatScript(selectedImages, albumTitle)}
              className="bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] hover:border-gold-500/30 text-xs text-[#d4cbba] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
              title="Tạo file .BAT tự động copy các file ảnh gốc vào thư mục 'Da_Chon'"
            >
              <Terminal className="w-4 h-4 text-gold-400" />
              <span>Tải file BAT (Tự gom file gốc)</span>
            </button>

            <button
              onClick={() => downloadCsv(selectedImages, albumTitle)}
              className="bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] hover:border-gold-500/30 text-xs text-[#d4cbba] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
              title="Xuất bảng tính Excel/CSV danh sách ảnh và ghi chú sửa"
            >
              <FileSpreadsheet className="w-4 h-4 text-gold-400" />
              <span>Xuất danh sách Excel (CSV)</span>
            </button>
          </div>

          <p className="text-[11px] text-[#8e8576] text-center leading-normal">
            💡 Copy danh sách này và Paste trực tiếp vào ô tìm kiếm (Search filter) của{' '}
            <strong className="text-gold-300">Adobe Lightroom Classic / Photoshop Bridge</strong> để lọc các file gốc chỉnh sửa tức thì.
          </p>
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-[#6e665a]">
          Danh sách copy và công cụ xuất file sẽ kích hoạt khi khách hàng chốt chọn ảnh.
        </div>
      )}
    </div>
  );
};

export default AdminCopyToolbar;
