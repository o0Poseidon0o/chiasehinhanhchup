const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { validateAdminPassword } = require('../middlewares/validate');

// Public: Get contact settings
router.get('/contact', settingController.getContactSettings);

// Master Admin: Update contact settings
router.put('/contact', validateAdminPassword, settingController.updateContactSettings);

// Master Admin: Quick approve all pending photographers
router.post('/approve-all-pending-photographers', validateAdminPassword, settingController.approveAllPendingPhotographers);

module.exports = router;
