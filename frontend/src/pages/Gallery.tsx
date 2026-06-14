import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, MessageSquare, Send, X, Check, Download, Filter, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Gallery() {
  const { id } = useParams();
  const [album, setAlbum] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, string>>({});
  
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await axios.get(`/api/albums/${id}`);
        setAlbum(res.data.album);
        if (res.data.requiresPasscode) {
          setRequiresPasscode(true);
        } else {
          setImages(res.data.images);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Không thể tải album');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  const toggleSelect = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(imageId)) {
      newSet.delete(imageId);
    } else {
      if (album?.limitCount > 0 && newSet.size >= album.limitCount) {
        alert(`Bạn chỉ được chọn tối đa ${album.limitCount} ảnh`);
        return;
      }
      newSet.add(imageId);
    }
    setSelectedIds(newSet);
  };

  const verifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setPasscodeError('');
    try {
      const res = await axios.post(`/api/albums/${id}/verify`, { passcode });
      setImages(res.data.images);
      setRequiresPasscode(false);
    } catch (err: any) {
      setPasscodeError('Mật khẩu không chính xác');
    } finally {
      setVerifying(false);
    }
  };

  const handleCommentChange = (imageId: string, text: string) => {
    setComments({ ...comments, [imageId]: text });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/selections', {
        albumId: id,
        clientName: clientInfo.name,
        clientPhone: clientInfo.phone,
        selectedIds: Array.from(selectedIds),
        comments
      });
      setSubmitted(true);
      setShowSubmitModal(false);
    } catch (err) {
      alert('Đã xảy ra lỗi khi gửi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadSelected = async () => {
    let delay = 0;
    for (const imgId of Array.from(selectedIds)) {
      const img = images.find(i => i.id === imgId);
      if (img) {
        const url = img.webContentLink || `https://drive.google.com/uc?id=${imgId}&export=download`;
        
        // Sử dụng iframe ẩn để tải thay vì window.open hoặc link.click
        // Cách này giúp lách luật chặn "Multiple Downloads" của trình duyệt
        setTimeout(() => {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = url;
          document.body.appendChild(iframe);
          
          // Xóa iframe sau khi tải xong để dọn dẹp bộ nhớ
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 10000);
        }, delay);
        
        // Tăng khoảng thời gian nghỉ giữa các file lên 800ms để trình duyệt không bị ngợp
        delay += 800;
      }
    }
    
    // Hiện thông báo hướng dẫn nhỏ nếu trình duyệt vẫn hỏi
    if (selectedIds.size > 1) {
      alert(`Hệ thống đang tải xuống ${selectedIds.size} ảnh...\\n\\nLƯU Ý: Nếu trình duyệt (Chrome/Safari) hiển thị cảnh báo "Chặn tải xuống nhiều tệp" (Pop-up blocked / Multiple downloads blocked) ở góc phải thanh địa chỉ, vui lòng bấm vào đó và chọn "Cho phép" (Allow) nhé!`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  
  if (requiresPasscode) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Album Bảo Mật</h2>
        <p className="text-slate-400 mb-6">Vui lòng nhập mật khẩu để xem album này</p>
        <form onSubmit={verifyPasscode} className="space-y-4">
          <input 
            type="password" 
            placeholder="Nhập mật khẩu..." 
            className="glass-input w-full text-center"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
          />
          {passcodeError && <p className="text-red-400 text-sm">{passcodeError}</p>}
          <button type="submit" disabled={verifying} className="glass-button w-full flex items-center justify-center gap-2">
            {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác Nhận'}
          </button>
        </form>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card text-center max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Đã Gửi Lựa Chọn</h2>
        <p className="text-slate-400 mb-6">Cám ơn bạn! Nhiếp ảnh gia đã nhận được danh sách ảnh bạn chọn.</p>
      </div>
    </div>
  );

  const displayedImages = filterMode === 'all' ? images : images.filter((img: any) => selectedIds.has(img.id));

  return (
    <div 
      className="min-h-screen pb-32" 
      onContextMenu={(e) => e.preventDefault()} 
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Hero Header Apple Style */}
      <div className="relative h-[40vh] md:h-[50vh] flex items-end justify-center pb-12 overflow-hidden bg-black mb-1 md:mb-2">
        {images.length > 0 && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 blur-lg" 
            style={{ backgroundImage: `url(https://lh3.googleusercontent.com/d/${images[0].id}=w1000)` }} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-white drop-shadow-xl">{album?.name}</h1>
          <p className="text-lg text-slate-300 font-medium">
            {images.length} hình ảnh {album?.limitCount > 0 && `• Được chọn tối đa ${album.limitCount} ảnh`}
          </p>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-1 md:px-2">
        {displayedImages.length === 0 && filterMode === 'selected' && (
          <div className="text-center py-20 text-slate-500">
            Bạn chưa chọn ảnh nào.
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 md:gap-2">
          <AnimatePresence>
            {displayedImages.map((img: any) => {
              const isSelected = selectedIds.has(img.id);
              const hasComment = !!comments[img.id];
              
              // Lightbox index needs to be relative to the full array, not displayed array.
              const originalIndex = images.findIndex(i => i.id === img.id);
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={img.id} 
                  className="relative group cursor-pointer aspect-square bg-slate-900 overflow-hidden"
                  onClick={() => setLightboxIndex(originalIndex)}
                >
                  <img 
                    src={`https://lh3.googleusercontent.com/d/${img.id}=w600`} 
                    alt={img.name} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Apple Style Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {isSelected && (
                    <div className="absolute inset-0 border-[3px] md:border-[4px] border-emerald-500 pointer-events-none transition-all duration-300 z-10" />
                  )}
                  {isSelected && (
                     <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none" />
                  )}
                  
                  {/* Filename */}
                  <div className="absolute bottom-0 left-0 p-2 md:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <p className="text-white font-medium text-xs md:text-sm drop-shadow-md">{img.name}</p>
                  </div>

                  {/* Checkbox */}
                  <button 
                    onClick={(e) => toggleSelect(img.id, e)}
                    className={`absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 transform z-20 shadow-lg ${isSelected ? 'bg-emerald-500 text-white shadow-emerald-500/50 scale-100 border-2 border-emerald-500' : 'bg-black/40 backdrop-blur-md border-2 border-white/60 text-white/0 hover:text-white/50 hover:bg-black/60 scale-95'}`}
                  >
                    <Check className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${isSelected ? 'scale-100 text-white' : 'scale-75'}`} strokeWidth={isSelected ? 3 : 2} />
                  </button>
                  
                  {hasComment && (
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 w-6 h-6 md:w-8 md:h-8 rounded-full bg-fuchsia-500 text-white flex items-center justify-center shadow-md z-10">
                      <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Dynamic Island Floating Bar */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center p-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full shadow-2xl"
        >
          {/* Filter Toggles */}
          <div className="flex bg-black/40 rounded-full p-1 mr-2 md:mr-4">
            <button 
              onClick={() => setFilterMode('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${filterMode === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Tất cả</span>
            </button>
            <button 
              onClick={() => setFilterMode('selected')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${filterMode === 'selected' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">Đã chọn ({selectedIds.size})</span>
            </button>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 pr-1">
              <button 
                onClick={downloadSelected}
                className="w-10 h-10 md:w-auto md:px-4 md:py-2 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center gap-2 transition-colors"
                title="Tải ảnh đã chọn"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
                <span className="hidden md:inline text-sm font-medium">Tải về</span>
              </button>
              
              <button 
                onClick={() => setShowSubmitModal(true)}
                className="w-10 h-10 md:w-auto md:px-6 md:py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                title="Gửi lựa chọn"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                <span className="hidden md:inline text-sm font-medium">Gửi Ảnh</span>
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col md:flex-row">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 z-50 p-2 bg-slate-800/50 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={`https://lh3.googleusercontent.com/d/${images[lightboxIndex].id}`} 
              className="max-w-full max-h-full object-contain"
              alt="Preview" 
            />
          </div>
          
          <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 p-6 flex flex-col">
            <h3 className="font-bold text-xl mb-6">{images[lightboxIndex].name}</h3>
            
            <button 
              onClick={(e) => toggleSelect(images[lightboxIndex].id, e)}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 mb-8 transition-colors ${selectedIds.has(images[lightboxIndex].id) ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            >
              <Check className="w-5 h-5" />
              {selectedIds.has(images[lightboxIndex].id) ? 'Đã Chọn Ảnh Này' : 'Chọn Ảnh Này'}
            </button>

            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Ghi chú cho thợ ảnh
              </label>
              <textarea 
                className="glass-input w-full h-32 resize-none"
                placeholder="Ví dụ: Bóp mặt, chỉnh sáng lên một chút..."
                value={comments[images[lightboxIndex].id] || ''}
                onChange={(e) => handleCommentChange(images[lightboxIndex].id, e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => {
                  const img = images[lightboxIndex];
                  const link = img?.webContentLink || `https://drive.google.com/uc?id=${img.id}&export=download`;
                  window.open(link, '_blank');
                }}
                className="flex-1 glass-button py-3 text-sm bg-emerald-600 hover:bg-emerald-500 shadow-none flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Tải ảnh
              </button>
              <div className="flex flex-1 gap-2">
                <button 
                  onClick={() => setLightboxIndex(prev => prev! > 0 ? prev! - 1 : prev)}
                  disabled={lightboxIndex === 0}
                  className="flex-1 glass-button px-2 py-3 text-sm bg-slate-800 shadow-none hover:bg-slate-700 disabled:opacity-30"
                >
                  Lùi
                </button>
                <button 
                  onClick={() => setLightboxIndex(prev => prev! < images.length - 1 ? prev! + 1 : prev)}
                  disabled={lightboxIndex === images.length - 1}
                  className="flex-1 glass-button px-2 py-3 text-sm"
                >
                  Tới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-2">Hoàn tất lựa chọn</h2>
            <p className="text-slate-400 mb-6">Bạn đã chọn {selectedIds.size} ảnh. Vui lòng để lại thông tin để nhiếp ảnh gia liên hệ.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tên của bạn</label>
                <input 
                  required
                  type="text" 
                  className="glass-input w-full" 
                  placeholder="VD: Anh Tuấn"
                  value={clientInfo.name}
                  onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Số điện thoại</label>
                <input 
                  required
                  type="tel" 
                  className="glass-input w-full" 
                  placeholder="0912345678"
                  value={clientInfo.phone}
                  onChange={e => setClientInfo({...clientInfo, phone: e.target.value})}
                />
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 glass-button flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Gửi ngay
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
