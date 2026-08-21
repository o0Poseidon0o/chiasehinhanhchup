import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit, 
  Search, 
  Plus, 
  ExternalLink, 
  Mail, 
  Phone, 
  Award, 
  Camera, 
  User, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Loader2,
  X
} from 'lucide-react';
import { userApi } from '../../api/userApi';
import { formatDate } from '../../utils/formatters';

export const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePhotographers: 0,
    pendingPhotographers: 0,
    clients: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filters
  const [filterRole, setFilterRole] = useState('all'); // 'all' | 'pending' | 'photographer' | 'client' | 'admin'
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
      experience: '',
      equipment: '',
      styles: '',
      location: ''
    }
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, statsRes] = await Promise.all([
        userApi.getAll(),
        userApi.getStats()
      ]);
      setUsers(usersRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Phê duyệt hồ sơ photographer
  const handleApprove = async (id, name) => {
    try {
      setProcessingId(id);
      await userApi.approvePhotographer(id);
      setNotice({ type: 'success', message: `Đã phê duyệt thành công hồ sơ của "${name}"!` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể phê duyệt hồ sơ.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Từ chối hồ sơ photographer
  const handleReject = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn từ chối hồ sơ của "${name}"?`)) return;
    try {
      setProcessingId(id);
      await userApi.rejectPhotographer(id, 'Hồ sơ chưa đạt tiêu chuẩn');
      setNotice({ type: 'info', message: `Đã từ chối hồ sơ của "${name}".` });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể từ chối hồ sơ.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Xóa tài khoản
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" khỏi hệ thống?`)) return;
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

  // Thay đổi Role hoặc Status nhanh
  const handleUpdateRole = async (id, newRole) => {
    try {
      setProcessingId(id);
      await userApi.updateUser(id, { role: newRole });
      setNotice({ type: 'success', message: 'Đã cập nhật phân quyền thành công.' });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể cập nhật quyền.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Tạo User thủ công
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
        studioInfo: { portfolioUrl: '', experience: '', equipment: '', styles: '', location: '' }
      });
      setNotice({ type: 'success', message: 'Đã tạo tài khoản người dùng thành công!' });
      await fetchData();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Không thể tạo tài khoản.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Xuất danh bạ CSV
  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['Họ Tên', 'Email', 'Số Điện Thoại', 'Vai Trò', 'Trạng Thái', 'Portfolio', 'Ngày Đăng Ký'];
    const rows = users.map(u => [
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.role || ''}"`,
      `"${u.status || ''}"`,
      `"${u.studioInfo?.portfolioUrl || ''}"`,
      `"${formatDate(u.createdAt)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `potonow_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lọc danh sách
  const pendingUsers = users.filter(u => u.role === 'photographer' && u.status === 'pending');

  const filteredUsers = users.filter(u => {
    if (filterRole === 'pending' && (u.role !== 'photographer' || u.status !== 'pending')) return false;
    if (filterRole === 'photographer' && u.role !== 'photographer') return false;
    if (filterRole === 'client' && u.role !== 'client') return false;
    if (filterRole === 'admin' && u.role !== 'admin') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone?.includes(q);
      const matchLocation = u.studioInfo?.location?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchLocation) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Tổng số User */}
        <div className="bg-[#141720] border border-[#242938] rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Tổng Người Dùng</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.totalUsers || users.length}
          </div>
          <div className="text-[11px] text-gray-400">Khách hàng & Nhiếp ảnh gia</div>
        </div>

        {/* Card 2: Nhiếp Ảnh Gia Hoạt Động */}
        <div className="bg-[#141720] border border-[#242938] rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Nhiếp Ảnh Gia Đã Duyệt</span>
            <Camera className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {stats.activePhotographers || 0}
          </div>
          <div className="text-[11px] text-gray-400">Đang hoạt động trên nền tảng</div>
        </div>

        {/* Card 3: Hồ Sơ Chờ Duyệt */}
        <div 
          onClick={() => setFilterRole('pending')}
          className={`cursor-pointer rounded-2xl p-5 space-y-2 shadow-lg transition-all ${
            stats.pendingPhotographers > 0
              ? 'bg-amber-500/10 border-2 border-amber-500/50 hover:bg-amber-500/15'
              : 'bg-[#141720] border border-[#242938]'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase text-amber-400">Hồ Sơ Chờ Duyệt</span>
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center space-x-2">
            <span>{stats.pendingPhotographers || 0}</span>
            {stats.pendingPhotographers > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 animate-bounce">
                MỚI
              </span>
            )}
          </div>
          <div className="text-[11px] text-gray-400">Cần kiểm duyệt chuyên môn</div>
        </div>

        {/* Card 4: Khách Hàng */}
        <div className="bg-[#141720] border border-[#242938] rounded-2xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Khách Hàng</span>
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">
            {stats.clients || 0}
          </div>
          <div className="text-[11px] text-gray-400">Tài khoản khách lưu kho ảnh</div>
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

      {/* 2. KHU VỰC HỒ SƠ CHỜ DUYỆT (PENDING PHOTOGRAPHERS SHOWCASE) */}
      {pendingUsers.length > 0 && (
        <div className="bg-gradient-to-br from-[#171b26] to-[#12151e] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#282f42] pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500 rounded-2xl text-amber-950 shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
                  <span>Hồ Sơ Nhiếp Ảnh Gia Chờ Duyệt</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-amber-950">
                    {pendingUsers.length}
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Kiểm tra link portfolio và bấm duyệt để cấp quyền tạo album cho photographer
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {pendingUsers.map(applicant => (
              <div
                key={applicant._id}
                className="bg-[#0c0d12] border border-[#282f42] hover:border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-base">{applicant.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{applicant.email}</span>
                      </div>
                      {applicant.phone && (
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-300 font-semibold">{applicant.phone}</span>
                        </div>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Chờ Duyệt
                    </span>
                  </div>

                  {/* Portfolio & Info */}
                  <div className="p-3 bg-[#141720] rounded-xl border border-[#242938] space-y-2 text-xs">
                    {applicant.studioInfo?.portfolioUrl ? (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Link Portfolio:</span>
                        <a
                          href={applicant.studioInfo.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-semibold underline truncate max-w-[200px]"
                        >
                          <span>Xem Tác Phẩm</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Chưa cung cấp link portfolio</div>
                    )}

                    {applicant.studioInfo?.experience && (
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-400">Kinh nghiệm:</span>
                        <span>{applicant.studioInfo.experience}</span>
                      </div>
                    )}

                    {applicant.studioInfo?.location && (
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-400">Khu vực:</span>
                        <span>{applicant.studioInfo.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-[#242938]">
                  <button
                    disabled={processingId === applicant._id}
                    onClick={() => handleApprove(applicant._id, applicant.name)}
                    className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all disabled:opacity-50"
                  >
                    {processingId === applicant._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Phê Duyệt & Kích Hoạt</span>
                      </>
                    )}
                  </button>

                  <button
                    disabled={processingId === applicant._id}
                    onClick={() => handleReject(applicant._id, applicant.name)}
                    className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TOOLBAR VÀ BẢNG DANH SÁCH TOÀN BỘ NGƯỜI DÙNG */}
      <div className="bg-[#141720] border border-[#242938] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Toolbar Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Danh Sách Người Dùng Hệ Thống</h3>
            <p className="text-xs text-gray-400">
              Quản lý phân quyền, tra cứu thông tin khách hàng và nhiếp ảnh gia
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-[#0c0d12] hover:bg-[#1c2230] border border-[#242938] text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm User Mới</span>
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

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại, khu vực..."
              className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center space-x-1 bg-[#0c0d12] p-1 rounded-xl border border-[#242938] overflow-x-auto">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'photographer', label: 'Photographer' },
              { id: 'client', label: 'Khách hàng' },
              { id: 'admin', label: 'Admin' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterRole(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  filterRole === tab.id
                    ? 'bg-amber-500 text-amber-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* USERS DATA TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-[#242938]">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0c0d12] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#242938]">
              <tr>
                <th className="py-3 px-4">Người Dùng</th>
                <th className="py-3 px-4">Liên Hệ</th>
                <th className="py-3 px-4">Vai Trò & Phân Quyền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Ngày Tạo</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242938]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          u.role === 'admin'
                            ? 'bg-amber-500 text-amber-950'
                            : u.role === 'photographer'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm">{u.name}</div>
                          {u.studioInfo?.portfolioUrl && (
                            <a
                              href={u.studioInfo.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-amber-400 hover:underline inline-flex items-center space-x-1"
                            >
                              <span>Portfolio</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div>{u.email}</div>
                      {u.phone && <div className="text-amber-400 font-mono text-[11px]">{u.phone}</div>}
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        disabled={processingId === u._id || u._id === 'master_admin'}
                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                          u.role === 'admin'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : u.role === 'photographer'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        }`}
                      >
                        <option value="photographer" className="bg-[#141720]">Photographer</option>
                        <option value="client" className="bg-[#141720]">Khách Hàng</option>
                        <option value="admin" className="bg-[#141720]">Quản Trị Viên</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : u.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {u.status === 'active' ? 'Đã duyệt' : u.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {u._id !== 'master_admin' && (
                        <div className="flex items-center justify-end space-x-1">
                          {u.status === 'pending' && (
                            <button
                              title="Phê duyệt ngay"
                              onClick={() => handleApprove(u._id, u.name)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            title="Xóa người dùng"
                            onClick={() => handleDelete(u._id, u.name)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADMIN TẠO USER MỚI */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#141720] border border-[#2b3245] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#f8fafc]">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">Tạo Tài Khoản Mới</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Họ Tên / Studio *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="VD: Hải Đăng Studio"
                  className="w-full bg-[#0c0d12] border border-[#242938] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
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
                    placeholder="email@potonow.vn"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Phân quyền</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="photographer">Nhiếp Ảnh Gia</option>
                    <option value="client">Khách Hàng</option>
                    <option value="admin">Quản Trị Viên</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Trạng thái</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="active">Kích hoạt ngay</option>
                    <option value="pending">Chờ duyệt</option>
                  </select>
                </div>
              </div>

              {createForm.role === 'photographer' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Link Portfolio</label>
                  <input
                    type="url"
                    value={createForm.studioInfo.portfolioUrl}
                    onChange={(e) => setCreateForm({
                      ...createForm,
                      studioInfo: { ...createForm.studioInfo, portfolioUrl: e.target.value }
                    })}
                    placeholder="https://..."
                    className="w-full bg-[#0c0d12] border border-[#242938] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={processingId === 'create'}
                className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2"
              >
                {processingId === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Tạo Người Dùng</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
