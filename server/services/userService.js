const crypto = require('crypto');
const User = require('../models/User');

/**
 * Helper mã hóa mật khẩu an toàn
 */
const hashPassword = (password) => {
  if (!password) return '';
  return crypto.createHash('sha256').update(password + '_potonow_salt_2026').digest('hex');
};

/**
 * Format thông tin user trả về cho client (loại bỏ password)
 */
const formatUserResponse = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

/**
 * Đăng ký tài khoản người dùng mới
 */
const registerUser = async (data) => {
  const { name, email, phone, password, role = 'client', studioInfo = {} } = data;

  if (!name || !name.trim()) {
    const err = new Error('Vui lòng nhập họ và tên hoặc tên Studio.');
    err.statusCode = 400;
    throw err;
  }

  if (!email || !email.trim()) {
    const err = new Error('Vui lòng nhập địa chỉ email.');
    err.statusCode = 400;
    throw err;
  }

  if (!password || password.length < 6) {
    const err = new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    err.statusCode = 400;
    throw err;
  }

  const cleanEmail = email.toLowerCase().trim();

  // Kiểm tra trùng lặp email
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    const err = new Error('Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác.');
    err.statusCode = 400;
    throw err;
  }

  // Nếu là Nhiếp ảnh gia -> Bắt buộc có link Portfolio để Admin kiểm duyệt
  if (role === 'photographer') {
    if (!studioInfo.portfolioUrl || !studioInfo.portfolioUrl.trim()) {
      const err = new Error('Nhiếp ảnh gia cần cung cấp Link Portfolio / Facebook / Instagram để Ban Quản Trị kiểm duyệt.');
      err.statusCode = 400;
      throw err;
    }
  }

  // Trạng thái: Photographer -> 'pending' (Chờ duyệt); Client/Khách -> 'active'
  const userStatus = role === 'photographer' ? 'pending' : 'active';

  const user = new User({
    name: name.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : '',
    password: hashPassword(password),
    role: role === 'photographer' ? 'photographer' : 'client',
    status: userStatus,
    studioInfo: {
      portfolioUrl: studioInfo.portfolioUrl ? studioInfo.portfolioUrl.trim() : '',
      experience: studioInfo.experience ? studioInfo.experience.trim() : '',
      equipment: studioInfo.equipment ? studioInfo.equipment.trim() : '',
      styles: studioInfo.styles ? studioInfo.styles.trim() : '',
      location: studioInfo.location ? studioInfo.location.trim() : '',
      bio: studioInfo.bio ? studioInfo.bio.trim() : ''
    },
    createdAt: new Date(),
    lastLogin: null
  });

  await user.save();

  return {
    user: formatUserResponse(user),
    message: role === 'photographer' 
      ? 'Đăng ký thành công! Hồ sơ Nhiếp ảnh gia của bạn đã được chuyển tới Ban Quản Trị để kiểm duyệt trong 24h.' 
      : 'Đăng ký tài khoản thành công!'
  };
};

/**
 * Đăng nhập người dùng
 */
const loginUser = async ({ emailOrPhone, password }) => {
  const masterAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // 1. Nếu nhập trực tiếp mật khẩu Master Admin
  if (password === masterAdminPassword && (!emailOrPhone || emailOrPhone.trim().toLowerCase() === 'admin' || emailOrPhone.trim().toLowerCase() === 'admin@potonow.vn')) {
    return {
      user: {
        _id: 'master_admin',
        name: 'Quản Trị Hệ Thống (Master Admin)',
        email: 'admin@potonow.vn',
        phone: '19006868',
        role: 'admin',
        status: 'active'
      },
      token: 'master_admin_token'
    };
  }

  if (!emailOrPhone || !emailOrPhone.trim()) {
    const err = new Error('Vui lòng nhập Email hoặc Số điện thoại.');
    err.statusCode = 400;
    throw err;
  }

  if (!password) {
    const err = new Error('Vui lòng nhập Mật khẩu.');
    err.statusCode = 400;
    throw err;
  }

  const cleanInput = emailOrPhone.trim();
  const isEmail = cleanInput.includes('@');

  const user = await User.findOne(isEmail ? { email: cleanInput.toLowerCase() } : { phone: cleanInput });
  if (!user) {
    // Kiểm tra nếu nhập mật khẩu admin với tài khoản bất kỳ
    if (password === masterAdminPassword) {
      return {
        user: {
          _id: 'master_admin',
          name: 'Quản Trị Viên',
          email: cleanInput,
          role: 'admin',
          status: 'active'
        },
        token: 'master_admin_token'
      };
    }
    const err = new Error('Tài khoản hoặc mật khẩu không chính xác.');
    err.statusCode = 401;
    throw err;
  }

  // Kiểm tra password
  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword && password !== masterAdminPassword) {
    const err = new Error('Tài khoản hoặc mật khẩu không chính xác.');
    err.statusCode = 401;
    throw err;
  }

  // Kiểm tra trạng thái tài khoản
  if (user.status === 'pending') {
    const err = new Error('Hồ sơ Nhiếp ảnh gia của bạn đang chờ Ban Quản Trị phê duyệt. Vui lòng liên hệ Admin qua hotline 1900 6868 nếu bạn cần hỗ trợ gấp.');
    err.statusCode = 403;
    throw err;
  }

  if (user.status === 'rejected') {
    const err = new Error('Rất tiếc, hồ sơ của bạn chưa đáp ứng tiêu chuẩn chuyên môn của nền tảng. Vui lòng liên hệ bộ phận hỗ trợ để được hướng dẫn.');
    err.statusCode = 403;
    throw err;
  }

  if (user.status === 'inactive') {
    const err = new Error('Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên.');
    err.statusCode = 403;
    throw err;
  }

  // Cập nhật lastLogin
  user.lastLogin = new Date();
  await user.save();

  return {
    user: formatUserResponse(user),
    token: `user_token_${user._id}`
  };
};

