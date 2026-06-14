import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FolderUp, Link as LinkIcon, Users, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateAlbum() {
  const [formData, setFormData] = useState({
    driveUrl: '',
    name: '',
    limitCount: 0,
    passcode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/albums', formData);
      // Chuyển hướng đến trang Admin của album vừa tạo
      navigate(`/album/${res.data._id}/admin`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi khi tạo album. Vui lòng kiểm tra lại link Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full glass rounded-3xl p-8 z-10"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-slate-700/50 pb-6">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
            <FolderUp className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Tạo Album Mới</h2>
            <p className="text-slate-400 text-sm">Chia sẻ với khách hàng ngay lập tức</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tên Album</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="VD: Album Cưới Duy & Lan"
                className="glass-input w-full pl-11"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Link Thư Mục Google Drive</label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://drive.google.com/drive/folders/..."
                className="glass-input w-full pl-11"
                value={formData.driveUrl}
                onChange={(e) => setFormData({...formData, driveUrl: e.target.value})}
              />
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Đảm bảo thư mục đang ở chế độ "Anyone with the link"</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Giới hạn ảnh (0 = Vô hạn)</label>
              <input
                type="number"
                min="0"
                className="glass-input w-full"
                value={formData.limitCount}
                onChange={(e) => setFormData({...formData, limitCount: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu (Tùy chọn)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Để trống nếu không cần"
                  className="glass-input w-full pl-10 text-sm"
                  value={formData.passcode}
                  onChange={(e) => setFormData({...formData, passcode: e.target.value})}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full flex justify-center items-center gap-2 mt-8"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderUp className="w-5 h-5" />}
            {loading ? 'Đang tạo...' : 'Tạo Album'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
