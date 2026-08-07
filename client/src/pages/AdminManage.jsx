import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, RefreshCw, AlertCircle, Info } from 'lucide-react';
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
  const token = searchParams.get('token');

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
        <Link
          to="/"
          className="inline-block bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] text-[#f5eedf] px-6 py-2.5 rounded-xl text-xs font-semibold transition-all"
        >
          Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  const selectedImages = album.selectedImages || [];
  const selectedCount = selectedImages.length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#221f1c] pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="text-xs text-[#a2998a] hover:text-gold-400 flex items-center space-x-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-[#6e665a]">•</span>
            <span className="text-xs text-gold-400 font-semibold uppercase tracking-wider">
              Trang Quản Trị Album
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-100">{album.title}</h1>
        </div>

        {/* Action buttons: Lock/Unlock + Refresh */}
        <div className="flex items-center gap-2">
          {album.status === 'selecting' ? (
            <button
              disabled={actionLoading}
              onClick={() => handleToggleStatus('lock')}
              className="bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Khóa Album Khách</span>
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
            onClick={fetchAlbumManageData}
            className="p-2.5 bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] text-[#f5eedf] rounded-xl transition-all"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Cài đặt + Thông tin khách & Công cụ copy + Danh sách ảnh */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Cài đặt & Thông tin khách */}
        <div className="lg:col-span-1 space-y-6">
          <AdminSettingsCard album={album} />
          <AdminClientInfoCard clientInfo={album.clientInfo} />
        </div>

        {/* Cột phải: Thanh công cụ copy/xuất file & Danh sách chi tiết ảnh khách chọn */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thanh công cụ copy tên file cho Lightroom/Photoshop */}
          <AdminCopyToolbar
            selectedImages={selectedImages}
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
