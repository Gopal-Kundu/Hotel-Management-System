import express from 'express';
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBookingStatus,
  requestRoomService,
  updateRoomServiceStatus,
} from '../controllers/bookingController.js';
import { isAuthenticated, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Customer bookings routes
router.post('/', restrictTo('customer'), createBooking);
router.get('/my-bookings', restrictTo('customer'), getMyBookings);
router.post('/:id/room-service', restrictTo('customer'), requestRoomService);

// General bookings check (Staff & Admin)
router.get('/', restrictTo('admin', 'manager', 'employee'), getAllBookings);

// Booking status update (Customer cancel or Manager check-in/out)
router.put('/:id/status', restrictTo('admin', 'manager', 'customer'), updateBookingStatus);

// Room service fulfillment
router.put('/:id/room-service/:reqId', restrictTo('admin', 'manager', 'employee'), updateRoomServiceStatus);

export default router;
