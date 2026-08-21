const express = require('express');
const router = express.Router();
const photographerController = require('../controllers/photographerController');

// Endpoint công khai để khách đặt lịch
router.post('/bookings', photographerController.createBooking);

// Endpoints dành cho Nhiếp ảnh gia xem dữ liệu của mình
router.get('/overview', photographerController.getOverview);
router.get('/albums', photographerController.getAlbums);
router.get('/clients', photographerController.getClients);
router.get('/bookings', photographerController.getBookings);
router.put('/bookings/:id/status', photographerController.updateBookingStatus);
router.put('/bookings/:id', photographerController.updateBooking);
router.delete('/bookings/:id', photographerController.deleteBooking);

module.exports = router;
