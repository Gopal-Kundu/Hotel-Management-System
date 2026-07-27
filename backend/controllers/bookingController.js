import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

export const createBooking = async (req, res) => {
  const { roomId, checkInDate, checkOutDate } = req.body;
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status !== 'available') {
      return res.status(400).json({ message: 'Room is not available for booking' });
    }

    // Calculate dates
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = diffDays * room.price;

    const booking = await Booking.create({
      customer: req.user._id,
      room: roomId,
      checkInDate: start,
      checkOutDate: end,
      totalAmount,
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('room', 'roomNumber type price status')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('room', 'roomNumber type price status description images')
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your bookings', error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const booking = await Booking.findById(id).populate('room');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role === 'customer' && booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to change this booking' });
    }

    if (req.user.role === 'customer') {
      if (status !== 'cancelled') {
        return res.status(400).json({ message: 'Customers can only cancel bookings' });
      }
      if (booking.status !== 'pending' && booking.status !== 'accepted') {
        return res.status(400).json({ message: 'Cannot cancel booking at this stage' });
      }
    }

    booking.status = status;

    if (status === 'checked-in') {
      await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });
    } else if (status === 'checked-out') {
      await Room.findByIdAndUpdate(booking.room._id, { status: 'available' });
    } else if (status === 'cancelled') {
      await Room.findByIdAndUpdate(booking.room._id, { status: 'available' });
    } else if (status === 'accepted') {
      await Room.findByIdAndUpdate(booking.room._id, { status: 'available' });
    }

    await booking.save();
    
    // Fetch updated booking with details
    const updatedBooking = await Booking.findById(id)
      .populate('customer', 'name email')
      .populate('room');

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};


export const requestRoomService = async (req, res) => {
  const { id } = req.params;
  const { requestType } = req.body;
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({ message: 'Can only request room service during active check-in' });
    }

    booking.roomServiceRequests.push({
      requestType,
      status: 'pending',
    });

    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Room service request failed', error: error.message });
  }
};

export const updateRoomServiceStatus = async (req, res) => {
  const { id, reqId } = req.params;
  const { status } = req.body;
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const request = booking.roomServiceRequests.id(reqId);
    if (!request) {
      return res.status(404).json({ message: 'Room service request not found' });
    }

    request.status = status;
    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service status', error: error.message });
  }
};


