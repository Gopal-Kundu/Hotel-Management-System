import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const cleaningRooms = await Room.countDocuments({ status: 'cleaning' });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'checked-in' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    // Calculate total revenue
    const validBookings = await Booking.find({ status: { $ne: 'cancelled' } });
    let totalRevenue = 0;
    for (const b of validBookings) {
      totalRevenue += b.totalAmount || 0;
    }

    res.status(200).json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      cleaningRooms,
      totalBookings,
      activeBookings,
      pendingBookings,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

export const getUsersByRole = async (req, res) => {
  const { role } = req.query;
  try {
    const filter = {};
    if (role) {
      filter.role = role;
    } else {
      filter.role = { $ne: 'admin' }; // Don't return admins by default
    }

    const users = await User.find(filter).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      employeeDetails: {
        status: 'active',
        attendance: [],
      },
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      employeeDetails: user.employeeDetails,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin account' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    if (user.role !== 'customer') {
      if (status) user.employeeDetails.status = status;
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin account' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
