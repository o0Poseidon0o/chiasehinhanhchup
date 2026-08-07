import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Info, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { albumApi } from '../api/albumApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import { PhotoCard } from '../components/album/PhotoCard';
import { LightboxModal } from '../components/album/LightboxModal';
import { PasscodeModal } from '../components/album/PasscodeModal';
import { SubmitModal } from '../components/album/SubmitModal';
import { SelectionStickyBar } from '../components/album/SelectionStickyBar';
import { formatDate } from '../utils/formatters';

export const AlbumView = () => {
  const { id } = useParams();

  // State quản lý album
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // State mã PIN bảo mật
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const [verifyingPasscode, setVerifyingPasscode] = useState(false);

  // State chọn ảnh và ghi chú
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [comments, setComments] = useState({});

  // State modal & lightbox
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Tải thông tin album từ API
   */
  const fetchAlbum = useCallback(async (currentPasscode = '', isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError('');
      const data = await albumApi.getById(id, currentPasscode);

      if (data.needsPasscode) {
        setNeedsPasscode(true);
        setAlbum({ title: data.title });
      } else {
        setNeedsPasscode(false);
        setAlbum(data.album);

        // Nạp lại các ảnh đã chọn nếu đã submit trước đó và chưa có lựa chọn tạm
        if (data.album.selectedImages && data.album.selectedImages.length > 0 && selectedPhotos.length === 0) {
          setSelectedPhotos(data.album.selectedImages);
          const initialComments = {};
          data.album.selectedImages.forEach((img) => {
            if (img.comment) initialComments[img.fileId] = img.comment;
          });
          setComments(initialComments);
        }
      }
    } catch (err) {
      setError(err.message || 'Không thể tải album.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, selectedPhotos.length]);

  // Kiểm tra passcode đã lưu trong sessionStorage khi mount & tự động đồng bộ
  useEffect(() => {
    const savedPasscode = sessionStorage.getItem(`passcode_${id}`) || '';
    fetchAlbum(savedPasscode);

    // Tự động kiểm tra và đồng bộ ảnh mới khi người dùng quay lại tab trình duyệt
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const pass = sessionStorage.getItem(`passcode_${id}`) || '';
        fetchAlbum(pass, true);
      }
    };

    // Tự động đồng bộ định kỳ mỗi 45 giây trong nền (nếu album chưa khóa)
    const interval = setInterval(() => {
      const pass = sessionStorage.getItem(`passcode_${id}`) || '';
      fetchAlbum(pass, true);
    }, 45000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [id, fetchAlbum]);

  /**
   * Làm mới danh sách ảnh từ Google Drive
   */
  const handleRefreshDrive = () => {
    const savedPasscode = sessionStorage.getItem(`passcode_${id}`) || '';
    fetchAlbum(savedPasscode, true);
  };

  /**
   * Xác thực mã PIN
   */
  const handlePasscodeSubmit = async (passcode) => {
    setVerifyingPasscode(true);
    setPasscodeError('');
    try {
      await albumApi.verifyPasscode(id, passcode);
      sessionStorage.setItem(`passcode_${id}`, passcode);
      await fetchAlbum(passcode);
    } catch (err) {
      setPasscodeError(err.message || 'Mã PIN không đúng.');
    } finally {
      setVerifyingPasscode(false);
    }
  };

  /**
   * Bật/Tắt chọn ảnh
   */
  const handleToggleSelect = (image) => {
    if (isClosed) return;

    const isSelected = selectedPhotos.some((p) => p.fileId === image.fileId);

    if (isSelected) {
      setSelectedPhotos(selectedPhotos.filter((p) => p.fileId !== image.fileId));
    } else {
      if (album.maxSelect > 0 && selectedPhotos.length >= album.maxSelect) {
        alert(`Bạn chỉ được chọn tối đa ${album.maxSelect} ảnh.`);
        return;
      }
      const existingComment = comments[image.fileId] || image.comment || '';
      setSelectedPhotos([...selectedPhotos, { ...image, comment: existingComment }]);
    }
  };

  /**
   * Cập nhật ghi chú cho từng ảnh
   */
  const handleCommentChange = (fileId, text) => {
    if (isClosed) return;
    setComments(prev => ({ ...prev, [fileId]: text }));
    setSelectedPhotos(prev =>
      prev.map((p) => (p.fileId === fileId ? { ...p, comment: text } : p))
    );
  };

  /**
   * Xóa toàn bộ ảnh đã chọn
   */
  const handleClearAll = () => {
    if (isClosed) return;
    if (window.confirm('Bạn có chắc chắn muốn bỏ chọn tất cả ảnh?')) {
      setSelectedPhotos([]);
      setComments({});
    }
  };

  /**
   * Gửi danh sách lựa chọn của khách hàng
   */
  const handleClientSubmit = async (clientInfo) => {
    setSubmitting(true);
    try {
      // Đảm bảo toàn bộ ảnh được gán chính xác comment mới nhất
      const payloadImages = selectedPhotos.map((p) => ({
        fileId: p.fileId,
        fileName: p.fileName,
        thumbnailUrl: p.thumbnailUrl,
        embedUrl: p.embedUrl,
        comment: (comments[p.fileId] !== undefined ? comments[p.fileId] : p.comment) || ''
      }));

      await albumApi.submitSelection(id, {
        clientInfo: {
          name: clientInfo.name.trim(),
          phone: clientInfo.phone.trim(),
          note: (clientInfo.note || '').trim()
        },
        selectedImages: payloadImages,
      });

      alert('Gửi lựa chọn ảnh và ghi chú thành công! Cảm ơn bạn.');
      setShowSubmitModal(false);
      const savedPasscode = sessionStorage.getItem(`passcode_${id}`) || '';
      fetchAlbum(savedPasscode);
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra khi gửi dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Trạng thái đang tải
  if (loading) {
    return <LoadingSpinner message="Đang kết nối Google Drive và tải danh sách ảnh..." />;
  }

  // Màn hình nhập mã PIN bảo mật
  if (needsPasscode) {
    return (
      <PasscodeModal
        albumTitle={album?.title}
        onSubmit={handlePasscodeSubmit}
        loading={verifyingPasscode}
        error={passcodeError}
      />
    );
  }

  // Màn hình lỗi
  if (error || !album) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 animate-fade-in px-4">
        <div className="w-12 h-12 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-red-300">Không thể mở Album</h2>
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

  const isClosed = album.status === 'locked' || album.status === 'submitted';
  const totalCount = album.images?.length || 0;

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#221f1c] pb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-100">{album.title}</h1>
          <div className="text-xs text-[#a2998a] mt-1.5 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-gold-400" />
              Tổng: <strong className="text-gold-200">{totalCount}</strong> ảnh
            </span>

            {album.driveFolderUrl && album.driveFolderUrl !== 'mock' && (
              <>
                <span className="text-[#6e665a]">•</span>
                <a
                  href={album.driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#be8449] hover:underline flex items-center space-x-1"
                >
                  <span>Mở Google Drive</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
          {/* Nút Làm mới cập nhật ảnh */}
          <button
            onClick={handleRefreshDrive}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1a1816] hover:bg-[#221f1c] border border-[#2b2722] hover:border-gold-500/40 text-xs text-[#cfc5b4] hover:text-gold-200 transition-all disabled:opacity-50"
            title="Tải lại để xem ảnh mới nhất vừa được thêm trên Google Drive"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Đang tải lại...' : 'Làm mới ảnh'}</span>
          </button>

          <StatusBadge status={album.status} />

          {album.maxSelect > 0 && (
            <span className="text-xs px-3 py-1 rounded-full border border-[#2b2722] text-[#a2998a] bg-[#161412]">
              Giới hạn: {album.maxSelect} ảnh
            </span>
          )}
        </div>
      </div>

      {/* Thông báo trạng thái khóa / đã gửi */}
      {isClosed && (
        <div className="bg-green-950/20 border border-green-500/20 text-[#beceb5] p-4 rounded-xl text-xs sm:text-sm flex items-start space-x-3 leading-relaxed">
          <Info className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <strong>Thông báo:</strong> Album này đã được gửi chốt lựa chọn ảnh lúc{' '}
            {formatDate(album.clientInfo?.submittedAt)}. Khách hàng hiện đang ở chế độ xem lại (Read-only).
          </div>
        </div>
      )}

      {/* Grid danh sách hình ảnh */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {album.images?.map((image, index) => {
          const isSelected = selectedPhotos.some((p) => p.fileId === image.fileId);
          return (
            <PhotoCard
              key={image.fileId}
              image={image}
              index={index}
              isSelected={isSelected}
              isClosed={isClosed}
              comment={comments[image.fileId]}
              onToggleSelect={handleToggleSelect}
              onOpenLightbox={setLightboxIndex}
            />
          );
        })}
      </div>

      {/* Sticky Bar thanh tác vụ chọn ảnh ở cạnh dưới màn hình */}
      {!isClosed && (
        <SelectionStickyBar
          selectedPhotos={selectedPhotos}
          maxSelect={album.maxSelect}
          onClearAll={handleClearAll}
          onSubmit={() => setShowSubmitModal(true)}
        />
      )}

      {/* Lightbox phóng to ảnh */}
      {lightboxIndex >= 0 && (
        <LightboxModal
          images={album.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={setLightboxIndex}
          selectedPhotos={selectedPhotos}
          onToggleSelect={handleToggleSelect}
          comments={comments}
          onCommentChange={handleCommentChange}
          allowComment={album.allowComment}
          allowDownload={album.allowDownload}
          isClosed={isClosed}
        />
      )}

      {/* Modal gửi chốt thông tin */}
      {showSubmitModal && (
        <SubmitModal
          isOpen={showSubmitModal}
          selectedCount={selectedPhotos.length}
          selectedImages={selectedPhotos}
          initialClientInfo={album.clientInfo}
          maxSelect={album.maxSelect}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleClientSubmit}
          loading={submitting}
        />
      )}
    </div>
  );
};

export default AlbumView;
