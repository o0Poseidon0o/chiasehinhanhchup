let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('⚠️ Ghi chú: Thư viện nodemailer chưa sẵn sàng:', e.message);
}
const Setting = require('../models/Setting');

/**
 * Lấy cấu hình email từ CSDL Setting (hoặc fallback sang biến môi trường .env)
 */
const getEmailConfig = async () => {
  let config = {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_PASS || '',
    senderName: 'Photodate.vn - Nền Tảng Nhiếp Ảnh',
    service: 'gmail'
  };

  try {
    const setting = await Setting.findOne({ key: 'contact_settings' });
    if (setting) {
      if (setting.emailUser) config.user = setting.emailUser.trim();
      if (setting.emailPass) config.pass = setting.emailPass.trim();
      if (setting.emailSenderName) config.senderName = setting.emailSenderName.trim();
      if (setting.emailService) config.service = setting.emailService.trim();
    }
  } catch (err) {
    console.warn('Không thể đọc cấu hình email từ Setting:', err.message);
  }

  return config;
};

/**
 * Khởi tạo Transporter cho Nodemailer
 */
const createTransporter = async () => {
  const config = await getEmailConfig();

  if (!nodemailer) {
    try {
      nodemailer = require('nodemailer');
    } catch (_) {
      const err = new Error('Thư viện gửi email (nodemailer) chưa được cài đặt trên máy chủ.');
      err.statusCode = 500;
      throw err;
    }
  }

  if (!config.user || !config.pass) {
    const err = new Error(
      'Hệ thống chưa được thiết lập tài khoản Gmail gửi thư. Vui lòng vào trang Quản trị Master Admin -> Cấu hình Email để cài đặt.'
    );
    err.statusCode = 400;
    throw err;
  }

  // Chuẩn hóa mật khẩu ứng dụng (loại bỏ khoảng trắng nếu người dùng copy dạng: abcd efgh ijkl mnop)
  const cleanPass = config.pass.replace(/\s+/g, '');

  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: cleanPass
    }
  });

  return { transporter, config };
};

/**
 * Gửi email chung
 */
