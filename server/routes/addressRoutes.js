const express = require('express');
const router = express.Router();
const {
  getProvinces,
  getWardsByProvince,
  searchAddress
} = require('../controllers/addressController');

router.get('/provinces', getProvinces);
router.get('/wards/:provinceId', getWardsByProvince);
router.get('/search', searchAddress);

module.exports = router;
