import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Users, FileSpreadsheet, Terminal, Trash2, AlertTriangle } from 'lucide-react';

export default function Admin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selections, setSelections] = useState<any[]>([]);
  const [album, setAlbum] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumRes, selectionsRes] = await Promise.all([
          axios.get(`/api/albums/${id}?admin=true`),
          axios.get(`/api/albums/${id}/selections`)
        ]);
        setAlbum(albumRes.data.album);
        setImages(albumRes.data.images);
        setSelections(selectionsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const downloadBat = (selectedIds: string[], clientName: string) => {
    const baseNames = selectedIds.map(imgId => {
      const img = images.find(i => i.id === imgId);
      if (!img) return '';
      // Lấy tên cơ bản không chứa đuôi mở rộng để copy được cả file RAW và JPG
      return img.name.replace(/\.[^/.]+$/, "");
    }).filter(Boolean);

    let batContent = `@echo off\r\nchcp 65001 > nul\r\necho Dang tao thu muc Anh_Da_Chon...\r\nmkdir "Anh_Da_Chon" 2>nul\r\necho Dang gom anh...\r\n`;
    baseNames.forEach(name => {
      batContent += `copy "*${name}*" "Anh_Da_Chon\\"\r\n`;
    });
    batContent += `echo Hoan tat gom ${baseNames.length} anh! Chuc ban retouch vui ve.\r\npause\r\n`;

    const blob = new Blob([batContent], { type: 'application/bat;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Gom_Anh_${clientName.replace(/\s+/g, '_')}.bat`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadCsv = (selectedIds: string[], clientName: string, commentsMap: any) => {
    let csvContent = `\uFEFFSTT,Tên Ảnh,Ghi Chú\n`; // \uFEFF là BOM để Excel nhận diện được Tiếng Việt UTF-8
    selectedIds.forEach((imgId, index) => {
      const img = images.find(i => i.id === imgId);
      if (img) {
        const comment = commentsMap?.[imgId] || '';
        // Escape dấu nháy kép cho chuẩn CSV
        const safeComment = `"${comment.replace(/"/g, '""')}"`;
        csvContent += `${index + 1},${img.name},${safeComment}\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Danh_Sach_Anh_${clientName.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const deleteSelection = async (selectionId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lựa chọn của khách hàng này? (Dữ liệu không thể khôi phục)')) {
      try {
        await axios.delete(`/api/selections/${selectionId}`);
        setSelections(selections.filter(s => s._id !== selectionId));
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const deleteAlbum = async () => {
    const confirmMessage = 'CẢNH BÁO: Thao tác này sẽ xóa VĨNH VIỄN toàn bộ Album và TẤT CẢ lựa chọn của khách hàng khỏi hệ thống! Bạn có chắc chắn muốn xóa?';
    if (window.confirm(confirmMessage)) {
      try {
        await axios.delete(`/api/albums/${id}`);
        navigate('/');
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa album!');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/album/${id}`)}`} 
              alt="QR Code" 
              className="w-20 h-20 sm:w-24 sm:h-24" 
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
              Quản trị: {album?.name}
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Link gửi cho khách: <a href={`${window.location.origin}/album/${id}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline break-all">{window.location.origin}/album/{id}</a>
            </p>
          </div>
        </div>
        <button 
          onClick={deleteAlbum}
          className="glass-button bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white shadow-none flex items-center justify-center gap-2 px-6 py-3 whitespace-nowrap"
        >
          <AlertTriangle className="w-5 h-5" />
          Xóa toàn bộ Album
        </button>
      </div>

      <div className="glass-card mb-8 flex items-center gap-4">
        <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{selections.length}</h2>
          <p className="text-slate-400">Lượt khách đã chọn ảnh</p>
        </div>
      </div>

      <div className="space-y-6">
        {selections.map(sel => (
          <div key={sel._id} className="glass-card border-slate-700/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-xl font-bold">{sel.clientName}</h3>
                <p className="text-slate-400">SĐT: {sel.clientPhone} • {new Date(sel.createdAt).toLocaleString()}</p>
                <p className="text-emerald-400 font-medium mt-1">Đã chọn {sel.selectedIds.length} ảnh</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => downloadBat(sel.selectedIds, sel.clientName)}
                  className="glass-button bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <Terminal className="w-5 h-5" />
                  Tải Script Gom Ảnh (.bat)
                </button>
                <button 
                  onClick={() => downloadCsv(sel.selectedIds, sel.clientName, sel.comments)}
                  className="glass-button bg-emerald-600 hover:bg-emerald-500 shadow-none flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Xuất Excel (.csv)
                </button>
                <button 
                  onClick={() => deleteSelection(sel._id)}
                  className="glass-button bg-red-500/20 text-red-400 shadow-none hover:bg-red-500/40 hover:text-white flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <Trash2 className="w-5 h-5" />
                  Xóa
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-slate-300">Ảnh đã chọn:</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {sel.selectedIds.map((imgId: string) => {
                  const img = images.find(i => i.id === imgId);
                  const comment = sel.comments?.[imgId];
                  if (!img) return null;
                  return (
                    <div key={imgId} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800 aspect-square">
                      <img src={`https://lh3.googleusercontent.com/d/${imgId}=w200-h200-c`} className="w-full h-full object-cover" alt={img.name} title={img.name} />
                      {comment && (
                        <div className="absolute inset-0 bg-black/80 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center overflow-y-auto">
                          {comment}
                        </div>
                      )}
                      {comment && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-fuchsia-500 rounded-full group-hover:hidden"></div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white truncate px-1 py-1 text-center">
                        {img.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {selections.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Chưa có khách hàng nào gửi lựa chọn.
          </div>
        )}
      </div>
    </div>
  );
}
