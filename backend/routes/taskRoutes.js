import express from 'express';
import {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTaskStatus,
  markAttendance,
} from '../controllers/taskController.js';
import { isAuthenticated, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Attendance can be marked by anyone in staff
router.post('/attendance', restrictTo('employee', 'manager', 'admin'), markAttendance);

// Manager task controls
router.post('/', restrictTo('admin', 'manager'), createTask);
router.get('/', restrictTo('admin', 'manager'), getAllTasks);

// Employee task viewing and status modification
router.get('/my-tasks', restrictTo('employee'), getMyTasks);
router.put('/:id/status', restrictTo('employee', 'manager'), updateTaskStatus);

export default router;
