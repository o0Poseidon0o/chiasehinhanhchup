/**
 * Format danh sách tên file theo các định dạng phân cách
 * @param {Array<Object>} selectedImages 
 * @param {'comma'|'space'|'newline'|'pipe'} separator 
 * @returns {string}
 */
export const formatFileList = (selectedImages = [], separator = 'comma') => {
  if (!Array.isArray(selectedImages) || selectedImages.length === 0) return '';
  
  const names = selectedImages.map(img => img.fileName || '');
  
  switch (separator) {
    case 'comma':
      return names.join(', ');
    case 'space':
      return names.join(' ');
    case 'newline':
      return names.join('\n');
    case 'pipe':
      return names.join('|');
    default:
      return names.join(', ');
  }
};

/**
 * Format danh sách chi tiết ảnh kèm ghi chú của từng ảnh và lời nhắn khách
 * @param {Array<Object>} selectedImages 
 * @param {Object} clientInfo 
 * @param {string} albumTitle 
 * @returns {string}
 */
export const formatDetailedList = (selectedImages = [], clientInfo = {}, albumTitle = 'Album') => {
  if (!Array.isArray(selectedImages) || selectedImages.length === 0) return '';

  let text = `DANH SÁCH ẢNH CHỌN - ${albumTitle.toUpperCase()}\n`;
  if (clientInfo?.name) {
    text += `Khách hàng: ${clientInfo.name} - SĐT: ${clientInfo.phone || 'N/A'}\n`;
  }
  if (clientInfo?.note) {
    text += `Lời nhắn chung: "${clientInfo.note}"\n`;
  }
  text += `Tổng số lượng: ${selectedImages.length} ảnh\n`;
  text += `----------------------------------------\n`;

  selectedImages.forEach((img, idx) => {
    text += `${idx + 1}. ${img.fileName}`;
    if (img.comment && img.comment.trim().length > 0) {
      text += ` => [Ghi chú: ${img.comment.trim()}]`;
    }
    text += `\n`;
  });

  return text;
};

/**
 * Tải file script Windows Batch (.bat) để tự động sao chép các file ảnh đã chọn vào thư mục "Da_Chon"
 * @param {Array<Object>} selectedImages 
 * @param {string} albumTitle 
 */
export const downloadBatScript = (selectedImages = [], albumTitle = 'album') => {
  if (!selectedImages.length) return;

  const sanitizedTitle = albumTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  let batContent = `@echo off\r\nchcp 65001 >nul\r\necho Dang sao chep cac file anh da chon vao thu muc Da_Chon...\r\nif not exist "Da_Chon" mkdir "Da_Chon"\r\n\r\n`;

  selectedImages.forEach(img => {
    batContent += `if exist "${img.fileName}" (copy /Y "${img.fileName}" "Da_Chon\\" >nul && echo Da chep: ${img.fileName}) else (echo Khong tim thay: ${img.fileName})\r\n`;
  });

  batContent += `\r\necho.\r\necho ===========================================\r\necho Hoan tat sao chep ${selectedImages.length} file anh!\r\necho ===========================================\r\npause\r\n`;

  const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Copy_Anh_${sanitizedTitle}_Windows.bat`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Tải file script macOS Shell (.command) để tự động sao chép các file ảnh đã chọn vào thư mục "Da_Chon" trên Macbook
 * @param {Array<Object>} selectedImages 
 * @param {string} albumTitle 
 */
export const downloadShellScript = (selectedImages = [], albumTitle = 'album') => {
  if (!selectedImages.length) return;

  const sanitizedTitle = albumTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  let shContent = `#!/bin/bash\n`;
  shContent += `# Script tu dong gom anh goc cho macOS / Linux (Capture One / Lightroom Workflow)\n`;
  shContent += `DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"\n`;
  shContent += `cd "$DIR"\n\n`;
  shContent += `echo "=================================================="\n`;
  shContent += `echo "  MACOS PHOTO AUTO COPY TOOL"\n`;
  shContent += `echo "  Dang sao chep ${selectedImages.length} file anh da chon vao thư muc Da_Chon..."\n`;
  shContent += `echo "=================================================="\n\n`;
  shContent += `mkdir -p "Da_Chon"\n\n`;
  shContent += `success_count=0\n`;

  selectedImages.forEach(img => {
    const safeName = (img.fileName || '').replace(/"/g, '\\"');
    shContent += `if [ -f "${safeName}" ]; then\n`;
    shContent += `  cp "${safeName}" "Da_Chon/" && echo "[✓] Da chep: ${safeName}" && success_count=$((success_count+1))\n`;
    shContent += `else\n`;
    shContent += `  echo "[X] Khong tim thay: ${safeName}"\n`;
    shContent += `fi\n`;
  });

  shContent += `\necho ""\n`;
  shContent += `echo "=================================================="\n`;
  shContent += `echo " HOAN TAT! Da sao chep $success_count / ${selectedImages.length} file anh."\n`;
  shContent += `echo " Thu muc chieu: $(pwd)/Da_Chon"\n`;
  shContent += `echo "=================================================="\n`;
  shContent += `read -p "Nhan Enter de thoat..." temp\n`;

  const blob = new Blob([shContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Copy_Anh_${sanitizedTitle}_Mac.command`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Tải file TXT danh sách tên ảnh (dùng trực tiếp cho Capture One "Select By Filename List")
 * @param {Array<Object>} selectedImages 
 * @param {string} albumTitle 
 */
export const downloadTextList = (selectedImages = [], albumTitle = 'album') => {
  if (!selectedImages.length) return;

  const sanitizedTitle = albumTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const txtContent = selectedImages.map(img => img.fileName || '').join('\n');

  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Danh_sach_anh_${sanitizedTitle}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Tải file CSV chứa danh sách ảnh đã chọn kèm ghi chú
 * @param {Array<Object>} selectedImages 
 * @param {string} albumTitle 
 */
export const downloadCsv = (selectedImages = [], albumTitle = 'album') => {
  if (!selectedImages.length) return;

  const sanitizedTitle = albumTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  let csvContent = '\uFEFF"STT","Tên File","Ghi chú chỉnh sửa"\r\n';

  selectedImages.forEach((img, idx) => {
    const note = (img.comment || '').replace(/"/g, '""');
    csvContent += `"${idx + 1}","${img.fileName}","${note}"\r\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Danh_sach_chon_${sanitizedTitle}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

