import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Tag, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  X,
  ExternalLink,
  Layers
} from 'lucide-react';
import { categoryApi } from '../../api/categoryApi';

export const AdminCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = create new
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    price: 'Từ 1.500.000đ',
    badge: 'Được yêu thích',
    tags: 'Ngoại cảnh, Studio, Retouch',
    duration: '2 - 3 giờ',
    deliverables: 'Toàn bộ file gốc + 20 ảnh chỉnh sửa',
    order: 1
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoryApi.getAll();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách thể loại chụp.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      title: '',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      price: 'Từ 1.500.000đ',
      badge: 'Nổi bật',
      tags: 'Ngoại cảnh, Retouch, Film Tone',
      duration: '2 - 3 giờ',
      deliverables: 'Toàn bộ file gốc + 20 ảnh chỉnh sửa',
      order: categories.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      title: cat.title || '',
      subtitle: cat.subtitle || '',
      image: cat.image || '',
      price: cat.price || '',
      badge: cat.badge || '',
      tags: Array.isArray(cat.tags) ? cat.tags.join(', ') : (cat.tags || ''),
      duration: cat.duration || '',
      deliverables: cat.deliverables || '',
      order: cat.order || 1
    });
    setIsModalOpen(true);
  };

  // In-App Confirm Dialog States
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, title }
  const [resetConfirm, setResetConfirm] = useState(false);

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id, title } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      setLoading(true);
      await categoryApi.delete(id);
      setNotice({ type: 'success', message: `Đã xóa thể loại "${title}" thành công!` });
      await fetchCategories();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể xóa thể loại chụp.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async () => {
    setResetConfirm(false);
    try {
      setLoading(true);
      const res = await categoryApi.resetDefaults();
      setCategories(res.data || []);
      setNotice({ type: 'success', message: 'Đã khôi phục 6 thể loại chụp ảnh mặc định thành công!' });
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể khôi phục danh sách mặc định.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và link hình ảnh đại diện.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory._id || editingCategory.id, formData);
        setNotice({ type: 'success', message: `Đã cập nhật thể loại "${formData.title}" thành công!` });
      } else {
        await categoryApi.create(formData);
        setNotice({ type: 'success', message: `Đã thêm thể loại chụp mới "${formData.title}"!` });
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể lưu thông tin thể loại chụp.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#141720] border border-[#242938] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quản Lý Giao Diện & Thể Loai CMS</span>
          </div>
          <h2 className="text-2xl font-black text-white">Quản Lý Thể Loại Chụp Ảnh Nổi Bật</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
            Chỉnh sửa nội dung, hình ảnh banner, giá hiển thị và các nhãn trên khối "Các Thể Loại Chụp Ảnh Nổi Bật" ngoài trang chủ.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={fetchCategories}
            className="p-3 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-400 hover:text-white rounded-2xl transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => setResetConfirm(true)}
            className="px-4 py-3 bg-[#0c0d12] hover:bg-[#1a202c] border border-amber-500/30 text-amber-400 font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 transition-all hover:border-amber-400"
            title="Khôi phục 6 thể loại chụp ảnh mặc định ban đầu"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm Thể Loại Mới</span>
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm animate-fade-in ${
          notice.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {loading && categories.length === 0 ? (
        <div className="text-center py-20 bg-[#141720] border border-[#242938] rounded-3xl space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-gray-400">Đang tải các thể loại chụp ảnh...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-[#141720] border border-[#242938] rounded-3xl space-y-4">
          <Layers className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Chưa có thể loại chụp nào trong danh sách</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Bạn có thể khôi phục ngay 6 mẫu thể loại chụp ban đầu hoặc tự tạo mới theo ý muốn.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={handleResetDefaults}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Khôi Phục 6 Thể Loại Mẫu</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Tự Tạo Thể Loại Mới</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={cat._id || cat.id || idx}
              className="bg-[#141720] border border-[#242938] hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Card Image Header */}
              <div className="relative h-48 overflow-hidden bg-black/40">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141720] via-transparent to-black/30" />

                {/* Badge Top Left */}
                {cat.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-amber-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow-md">
                    {cat.badge}
                  </span>
                )}

                {/* Order Top Right */}
                <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-gray-300 text-[11px] font-mono rounded-lg border border-white/10">
                  Vị trí #{cat.order || idx + 1}
                </span>

                {/* Title on Image */}
                <div className="absolute bottom-3 left-4 right-4 space-y-0.5">
                  <h3 className="font-extrabold text-white text-lg group-hover:text-amber-400 transition-colors drop-shadow-md">
                    {cat.title}
                  </h3>
                  {cat.subtitle && (
                    <p className="text-xs text-gray-300 truncate opacity-90">
                      {cat.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Meta Specs */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#0c0d12] rounded-2xl border border-[#242938] text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Mức giá từ</span>
                      <span className="font-extrabold text-amber-400 text-xs">{cat.price}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Thời lượng</span>
                      <span className="font-semibold text-white text-xs">{cat.duration}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {cat.tags && cat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(cat.tags) ? cat.tags : cat.tags.split(',')).map((tag, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-[#0c0d12] border border-[#242938] text-gray-300 text-[10px] rounded-lg">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Deliverables */}
                  {cat.deliverables && (
                    <div className="text-[11px] text-gray-400 flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{cat.deliverables}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 border-t border-[#242938] flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="flex-1 py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh Sửa</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirm({ id: cat._id || cat.id, title: cat.title })}
                    className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                    title="Xóa thể loại này"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL THÊM / SỬA THỂ LOẠI CHỤP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#141720] border border-[#2b3245] rounded-3xl shadow-2xl text-[#f8fafc] overflow-hidden my-auto">
            {/* Header */}
            <div className="p-6 border-b border-[#242938] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingCategory ? 'Chỉnh Sửa Thể Loại Chụp' : 'Thêm Thể Loại Chụp Mới'}
                </h3>
                <p className="text-xs text-gray-400">
                  Nội dung sẽ hiển thị ngay tại khối "Các Thể Loại Chụp Ảnh Nổi Bật" ngoài trang chủ
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body Scrollable */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Thể Loại Chụp *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Chụp Ảnh Pre-Wedding Hàn Quốc"
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mô Tả Ngắn / Phụ Đề</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="VD: Ghi lại câu chuyện tình yêu lãng mạn..."
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Link Hình Ảnh Banner (Unsplash / URL) *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
                {formData.image && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-[#242938]">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Mức Giá Hiển Thị</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="VD: Từ 1.800.000đ"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nhãn Badge Mới/Hot</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="VD: Phổ biến nhất, HOT"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Thời Lượng Buổi Chụp</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="VD: 2 - 3 giờ"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Vị Trí Sắp Xếp (Thứ tự)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Thẻ Tags (Cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Ngoại cảnh, Studio, Film Tone"
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Sản Phẩm Bàn Giao</label>
                <input
                  type="text"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  placeholder="Toàn bộ file gốc + 20 ảnh retouch"
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu Thay Đổi CMS</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA (IN-APP REACT MODAL) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141720] border border-[#2b3245] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-red-500/15 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Xác Nhận Xóa Thể Loại Chụp?</h3>
              <p className="text-xs text-gray-300">
                Bạn có chắc chắn muốn xóa thể loại <strong className="text-amber-400">"{deleteConfirm.title}"</strong> khỏi trang chủ không?
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-300 font-bold rounded-xl text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-500/20 transition-colors"
              >
                Xóa Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN KHÔI PHỤC MẶC ĐỊNH (IN-APP REACT MODAL) */}
      {resetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141720] border border-[#2b3245] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Khôi Phục 6 Thể Loại Mẫu?</h3>
              <p className="text-xs text-gray-300">
                Hệ thống sẽ tái tạo 6 mẫu thể loại chụp ảnh chuẩn ban đầu ngoài trang chủ.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setResetConfirm(false)}
                className="flex-1 py-2.5 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-300 font-bold rounded-xl text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-colors"
              >
                Khôi Phục Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesManagement;
