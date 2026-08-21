import React, { useState } from 'react';
import { Copy, Check, Terminal, FileSpreadsheet, MessageSquare, FileText, Apple, HelpCircle, ChevronDown, ChevronUp, Laptop } from 'lucide-react';
import { 
  formatFileList, 
  formatDetailedList, 
  downloadBatScript, 
  downloadShellScript, 
  downloadTextList, 
  downloadCsv 
} from '../../utils/exportUtils';

export const AdminCopyToolbar = ({ selectedImages = [], clientInfo = {}, albumTitle = 'album' }) => {
  const [separator, setSeparator] = useState('comma');
  const [copiedNames, setCopiedNames] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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
        <div className="flex flex-wrap bg-[#161412] p-1 rounded-xl border border-[#2b2722] text-xs gap-1">
          <button
            onClick={() => setSeparator('comma')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              separator === 'comma'
                ? 'bg-gold-500 text-gold-950 shadow-sm'
                : 'text-[#a2998a] hover:text-[#f5eedf]'
            }`}
            title="Tách tên ảnh bằng dấu phẩy (,)"
          >
            Dấu phẩy ( , )
          </button>
          <button
            onClick={() => setSeparator('space')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              separator === 'space'
                ? 'bg-gold-500 text-gold-950 shadow-sm'
                : 'text-[#a2998a] hover:text-[#f5eedf]'
            }`}
            title="Tách tên ảnh bằng khoảng cách"
          >
            Khoảng cách ( )
          </button>
          <button
            onClick={() => setSeparator('newline')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              separator === 'newline'
                ? 'bg-gold-500 text-gold-950 shadow-sm'
                : 'text-[#a2998a] hover:text-[#f5eedf]'
            }`}
            title="Mỗi tên ảnh 1 dòng (Dùng cho Capture One / File list)"
          >
            Xuống dòng
          </button>
          <button
            onClick={() => setSeparator('pipe')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              separator === 'pipe'
                ? 'bg-gold-500 text-gold-950 shadow-sm'
                : 'text-[#a2998a] hover:text-[#f5eedf]'
            }`}
            title="Tách tên ảnh bằng dấu gạch đứng (|) cho Regex"
          >
            Dấu gạch ( | )
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
                  <span>COPY TÊN FILE (LIGHTROOM / CAPTURE ONE)</span>
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

          {/* Công cụ Tải file & Script tự động (Windows + Macbook Mac OS + Capture One) */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-semibold text-[#a2998a] flex items-center justify-between">
              <span>⚡ Công cụ tải danh sách & script gom ảnh tự động:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Tải Script Mac */}
              <button
                onClick={() => downloadShellScript(selectedImages, albumTitle)}
                className="bg-[#1a1816] hover:bg-[#25211c] border border-gold-500/30 hover:border-gold-500/60 text-xs text-[#f5eedf] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm group"
                title="Tải script .command cho Macbook (Double-click trong Finder để tự gom ảnh vào folder Da_Chon)"
              >
                <Apple className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Script Mac (.command)</span>
              </button>

              {/* Tải Script Windows */}
              <button
                onClick={() => downloadBatScript(selectedImages, albumTitle)}
                className="bg-[#1a1816] hover:bg-[#25211c] border border-[#2b2722] hover:border-gold-500/40 text-xs text-[#d4cbba] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all group"
                title="Tải file .BAT cho Windows (Tự động copy các file ảnh gốc vào thư mục 'Da_Chon')"
              >
                <Terminal className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Script Win (.BAT)</span>
              </button>

              {/* Tải File TXT cho Capture One */}
              <button
                onClick={() => downloadTextList(selectedImages, albumTitle)}
                className="bg-[#1a1816] hover:bg-[#25211c] border border-[#2b2722] hover:border-gold-500/40 text-xs text-[#d4cbba] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all group"
                title="Tải file text (.txt) mỗi file 1 dòng (Nhập thẳng vào Capture One / Photo Mechanic)"
              >
                <FileText className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Danh sách (.TXT)</span>
              </button>

              {/* Tải Excel CSV */}
              <button
                onClick={() => downloadCsv(selectedImages, albumTitle)}
                className="bg-[#1a1816] hover:bg-[#25211c] border border-[#2b2722] hover:border-gold-500/40 text-xs text-[#d4cbba] py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 transition-all group"
                title="Xuất bảng tính Excel/CSV chứa tên ảnh và ghi chú sửa"
              >
                <FileSpreadsheet className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Xuất Excel (CSV)</span>
              </button>
            </div>
          </div>

          {/* Collapsible Quick Guide for Photographers */}
          <div className="pt-2 border-t border-[#221f1c]">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-xs text-gold-300/90 hover:text-gold-200 py-1.5 px-2 rounded-lg hover:bg-[#1a1816] transition-colors"
            >
              <span className="flex items-center space-x-2 font-medium">
                <HelpCircle className="w-4 h-4 text-gold-400" />
                <span>💡 Hướng dẫn nhanh cho Capture One / Lightroom / Macbook</span>
              </span>
              {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showGuide && (
              <div className="mt-3 p-4 bg-[#141210] rounded-xl border border-[#2b2722] text-xs text-[#b5ac9d] space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-gold-300 flex items-center space-x-1.5">
                    <span>📸 Trong Capture One Pro (Macbook & Windows):</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed pl-4">
                    • <strong>Cách 1:</strong> Chọn dấu phân cách <code className="text-gold-400">Xuống dòng</code> hoặc <code className="text-gold-400">Dấu phẩy</code> ➔ Nhấn <strong>Copy tên file</strong>. Vào Capture One ➔ Menu <code className="text-gold-300">Edit</code> ➔ <code className="text-gold-300">Select By</code> ➔ <code className="text-gold-300">Filename List...</code> (Phím tắt: <kbd className="bg-[#24201c] px-1.5 py-0.5 rounded text-[10px]">Cmd + Option + F</kbd> trên Mac / <kbd className="bg-[#24201c] px-1.5 py-0.5 rounded text-[10px]">Ctrl + Alt + F</kbd> trên Win) ➔ Dán danh sách vào.
                    <br />
                    • <strong>Cách 2:</strong> Bấm <strong>Danh sách (.TXT)</strong> để tải file text, trong cửa sổ <em>Select By Filename List</em> bấm <strong>Browse...</strong> chọn file TXT vừa tải.
                  </p>
                </div>

                <div className="space-y-1 border-t border-[#221f1c] pt-2">
                  <div className="font-bold text-gold-300 flex items-center space-x-1.5">
                    <span>📸 Trong Adobe Lightroom Classic:</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed pl-4">
                    • Chọn <code className="text-gold-400">Dấu phẩy</code> hoặc <code className="text-gold-400">Khoảng cách</code> ➔ Bấm <strong>Copy tên file</strong>. Trong mục Library (<kbd className="bg-[#24201c] px-1.5 py-0.5 rounded text-[10px]">G</kbd>), nhấn phím <kbd className="bg-[#24201c] px-1.5 py-0.5 rounded text-[10px]">\</kbd> mở Filter ➔ Chọn <strong>Text</strong> ➔ Chuyển thành <strong>Filename / Contains</strong> ➔ Dán danh sách.
                  </p>
                </div>

                <div className="space-y-1 border-t border-[#221f1c] pt-2">
                  <div className="font-bold text-gold-300 flex items-center space-x-1.5">
                    <Apple className="w-3.5 h-3.5 text-gold-400 inline" />
                    <span>🍎 Dành cho Nhiếp ảnh gia dùng Macbook (macOS):</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed pl-4">
                    • Bấm <strong>Script Mac (.command)</strong> để tải script.
                    <br />
                    • Bỏ file <code className="text-gold-400">.command</code> vừa tải vào cùng thư mục chứa bộ ảnh gốc trên Mac.
                    <br />
                    • Double-click vào file <code className="text-gold-400">.command</code> trong Finder ➔ Terminal trên Mac sẽ tự chạy và gom toàn bộ các ảnh gốc được khách chọn vào thư mục mới đặt tên là <strong className="text-gold-300">Da_Chon</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
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

