const express = require('express');
const router = express.Router();
const locationGuideController = require('../controllers/locationGuideController');
const { validateAdminPassword } = require('../middlewares/validate');

// Public routes
router.get('/', locationGuideController.getLocations);
router.get('/:id', locationGuideController.getLocationById);

// Admin-protected routes
router.post('/reset', validateAdminPassword, locationGuideController.resetLocations);
router.get('/reset', validateAdminPassword, locationGuideController.resetLocations);
router.post('/', validateAdminPassword, locationGuideController.createLocation);
router.put('/:id', validateAdminPassword, locationGuideController.updateLocation);
router.delete('/:id', validateAdminPassword, locationGuideController.deleteLocation);

module.exports = router;