const sendMail = async ({ to, subject, html, text }) => {
  const { transporter, config } = await createTransporter();

  const mailOptions = {
    from: `"${config.senderName}" <${config.user}>`,
    to: to.trim().toLowerCase(),
    subject,
    text: text || subject,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

/**
 * Gửi Email mã xác thực OTP & link Đặt lại mật khẩu
 */
const sendPasswordResetEmail = async ({ to, name, code, token, originUrl, role }) => {
  const recipientName = name || 'Quý khách';
  const roleDisplay = role === 'photographer' 
    ? 'Nhiếp Ảnh Gia' 
    : role === 'admin' 
    ? 'Quản Trị Viên' 
    : 'Khách Hàng';

  const baseUrl = originUrl ? originUrl.replace(/\/$/, '') : 'https://photodate.vn';
  const directResetLink = `${baseUrl}/?action=reset-password&token=${token}&email=${encodeURIComponent(to)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Khôi phục mật khẩu - Photodate.vn</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d12; color: #f1f5f9; margin: 0; padding: 20px; }
        .container { max-width: 540px; margin: 0 auto; background-color: #141720; border: 1px solid #242938; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1f2533 0%, #141720 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #242938; }
        .logo { font-size: 24px; font-weight: 900; color: #f59e0b; letter-spacing: -0.5px; margin-bottom: 4px; }
        .badge { display: inline-block; background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; margin-top: 6px; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
        .desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #0c0d12; border: 2px dashed #f59e0b; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .otp-label { font-size: 12px; color: #f59e0b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .otp-code { font-size: 36px; font-weight: 900; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; margin: 0; }
        .otp-expire { font-size: 12px; color: #64748b; margin-top: 8px; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0c0d12 !important; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 14px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35); }
        .warning { background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 12px 16px; font-size: 12px; color: #fca5a5; line-height: 1.5; margin-top: 24px; }
        .footer { padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e2433; background: #0f121a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Photodate.vn</div>
          <div style="font-size: 13px; color: #94a3b8;">Nền Tảng Kết Nối & Duyệt Ảnh Chuyên Nghiệp</div>
          <div class="badge">Tài khoản: ${roleDisplay}</div>
        </div>

        <div class="content">
          <div class="greeting">Xin chào ${recipientName},</div>
          <div class="desc">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này.
            Dưới đây là mã xác thực OTP dùng một lần của bạn:
          </div>

          <div class="otp-box">
            <div class="otp-label">MÃ XÁC THỰC BẢO MẬT (OTP)</div>
            <div class="otp-code">${code}</div>
            <div class="otp-expire">⏳ Mã có hiệu lực trong vòng <strong>15 phút</strong></div>
          </div>

          <div class="btn-wrapper">
            <a href="${directResetLink}" class="btn" target="_blank">
              👉 Bấm Vào Đây Để Đặt Lại Mật Khẩu Nhanh
            </a>
          </div>

          <div class="warning">
            ⚠️ <strong>Lưu ý bảo mật:</strong> Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ ngay hotline 0777 908 179 để được hỗ trợ. Tuyệt đối không chia sẻ mã OTP với bất kỳ ai.
          </div>
        </div>

        <div class="footer">
          Email này được gửi tự động từ hệ thống Photodate.vn.<br>
          © 2026 Photodate.vn • All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendMail({
    to,
    subject: `[Photodate] Mã xác thực đổi mật khẩu: ${code}`,
    html,
    text: `Xin chào ${recipientName}, Mã xác thực OTP đặt lại mật khẩu Photodate.vn của bạn là: ${code} (Hiệu lực trong 15 phút). Hoặc truy cập link sau: ${directResetLink}`
  });
};

/**
 * Kiểm tra kết nối và gửi email thử nghiệm cho Master Admin
 */
const verifyAndSendTestEmail = async (testToEmail) => {
  const { transporter, config } = await createTransporter();

  // 1. Kiểm tra xác thực với Gmail
  await transporter.verify();

  const to = (testToEmail || config.user).trim().toLowerCase();

  // 2. Gửi thử nghiệm
  const html = `
    <div style="font-family: Arial, sans-serif; background: #0c0d12; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #f59e0b; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #f59e0b; margin-top: 0;">🎉 Kết Nối Gmail Thành Công!</h2>
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        Hệ thống <strong>Photodate.vn</strong> đã kết nối thành công với tài khoản Gmail: <strong style="color: #38bdf8;">${config.user}</strong>.
      </p>
      <div style="background: #1e2433; padding: 14px; border-radius: 10px; font-size: 13px; color: #94a3b8; margin: 16px 0;">
        • Tên người gửi: <strong>${config.senderName}</strong><br>
        • Thời gian gửi: <strong>${new Date().toLocaleString('vi-VN')}</strong><br>
        • Trạng thái: <strong>Sẵn sàng gửi mã OTP và thông báo</strong>
      </div>
      <p style="font-size: 12px; color: #64748b;">
        Đây là email kiểm tra tự động được gửi từ tính năng cấu hình của Master Admin.
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${config.senderName}" <${config.user}>`,
    to,
    subject: `[Photodate] Kiểm tra cấu hình Gmail gửi thư thành công!`,
    html,
    text: `Hệ thống Photodate.vn đã kết nối thành công với tài khoản Gmail: ${config.user}. Sẵn sàng gửi mã OTP!`
  });

  return {
    success: true,
    message: `Đã gửi thư thử nghiệm thành công tới ${to}!`,
    sender: config.user,
    messageId: info.messageId
  };
};

module.exports = {
  getEmailConfig,
  sendMail,
  sendPasswordResetEmail,
  verifyAndSendTestEmail
};
