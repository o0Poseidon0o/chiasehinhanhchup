const Setting = require('../models/Setting');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy thông tin cấu hình liên hệ (Hotline, Telegram, Zalo, Messenger, Pill)
 * @route   GET /api/settings/contact
 * @access  Public
 */
const getContactSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne({ key: 'contact_settings' });
  if (!setting) {
    setting = await Setting.findOneAndUpdate(
      { key: 'contact_settings' },
      { key: 'contact_settings' },
      { new: true, upsert: true }
    );
  }

  res.status(200).json({
    success: true,
    data: setting
  });
});

/**
 * @desc    Cập nhật thông tin cấu hình liên hệ
 * @route   PUT /api/settings/contact
 * @access  Master Admin
 */
const updateContactSettings = asyncHandler(async (req, res) => {
  const {
    hotline,
    hotlineDisplay,
    hotlineHours,
    enableHotline,
    telegramUrl,
    telegramSubtext,
    enableTelegram,
    zaloUrl,
    zaloSubtext,
    enableZalo,
    messengerUrl,
    messengerSubtext,
    enableMessenger,
    supportPillText,
    supportPillSubtext,
    enableSupportPill,
    autoApprovePhotographer
  } = req.body;

  const updateData = {
    key: 'contact_settings',
    updatedAt: new Date()
  };

  if (hotline !== undefined) updateData.hotline = String(hotline).trim();
  if (hotlineDisplay !== undefined) updateData.hotlineDisplay = String(hotlineDisplay).trim();
  if (hotlineHours !== undefined) updateData.hotlineHours = String(hotlineHours).trim();
  if (enableHotline !== undefined) updateData.enableHotline = Boolean(enableHotline);

  if (telegramUrl !== undefined) updateData.telegramUrl = String(telegramUrl).trim();
  if (telegramSubtext !== undefined) updateData.telegramSubtext = String(telegramSubtext).trim();
  if (enableTelegram !== undefined) updateData.enableTelegram = Boolean(enableTelegram);

  if (zaloUrl !== undefined) updateData.zaloUrl = String(zaloUrl).trim();
  if (zaloSubtext !== undefined) updateData.zaloSubtext = String(zaloSubtext).trim();
  if (enableZalo !== undefined) updateData.enableZalo = Boolean(enableZalo);

  if (messengerUrl !== undefined) updateData.messengerUrl = String(messengerUrl).trim();
  if (messengerSubtext !== undefined) updateData.messengerSubtext = String(messengerSubtext).trim();
  if (enableMessenger !== undefined) updateData.enableMessenger = Boolean(enableMessenger);

  if (supportPillText !== undefined) updateData.supportPillText = String(supportPillText).trim();
  if (supportPillSubtext !== undefined) updateData.supportPillSubtext = String(supportPillSubtext).trim();
  if (enableSupportPill !== undefined) updateData.enableSupportPill = Boolean(enableSupportPill);
  if (autoApprovePhotographer !== undefined) updateData.autoApprovePhotographer = Boolean(autoApprovePhotographer);

  const updated = await Setting.findOneAndUpdate(
    { key: 'contact_settings' },
    updateData,
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Đã lưu cấu hình liên hệ thành công!',
    data: updated
  });
});

/**
 * @desc    Kích hoạt nhanh toàn bộ tài khoản Nhiếp ảnh gia đang chờ duyệt
 * @route   POST /api/settings/approve-all-pending-photographers
 * @access  Master Admin
 */
const approveAllPendingPhotographers = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const pendingUsers = await User.find({ role: 'photographer', status: 'pending' });
  const count = pendingUsers.length;

  if (count > 0) {
    for (const u of pendingUsers) {
      u.status = 'active';
      await u.save();
    }
  }

  res.status(200).json({
    success: true,
    count,
    message: `Đã kích hoạt thành công ${count} tài khoản Nhiếp ảnh gia đang chờ duyệt!`
  });
});

/**
 * @desc    Lấy thông tin cấu hình Email của hệ thống (Master Admin)
 * @route   GET /api/settings/email
 * @access  Master Admin
 */
const getEmailSettings = asyncHandler(async (req, res) => {
  const emailService = require('../services/emailService');
  const config = await emailService.getEmailConfig();
  
  res.status(200).json({
    success: true,
    data: {
      emailUser: config.user || '',
      emailSenderName: config.senderName || 'Photodate.vn',
      emailService: config.service || 'gmail',
      emailHost: config.host || '',
      emailPort: config.port || 587,
      emailSecure: Boolean(config.secure),
      isConfigured: Boolean(config.user && config.pass),
      hasPassword: Boolean(config.pass)
    }
  });
});

/**
 * @desc    Cập nhật thông tin cấu hình Email Gmail / SMTP (Master Admin)
 * @route   PUT /api/settings/email
 * @access  Master Admin
 */
const updateEmailSettings = asyncHandler(async (req, res) => {
  const { emailUser, emailPass, emailSenderName, emailService, emailHost, emailPort, emailSecure } = req.body;

  const updateData = {
    updatedAt: new Date()
  };

  if (emailUser !== undefined) updateData.emailUser = String(emailUser).trim();
  if (emailPass !== undefined && emailPass.trim() && !emailPass.includes('•••')) {
    updateData.emailPass = String(emailPass).trim();
  }
  if (emailSenderName !== undefined) updateData.emailSenderName = String(emailSenderName).trim();
  if (emailService !== undefined) updateData.emailService = String(emailService).trim();
  if (emailHost !== undefined) updateData.emailHost = String(emailHost).trim();
  if (emailPort !== undefined) updateData.emailPort = Number(emailPort) || 587;
  if (emailSecure !== undefined) updateData.emailSecure = Boolean(emailSecure);

  const updated = await Setting.findOneAndUpdate(
    { key: 'contact_settings' },
    updateData,
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Đã lưu thông tin cấu hình Email thành công!',
    data: {
      emailUser: updated.emailUser || '',
      emailSenderName: updated.emailSenderName || 'Photodate.vn',
      emailService: updated.emailService || 'gmail',
      emailHost: updated.emailHost || '',
      emailPort: updated.emailPort || 587,
      emailSecure: Boolean(updated.emailSecure),
      isConfigured: Boolean(updated.emailUser && updated.emailPass)
    }
  });
});

/**
 * @desc    Gửi email thử nghiệm (Test Email Connection)
 * @route   POST /api/settings/email/test
 * @access  Master Admin
 */
const testEmailSettings = asyncHandler(async (req, res) => {
  const emailService = require('../services/emailService');
  const targetEmail = req.body.testEmail || req.body.to || req.body.email;
  const result = await emailService.verifyAndSendTestEmail(targetEmail);
  res.status(200).json(result);
});

module.exports = {
  getContactSettings,
  updateContactSettings,
  approveAllPendingPhotographers,
  getEmailSettings,
  updateEmailSettings,
  testEmailSettings
};
