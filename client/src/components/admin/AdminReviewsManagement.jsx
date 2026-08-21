import React, { useState, useEffect } from 'react';
import { 
  Star, ShieldCheck, Check, EyeOff, Trash2, Search, Filter, RefreshCw, 
  Award, Camera, AlertCircle, CheckCircle2, User, MessageSquare
} from 'lucide-react';
import { userApi } from '../../api/userApi';

export const AdminReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'hidden' | 'disputed'
  const [notice, setNotice] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllReviewsAdmin();
      setReviews(res.data || []);
    } catch (err) {
      console.error('Fetch admin reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await userApi.updateReviewStatus(reviewId, newStatus);
      setNotice({
        type: 'success',
        message: newStatus === 'deleted' ? 'Đã xóa đánh giá.' : `Đã cập nhật trạng thái: ${newStatus}`
      });
      fetchReviews();
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái: ' + err.message);
    }
  };

  const handleReplyReview = async (reviewId) => {
    const text = prompt('Nhập nội dung phản hồi chính thức từ Studio/Admin:');
    if (!text || !text.trim()) return;
    try {
      await userApi.replyReview(reviewId, text.trim());
      setNotice({ type: 'success', message: 'Đã lưu phản hồi chính thức thành công!' });
      fetchReviews();
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      alert('Lỗi khi lưu phản hồi: ' + err.message);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (r.clientName && r.clientName.toLowerCase().includes(q)) || (r.comment && r.comment.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'disputed'
      ? (r.status === 'disputed' || r.isReported)
      : r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const disputedCount = reviews.filter(r => r.status === 'disputed' || r.isReported).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Notice */}
      {notice && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice.message}</span>
        </div>
      )}

      {/* Control Filter Bar */}
      <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8474]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên khách hàng hoặc nội dung nhận xét..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f0e0c] border border-[#2a251f] rounded-xl text-xs sm:text-sm text-[#f5eedf] placeholder-[#6b6255] focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Filter className="w-4 h-4 text-[#8e8474] hidden sm:block" />
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'approved', label: 'Đã hiển thị' },
            { id: 'disputed', label: `⚠️ Đang Khiếu Nại (${disputedCount})` },
            { id: 'hidden', label: 'Đã ẩn' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                  : 'bg-[#1a1714] text-[#8e8474] hover:text-[#cfc5b4]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={fetchReviews}
            className="p-2.5 bg-[#1d1a17] hover:bg-[#282420] border border-[#2f2923] text-gold-300 rounded-xl transition-all ml-auto"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reviews Table List */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
          <p className="text-xs text-[#8e8474]">Đang tải toàn bộ Đánh giá & Feedback Khách hàng...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-[#141210] border border-[#24201b] rounded-3xl space-y-3">
          <MessageSquare className="w-10 h-10 text-gold-400/40 mx-auto" />
          <p className="text-sm font-bold text-gold-200">Không có đánh giá nào phù hợp</p>
          <p className="text-xs text-gray-500">Tất cả nhận xét từ khách hàng sẽ hiển thị tại đây để Master Admin kiểm duyệt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-[#141210] p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rev.isReported || rev.status === 'disputed'
                  ? 'border-amber-500/50 bg-amber-500/[0.03]'
                  : 'border-[#24201b] hover:border-gold-500/30'
              }`}
            >
              <div className="space-y-2 flex-grow min-w-0">
                <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                  <div className="flex items-center space-x-1 bg-gold-500/10 px-2.5 py-1 rounded-lg border border-gold-500/30">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-amber-300">{rev.rating}.0 / 5.0</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>{rev.clientName}</span>
                  </div>

                  {rev.isVerifiedBooking ? (
                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>✓ Đã Đặt Lịch Chụp</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-gray-400 text-[10px] rounded">
                      Trải nghiệm tự do
                    </span>
                  )}

                  <span className="text-[11px] text-gray-500">
                    {new Date(rev.createdAt).toLocaleString('vi-VN')}
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                    rev.status === 'approved'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                      : rev.status === 'disputed' || rev.isReported
                      ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                      : 'bg-zinc-900 border-zinc-700 text-gray-400'
                  }`}>
                    {rev.status === 'approved' ? '✓ Đã Hiển Thị' : rev.status === 'disputed' || rev.isReported ? '⚠️ Đang Tranh Chấp' : '👁️ Đã Ẩn'}
                  </span>
                </div>

                {/* Report Reason Box if Disputed */}
                {(rev.isReported || rev.status === 'disputed') && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Studio Khiếu Nại Oan Sai:</strong> "{rev.reportReason || 'Khách không chụp thực tế / Báo cáo nội dung không chính xác'}"</span>
                  </div>
                )}

                <p className="text-xs text-gray-300 italic bg-[#0c0b0a] p-3 rounded-xl border border-[#24201b]">
                  "{rev.comment}"
                </p>

                {/* Photographer Reply */}
                {rev.photographerReply && (
                  <div className="p-2.5 bg-[#181512] border-l-2 border-gold-400 rounded-r-xl text-xs space-y-1">
                    <span className="text-gold-400 font-bold block text-[11px]">💬 Phản Hồi Từ Studio:</span>
                    <p className="text-gray-300 italic">{rev.photographerReply.text}</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center flex-wrap gap-y-1">
                <button
                  onClick={() => handleReplyReview(rev.id)}
                  className="px-3 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-bold flex items-center space-x-1"
                  title="Thêm hoặc sửa phản hồi chính thức"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Trả Lời</span>
                </button>

                {rev.status === 'approved' ? (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'hidden')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1"
                    title="Ẩn đánh giá này khỏi trang profile public"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ẩn Nhận Xét</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'approved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-1"
                    title="Bác bỏ khiếu nại & Phê duyệt hiển thị công khai"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Duyệt Hiển Thị</span>
                  </button>
                )}

                <button
                  onClick={() => handleUpdateStatus(rev.id, 'deleted')}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-rose-300 text-xs font-bold flex items-center space-x-1"
                  title="Chấp nhận khiếu nại & Xóa vĩnh viễn đánh giá oan sai"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsManagement;
