import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Info, AlertCircle, RefreshCw, Image as ImageIcon, Heart, Send, CheckCircle2 } from 'lucide-react';
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
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'selected'

  // State modal & lightbox
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ref theo dõi việc khởi tạo các ảnh đã được lưu sẵn từ trước (tránh nạp đè state khi user đang thao tác)
  const hasInitializedRef = useRef(false);

  // Reset initialized flag khi đổi id album
  useEffect(() => {
    hasInitializedRef.current = false;
  }, [id]);

  /**
   * Tải thông tin album từ API (không phụ thuộc vào selectedPhotos.length để không làm reload trang khi tick ảnh)
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

        // Nạp lại các ảnh đã chọn duy nhất 1 lần đầu khi mở album
        if (
          data.album.selectedImages &&
          data.album.selectedImages.length > 0 &&
          !hasInitializedRef.current
        ) {
          hasInitializedRef.current = true;
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
  }, [id]);

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
   * Cập nhật ghi chú cho từng ảnh (có tự động tick chọn ảnh nếu người dùng thêm ghi chú)
   */
  const handleCommentChange = (fileId, text, autoSelect = false) => {
    if (isClosed) return;

    setComments((prev) => ({ ...prev, [fileId]: text }));

    setSelectedPhotos((prev) => {
      const exists = prev.some((p) => p.fileId === fileId);
      if (exists) {
        return prev.map((p) => (p.fileId === fileId ? { ...p, comment: text } : p));
      } else if (autoSelect && text.trim().length > 0 && album?.images) {
        const targetImg = album.images.find((img) => img.fileId === fileId);
        if (targetImg) {
          if (album.maxSelect > 0 && prev.length >= album.maxSelect) {
            return prev;
          }
          return [...prev, { ...targetImg, comment: text }];
        }
      }
      return prev;
    });
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
        comment: (comments[p.fileId] !== undefined ? comments[p.fileId] : p.comment) || '',
      }));

      await albumApi.submitSelection(id, {
        clientInfo: {
          name: clientInfo.name.trim(),
          phone: clientInfo.phone.trim(),
          note: (clientInfo.note || '').trim(),
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

  const displayedImages = filterMode === 'selected'
    ? (album.images || []).filter((image) => selectedPhotos.some((p) => p.fileId === image.fileId))
    : (album.images || []);

  const handleOpenLightbox = (fileId) => {
    const idx = album.images?.findIndex((img) => img.fileId === fileId);
    if (idx !== undefined && idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  return (
    <div className="space-y-6 pb-28">
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
          {/* Nút gửi lựa chọn nhanh trên Header */}
          {!isClosed && selectedPhotos.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 hover:from-amber-400 hover:to-gold-300 text-gold-950 font-black px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-gold-500/25 active:scale-95 transition-all hover:brightness-105"
              title="Gửi ngay danh sách ảnh đã chọn cho Studio"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Gửi Lựa Chọn ({selectedPhotos.length})</span>
            </button>
          )}

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

      {/* Thanh bộ lọc xem ảnh: Tất cả vs Đã chọn */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-[#12100e] border border-[#242938] p-2 sm:p-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterMode === 'all'
                ? 'bg-amber-500 text-amber-950 shadow-md font-black'
                : 'text-[#a2998a] hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Tất cả ảnh ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('selected')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterMode === 'selected'
                ? 'bg-amber-500 text-amber-950 shadow-md font-black'
                : 'text-[#a2998a] hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${selectedPhotos.length > 0 ? 'fill-current text-amber-950' : ''}`} />
            <span>Đã chọn ({selectedPhotos.length}{album.maxSelect > 0 ? `/${album.maxSelect}` : ''})</span>
          </button>
        </div>

        {/* Thông báo trạng thái hoặc nút bỏ chọn */}
        {selectedPhotos.length > 0 && !isClosed && (
          <div className="flex items-center space-x-3 text-xs text-[#a2998a] ml-auto">
            {album.maxSelect > 0 && selectedPhotos.length >= album.maxSelect && (
              <span className="text-amber-400 font-semibold hidden md:inline">
                ✨ Đã chọn đủ {album.maxSelect} ảnh theo yêu cầu!
              </span>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[#8e8576] hover:text-rose-400 text-xs transition-colors hover:underline px-2 py-1"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        )}
      </div>

      {/* Grid danh sách hình ảnh */}
      {displayedImages.length === 0 ? (
        <div className="bg-[#12100e] border border-[#242938] rounded-2xl p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto shadow-lg animate-fade-in">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Bạn chưa chọn bức ảnh nào</h3>
            <p className="text-xs text-[#a2998a] leading-relaxed">
              Bấm nút <strong>"Chọn"</strong> hoặc biểu tượng trái tim trên các bức ảnh bạn ưng ý nhất để thêm vào danh sách.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            Quay lại xem tất cả ảnh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {displayedImages.map((image, index) => {
            const isSelected = selectedPhotos.some((p) => p.fileId === image.fileId);
            return (
              <PhotoCard
                key={image.fileId}
                image={image}
                index={index}
                isSelected={isSelected}
                isClosed={isClosed}
                comment={comments[image.fileId]}
                allowComment={album.allowComment}
                allowDownload={album.allowDownload}
                onToggleSelect={handleToggleSelect}
                onCommentChange={handleCommentChange}
                onOpenLightbox={() => handleOpenLightbox(image.fileId)}
              />
            );
          })}
        </div>
      )}

      {/* Sticky Bar thanh tác vụ chọn ảnh ở cạnh dưới màn hình */}
      {!isClosed && (
        <SelectionStickyBar
          selectedCount={selectedPhotos.length}
          selectedPhotos={selectedPhotos}
          maxSelect={album.maxSelect}
          isClosed={isClosed}
          onOpenSubmitModal={() => setShowSubmitModal(true)}
          onSubmit={() => setShowSubmitModal(true)}
          filterMode={filterMode}
          onToggleFilter={() => setFilterMode((prev) => (prev === 'all' ? 'selected' : 'all'))}
          isSubmitModalOpen={showSubmitModal}
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
          maxSelect={album.maxSelect}
          onToggleSelect={handleToggleSelect}
          comments={comments}
          onCommentChange={handleCommentChange}
          allowComment={album.allowComment}
          allowDownload={album.allowDownload}
          isClosed={isClosed}
          onOpenSubmitModal={() => {
            setLightboxIndex(-1);
            setShowSubmitModal(true);
          }}
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

