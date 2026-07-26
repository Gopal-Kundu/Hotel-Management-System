import express from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomAvailability,
  getTopFeaturedRooms,
} from '../controllers/roomController.js';
import { isAuthenticated, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/top-featured', getTopFeaturedRooms);
router.get('/', getAllRooms);
router.get('/:id', getRoomById);

// Admin/Manager routes
router.post('/', isAuthenticated, restrictTo('admin', 'manager'), createRoom);
router.put('/:id', isAuthenticated, restrictTo('admin', 'manager'), updateRoom);
router.delete('/:id', isAuthenticated, restrictTo('admin', 'manager'), deleteRoom);

// Staff updates
router.put('/:id/availability', isAuthenticated, restrictTo('manager', 'admin'), updateRoomAvailability);

export default router;
