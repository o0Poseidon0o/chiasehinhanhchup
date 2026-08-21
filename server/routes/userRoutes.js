const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateAdminPassword } = require('../middlewares/validate');

// Public routes (Đăng ký, Đăng nhập & Danh sách Nhiếp ảnh gia cho khách chọn)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/photographers', userController.getActivePhotographers);

// Self Profile Update (Nhiếp ảnh gia tự cập nhật profile cá nhân)
router.put('/profile/:id', userController.updateUser);
router.put('/:id', userController.updateUser);

// Admin & Management routes
router.get('/stats', validateAdminPassword, userController.getStats);
router.get('/', validateAdminPassword, userController.getUsers);
router.post('/', validateAdminPassword, userController.createUser);
router.get('/:id', validateAdminPassword, userController.getUser);
router.put('/:id/approve', validateAdminPassword, userController.approvePhotographer);
router.put('/:id/reject', validateAdminPassword, userController.rejectPhotographer);
router.delete('/:id', validateAdminPassword, userController.deleteUser);

module.exports = router;