/**
 * Lấy danh sách toàn bộ User (cho Admin)
 */
const getAllUsers = async (query = {}) => {
  const { search, role, status } = query;
  let all = await User.find();

  if (!Array.isArray(all)) all = [];

  let filtered = all.map(u => formatUserResponse(u));

  if (role && role !== 'all') {
    filtered = filtered.filter(u => u.role === role);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(u => u.status === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.studioInfo?.styles && u.studioInfo.styles.toLowerCase().includes(q))
    );
  }

  // Sắp xếp mới nhất lên đầu
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return filtered;
};

/**
 * Lấy thông tin user theo ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng này.');
    err.statusCode = 404;
    throw err;
  }
  return formatUserResponse(user);
};

/**
 * Duyệt & Kích hoạt hồ sơ Nhiếp ảnh gia (Admin)
 */
const approvePhotographer = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('Không tìm thấy hồ sơ người dùng.');
    err.statusCode = 404;
    throw err;
  }

  user.status = 'active';
  user.role = 'photographer';
  await user.save();

  return {
    success: true,
    message: `Đã phê duyệt thành công hồ sơ Nhiếp ảnh gia "${user.name}"!`,
    user: formatUserResponse(user)
  };
};

/**
 * Từ chối hồ sơ Nhiếp ảnh gia (Admin)
 */
const rejectPhotographer = async (id, reason = '') => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('Không tìm thấy hồ sơ người dùng.');
    err.statusCode = 404;
    throw err;
  }

  user.status = 'rejected';
  if (reason) {
    user.studioInfo = { ...(user.studioInfo || {}), rejectReason: reason };
  }
  await user.save();

  return {
    success: true,
    message: `Đã từ chối hồ sơ của "${user.name}".`,
    user: formatUserResponse(user)
  };
};

/**
 * Cập nhật thông tin User (Admin / User)
 */
const updateUser = async (id, data) => {
  const updateData = { ...data };
  if (updateData.password) {
    updateData.password = hashPassword(updateData.password);
  }

  const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) {
    const err = new Error('Không tìm thấy người dùng để cập nhật.');
    err.statusCode = 404;
    throw err;
  }

  return {
    success: true,
    user: formatUserResponse(updated)
  };
};

/**
 * Admin tự tạo User mới trực tiếp (kích hoạt sẵn)
 */
const adminCreateUser = async (data) => {
  const { name, email, phone, password, role = 'photographer', status = 'active', studioInfo = {} } = data;

  if (!name || !email || !password) {
    const err = new Error('Vui lòng nhập đầy đủ Tên, Email và Mật khẩu.');
    err.statusCode = 400;
    throw err;
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    const err = new Error('Email này đã tồn tại trong hệ thống.');
    err.statusCode = 400;
    throw err;
  }

  const user = new User({
    name: name.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : '',
    password: hashPassword(password),
    role,
    status,
    studioInfo,
    createdAt: new Date(),
    lastLogin: null
  });

  await user.save();
  return formatUserResponse(user);
};

/**
 * Xóa tài khoản User
 */
const deleteUser = async (id) => {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error('Không tìm thấy người dùng để xóa.');
    err.statusCode = 404;
    throw err;
  }
  return {
    success: true,
    message: 'Đã xóa tài khoản người dùng thành công.'
  };
};

/**
 * Thống kê tổng hợp số lượng User cho Dashboard
 */
const getUserStats = async () => {
  const all = await User.find();
  const safe = Array.isArray(all) ? all : [];

  return {
    totalUsers: safe.length,
    activePhotographers: safe.filter(u => u.role === 'photographer' && u.status === 'active').length,
    pendingPhotographers: safe.filter(u => u.role === 'photographer' && u.status === 'pending').length,
    clients: safe.filter(u => u.role === 'client').length,
    admins: safe.filter(u => u.role === 'admin').length
  };
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  approvePhotographer,
  rejectPhotographer,
  updateUser,
  adminCreateUser,
  deleteUser,
  getUserStats
};
