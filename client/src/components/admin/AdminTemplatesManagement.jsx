import React, { useState, useEffect } from 'react';
import {
  Layout,
  FolderPlus,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Type,
  Layers,
  Loader2,
  Search
} from 'lucide-react';
import {
  templateApi,
  FALLBACK_EDITORIAL_TEMPLATES
} from '../../api/templateApi';

export default function AdminTemplatesManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [driveCategory, setDriveCategory] = useState('Drive Overlay');
  const [importingDrive, setImportingDrive] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadAllTemplates = async () => {
    setLoading(true);
    try {
      const res = await templateApi.getAll({ includePrivate: 'true' });
      const list = res?.data || res?.templates || [];
      if (list.length) {
        setTemplates(list);
      } else {
        setTemplates(FALLBACK_EDITORIAL_TEMPLATES);
      }
    } catch {
      setTemplates(FALLBACK_EDITORIAL_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTemplates();
  }, []);

  const handleImportDrive = async (e) => {
    e.preventDefault();
    if (!driveFolderUrl.trim()) return;
    setImportingDrive(true);
    try {
      const res = await templateApi.importDrive({
        folderUrl: driveFolderUrl.trim(),
        category: driveCategory,
        authorName: 'Master Admin (Google Drive)',
        isPublic: true
      });
      showToast(res.message || `Đã đồng bộ ${res.importedCount || res.data?.length || 0} mẫu từ Google Drive!`);
      setDriveFolderUrl('');
      await loadAllTemplates();
    } catch (err) {
      showToast(err.message || 'Không thể quét thư mục Google Drive. Hãy kiểm tra quyền chia sẻ Công khai!', 'error');
    } finally {
      setImportingDrive(false);
    }
  };

  const handleTogglePublic = async (tpl) => {
    const id = tpl._id || tpl.id;
    const displayName = tpl.title || tpl.name || 'Template';
    try {
      const res = await templateApi.update(id, { isPublic: !tpl.isPublic });
      const updated = res?.data || res || { ...tpl, isPublic: !tpl.isPublic };
      setTemplates(prev => prev.map(item => ((item._id || item.id) === id ? updated : item)));
      showToast(`Đã chuyển mẫu "${displayName}" sang ${!tpl.isPublic ? 'Công khai' : 'Ẩn'}`);
    } catch {
      showToast('Không thể cập nhật trạng thái mẫu', 'error');
    }
  };

  const handleDelete = async (tpl) => {
    const id = tpl._id || tpl.id;
    const displayName = tpl.title || tpl.name || 'Template';
    if (!window.confirm(`Bạn có chắc muốn xóa mẫu "${displayName}" khỏi hệ thống?`)) return;
    try {
      await templateApi.delete(id);
      setTemplates(prev => prev.filter(item => (item._id || item.id) !== id));
      showToast(`Đã xóa mẫu "${displayName}"`);
    } catch {
      showToast('Lỗi khi xóa mẫu template', 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Khôi phục lại 6 mẫu Editorial gốc (TAM LE MEDIA Present & Magazine)? Các mẫu do nhiếp ảnh gia tự tạo vẫn được giữ nguyên.')) return;
    setResetting(true);
    try {
      const res = await templateApi.resetDefaults();
      const list = res?.data || res?.templates;
      if (list) setTemplates(list);
      showToast(res.message || 'Đã khôi phục bộ mẫu Editorial gốc!');
    } catch {
      showToast('Lỗi khi khôi phục mẫu mặc định', 'error');
    } finally {
      setResetting(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(templates.map(t => t.category || 'Editorial')))];

  const filteredTemplates = templates.filter(t => {
    const matchCat = categoryFilter === 'ALL' || (t.category || 'Editorial') === categoryFilter;
    const titleStr = (t.title || t.name || '').toLowerCase();
    const descStr = (t.subtitle || t.description || '').toLowerCase();
    const authorStr = (t.authorName || '').toLowerCase();
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = !q || titleStr.includes(q) || descStr.includes(q) || authorStr.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-sm font-bold animate-bounce ${
            toastMsg.type === 'error'
              ? 'bg-red-950/95 border-red-500/40 text-red-200'
              : 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg.msg}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            SIÊU NHẸ • LƯU JSON & LINK GOOGLE DRIVE OVERLAY
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Layout className="w-6 h-6 text-amber-400" />
            Quản Lý Kho Storyboard & Google Drive Template
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mỗi mẫu chỉ tốn ~1KB JSON. Ảnh khung PNG trong suốt được stream trực tiếp từ Google Drive giúp server luôn nhẹ và nhanh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-lg font-black text-white">{templates.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Tổng Mẫu</div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-lg font-black text-emerald-400">
              {templates.filter(t => t.isPublic !== false).length}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Đang Công Khai</div>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={resetting}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 text-amber-400" />}
            Khôi Phục 6 Mẫu Gốc
          </button>
        </div>
      </div>

      {/* Google Drive Folder Sync Card */}
      <form
        onSubmit={handleImportDrive}
        className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <FolderPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Đồng Bộ Thư Mục Khung Template PNG Từ Google Drive
            </h3>
          </div>
          <span className="text-[11px] text-amber-300/90 font-medium">
            * Tự động quét mọi file PNG/WebP trong folder Drive và biến thành mẫu khung cho toàn bộ Studio
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={driveFolderUrl}
              onChange={(e) => setDriveFolderUrl(e.target.value)}
              placeholder="Dán link thư mục Google Drive (VD: https://drive.google.com/drive/folders/1a2b3c...)"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              value={driveCategory}
              onChange={(e) => setDriveCategory(e.target.value)}
              placeholder="Danh mục (VD: Drive Overlay, Magazine...)"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={importingDrive || !driveFolderUrl.trim()}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {importingDrive ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang Quét Drive...
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                Quét & Nhập Kho Mẫu
              </>
            )}
          </button>
        </div>
      </form>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'Tất Cả Danh Mục' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên mẫu, tác giả..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-sm">Đang tải kho Storyboard & Template...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTemplates.map(tpl => {
            const id = tpl._id || tpl.id;
            const displayName = tpl.title || tpl.name || 'Mẫu Storyboard';
            const displayDesc = tpl.subtitle || tpl.description || 'Mẫu thiết kế Storyboard & Profile Nhiếp ảnh gia.';
            const slots = (tpl.photoSlots || tpl.slots || []).filter(s => !s.isBackground);
            const texts = tpl.textLayers || [];
            const cards = tpl.decorCards || (tpl.cardFrame?.enabled ? [tpl.cardFrame] : []);

            return (
              <div
                key={id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 flex flex-col justify-between gap-4 transition group"
              >
                <div className="flex gap-4">
                  {/* Mini Blueprint Thumbnail */}
                  <div
                    className="w-24 h-32 rounded-2xl shrink-0 relative overflow-hidden border border-slate-700/80 shadow-inner"
                    style={{
                      backgroundColor:
                        tpl.background?.type === 'solid' || tpl.background?.mode === 'solid'
                          ? tpl.background?.color || '#f8f5f0'
                          : '#1e293b'
                    }}
                  >
                    {(tpl.background?.grayscale || tpl.background?.mode === 'photo-bw') && (
                      <div className="absolute inset-0 bg-gradient-to-b from-zinc-500 via-zinc-700 to-zinc-900 opacity-75" />
                    )}
                    {cards.map((c, cIdx) => (
                      <div
                        key={c.id || cIdx}
                        className="absolute shadow-sm"
                        style={{
                          left: `${c.x}%`,
                          top: `${c.y}%`,
                          width: `${c.w}%`,
                          height: `${c.h}%`,
                          backgroundColor: c.bgColor || c.color || '#fbf9f5'
                        }}
                      />
                    ))}
                    {slots.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="absolute bg-amber-500/30 border border-amber-400/70 flex items-center justify-center text-[8px] font-black text-amber-200"
                        style={{
                          left: `${s.x}%`,
                          top: `${s.y}%`,
                          width: `${s.w}%`,
                          height: `${s.h}%`
                        }}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {tpl.category || 'Editorial'}
                      </span>
                      {tpl.isSystem && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          Mặc định
                        </span>
                      )}
                      {tpl.driveFileId && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Drive PNG
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white truncate" title={displayName}>
                      {displayName}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {displayDesc}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        {(tpl.photoSlots || tpl.slots || []).length} ô ảnh
                      </span>
                      <span className="flex items-center gap-1">
                        <Type className="w-3.5 h-3.5 text-sky-400" />
                        {texts.length} lớp chữ
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        {tpl.aspectRatio || '3:4'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 truncate">
                    Tác giả: <span className="text-slate-300 font-semibold">{tpl.authorName || 'System'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tpl.driveOverlayUrl && (
                      <a
                        href={tpl.driveOverlayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Xem file PNG trên Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleTogglePublic(tpl)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        tpl.isPublic !== false
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {tpl.isPublic !== false ? (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Công khai
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Đang ẩn
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tpl)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition cursor-pointer"
                      title="Xóa mẫu này"
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
    </div>
  );
}
