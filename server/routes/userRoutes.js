const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateAdminPassword } = require('../middlewares/validate');

// Public routes (Đăng ký, Đăng nhập & Danh sách Nhiếp ảnh gia cho khách chọn)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/photographers', userController.getActivePhotographers);

// Admin & Management routes
router.get('/stats', validateAdminPassword, userController.getStats);
router.get('/', validateAdminPassword, userController.getUsers);
router.post('/', validateAdminPassword, userController.createUser);
router.get('/:id', validateAdminPassword, userController.getUser);
router.put('/:id', validateAdminPassword, userController.updateUser);
router.put('/:id/approve', validateAdminPassword, userController.approvePhotographer);
router.put('/:id/reject', validateAdminPassword, userController.rejectPhotographer);
router.delete('/:id', validateAdminPassword, userController.deleteUser);

module.exports = router;
