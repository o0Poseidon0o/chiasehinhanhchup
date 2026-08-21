const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateAdminPassword } = require('../middlewares/validate');

// Master Admin Reset routes (phải đứng trước /:id)
router.post('/reset', validateAdminPassword, categoryController.resetCategories);
router.get('/reset', validateAdminPassword, categoryController.resetCategories);

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Master Admin CRUD routes
router.post('/', validateAdminPassword, categoryController.createCategory);
router.put('/:id', validateAdminPassword, categoryController.updateCategory);
router.delete('/:id', validateAdminPassword, categoryController.deleteCategory);

module.exports = router;
