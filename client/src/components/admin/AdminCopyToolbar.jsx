import React, { useState } from 'react';
import { Copy, Check, Terminal, FileSpreadsheet, MessageSquare, FileText } from 'lucide-react';
import { formatFileList, formatDetailedList, downloadBatScript, downloadCsv } from '../../utils/exportUtils';

export const AdminCopyToolbar = ({ selectedImages = [], clientInfo = {}, albumTitle = 'album' }) => {
  const [separator, setSeparator] = useState('comma');
  const [copiedNames, setCopiedNames] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);

  const selectedCount = selectedImages.length;
  const fileListString = formatFileList(selectedImages, separator);
  const detailedListString = formatDetailedList(selectedImages, clientInfo, albumTitle);

  // Đếm số ảnh có ghi chú
  const commentedImagesCount = selectedImages.filter(
    (img) => img.comment && img.comment.trim().length > 0
  ).length;

  const handleCopyNames = () => {
    if (!fileListString) return;
    navigator.clipboard.writeText(fileListString);
    setCopiedNames(true);
    setTimeout(() => setCopiedNames(false), 2000);
  };

  const handleCopyDetailed = () => {
    if (!detailedListString) return;
    navigator.clipboard.writeText(detailedListString);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4 border border-[#2b2722]">
      {/* Header & Delimiter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#221f1c] pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-2">
            <span>📋 Copy danh sách ({selectedCount} ảnh đã chọn)</span>
          </h3>
          {commentedImagesCount > 0 && (
            <p className="text-xs text-gold-300/80 mt-0.5">
              Có <strong className="text-gold-400">{commentedImagesCount}</strong> ảnh có ghi chú yêu cầu sửa
            </p>
          )}
        </div>

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

          {/* Copy Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nút copy tên file thuần */}
            <button
              onClick={handleCopyNames}
              className="bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
            >
              {copiedNames ? (
                <>
                  <Check className="w-4 h-4 text-green-950" />
                  <span>ĐÃ COPY TÊN FILE!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY TÊN FILE (LỌC LIGHTROOM)</span>
                </>
              )}
            </button>

            {/* Nút copy toàn bộ tên file kèm ghi chú */}
            <button
              onClick={handleCopyDetailed}
              className="bg-[#1e1a16] hover:bg-[#28231e] border border-gold-500/40 text-gold-200 hover:text-gold-100 font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs"
              title="Copy danh sách tên ảnh kèm từng yêu cầu chỉnh sửa và lời nhắn của khách"
            >
              {copiedNotes ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>ĐÃ COPY KÈM GHI CHÚ!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 text-gold-400" />
                  <span>COPY KÈM GHI CHÚ YÊU CẦU</span>
                </>
              )}
            </button>
          </div>

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
            💡 Dùng <strong className="text-gold-300">Copy tên file</strong> để lọc nhanh trong Lightroom / Photoshop Bridge; Dùng <strong className="text-gold-300">Copy kèm ghi chú</strong> hoặc <strong className="text-gold-300">Xuất Excel</strong> để xem chi tiết từng ảnh cần sửa gì.
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
