import express from 'express';
import {
  getDashboardStats,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/adminController.js';
import { isAuthenticated, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(restrictTo('admin', 'manager'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getUsersByRole);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
