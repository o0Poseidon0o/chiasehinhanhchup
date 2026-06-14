import { ArrowRight, Image as ImageIcon, Camera, Zap, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen p-6">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full z-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-3xl glass inline-block">
            <Camera className="w-12 h-12 text-indigo-400" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Nền tảng <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Chọn Ảnh</span> Chuyên Nghiệp
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Đơn giản hóa quy trình giao dịch giữa Nhiếp ảnh gia và Khách hàng. Gửi link Drive, khách chọn ảnh, bạn nhận danh sách copy thẳng vào Lightroom.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/create" className="glass-button flex items-center gap-2 text-lg px-8 py-4 w-full sm:w-auto justify-center group">
            Bắt đầu miễn phí
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10 mt-24"
      >
        <div className="glass-card flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Google Drive API</h3>
          <p className="text-slate-400 text-sm">Chỉ cần dán link thư mục Google Drive. Chúng tôi tự động đồng bộ ảnh nhanh chóng.</p>
        </div>
        <div className="glass-card flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center mb-4 text-fuchsia-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Trải Nghiệm Mượt Mà</h3>
          <p className="text-slate-400 text-sm">Giao diện Masonry grid hiện đại, Lazy load tối ưu cho album hàng trăm bức ảnh.</p>
        </div>
        <div className="glass-card flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Tự Động Gom Ảnh</h3>
          <p className="text-slate-400 text-sm">Xuất script .bat để tự động copy toàn bộ file RAW/JPG khách chọn ra thư mục riêng.</p>
        </div>
      </motion.div>
    </div>
  );
}
