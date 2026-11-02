const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// Lấy danh sách templates (Hỗ trợ cả Studio, Khách và Admin)
router.get('/', templateController.getTemplates);

// Nhập hàng loạt khung PNG Template từ link Google Drive
router.post('/import-drive', templateController.importDriveTemplates);

// Khôi phục bộ Template mặc định
router.post('/reset', templateController.resetTemplates);

// Tạo mới / Lưu Template
router.post('/', templateController.createTemplate);

// Cập nhật Template (Bố cục, ghim Featured, ẩn/hiện, lượt dùng)
router.put('/:id', templateController.updateTemplate);

// Xóa Template
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;

