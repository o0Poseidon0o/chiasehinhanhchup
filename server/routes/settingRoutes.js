const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { validateAdminPassword } = require('../middlewares/validate');

// Public: Get contact settings
router.get('/contact', settingController.getContactSettings);

// Master Admin: Update contact settings
router.put('/contact', validateAdminPassword, settingController.updateContactSettings);

module.exports = router;
