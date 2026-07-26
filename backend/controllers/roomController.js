import Room from '../models/Room.js';

export const getAllRooms = async (req, res) => {
  const { type, status, page, limit, maxPrice } = req.query;
  try {
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    if (status && status !== 'All') filter.status = status.toLowerCase();
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };

    if (page) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 6;
      const skipNum = (pageNum - 1) * limitNum;

      const totalRooms = await Room.countDocuments(filter);
      const rooms = await Room.find(filter)
        .skip(skipNum)
        .limit(limitNum);

      return res.status(200).json({
        rooms,
        totalPages: Math.ceil(totalRooms / limitNum),
        currentPage: pageNum,
        totalRooms,
      });
    }

    const rooms = await Room.find(filter);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error: error.message });
  }
};

export const createRoom = async (req, res) => {
  const { roomNumber, type, price, description, images } = req.body;
  try {
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: `Room ${roomNumber} already exists` });
    }

    const room = await Room.create({
      roomNumber,
      type,
      price,
      description,
      images: images || [],
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
};

export const updateRoomAvailability = async (req, res) => {
  const { status } = req.body;
  try {
    if (!['available', 'occupied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid room status' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.status = status;
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
};

export const getTopFeaturedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ price: -1 }).limit(6);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured rooms', error: error.message });
  }
};

