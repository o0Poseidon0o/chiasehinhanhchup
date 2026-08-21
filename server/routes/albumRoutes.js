const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const {
  validateCreateAlbum,
  validateSubmitSelection,
  validateManageToken,
  validateAdminPassword
} = require('../middlewares/validate');

// Admin Auth route
router.post('/admin/login', albumController.verifyAdminPassword);

// Public routes for client & photo selection
router.get('/public', albumController.getPublicAlbums);
router.post('/parse-drive', albumController.parseDriveUrl);
router.get('/proxy-image/:fileId', albumController.proxyImage);
router.post('/', validateCreateAlbum, albumController.createAlbum);
router.get('/', validateAdminPassword, albumController.getAlbums);
router.post('/sync-all', validateAdminPassword, albumController.syncAllAlbums);
router.post('/bulk-delete', validateAdminPassword, albumController.deleteBulkAlbums);
router.get('/:id', albumController.getAlbum);
router.delete('/:id', albumController.deleteAlbum);
router.post('/:id/verify-passcode', albumController.verifyPasscode);
router.post('/:id/submit', validateSubmitSelection, albumController.submitSelection);

// Admin management routes (Secured by manageToken)
router.post('/:id/sync', albumController.syncAlbum);
router.get('/:id/manage', validateManageToken, albumController.getManageAlbum);
router.put('/:id/settings', albumController.updateAlbumSettings);
router.put('/:id/lock', validateManageToken, albumController.lockAlbum);
router.put('/:id/unlock', validateManageToken, albumController.unlockAlbum);

module.exports = router;
