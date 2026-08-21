import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Mail, 
  Phone, 
  Award, 
  MapPin, 
  Briefcase, 
  Trash2, 
  Search, 
  Plus, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  X,
  Lock,
  Unlock,
  FolderKanban,
  CheckCircle2,
  Users
} from 'lucide-react';
import { userApi } from '../../api/userApi';
import { albumApi } from '../../api/albumApi';
import { formatDate } from '../../utils/formatters';

export const AdminPhotographersHub = () => {
  const [photographers, setPhotographers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');

  // Action states
  const [processingId, setProcessingId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'photographer',
    status: 'active',
    studioInfo: {
      portfolioUrl: '',
      experience: '3 năm',
      equipment: 'Sony A7IV, 24-70 GM',
      styles: 'Chân dung, Cưới, Lookbook',
      location: 'Hà Nội',
      bio: ''
    }
  });

  // Modal View Photographer's Albums
  const [viewingPhotographer, setViewingPhotographer] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, albumsRes] = await Promise.all([
        userApi.getAll({ role: 'photographer' }),
        albumApi.getAll()
      ]);
      setPhotographers(usersRes.data || []);
      setAlbums(albumsRes.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nhiếp ảnh gia.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Phê duyệt hồ sơ
  const handleApprove = async (id, name) => {
    try {
      setProcessingId(id);
      await userApi.approvePhotographer(id);
      setNotice({ type: 'success', message: `Đã phê duyệt và kích hoạt thành công hồ sơ của "${name}"!` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể phê duyệt.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Từ chối / Tạm khóa hồ sơ
  const handleRejectOrLock = async (id, name, currentStatus) => {
    const actionName = currentStatus === 'active' ? 'tạm khóa' : 'từ chối';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản "${name}"?`)) return;
    try {
      setProcessingId(id);
      await userApi.rejectPhotographer(id, 'Quyết định từ Ban Quản Trị');
      setNotice({ type: 'info', message: `Đã ${actionName} tài khoản "${name}".` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể cập nhật trạng thái.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Xóa tài khoản
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn Nhiếp ảnh gia "${name}" khỏi hệ thống?`)) return;
    try {
      setProcessingId(id);
      await userApi.deleteUser(id);
      setNotice({ type: 'success', message: `Đã xóa tài khoản "${name}".` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể xóa tài khoản.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Tạo photographer trực tiếp
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessingId('create');
      await userApi.createUser(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'photographer',
        status: 'active',
        studioInfo: { portfolioUrl: '', experience: '', equipment: '', styles: '', location: '', bio: '' }
      });
      setNotice({ type: 'success', message: 'Đã thêm Nhiếp ảnh gia mới vào hệ thống thành công!' });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể tạo tài khoản.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Xuất CSV danh sách photographer
  const handleExportCSV = () => {
    if (photographers.length === 0) return;
    const headers = ['Tên Studio/Photographer', 'Email', 'SĐT', 'Trạng Thái', 'Link Portfolio', 'Kinh Nghiệm', 'Thiết Bị', 'Khu Vực', 'Ngày Đăng Ký'];
    const rows = photographers.map(p => [
      `"${p.name || ''}"`,
      `"${p.email || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.status === 'active' ? 'Đã duyệt' : p.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}"`,
      `"${p.studioInfo?.portfolioUrl || ''}"`,
      `"${p.studioInfo?.experience || ''}"`,
      `"${p.studioInfo?.equipment || ''}"`,
      `"${p.studioInfo?.location || ''}"`,
      `"${formatDate(p.createdAt)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_nhiep_anh_gia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Đếm số album của từng photographer
  const getPhotographerAlbumCount = (photographerId) => {
    return albums.filter(a => a.photographerId === photographerId).length;
  };

  // Filter list
  const pendingList = photographers.filter(p => p.status === 'pending');
  const activeList = photographers.filter(p => p.status === 'active');
  const rejectedList = photographers.filter(p => p.status === 'rejected');

  const filteredPhotographers = photographers.filter(p => {
    if (statusFilter === 'pending' && p.status !== 'pending') return false;
    if (statusFilter === 'active' && p.status !== 'active') return false;
    if (statusFilter === 'rejected' && p.status !== 'rejected') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchEmail = p.email?.toLowerCase().includes(q);
      const matchPhone = p.phone?.includes(q);
      const matchLoc = p.studioInfo?.location?.toLowerCase().includes(q);
      const matchStyles = p.studioInfo?.styles?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchLoc && !matchStyles) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141720] border border-[#242938] rounded-2xl p-5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
            <span>Tổng Nhiếp Ảnh Gia</span>
            <Camera className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{photographers.length}</div>
          <div className="text-[11px] text-gray-400">Đối tác studio & freelancer</div>
        </div>

        <div className="bg-[#141720] border border-[#242938] rounded-2xl p-5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
            <span>Đang Hoạt Động</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{activeList.length}</div>
          <div className="text-[11px] text-gray-400">Đã được phê duyệt hồ sơ</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`cursor-pointer rounded-2xl p-5 space-y-1.5 shadow-lg transition-all ${
            pendingList.length > 0
              ? 'bg-amber-500/10 border-2 border-amber-500/50 hover:bg-amber-500/15'
              : 'bg-[#141720] border border-[#242938]'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
            <span className="text-amber-400">Hồ Sơ Chờ Duyệt</span>
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 flex items-center space-x-2">
            <span>{pendingList.length}</span>
            {pendingList.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 animate-bounce">
                MỚI
              </span>
            )}
          </div>
          <div className="text-[11px] text-gray-400">Cần Master Admin kiểm tra Portfolio</div>
        </div>

        <div className="bg-[#141720] border border-[#242938] rounded-2xl p-5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase">
            <span>Bị Từ Chối / Tạm Khóa</span>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400">{rejectedList.length}</div>
          <div className="text-[11px] text-gray-400">Hồ sơ chưa đạt tiêu chuẩn</div>
        </div>
      </div>

      {/* NOTICE ALERT */}
      {notice && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm animate-fade-in ${
          notice.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : notice.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
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

      {/* 2. KHU VỰC DUYỆT HỒ SƠ PENDING NỔI BẬT */}
      {pendingList.length > 0 && (
        <div className="bg-gradient-to-br from-[#181d2a] to-[#12151e] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#282f42] pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500 rounded-2xl text-amber-950 shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center space-x-2">
                  <span>Hồ Sơ Nhiếp Ảnh Gia Chờ Master Admin Duyệt</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-amber-950">
                    {pendingList.length} hồ sơ mới
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Bấm vào link Portfolio để xem ảnh chụp thực tế trước khi duyệt cấp quyền tạo album
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingList.map(p => (
              <div
                key={p._id}
                className="bg-[#0c0d12] border border-[#282f42] hover:border-amber-500/60 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{p.name}</h4>
                      <div className="text-xs text-gray-400 flex items-center space-x-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        <span>{p.email}</span>
                      </div>
                      {p.phone && (
                        <div className="text-xs text-amber-400 font-mono font-semibold flex items-center space-x-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{p.phone}</span>
                        </div>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      CHỜ DUYỆT
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#141720] rounded-xl border border-[#242938] space-y-2 text-xs">
                    {p.studioInfo?.portfolioUrl ? (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tác phẩm / Portfolio:</span>
                        <a
                          href={p.studioInfo.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-bold underline truncate max-w-[200px]"
                        >
                          <span>Bấm Xem Tác Phẩm</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Chưa có link portfolio</span>
                    )}

                    {p.studioInfo?.experience && (
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-400">Kinh nghiệm:</span>
                        <span>{p.studioInfo.experience}</span>
                      </div>
                    )}

                    {p.studioInfo?.equipment && (
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-400">Thiết bị:</span>
                        <span>{p.studioInfo.equipment}</span>
                      </div>
                    )}

                    {p.studioInfo?.location && (
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-400">Khu vực:</span>
                        <span>{p.studioInfo.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-[#242938]">
                  <button
                    disabled={processingId === p._id}
                    onClick={() => handleApprove(p._id, p.name)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all disabled:opacity-50"
                  >
                    {processingId === p._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Phê Duyệt & Kích Hoạt</span>
                      </>
                    )}
                  </button>

                  <button
                    disabled={processingId === p._id}
                    onClick={() => handleRejectOrLock(p._id, p.name, p.status)}
                    className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DANH SÁCH TẤT CẢ NHIẾP ẢNH GIA / STUDIO ĐỐI TÁC */}
      <div className="bg-[#141720] border border-[#242938] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Toolbar Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Danh Sách Nhiếp Ảnh Gia & Studio Đối Tác</h3>
            <p className="text-xs text-gray-400">
              Quản trị toàn bộ danh sách photographer, theo dõi số lượng album và link tác phẩm của từng đối tác
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Photographer Mới</span>
            </button>

            <button
              onClick={fetchData}
              title="Làm mới dữ liệu"
              className="p-2 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-400 hover:text-white rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên studio, email, số điện thoại, khu vực, thiết bị..."
              className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 bg-[#0c0d12] p-1 rounded-xl border border-[#242938]">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Đã duyệt' },
              { id: 'pending', label: 'Chờ duyệt' },
              { id: 'rejected', label: 'Từ chối' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-amber-500 text-amber-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#242938]">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0c0d12] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#242938]">
              <tr>
                <th className="py-3 px-4">Studio / Nhiếp Ảnh Gia</th>
                <th className="py-3 px-4">Liên Hệ</th>
                <th className="py-3 px-4">Portfolio & Tác Phẩm</th>
                <th className="py-3 px-4 text-center">Số Album Đã Tạo</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Ngày Tham Gia</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242938]">
              {filteredPhotographers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                    Không tìm thấy Nhiếp ảnh gia nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPhotographers.map(p => {
                  const albumCount = getPhotographerAlbumCount(p._id);

                  return (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shadow-sm">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs sm:text-sm">{p.name}</div>
                            {p.studioInfo?.location && (
                              <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span>{p.studioInfo.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-gray-300">{p.email}</div>
                        {p.phone && (
                          <a 
                            href={`https://zalo.me/${p.phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-amber-400 font-mono text-[11px] font-semibold hover:underline block"
                          >
                            {p.phone} (Zalo)
                          </a>
                        )}
                      </td>

                      {/* Portfolio */}
                      <td className="py-3.5 px-4">
                        {p.studioInfo?.portfolioUrl ? (
                          <a
                            href={p.studioInfo.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold rounded-lg hover:bg-amber-500/20 transition-colors"
                          >
                            <span>Xem Portfolio</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-500 italic">Chưa cung cấp</span>
                        )}
                      </td>

                      {/* Album Count */}
                      <td className="py-3.5 px-4 text-center font-bold text-white text-sm">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                          {albumCount} album
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {p.status === 'active' ? '✓ Đã duyệt' : p.status === 'pending' ? '⏳ Chờ duyệt' : '✗ Tạm khóa'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {formatDate(p.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {p.status !== 'active' ? (
                            <button
                              title="Phê duyệt & Kích hoạt"
                              onClick={() => handleApprove(p._id, p.name)}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              title="Tạm khóa tài khoản"
                              onClick={() => handleRejectOrLock(p._id, p.name, p.status)}
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-amber-400 rounded-lg transition-colors"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            title="Xóa đối tác"
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MASTER ADMIN THÊM PHOTOGRAPHER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#141720] border border-[#2b3245] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#f8fafc] my-8">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">Thêm Nhiếp Ảnh Gia Mới</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Studio / Nhiếp Ảnh Gia *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="VD: Hải Đăng Studio"
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="email@studio.vn"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="0912345678"
                    className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Link Portfolio / Facebook / Instagram</label>
                <input
                  type="url"
                  value={createForm.studioInfo.portfolioUrl}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    studioInfo: { ...createForm.studioInfo, portfolioUrl: e.target.value }
                  })}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Số năm kinh nghiệm</label>
                  <select
                    value={createForm.studioInfo.experience || '3 - 5 năm (Chuyên nghiệp)'}
                    onChange={(e) => setCreateForm({
                      ...createForm,
                      studioInfo: { ...createForm.studioInfo, experience: e.target.value }
                    })}
                    className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Dưới 1 năm (Mới vào nghề)">Dưới 1 năm (Mới vào nghề)</option>
                    <option value="1 - 2 năm">1 - 2 năm</option>
                    <option value="3 - 5 năm (Chuyên nghiệp)">3 - 5 năm (Chuyên nghiệp)</option>
                    <option value="5 - 10 năm (Kỳ cựu)">5 - 10 năm (Kỳ cựu)</option>
                    <option value="Trên 10 năm (Master / Chuyên gia)">Trên 10 năm (Master / Chuyên gia)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Khu vực hoạt động</label>
                  <select
                    value={createForm.studioInfo.location || 'Hà Nội'}
                    onChange={(e) => setCreateForm({
                      ...createForm,
                      studioInfo: { ...createForm.studioInfo, location: e.target.value }
                    })}
                    className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-2.5 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Nha Trang">Nha Trang</option>
                    <option value="Đà Lạt">Đà Lạt</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Huế">Huế</option>
                    <option value="Quảng Ninh">Quảng Ninh</option>
                    <option value="Toàn quốc (Nhận chụp xa)">Toàn quốc (Nhận chụp xa)</option>
                  </select>
                </div>
              </div>

              {/* Thể loại sở trường (CHỌN NHIỀU TAG) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-300">
                    Thể loại sở trường <span className="text-amber-400 font-bold">(Chọn nhiều sở trường)</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Bấm để chọn/bỏ chọn</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    'Chân dung nghệ thuật',
                    'Ảnh cưới & Pre-wedding',
                    'Kỷ yếu & Sinh viên',
                    'Gia đình & Em bé',
                    'Sự kiện & Doanh nghiệp',
                    'Lookbook & Thời trang',
                    'Đường phố & Phóng sự'
                  ].map(style => {
                    const currentStr = createForm.studioInfo.styles || '';
                    const isSelected = currentStr.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          const currentList = currentStr ? currentStr.split(',').map(s => s.trim()).filter(Boolean) : [];
                          const nextList = isSelected 
                            ? currentList.filter(s => s !== style)
                            : [...currentList, style];
                          setCreateForm({
                            ...createForm,
                            studioInfo: { ...createForm.studioInfo, styles: nextList.join(', ') }
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-amber-950 font-bold shadow-md scale-105'
                            : 'bg-[#0c0d12] hover:bg-[#1c2230] border border-[#2b3245] text-gray-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={processingId === 'create'}
                className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2"
              >
                {processingId === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Thêm Đối Tác</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPhotographersHub;
