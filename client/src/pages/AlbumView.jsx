import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Info, AlertCircle } from 'lucide-react';
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
  const fetchAlbum = useCallback(async (currentPasscode = '') => {
    try {
      setLoading(true);
      setError('');
      const data = await albumApi.getById(id, currentPasscode);

      if (data.needsPasscode) {
        setNeedsPasscode(true);
        setAlbum({ title: data.title });
      } else {
        setNeedsPasscode(false);
        setAlbum(data.album);

        // Nạp lại các ảnh đã chọn nếu đã submit trước đó
        if (data.album.selectedImages && data.album.selectedImages.length > 0) {
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
    }
  }, [id]);

  // Kiểm tra passcode đã lưu trong sessionStorage khi mount
  useEffect(() => {
    const savedPasscode = sessionStorage.getItem(`passcode_${id}`) || '';
    fetchAlbum(savedPasscode);
  }, [id, fetchAlbum]);

  /**
   * Xử lý xác thực mã PIN
   */
  const handlePasscodeSubmit = async (enteredPasscode) => {
    setPasscodeError('');
    setVerifyingPasscode(true);

    try {
      await albumApi.verifyPasscode(id, enteredPasscode);
      sessionStorage.setItem(`passcode_${id}`, enteredPasscode);
      fetchAlbum(enteredPasscode);
    } catch (err) {
      setPasscodeError(err.message || 'Mã PIN không chính xác.');
    } finally {
      setVerifyingPasscode(false);
    }
  };

  /**
   * Bật/Tắt chọn ảnh
   */
  const handleToggleSelect = (image) => {
    if (!album || album.status === 'locked' || album.status === 'submitted') return;

    const isSelected = selectedPhotos.some((p) => p.fileId === image.fileId);

    if (isSelected) {
      setSelectedPhotos((prev) => prev.filter((p) => p.fileId !== image.fileId));
    } else {
      if (album.maxSelect > 0 && selectedPhotos.length >= album.maxSelect) {
        alert(`Bạn chỉ được chọn tối đa ${album.maxSelect} bức ảnh. Vui lòng bỏ chọn bớt trước.`);
        return;
      }

      setSelectedPhotos((prev) => [
        ...prev,
        {
          fileId: image.fileId,
          fileName: image.fileName,
          thumbnailUrl: image.thumbnailUrl,
          embedUrl: image.embedUrl,
          comment: comments[image.fileId] || '',
        },
      ]);
    }
  };

  /**
   * Cập nhật ghi chú trên từng ảnh
   */
  const handleCommentChange = (fileId, text) => {
    setComments((prev) => ({ ...prev, [fileId]: text }));
    setSelectedPhotos((prev) =>
      prev.map((p) => (p.fileId === fileId ? { ...p, comment: text } : p))
    );
  };

  /**
   * Gửi danh sách lựa chọn của khách hàng
   */
  const handleClientSubmit = async (clientInfo) => {
    setSubmitting(true);
    try {
      await albumApi.submitSelection(id, {
        clientInfo,
        selectedImages: selectedPhotos,
      });
      alert('Gửi lựa chọn ảnh thành công! Cảm ơn bạn.');
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
    return <LoadingSpinner message="Đang tải danh sách ảnh từ album..." />;
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

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#221f1c] pb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gold-100">{album.title}</h1>
          <p className="text-xs text-[#a2998a] mt-1.5 flex items-center space-x-2">
            <span>Đường dẫn Drive: </span>
            <a
              href={album.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#be8449] hover:underline flex items-center space-x-1"
            >
              <span>Xem thư mục gốc</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
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
              comment={comments[image.fileId]}
              allowDownload={album.allowDownload}
              allowComment={album.allowComment}
              isClosed={isClosed}
              onToggleSelect={handleToggleSelect}
              onCommentChange={handleCommentChange}
              onOpenLightbox={setLightboxIndex}
            />
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <SelectionStickyBar
        selectedCount={selectedPhotos.length}
        maxSelect={album.maxSelect}
        isClosed={isClosed}
        onOpenSubmitModal={() => setShowSubmitModal(true)}
      />

      {/* Lightbox Modal */}
      {lightboxIndex >= 0 && (
        <LightboxModal
          images={album.images || []}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={setLightboxIndex}
          selectedPhotos={selectedPhotos}
          comments={comments}
          allowComment={album.allowComment}
          allowDownload={album.allowDownload}
          isClosed={isClosed}
          onToggleSelect={handleToggleSelect}
          onCommentChange={handleCommentChange}
        />
      )}

      {/* Submit Modal */}
      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        selectedCount={selectedPhotos.length}
        onSubmit={handleClientSubmit}
        loading={submitting}
      />
    </div>
  );
};

export default AlbumView;
