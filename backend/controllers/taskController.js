import Task from '../models/Task.js';
import User from '../models/User.js';

export const createTask = async (req, res) => {
  const { title, description, assignedTo, roomId } = req.body;
  try {
    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== 'employee') {
      return res.status(400).json({ message: 'Can only assign tasks to active employees' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      room: roomId || null,
      status: 'pending',
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email employeeDetails')
      .populate('assignedBy', 'name email')
      .populate('room', 'roomNumber type')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedBy', 'name email')
      .populate('room', 'roomNumber type status')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this task' });
    }

    task.status = status;
    task.completedAt = status === 'completed' ? new Date() : null;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyMarked = user.employeeDetails.attendance.some((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    user.employeeDetails.attendance.push({
      date: new Date(),
      status: 'present',
    });

    await user.save();
    res.status(200).json({
      message: 'Attendance marked successfully',
      attendance: user.employeeDetails.attendance,
    });
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};
