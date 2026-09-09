const crypto = require('crypto');
const User = require('../models/User');
const Setting = require('../models/Setting');
const emailService = require('./emailService');

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
  delete obj.resetPasswordCode;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
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

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = (phone || '').trim();

  // Kiểm tra trùng lặp email
  const existingEmail = await User.findOne({ email: cleanEmail });
  if (existingEmail) {
    const err = new Error('Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác hoặc Đăng nhập.');
    err.statusCode = 409;
    throw err;
  }

  // Kiểm tra trùng lặp số điện thoại (nếu có nhập)
  if (cleanPhone) {
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      const err = new Error('Số điện thoại này đã được đăng ký.');
      err.statusCode = 409;
      throw err;
    }
  }

  // Lấy cấu hình tự động duyệt NAG từ Setting
  let autoApprovePhotographer = true;
  try {
    const setting = await Setting.findOne({ key: 'contact_settings' });
    if (setting && setting.autoApprovePhotographer !== undefined) {
      autoApprovePhotographer = Boolean(setting.autoApprovePhotographer);
    }
  } catch (_) {}

  // Nếu là Nhiếp ảnh gia -> Chỉ bắt buộc có link Portfolio khi chế độ kiểm duyệt BẬT (autoApprovePhotographer === false)
  if (role === 'photographer') {
    if (!autoApprovePhotographer && (!studioInfo.portfolioUrl || !studioInfo.portfolioUrl.trim())) {
      const err = new Error('Nhiếp ảnh gia cần cung cấp Link Portfolio / Facebook / Instagram để Ban Quản Trị kiểm duyệt.');
      err.statusCode = 400;
      throw err;
    }
  }

  // Trạng thái: Nếu autoApprovePhotographer = true -> Kích hoạt ngay ('active'); Ngược lại -> 'pending' (Chờ duyệt)
  const userStatus = (role === 'photographer' && !autoApprovePhotographer) ? 'pending' : 'active';

  const user = new User({
    name: name.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : '',
    password: hashPassword(password),
    role: role === 'photographer' ? 'photographer' : 'client',
    status: userStatus,
    studioInfo: {
      avatar: studioInfo.avatar ? studioInfo.avatar.trim() : '',
      startingPrice: studioInfo.startingPrice ? studioInfo.startingPrice.trim() : '',
      badge: studioInfo.badge ? studioInfo.badge.trim() : 'Verified Pro',
      coverImage: studioInfo.coverImage ? studioInfo.coverImage.trim() : '',
      portfolioUrl: studioInfo.portfolioUrl ? studioInfo.portfolioUrl.trim() : 'https://photodate.vn',
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
    autoApprove: autoApprovePhotographer,
    message: role === 'photographer' 
      ? (autoApprovePhotographer 
          ? 'Đăng ký thành công! Chế độ trải nghiệm đang mở, tài khoản Nhiếp ảnh gia của bạn đã được kích hoạt ngay.'
          : 'Đăng ký thành công! Hồ sơ Nhiếp ảnh gia của bạn đã được chuyển tới Ban Quản Trị để kiểm duyệt trong 24h.')
      : 'Đăng ký tài khoản thành công!'
  };
};

/**
 * Đăng nhập người dùng
 */
const loginUser = async ({ emailOrPhone, password }) => {
  const cleanInput = String(emailOrPhone || '').trim();
  const cleanUser = cleanInput.toLowerCase();
  const cleanPassword = String(password || '').trim();
  const defaultAdminPass = String(process.env.ADMIN_PASSWORD || 'admin123').trim();

  let masterAdminPassword = defaultAdminPass;
  try {
    const setting = await Setting.findOne({ key: 'contact_settings' });
    if (setting && setting.adminPassword) {
      masterAdminPassword = String(setting.adminPassword).trim();
    }
  } catch (_) {}

  // 1. Nếu nhập trực tiếp tài khoản & mật khẩu Master Admin
  const isMasterAdminUser = !cleanUser || cleanUser === 'admin' || cleanUser === 'admin@potonow.vn' || cleanUser === 'admin@photodate.vn';
  const isMasterAdminPass = cleanPassword === defaultAdminPass || cleanPassword === masterAdminPassword;

  if (isMasterAdminPass && isMasterAdminUser) {
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

  if (!cleanInput) {
    const err = new Error('Vui lòng nhập Email hoặc Số điện thoại.');
    err.statusCode = 400;
    throw err;
  }

  if (!cleanPassword) {
    const err = new Error('Vui lòng nhập Mật khẩu.');
    err.statusCode = 400;
    throw err;
  }

  const isEmail = cleanInput.includes('@');
  const user = await User.findOne(isEmail ? { email: cleanInput.toLowerCase() } : { phone: cleanInput });

  if (!user) {
    // Kiểm tra nếu nhập mật khẩu admin với tài khoản bất kỳ (Master key)
    if (isMasterAdminPass) {
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

  // Kiểm tra password người dùng
  const hashedPassword = hashPassword(cleanPassword);
  if (user.password !== hashedPassword && !isMasterAdminPass) {
    const err = new Error('Tài khoản hoặc mật khẩu không chính xác.');
    err.statusCode = 401;
    throw err;
  }

  // Kiểm tra trạng thái tài khoản
  if (user.status === 'pending') {
    let autoApprovePhotographer = false;
    try {
      const setting = await Setting.findOne({ key: 'contact_settings' });
      if (setting && setting.autoApprovePhotographer) {
        autoApprovePhotographer = true;
      }
    } catch (_) {}

    if (autoApprovePhotographer) {
      // Chế độ trải nghiệm tự do đang mở -> Kích hoạt ngay cho NAG đăng nhập!
      user.status = 'active';
      await user.save();
    } else {
      const err = new Error('Hồ sơ Nhiếp ảnh gia của bạn đang chờ Ban Quản Trị phê duyệt. Vui lòng liên hệ Admin qua hotline 0777908179 nếu bạn cần hỗ trợ gấp.');
      err.statusCode = 403;
      throw err;
    }
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

  // Deep merge studioInfo với dữ liệu hiện tại để không bao giờ bị mất avatar/coverImage khi sửa 1 trong 2
  const existingUser = await User.findById(id);
  if (existingUser && updateData.studioInfo) {
    const mergedStudioInfo = {
      ...(existingUser.studioInfo || {}),
      ...updateData.studioInfo
    };

    // Giữ lại avatar/coverImage cũ nếu data mới gửi sang là chuỗi rỗng
    if (!updateData.studioInfo.avatar && existingUser.studioInfo?.avatar) {
      mergedStudioInfo.avatar = existingUser.studioInfo.avatar;
    }
    if (!updateData.studioInfo.coverImage && existingUser.studioInfo?.coverImage) {
      mergedStudioInfo.coverImage = existingUser.studioInfo.coverImage;
    }

    // Chuẩn hóa link Google Drive thành direct link có thể nhúng trực tiếp
    if (mergedStudioInfo.avatar && typeof mergedStudioInfo.avatar === 'string' && mergedStudioInfo.avatar.includes('drive.google.com')) {
      const match = mergedStudioInfo.avatar.match(/\/d\/([a-zA-Z0-9_-]+)/) || mergedStudioInfo.avatar.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        mergedStudioInfo.avatar = `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    if (mergedStudioInfo.coverImage && typeof mergedStudioInfo.coverImage === 'string' && mergedStudioInfo.coverImage.includes('drive.google.com')) {
      const match = mergedStudioInfo.coverImage.match(/\/d\/([a-zA-Z0-9_-]+)/) || mergedStudioInfo.coverImage.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        mergedStudioInfo.coverImage = `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }

    updateData.studioInfo = mergedStudioInfo;
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

/**
 * Yêu cầu đặt lại mật khẩu - Tạo mã OTP 6 số và gửi qua Email
 */
const forgotPassword = async ({ email, originUrl }) => {
  const cleanInput = String(email || '').trim();
  if (!cleanInput) {
    const err = new Error('Vui lòng nhập Email hoặc Số điện thoại của bạn.');
    err.statusCode = 400;
    throw err;
  }

  const isEmail = cleanInput.includes('@');
  let user = null;

  if (isEmail) {
    user = await User.findOne({ email: cleanInput.toLowerCase() });
  } else {
    // Tìm bằng số điện thoại
    const cleanPhone = cleanInput.replace(/\D/g, '');
    user = await User.findOne({ phone: cleanPhone });
  }

  // Nếu là email/tài khoản Master Admin đặc biệt mà chưa có trong bảng User
  const isMasterAdminEmail = cleanInput.toLowerCase() === 'admin@potonow.vn' || cleanInput.toLowerCase() === 'admin@photodate.vn' || cleanInput.toLowerCase() === 'admin';
  if (!user && isMasterAdminEmail) {
    user = new User({
      name: 'Quản Trị Hệ Thống (Master Admin)',
      email: 'admin@potonow.vn',
      phone: '19006868',
      password: hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
      role: 'admin',
      status: 'active'
    });
    await user.save();
  }

  if (!user) {
    const err = new Error('Không tìm thấy tài khoản nào phù hợp trên hệ thống.');
    err.statusCode = 404;
    throw err;
  }

  if (!user.email) {
    const err = new Error(
      `Tài khoản "${user.name}" (SĐT: ${user.phone}) chưa cập nhật địa chỉ email nhận OTP. Vui lòng liên hệ Master Admin để được đặt lại mật khẩu trực tiếp.`
    );
    err.statusCode = 400;
    throw err;
  }

  // Tạo mã OTP 6 chữ số ngẫu nhiên
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  // Tạo token ngẫu nhiên cho link nhấp trực tiếp
  const resetToken = crypto.randomBytes(24).toString('hex');
  // Hết hạn sau 15 phút
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  user.resetPasswordCode = resetCode;
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = expires;
  await user.save();

  // Gửi email qua emailService
  await emailService.sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    code: resetCode,
    token: resetToken,
    originUrl,
    role: user.role
  });

  // Che bớt email để bảo mật thông tin (vd: l***n@gmail.com)
  const atIndex = user.email.indexOf('@');
  const maskedEmail = atIndex > 2 
    ? `${user.email[0]}***${user.email[atIndex - 1]}${user.email.slice(atIndex)}` 
    : user.email;

  return {
    success: true,
    message: `Đã gửi mã xác thực 6 chữ số đến email "${maskedEmail}". Vui lòng kiểm tra hộp thư (cả mục Spam/Quảng cáo).`,
    email: user.email
  };
};

/**
 * Xác thực mã OTP trước khi đổi mật khẩu
 */
const verifyResetCode = async ({ email, code }) => {
  if (!email || !code) {
    const err = new Error('Thiếu email hoặc mã xác nhận.');
    err.statusCode = 400;
    throw err;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = String(code).trim();

  let user = await User.findOne({ email: cleanEmail });
  if (!user) {
    const err = new Error('Tài khoản không tồn tại.');
    err.statusCode = 404;
    throw err;
  }

  if (!user.resetPasswordCode || user.resetPasswordCode !== cleanCode) {
    const err = new Error('Mã xác thực OTP không chính xác.');
    err.statusCode = 400;
    throw err;
  }

  if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
    const err = new Error('Mã xác thực đã hết hạn (chỉ có hiệu lực trong 15 phút). Vui lòng yêu cầu mã mới.');
    err.statusCode = 400;
    throw err;
  }

  return {
    success: true,
    message: 'Mã xác thực chính xác!'
  };
};

/**
 * Đặt lại mật khẩu mới
 */
const resetPassword = async ({ email, code, token, newPassword }) => {
  if (!email || !email.trim()) {
    const err = new Error('Thiếu địa chỉ email.');
    err.statusCode = 400;
    throw err;
  }

  if (!newPassword || newPassword.length < 6) {
    const err = new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    err.statusCode = 400;
    throw err;
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    const err = new Error('Tài khoản không tồn tại.');
    err.statusCode = 404;
    throw err;
  }

  // Kiểm tra thời hạn
  if (!user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
    const err = new Error('Mã xác thực hoặc liên kết đổi mật khẩu đã hết hạn. Vui lòng gửi lại yêu cầu.');
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra hoặc bằng code hoặc bằng token
  const validByCode = code && user.resetPasswordCode && String(user.resetPasswordCode).trim() === String(code).trim();
  const validByToken = token && user.resetPasswordToken && user.resetPasswordToken === token;

  if (!validByCode && !validByToken) {
    const err = new Error('Mã xác thực hoặc liên kết đặt lại mật khẩu không hợp lệ.');
    err.statusCode = 400;
    throw err;
  }

  // Cập nhật mật khẩu mới
  user.password = hashPassword(newPassword);
  user.resetPasswordCode = null;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  // Nếu là Master Admin hoặc user có role admin, cập nhật cả mật khẩu Master Admin trong Setting
  if (user.role === 'admin' || cleanEmail === 'admin@potonow.vn' || cleanEmail === 'admin@photodate.vn') {
    try {
      await Setting.findOneAndUpdate(
        { key: 'contact_settings' },
        { adminPassword: newPassword, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (_) {}
  }

  return {
    success: true,
    message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.'
  };
};

/**
 * Master Admin trực tiếp đặt lại mật khẩu cho bất kỳ User / NAG nào
 */
const adminResetPassword = async (id, { newPassword, sendEmail = true }) => {
  if (!newPassword || String(newPassword).trim().length < 6) {
    const err = new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    err.statusCode = 400;
    throw err;
  }

  const cleanPassword = String(newPassword).trim();

  // Xử lý nếu là master_admin
  if (id === 'master_admin') {
    await Setting.findOneAndUpdate(
      { key: 'contact_settings' },
      { adminPassword: cleanPassword, updatedAt: new Date() },
      { upsert: true }
    );
    return {
      success: true,
      message: 'Đã cập nhật mật khẩu Master Admin thành công!'
    };
  }

  const user = await User.findById(id);
  if (!user) {
    const err = new Error('Không tìm thấy tài khoản người dùng.');
    err.statusCode = 404;
    throw err;
  }

  user.password = hashPassword(cleanPassword);
  user.resetPasswordCode = null;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  // Nếu user có role là admin, cập nhật cả Setting
  if (user.role === 'admin') {
    try {
      await Setting.findOneAndUpdate(
        { key: 'contact_settings' },
        { adminPassword: cleanPassword, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (_) {}
  }

  let emailNotice = '';
  // Gửi email thông báo nếu được yêu cầu và user có email
  if (sendEmail && user.email) {
    try {
      await emailService.sendAdminResetNotificationEmail({
        to: user.email,
        name: user.name,
        newPassword: cleanPassword,
        role: user.role
      });
      emailNotice = ` và đã gửi email thông báo tới "${user.email}"`;
    } catch (mailErr) {
      console.warn('Không thể gửi email thông báo mật khẩu mới:', mailErr.message);
      emailNotice = ` (Lưu ý: Không thể gửi email thông báo: ${mailErr.message})`;
    }
  }

  return {
    success: true,
    message: `Đã đổi mật khẩu thành công cho "${user.name}"${emailNotice}!`,
    data: {
      userId: user._id,
      name: user.name,
      email: user.email,
      newPassword: cleanPassword
    }
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
  getUserStats,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  adminResetPassword
};
