const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const {
  validateCreateAlbum,
  validateSubmitSelection,
  validateManageToken
} = require('../middlewares/validate');

// Public routes for client & photo selection
router.post('/', validateCreateAlbum, albumController.createAlbum);
router.get('/:id', albumController.getAlbum);
router.post('/:id/verify-passcode', albumController.verifyPasscode);
router.post('/:id/submit', validateSubmitSelection, albumController.submitSelection);

// Admin management routes (Secured by manageToken)
router.get('/:id/manage', validateManageToken, albumController.getManageAlbum);
router.put('/:id/lock', validateManageToken, albumController.lockAlbum);
router.put('/:id/unlock', validateManageToken, albumController.unlockAlbum);

module.exports = router;
