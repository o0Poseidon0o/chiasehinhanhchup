const express = require('express');
const router = express.Router();
const addonController = require('../controllers/addonController');
const { validateAdminPassword } = require('../middlewares/validate');

// Reset default addons (đặt trước /:id)
router.post('/reset', validateAdminPassword, addonController.resetAddons);

// Public routes
router.get('/', addonController.getAddons);
router.get('/:id', addonController.getAddonById);

// Master Admin routes
router.post('/', validateAdminPassword, addonController.createAddon);
router.put('/:id', validateAdminPassword, addonController.updateAddon);
router.patch('/:id/toggle', validateAdminPassword, addonController.toggleAddonActive);
router.delete('/:id', validateAdminPassword, addonController.deleteAddon);

module.exports = router;
