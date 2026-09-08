import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Tag, 
  DollarSign, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  X,
  Scissors,
  Shirt,
  Zap,
  BookOpen,
  Camera,
  Crown,
  Gift,
  Heart,
  Palette,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { addonApi } from '../../api/addonApi';

// Danh sách các Icon khả dụng để người dùng chọn
const AVAILABLE_ICONS = [
  { id: 'Scissors', label: 'Làm tóc / Makeup', icon: Scissors },
  { id: 'Shirt', label: 'Trang phục / Áo dài', icon: Shirt },
  { id: 'Zap', label: 'Nhanh 24h / Tốc độ', icon: Zap },
  { id: 'BookOpen', label: 'In ấn / Photobook', icon: BookOpen },
  { id: 'Sparkles', label: 'Hiệu ứng / Retouch', icon: Sparkles },
  { id: 'Camera', label: 'Thợ phụ / Flycam', icon: Camera },
  { id: 'Crown', label: 'VIP / Cao cấp', icon: Crown },
  { id: 'Gift', label: 'Quà tặng / Combo', icon: Gift },
  { id: 'Palette', label: 'Màu film / Nghệ thuật', icon: Palette },
  { id: 'Heart', label: 'Cưới / Cặp đôi', icon: Heart }
];

export const AdminAddonsManagement = () => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null); // null = tạo mới
  const [formData, setFormData] = useState({
    name: '',
    price: 350000,
    unit: 'lần',
    description: '',
    icon: 'Scissors',
    badge: '🔥 Phổ biến',
    isActive: true,
    isRecommended: false,
    order: 1
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal Xóa
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    addon: null,
    loading: false
  });

  const showToast = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchAddons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await addonApi.getAll();
      setAddons(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách dịch vụ đi kèm.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);

  const handleOpenCreateModal = () => {
    setEditingAddon(null);
    setFormData({
      name: '',
      price: 250000,
      unit: 'lần',
      description: '',
      icon: 'Sparkles',
      badge: '🔥 Phổ biến',
      isActive: true,
      isRecommended: false,
      order: addons.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name || '',
      price: addon.price || 0,
      unit: addon.unit || 'gói',
      description: addon.description || '',
      icon: addon.icon || 'Sparkles',
      badge: addon.badge || '',
      isActive: addon.isActive !== undefined ? addon.isActive : true,
      isRecommended: Boolean(addon.isRecommended),
      order: addon.order || 1
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (addon) => {
    try {
      const res = await addonApi.toggleActive(addon._id || addon.id);
      showToast('success', res.message || 'Đã cập nhật trạng thái dịch vụ.');
      setAddons(prev => prev.map(a => 
        (a._id === addon._id || a.id === addon.id) ? { ...a, isActive: !a.isActive } : a
      ));
    } catch (err) {
      showToast('error', err.message || 'Lỗi khi thay đổi trạng thái dịch vụ.');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên dịch vụ đi kèm.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        order: Number(formData.order) || 1
      };

      if (editingAddon) {
        await addonApi.update(editingAddon._id || editingAddon.id, payload);
        showToast('success', 'Cập nhật dịch vụ đi kèm thành công!');
      } else {
        await addonApi.create(payload);
        showToast('success', 'Thêm dịch vụ đi kèm mới thành công!');
      }

      setIsModalOpen(false);
      await fetchAddons();
    } catch (err) {
      showToast('error', err.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.addon) return;
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      await addonApi.delete(deleteModal.addon._id || deleteModal.addon.id);
      showToast('success', 'Đã xóa dịch vụ đi kèm thành công!');
      setDeleteModal({ isOpen: false, addon: null, loading: false });
      await fetchAddons();
    } catch (err) {
      showToast('error', err.message || 'Không thể xóa dịch vụ này.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục 4 dịch vụ đi kèm mặc định ban đầu? (Các thay đổi hiện tại sẽ được làm mới)')) {
      return;
    }

    try {
      setLoading(true);
      await addonApi.resetDefaults();
      showToast('success', 'Đã khôi phục các dịch vụ đi kèm mặc định thành công!');
      await fetchAddons();
    } catch (err) {
      showToast('error', err.message || 'Lỗi khi khôi phục dữ liệu mặc định.');
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconName, className = "w-5 h-5") => {
    const item = AVAILABLE_ICONS.find(i => i.id === iconName);
    const Comp = item ? item.icon : Sparkles;
    return <Comp className={className} />;
  };

  // Tính toán số liệu thống kê
  const totalCount = addons.length;
  const activeCount = addons.filter(a => a.isActive).length;
  const avgPrice = totalCount > 0 
    ? Math.round(addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0) / totalCount)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notice */}
      {notice && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-xl animate-slideDown border ${
          notice.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#14120f] border border-[#2b2722] rounded-2xl p-4 space-y-1">
          <span className="text-xs text-[#a2998a] block">Tổng số dịch vụ</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-gold-100">{totalCount}</span>
            <span className="text-xs text-gray-500">mục cấu hình</span>
          </div>
        </div>

        <div className="bg-[#14120f] border border-[#2b2722] rounded-2xl p-4 space-y-1">
          <span className="text-xs text-[#a2998a] block">Đang mở bán trên web</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
            <span className="text-xs text-emerald-500/70 font-semibold">Khách có thể chọn</span>
          </div>
        </div>

        <div className="bg-[#14120f] border border-[#2b2722] rounded-2xl p-4 space-y-1">
          <span className="text-xs text-[#a2998a] block">Đang tạm ẩn</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400">{totalCount - activeCount}</span>
            <span className="text-xs text-gray-500">tạm ngưng</span>
          </div>
        </div>

        <div className="bg-[#14120f] border border-[#2b2722] rounded-2xl p-4 space-y-1">
          <span className="text-xs text-[#a2998a] block">Giá add-on trung bình</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-gold-400">{avgPrice.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#171411] border border-[#2b2722] rounded-2xl p-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Danh Sách Dịch Vụ Đi Kèm & Bảng Giá</span>
            <span className="px-2 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-semibold">
              Live Booking Add-ons
            </span>
          </h3>
          <p className="text-xs text-[#a2998a] mt-0.5">
            Dịch vụ đang mở bán sẽ tự động xuất hiện tại Bước 3 của trang Đặt Lịch Chụp và được tính vào Tạm tính giá.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={handleResetDefaults}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#1d1a17] hover:bg-[#282420] border border-[#3a352e] hover:border-gold-500/40 text-[#c2b8a7] hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
            title="Khôi phục lại 4 dịch vụ đi kèm mặc định ban đầu"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gold-400" />
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 text-xs font-bold shadow-lg shadow-gold-500/10 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Dịch Vụ Mới</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto" />
          <p className="text-sm text-[#a2998a]">Đang tải bảng giá dịch vụ...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-950/30 border border-rose-500/40 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200">{error}</p>
          <button
            onClick={fetchAddons}
            className="px-4 py-2 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-white rounded-xl text-xs font-bold"
          >
            Thử lại
          </button>
        </div>
      ) : addons.length === 0 ? (
        <div className="py-16 text-center bg-[#14120f] border border-[#2b2722] rounded-2xl space-y-3">
          <Sparkles className="w-10 h-10 text-gold-400/50 mx-auto" />
          <p className="text-sm font-semibold text-white">Chưa có dịch vụ bổ sung nào</p>
          <p className="text-xs text-[#a2998a] max-w-md mx-auto">
            Bấm nút &quot;Khôi Phục Mặc Định&quot; hoặc &quot;Thêm Dịch Vụ Mới&quot; để tạo các gói Makeup, Thuê Trang Phục, In ấn...
          </p>
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 bg-gold-500 text-gold-950 font-bold rounded-xl text-xs"
          >
            Khôi phục mặc định ngay
          </button>
        </div>
      ) : (
        /* Addons Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addons.map((addon) => {
            const isCurrentlyActive = addon.isActive !== false;
            return (
              <div
                key={addon._id || addon.id}
                className={`p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'bg-[#14120f] border-[#2e2a24] hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/5'
                    : 'bg-[#0f0e0c] border-[#221f1c] opacity-65'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${
                        isCurrentlyActive
                          ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                          : 'bg-gray-800/40 border-gray-700/30 text-gray-500'
                      }`}>
                        {renderIcon(addon.icon, "w-5 h-5")}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm sm:text-base leading-snug">
                            {addon.name}
                          </h4>
                          {addon.isRecommended && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                              Khuyên dùng
                            </span>
                          )}
                        </div>

                        {addon.badge && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-gold-500/10 border border-gold-500/20 text-gold-300 text-[10px] font-semibold">
                            {addon.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active/Inactive Toggle Switch */}
                    <button
                      onClick={() => handleToggleActive(addon)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                        isCurrentlyActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-gray-800/40 border-gray-700/50 text-gray-400 hover:bg-gray-700/40'
                      }`}
                      title={isCurrentlyActive ? 'Bấm để tạm ẩn dịch vụ này' : 'Bấm để mở bán lại dịch vụ này'}
                    >
                      {isCurrentlyActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mở bán</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                          <span>Tạm ẩn</span>
                        </>
                      )}
                    </button>
                  </div>

                  {addon.description && (
                    <p className="text-xs text-[#a2998a] line-clamp-2 mb-4 leading-relaxed">
                      {addon.description}
                    </p>
                  )}
                </div>

                {/* Price and Actions footer */}
                <div className="pt-3 border-t border-[#221f1c] flex items-center justify-between mt-auto">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-lg font-black text-gold-400">
                      {(Number(addon.price) || 0).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs text-[#827a6f]">
                      / {addon.unit || 'lần'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(addon)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1e1b17] hover:bg-[#2a2621] border border-[#38332c] hover:border-gold-500/40 text-gold-300 text-xs font-semibold transition-colors"
                      title="Sửa thông tin hoặc điều chỉnh giá"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa Giá</span>
                    </button>

                    <button
                      onClick={() => setDeleteModal({ isOpen: true, addon, loading: false })}
                      className="p-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 text-xs transition-colors"
                      title="Xóa dịch vụ này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL THÊM / SỬA DỊCH VỤ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171411] border border-[#38332c] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#2b2722] pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingAddon ? 'Điều Chỉnh Giá & Dịch Vụ Đi Kèm' : 'Thêm Dịch Vụ Đi Kèm Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Tên dịch vụ */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Tên Dịch Vụ Bổ Sung *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Makeup & Làm Tóc Chuyên Nghiệp"
                  className="w-full bg-[#0e0d0b] border border-[#332e27] focus:border-gold-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              {/* Giá và Đơn vị tính */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Giá Tiền (VNĐ) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step="10000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                      className="w-full bg-[#0e0d0b] border border-[#332e27] focus:border-gold-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gold-300 font-bold outline-none"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-gray-500 pointer-events-none">
                      {(Number(formData.price) || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Đơn Vị Tính
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-[#0e0d0b] border border-[#332e27] focus:border-gold-500 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="lần">lần chụp</option>
                    <option value="gói">gói</option>
                    <option value="bộ">bộ trang phục</option>
                    <option value="cuốn">cuốn photobook</option>
                    <option value="ảnh">ảnh</option>
                    <option value="người">người</option>
                    <option value="giờ">giờ</option>
                  </select>
                </div>
              </div>

              {/* Chọn Biểu tượng (Icon Picker) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Biểu Tượng Đại Diện (Icon)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((ic) => {
                    const IconC = ic.icon;
                    const isPicked = formData.icon === ic.id;
                    return (
                      <button
                        type="button"
                        key={ic.id}
                        onClick={() => setFormData({ ...formData, icon: ic.id })}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                          isPicked
                            ? 'bg-gold-500/20 border-gold-500 text-gold-300 ring-2 ring-gold-500/30'
                            : 'bg-[#0e0d0b] border-[#2e2a24] text-gray-400 hover:text-white hover:border-[#443e35]'
                        }`}
                        title={ic.label}
                      >
                        <IconC className="w-4 h-4" />
                        <span className="text-[9px] truncate max-w-full">{ic.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Huy hiệu Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Huy Hiệu (Badge Nhãn)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="VD: 🔥 Phổ biến, ✨ Khuyên dùng, ⚡ 24h"
                    className="w-full bg-[#0e0d0b] border border-[#332e27] focus:border-gold-500 rounded-xl px-4 py-2 text-xs sm:text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Thứ Tự Hiển Thị (Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 1 })}
                    className="w-full bg-[#0e0d0b] border border-[#332e27] focus:border-gold-500 rounded-xl px-4 py-2 text-xs sm:text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Mô tả ngắn */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Mô Tả Ngắn Dịch Vụ
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả lợi ích, chất lượng để khách hàng yên tâm lựa chọn..."
                  className="w-full bg-[#0e0d0b] border border-[#332e27] focus:border-gold-500 rounded-xl px-4 py-2 text-xs sm:text-sm text-white outline-none resize-none"
                />
              </div>

              {/* Options Checkboxes */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-300 font-semibold">Mở bán ngay cho khách hàng</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecommended}
                    onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs text-amber-300 font-semibold">Gợi ý khuyên dùng (Recommended)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#2b2722] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1d1a17] hover:bg-[#282420] border border-[#3a352e] text-[#a2998a] hover:text-white text-xs font-semibold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 text-xs font-bold shadow-lg shadow-gold-500/20 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAddon ? 'Lưu Thay Đổi' : 'Tạo Dịch Vụ Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171411] border border-rose-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xác Nhận Xóa Dịch Vụ?</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Bạn có chắc muốn xóa dịch vụ <strong className="text-white">&quot;{deleteModal.addon?.name}&quot;</strong> khỏi hệ thống?
                <br />(Nếu chỉ muốn tạm ngừng nhận đơn, bạn nên dùng nút Tắt Mở Bán).
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, addon: null, loading: false })}
                className="flex-1 py-2.5 rounded-xl bg-[#1d1a17] hover:bg-[#282420] border border-[#3a352e] text-gray-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteModal.loading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-1.5"
              >
                {deleteModal.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
