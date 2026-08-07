import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  Unlock, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  Trash2, 
  FolderKanban, 
  AlertTriangle,
  FolderSync,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { albumApi } from '../api/albumApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AdminSettingsCard } from '../components/admin/AdminSettingsCard';
import { AdminClientInfoCard } from '../components/admin/AdminClientInfoCard';
import { AdminCopyToolbar } from '../components/admin/AdminCopyToolbar';
import { AdminPhotoCard } from '../components/admin/AdminPhotoCard';
import { LightboxModal } from '../components/album/LightboxModal';

export const AdminManage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State cho việc đồng bộ Google Drive
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const [lightboxIndex, setLightboxIndex] = useState(-1);

  /**
   * Tải dữ liệu quản trị album
   */
  const fetchAlbumManageData = useCallback(async () => {
    if (!token) {
      setError('Thiếu mã bảo mật Token quản trị trong đường dẫn (?token=...).');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await albumApi.getManageData(id, token);
      setAlbum(res.data);
    } catch (err) {
      setError(err.message || 'Không có quyền truy cập trang quản lý này.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchAlbumManageData();
  }, [fetchAlbumManageData]);

  /**
   * Đồng bộ lại ảnh từ Google Drive khi người dùng upload thêm ảnh
   */
  const handleSyncDrive = async () => {
    try {
      setSyncLoading(true);
      setSyncMessage(null);
      const res = await albumApi.syncDrivePhotos(id, token);
      setSyncMessage({
        type: 'success',
        text: res.message || `Đồng bộ thành công! Hiện có ${res.totalImages} ảnh.`
      });
      await fetchAlbumManageData();
    } catch (err) {
      setSyncMessage({
        type: 'error',
        text: err.message || 'Lỗi khi đồng bộ ảnh từ Google Drive.'
      });
    } finally {
      setSyncLoading(false);
      setTimeout(() => setSyncMessage(null), 7000);
    }
  };

  /**
   * Xử lý Khóa / Mở khóa album
   */
  const handleToggleStatus = async (action) => {
    setActionLoading(true);
    try {
      if (action === 'lock') {
        await albumApi.lockAlbum(id, token);
      } else {
        await albumApi.unlockAlbum(id, token);
      }
      await fetchAlbumManageData();
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái album.');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Xử lý Xóa album để giải phóng bộ nhớ
   */
  const handleDeleteAlbum = async () => {
    try {
      setDeleteLoading(true);
      await albumApi.deleteAlbum(id, token);
      navigate('/admin');
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa album.');
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải dữ liệu quản trị album..." />;
  }

  if (error || !album) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 animate-fade-in px-4">
        <div className="w-12 h-12 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-red-300">Quyền truy cập bị từ chối</h2>
        <p className="text-sm text-[#a2998a] leading-relaxed">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] text-gold-300 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Quản Lý Album</span>
          </Link>
          <Link
            to="/"
            className="inline-block bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] text-[#f5eedf] px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  const selectedImages = album.selectedImages || [];
  const selectedCount = selectedImages.length;
  const totalImages = Array.isArray(album.images) ? album.images.length : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#221f1c] pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link
              to="/admin"
              className="text-xs text-[#a2998a] hover:text-gold-400 flex items-center space-x-1 transition-colors"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Tất cả Album</span>
            </Link>
            <span className="text-[#6e665a]">•</span>
            <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
              Chi Tiết Quản Trị
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-100">{album.title}</h1>
            <span className="text-xs text-[#8e8474] flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-gold-400" />
              Tổng: <strong className="text-gold-200">{totalImages}</strong> ảnh
            </span>
          </div>
        </div>

        {/* Action buttons: Sync Drive + Lock/Unlock + Delete + Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Đồng Bộ Ảnh Google Drive */}
          <button
            onClick={handleSyncDrive}
            disabled={syncLoading}
            className="bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/40 hover:border-gold-400 text-gold-300 hover:text-gold-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            title="Đồng bộ lại khi bạn vừa upload thêm ảnh mới lên Google Drive"
          >
            <FolderSync className={`w-4 h-4 ${syncLoading ? 'animate-spin text-gold-400' : 'text-gold-400'}`} />
            <span>{syncLoading ? 'Đang quét Drive...' : 'Đồng bộ ảnh từ Drive'}</span>
          </button>

          {album.status === 'selecting' ? (
            <button
              disabled={actionLoading}
              onClick={() => handleToggleStatus('lock')}
              className="bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Khóa Album</span>
            </button>
          ) : (
            <button
              disabled={actionLoading}
              onClick={() => handleToggleStatus('unlock')}
              className="bg-green-950/40 border border-green-500/30 text-green-400 hover:bg-green-900/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Mở Khóa Album</span>
            </button>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-rose-950/30 border border-rose-600/30 text-rose-400 hover:bg-rose-900/40 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
            title="Xóa album để giải phóng bộ nhớ"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa Album</span>
          </button>

          <button
            onClick={fetchAlbumManageData}
            className="p-2.5 bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] text-[#f5eedf] rounded-xl transition-all"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs sm:text-sm animate-fadeIn shadow-lg ${
            syncMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          {syncMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed font-medium">{syncMessage.text}</div>
        </div>
      )}

      {/* Main Grid: Cài đặt + Thông tin khách & Công cụ copy + Danh sách ảnh */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Cài đặt & Thông tin khách */}
        <div className="lg:col-span-1 space-y-6">
          <AdminSettingsCard 
            album={album} 
            onSync={handleSyncDrive} 
            syncLoading={syncLoading} 
            onUpdate={(updated) => setAlbum(prev => ({ ...prev, ...updated }))}
            token={token}
          />
          <AdminClientInfoCard clientInfo={album.clientInfo} />
        </div>

        {/* Cột phải: Thanh công cụ copy/xuất file & Danh sách chi tiết ảnh khách chọn */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thanh công cụ copy/xuất file */}
          <AdminCopyToolbar
            selectedImages={selectedImages}
            clientInfo={album.clientInfo}
            albumTitle={album.title}
          />

          {/* Grid chi tiết các ảnh khách đã chọn */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gold-200 flex items-center justify-between">
              <span>Chi tiết ảnh khách đã chọn ({selectedCount})</span>
            </h3>

            {selectedCount > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {selectedImages.map((image, index) => (
                  <AdminPhotoCard
                    key={image.fileId}
                    image={image}
                    index={index}
                    onOpenLightbox={setLightboxIndex}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl py-14 text-center text-[#6e665a] space-y-2 border border-dashed border-[#2b2722]">
                <Info className="w-8 h-8 mx-auto opacity-35 text-gold-400" />
                <p className="text-sm font-semibold">Chưa có ảnh nào được chọn</p>
                <p className="text-xs max-w-xs mx-auto text-[#8e8576]">
                  Khi khách hàng tích chọn ảnh và bấm gửi chốt chọn, danh sách chi tiết sẽ hiển thị tại đây.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Xác Nhận Xóa Album */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#181512] border border-[#2e2821] max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-rose-200">Xác Nhận Xóa Album</h3>
                <span className="text-xs text-rose-400/80">Giải phóng dung lượng lưu trữ</span>
              </div>
            </div>

            <div className="text-sm text-[#cfc5b4] bg-[#100e0c] p-4 rounded-2xl border border-[#26211a] space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa album <strong className="text-gold-200">"{album.title}"</strong> không?
              </p>
              <p className="text-xs text-[#8e8474]">
                Sau khi xóa, link chọn ảnh của khách hàng sẽ ngừng hoạt động.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2.5 rounded-xl bg-[#221f1c] hover:bg-[#2c2723] text-[#a2998a] hover:text-[#cfc5b4] text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteAlbum}
                disabled={deleteLoading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal cho Admin xem ảnh phóng to kèm ghi chú */}
      {lightboxIndex >= 0 && selectedCount > 0 && (
        <LightboxModal
          images={selectedImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={setLightboxIndex}
          selectedPhotos={selectedImages}
          comments={selectedImages.reduce((acc, img) => {
            if (img.comment) acc[img.fileId] = img.comment;
            return acc;
          }, {})}
          allowComment={false}
          allowDownload={true}
          isClosed={true}
        />
      )}
    </div>
  );
};

export default AdminManage;
