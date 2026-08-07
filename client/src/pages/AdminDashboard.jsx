import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Settings, 
  RefreshCw, 
  Plus, 
  Image as ImageIcon, 
  User, 
  Phone, 
  AlertTriangle,
  FileText,
  Filter
} from 'lucide-react';
import { albumApi } from '../api/albumApi';

export const AdminDashboard = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [copiedLink, setCopiedLink] = useState(null);

  // State cho Modal xác nhận xóa
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    album: null,
    isBulk: false,
    loading: false
  });

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await albumApi.getAll();
      setAlbums(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách album.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Sao chép link vào clipboard
  const handleCopy = (text, type, id) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(`${type}-${id}`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Mở Modal xóa 1 album
  const openDeleteSingle = (album) => {
    setDeleteModal({
      isOpen: true,
      album,
      isBulk: false,
      loading: false
    });
  };

  // Mở Modal xóa nhiều album
  const openDeleteBulk = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      album: null,
      isBulk: true,
      loading: false
    });
  };

  // Thực hiện xóa
  const handleConfirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      if (deleteModal.isBulk) {
        await albumApi.deleteBulk(selectedIds);
        setAlbums(prev => prev.filter(a => !selectedIds.includes(a._id)));
        setSelectedIds([]);
      } else if (deleteModal.album) {
        await albumApi.deleteAlbum(deleteModal.album._id, deleteModal.album.manageToken);
        setAlbums(prev => prev.filter(a => a._id !== deleteModal.album._id));
      }
      setDeleteModal({ isOpen: false, album: null, isBulk: false, loading: false });
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa album.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Checkbox chọn album
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = (filteredList) => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(a => a._id));
    }
  };

  // Bộ lọc dữ liệu
  const filteredAlbums = albums.filter(album => {
    // Lọc theo search
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = (album.title || '').toLowerCase().includes(q);
    const clientNameMatch = (album.clientInfo?.name || '').toLowerCase().includes(q);
    const clientPhoneMatch = (album.clientInfo?.phone || '').toLowerCase().includes(q);
    const matchesSearch = !q || titleMatch || clientNameMatch || clientPhoneMatch;

    // Lọc theo trạng thái
    const matchesStatus = statusFilter === 'all' || album.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Thống kê nhanh
  const stats = {
    total: albums.length,
    selecting: albums.filter(a => a.status === 'selecting').length,
    submitted: albums.filter(a => a.status === 'submitted').length,
    totalSelectedPhotos: albums.reduce((acc, a) => acc + (a.selectedCount || 0), 0)
  };

  const getStatusBadge = (status, selectedCount) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã chốt ({selectedCount} ảnh)
          </span>
        );
      case 'locked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="w-3.5 h-3.5" />
            Đã khóa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Đang chọn ảnh
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#141210] p-6 sm:p-8 rounded-3xl border border-[#26221d] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-gold-500/10 border border-gold-500/20 rounded-2xl text-gold-400">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-100 tracking-tight">
              Quản Lý Album & Dọn Dẹp
            </h1>
          </div>
          <p className="text-sm text-[#a2998a] max-w-xl">
            Xem toàn bộ link album khách hàng, theo dõi trạng thái chọn ảnh và chủ động xóa các album cũ để giải phóng bộ nhớ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlbums}
            disabled={loading}
            className="p-3 rounded-2xl bg-[#1d1a17] hover:bg-[#282420] border border-[#2f2923] text-[#cfc5b4] transition-all hover:text-gold-300 disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          </button>
          <Link
            to="/"
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-gold-950 font-bold text-sm shadow-lg shadow-gold-500/10 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo Album Mới</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141210] p-5 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Tổng Album</span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-extrabold text-gold-100">{stats.total}</span>
            <FolderKanban className="w-5 h-5 text-gold-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-5 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Đang Chọn Ảnh</span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-extrabold text-gold-400">{stats.selecting}</span>
            <Clock className="w-5 h-5 text-gold-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-5 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Đã Gửi Chốt</span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-extrabold text-emerald-400">{stats.submitted}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400/50" />
          </div>
        </div>

        <div className="bg-[#141210] p-5 rounded-2xl border border-[#24201b] flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#8e8474] uppercase tracking-wider">Ảnh Khách Đã Chọn</span>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-3xl font-extrabold text-gold-200">{stats.totalSelectedPhotos}</span>
            <ImageIcon className="w-5 h-5 text-gold-400/50" />
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-[#141210] p-4 rounded-2xl border border-[#24201b] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8474]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên album, tên khách, SĐT..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f0e0c] border border-[#2a251f] rounded-xl text-sm text-[#f5eedf] placeholder-[#6b6255] focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#8e8474] mr-1 hidden sm:block" />
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'selecting', label: 'Đang chọn' },
            { key: 'submitted', label: 'Đã gửi chốt' },
            { key: 'locked', label: 'Đã khóa' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === f.key
                  ? 'bg-gold-500 text-gold-950 shadow-md shadow-gold-500/10'
                  : 'bg-[#1a1714] text-[#a2998a] hover:bg-[#26221d] hover:text-[#cfc5b4]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/40 px-5 py-3.5 rounded-2xl flex items-center justify-between animate-fadeIn">
          <span className="text-sm font-medium text-rose-200">
            Đã chọn <strong className="text-rose-100">{selectedIds.length}</strong> album
          </span>
          <button
            onClick={openDeleteBulk}
            className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-600/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa {selectedIds.length} Album Đã Chọn</span>
          </button>
        </div>
      )}

      {/* Album List */}
      {loading ? (
        <div className="text-center py-20 bg-[#141210] rounded-3xl border border-[#24201b]">
          <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8e8474]">Đang tải danh sách album...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-[#141210] rounded-3xl border border-rose-900/30 p-6">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <p className="text-sm text-rose-300 mb-4">{error}</p>
          <button
            onClick={fetchAlbums}
            className="px-4 py-2 bg-[#221f1c] hover:bg-[#2c2723] rounded-xl text-xs font-semibold text-gold-300"
          >
            Thử lại
          </button>
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="text-center py-20 bg-[#141210] rounded-3xl border border-[#24201b] p-8">
          <FolderKanban className="w-12 h-12 text-[#4f483d] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gold-200 mb-1">
            {searchQuery || statusFilter !== 'all' ? 'Không tìm thấy album phù hợp' : 'Chưa có album nào'}
          </h3>
          <p className="text-sm text-[#8e8474] max-w-md mx-auto mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc trạng thái.'
              : 'Hãy bắt đầu bằng cách tạo album chia sẻ ảnh đầu tiên từ link Google Drive.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gold-500 text-gold-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tạo Album Ngay</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header row with Select All */}
          <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-[#7e7464] uppercase tracking-wider">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredAlbums.length && filteredAlbums.length > 0}
                onChange={() => selectAllFiltered(filteredAlbums)}
                className="w-4 h-4 rounded border-[#3a332a] bg-[#141210] text-gold-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Chọn tất cả ({filteredAlbums.length} album)</span>
            </div>
            <span>Hành động</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-3">
            {filteredAlbums.map((album) => {
              const clientUrl = `${window.location.origin}/album/${album._id}`;
              const manageUrl = `${window.location.origin}/album/${album._id}/manage?token=${album.manageToken}`;
              const isSelected = selectedIds.includes(album._id);
              const formattedDate = album.createdAt 
                ? new Date(album.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Chưa rõ';

              return (
                <div
                  key={album._id}
                  className={`bg-[#141210] p-5 rounded-2xl border transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isSelected ? 'border-gold-500/50 bg-gold-500/[0.02]' : 'border-[#24201b] hover:border-[#3a332a]'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(album._id)}
                      className="w-4 h-4 mt-1 rounded border-[#3a332a] bg-[#0c0b0a] text-gold-500 focus:ring-0 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                    />

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-bold text-base text-gold-100 truncate max-w-md">
                          {album.title}
                        </h2>
                        {getStatusBadge(album.status, album.selectedCount)}
                        {album.hasPasscode && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#221f1c] text-[#a2998a] border border-[#332e29]">
                            PIN
                          </span>
                        )}
                      </div>

                      {/* Meta info bar */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#8e8474]">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-gold-400/70" />
                          <span>Tổng: <strong className="text-[#cfc5b4]">{album.imagesCount}</strong> ảnh</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />
                          <span>Đã chọn: <strong className="text-emerald-300">{album.selectedCount}</strong> ảnh</span>
                        </span>

                        <span>Ngày tạo: <strong className="text-[#cfc5b4]">{formattedDate}</strong></span>
                      </div>

                      {/* Customer info if submitted */}
                      {album.clientInfo?.name && (
                        <div className="bg-[#0e0d0b] p-2.5 rounded-xl border border-[#221f1c] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#cfc5b4]">
                          <span className="flex items-center gap-1.5 font-medium text-gold-300">
                            <User className="w-3.5 h-3.5" />
                            {album.clientInfo.name}
                          </span>
                          {album.clientInfo.phone && (
                            <a 
                              href={`tel:${album.clientInfo.phone}`}
                              className="flex items-center gap-1.5 text-[#a2998a] hover:text-gold-400 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {album.clientInfo.phone}
                            </a>
                          )}
                          {album.clientInfo.note && (
                            <span className="flex items-center gap-1.5 text-[#8e8474] italic truncate max-w-xs">
                              <FileText className="w-3.5 h-3.5" />
                              "{album.clientInfo.note}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#221f1c] justify-end">
                    {/* Copy Client Link */}
                    <button
                      onClick={() => handleCopy(clientUrl, 'client', album._id)}
                      className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#1a1714] hover:bg-[#26221d] border border-[#2b2722] text-[#cfc5b4] hover:text-gold-200 text-xs font-semibold transition-all"
                      title="Sao chép link gửi cho khách"
                    >
                      {copiedLink === `client-${album._id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Link Khách</span>
                        </>
                      )}
                    </button>

                    {/* View as Client */}
                    <a
                      href={clientUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#1a1714] hover:bg-[#26221d] border border-[#2b2722] text-[#8e8474] hover:text-gold-300 transition-all"
                      title="Mở giao diện khách hàng xem thử"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Go to Manage page */}
                    <Link
                      to={`/album/${album._id}/manage?token=${album.manageToken}`}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-300 hover:text-gold-200 text-xs font-bold transition-all"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Quản trị</span>
                    </Link>

                    {/* Delete Album */}
                    <button
                      onClick={() => openDeleteSingle(album)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 transition-all"
                      title="Xóa album để giải phóng bộ nhớ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#181512] border border-[#2e2821] max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-rose-200">
                  {deleteModal.isBulk ? `Xóa ${selectedIds.length} Album?` : 'Xác Nhận Xóa Album'}
                </h3>
                <span className="text-xs text-rose-400/80">Hành động này sẽ giải phóng bộ nhớ lưu trữ</span>
              </div>
            </div>

            <div className="text-sm text-[#cfc5b4] bg-[#100e0c] p-4 rounded-2xl border border-[#26211a] space-y-2">
              {deleteModal.isBulk ? (
                <p>
                  Bạn có chắc chắn muốn xóa vĩnh viễn <strong>{selectedIds.length} album</strong> đã chọn không? Toàn bộ danh sách chọn ảnh và thông tin khách hàng liên quan sẽ bị gỡ bỏ.
                </p>
              ) : (
                <>
                  <p>
                    Bạn có chắc chắn muốn xóa album: <strong className="text-gold-200">"{deleteModal.album?.title}"</strong>?
                  </p>
                  <p className="text-xs text-[#8e8474]">
                    Album có <strong>{deleteModal.album?.imagesCount}</strong> ảnh và <strong>{deleteModal.album?.selectedCount}</strong> ảnh đã chọn.
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, album: null, isBulk: false, loading: false })}
                disabled={deleteModal.loading}
                className="px-4 py-2.5 rounded-xl bg-[#221f1c] hover:bg-[#2c2723] text-[#a2998a] hover:text-[#cfc5b4] text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteModal.loading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteModal.loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xác nhận xóa vĩnh viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
