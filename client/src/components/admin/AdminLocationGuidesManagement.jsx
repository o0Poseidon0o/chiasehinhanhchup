import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Clock, 
  Tag, 
  Sparkles,
  Compass,
  Play,
  Video
} from 'lucide-react';
import { locationGuideApi } from '../../api/locationGuideApi';

const REGION_OPTIONS = [
  { value: 'north', label: 'Miền Bắc' },
  { value: 'central', label: 'Miền Trung' },
  { value: 'highlands', label: 'Tây Nguyên' },
  { value: 'south', label: 'Miền Nam' }
];

export const AdminLocationGuidesManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: 'north',
    regionName: 'Miền Bắc',
    image: '',
    description: '',
    bestTime: '',
    ticketPrice: 'Miễn phí',
    suitableConcepts: '',
    tips: '',
    videoUrl: '',
    isFeatured: false,
    order: 1
  });

  // Khóa cuộn trang khi mở modal và hỗ trợ phím Escape để đóng
  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await locationGuideApi.getAll();
      setLocations(res.data || []);
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Không thể tải danh sách địa điểm.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingLoc(null);
    setFormData({
      name: '',
      city: '',
      region: 'north',
      regionName: 'Miền Bắc',
      image: '',
      description: '',
      bestTime: '',
      ticketPrice: 'Miễn phí',
      suitableConcepts: '',
      tips: '',
      videoUrl: '',
      isFeatured: false,
      order: locations.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setFormData({
      name: loc.name || '',
      city: loc.city || '',
      region: loc.region || 'north',
      regionName: loc.regionName || 'Miền Bắc',
      image: loc.image || '',
      description: loc.description || '',
      bestTime: loc.bestTime || '',
      ticketPrice: loc.ticketPrice || 'Miễn phí',
      suitableConcepts: Array.isArray(loc.suitableConcepts) ? loc.suitableConcepts.join(', ') : (loc.suitableConcepts || ''),
      tips: loc.tips || '',
      videoUrl: loc.videoUrl || '',
      isFeatured: Boolean(loc.isFeatured),
      order: Number(loc.order) || 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim() || !formData.image.trim()) {
      setNotice({ type: 'error', text: 'Vui lòng điền đủ Tên địa điểm, Tỉnh/Thành và Link ảnh đại diện.' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        suitableConcepts: formData.suitableConcepts
          ? formData.suitableConcepts.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      if (editingLoc) {
        await locationGuideApi.update(editingLoc._id || editingLoc.id, payload);
        setNotice({ type: 'success', text: `Đã cập nhật địa điểm "${formData.name}" thành công!` });
      } else {
        await locationGuideApi.create(payload);
        setNotice({ type: 'success', text: `Đã thêm mới địa điểm "${formData.name}" thành công!` });
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Lỗi khi lưu thông tin địa điểm.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (loc) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa địa điểm "${loc.name}"?`)) return;
    try {
      await locationGuideApi.delete(loc._id || loc.id);
      setNotice({ type: 'success', text: `Đã xóa địa điểm "${loc.name}".` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Không thể xóa địa điểm này.' });
    }
  };

  const handleToggleFeatured = async (loc) => {
    try {
      const newStatus = !loc.isFeatured;
      await locationGuideApi.update(loc._id || loc.id, { isFeatured: newStatus });
      setNotice({ type: 'success', text: `Đã ${newStatus ? 'gắn cờ Hot' : 'bỏ cờ Hot'} cho "${loc.name}".` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Lỗi cập nhật trạng thái Hot.' });
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Khôi phục danh sách 8 địa điểm chụp ảnh mẫu mặc định từ Bắc chí Nam?')) return;
    try {
      setLoading(true);
      await locationGuideApi.resetDefaults();
      setNotice({ type: 'success', text: 'Đã khôi phục danh sách địa điểm mẫu thành công!' });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Không thể khôi phục địa điểm mẫu.' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = locations.filter((loc) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || (loc.name || '').toLowerCase().includes(q) || (loc.city || '').toLowerCase().includes(q);
    const matchesRegion = selectedRegion === 'all' || loc.region === selectedRegion;
    return matchesQuery && matchesRegion;
  });

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm animate-fadeIn ${
            notice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Bar: Search, Filter & Actions */}
      <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc thành phố..."
              className="w-full bg-[#1a1714] border border-[#2c2620] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Region Select */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-[#1a1714] border border-[#2c2620] rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả vùng miền</option>
            <option value="north">Miền Bắc</option>
            <option value="central">Miền Trung</option>
            <option value="highlands">Tây Nguyên</option>
            <option value="south">Miền Nam</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleResetDefaults}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1d1a17] hover:bg-[#26211c] border border-[#332b23] text-gray-300 text-xs font-semibold transition-colors disabled:opacity-50"
            title="Khôi phục danh sách địa điểm mẫu chuẩn"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Nạp Địa Điểm Mẫu</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Địa Điểm Mới</span>
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span>Đang tải danh sách địa điểm...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#141210] border border-[#24201b] rounded-2xl space-y-2">
          <Compass className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-sm font-semibold text-white">Không tìm thấy địa điểm nào</p>
          <p className="text-xs text-gray-400">Hãy thêm mới hoặc bấm "Nạp Địa Điểm Mẫu" để thiết lập dữ liệu ban đầu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((loc) => (
            <div
              key={loc._id || loc.id}
              className="bg-[#141210] border border-[#24201b] hover:border-amber-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
            >
              <div>
                {/* Image Header */}
                <div className="relative h-44 bg-gray-900 overflow-hidden">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-white font-semibold">
                      {loc.city}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/30 border border-amber-500/40 text-[10px] text-amber-300 font-bold">
                      {loc.regionName || loc.region}
                    </span>
                    {loc.videoUrl && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/30 border border-rose-500/40 text-[10px] text-rose-300 font-bold backdrop-blur-md">
                        <Play className="w-2.5 h-2.5 fill-rose-300" />
                        <span>Video Review</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFeatured(loc)}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                      loc.isFeatured
                        ? 'bg-amber-500 text-amber-950 font-bold shadow-md'
                        : 'bg-black/60 text-gray-400 hover:text-white'
                    }`}
                    title={loc.isFeatured ? 'Đang là Điểm Hot (Click để tắt)' : 'Gắn cờ Điểm Hot'}
                  >
                    <Star className={`w-3.5 h-3.5 ${loc.isFeatured ? 'fill-amber-950' : ''}`} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h4 className="text-base font-bold text-white line-clamp-1">{loc.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{loc.description}</p>

                  <div className="pt-2 space-y-1 text-[11px] text-gray-300 border-t border-white/5">
                    {loc.bestTime && (
                      <div className="flex items-center space-x-1.5 text-amber-300">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Giờ đẹp: {loc.bestTime}</span>
                      </div>
                    )}
                    {loc.ticketPrice && (
                      <div className="flex items-center space-x-1.5 text-emerald-400">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Vé: {loc.ticketPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 border-t border-[#24201b] bg-[#1a1714]/40 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-mono">Thứ tự: #{loc.order || 1}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(loc)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-amber-300 transition-colors"
                    title="Chỉnh sửa địa điểm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(loc)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Xóa địa điểm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa Địa Điểm */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="bg-[#141210] border border-[#2c2620] rounded-3xl w-full max-w-xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/5 transition-colors z-10"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingLoc ? 'Chỉnh Sửa Địa Điểm Chụp' : 'Thêm Địa Điểm Chụp Mới'}
                </h3>
                <p className="text-xs text-gray-400">Cập nhật cẩm nang địa điểm chụp ảnh toàn quốc</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">Tên địa điểm *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Hồ Gươm & 36 Phố Phường..."
                  className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ví dụ: Hà Nội, Đà Lạt, Ninh Bình..."
                    className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">Vùng miền *</label>
                  <select
                    value={formData.region}
                    onChange={(e) => {
                      const r = e.target.value;
                      const opt = REGION_OPTIONS.find(o => o.value === r);
                      setFormData({ ...formData, region: r, regionName: opt ? opt.label : 'Miền Bắc' });
                    }}
                    className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  >
                    {REGION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">Link ảnh đại diện (URL) *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">Mô tả vẻ đẹp / Cảm hứng</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả phong cảnh, bối cảnh check-in..."
                  className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">Thời điểm chụp đẹp nhất</label>
                  <input
                    type="text"
                    value={formData.bestTime}
                    onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                    placeholder="05:30 - 08:00 sáng..."
                    className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-300">Giá vé / Chi phí vào cổng</label>
                  <input
                    type="text"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    placeholder="Miễn phí, 50.000đ/vé..."
                    className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">
                  Concept chụp phù hợp (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.suitableConcepts}
                  onChange={(e) => setFormData({ ...formData, suitableConcepts: e.target.value })}
                  placeholder="Áo dài, Vintage, Street Style, Nàng thơ..."
                  className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">Mẹo trang phục & góc máy</label>
                <input
                  type="text"
                  value={formData.tips}
                  onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                  placeholder="Chọn trang phục màu trắng/be, chụp ngược sáng đón bình minh..."
                  className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-300">
                    Link Video Review / TikTok / YouTube (URL)
                  </label>
                  <span className="text-[11px] text-amber-400 font-medium">Hỗ trợ TikTok, YouTube & Shorts</span>
                </div>
                <div className="relative">
                  <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://www.tiktok.com/@.../video/..."
                    className="w-full bg-[#1a1714] border border-[#2c2620] focus:border-amber-500 rounded-xl pl-10 pr-3.5 py-2.5 text-white outline-none font-mono text-xs"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Gắn video clip thực tế để khách hàng xem góc quay, mẹo tạo dáng hoặc flycam trước khi đặt lịch chụp.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-[#1a1714] border-[#2c2620]"
                  />
                  <span className="text-xs font-bold text-amber-300">Đánh dấu là Điểm Hot (⭐ Featured)</span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Thứ tự:</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-16 bg-[#1a1714] border border-[#2c2620] rounded-lg px-2 py-1 text-xs text-center text-white"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#2c2620]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#2c2620] text-gray-300 hover:text-white hover:bg-white/5 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{editingLoc ? 'Lưu Thay Đổi' : 'Thêm Địa Điểm'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminLocationGuidesManagement;
