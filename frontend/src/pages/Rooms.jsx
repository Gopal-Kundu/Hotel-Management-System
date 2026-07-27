import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Filter, AlertCircle, ChevronRight, X
} from 'lucide-react';
import api from '../utils/api.js';
import { toast } from 'sonner';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { roomStart, roomSuccess, roomFailure } from '../store/roomSlice.js';
import { setClickedBookNow } from '../store/authSlice.js';

const Rooms = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { rooms, loading, totalPages } = useSelector((state) => state.room);
  const navigate = useNavigate();
  const location = useLocation();

  // Local pagination page state
  const [page, setPage] = useState(1);

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [priceRange, setPriceRange] = useState(0);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);



  // Booking details modal
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingDays, setBookingDays] = useState(1);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Expanded Room Details view state
  const [selectedDetailRoom, setSelectedDetailRoom] = useState(null);

  useEffect(() => {
    fetchRooms(1);
    // Default dates (today & tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setCheckInDate(today.toISOString().split('T')[0]);
    setCheckOutDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const detailId = params.get('roomDetailsId');
    if (detailId) {
      const fetchDetailRoom = async () => {
        try {
          const res = await api.get(`/rooms/${detailId}`);
          setSelectedDetailRoom(res.data);
        } catch (err) {
          console.error(err);
          setSelectedDetailRoom(null);
        }
      };
      fetchDetailRoom();
    } else {
      setSelectedDetailRoom(null);
    }
  }, [location.search]);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        setBookingDays(diffDays);
      } else {
        setBookingDays(1);
      }
    }
  }, [checkInDate, checkOutDate]);

  const fetchRooms = async (pageNumber = 1) => {
    dispatch(roomStart());
    try {
      const params = {
        page: pageNumber,
        limit: 6
      };
      if (filterType !== 'All') params.type = filterType;
      if (filterStatus !== 'All') params.status = filterStatus.toLowerCase();
      if (priceRange) params.maxPrice = priceRange;

      const res = await api.get('/rooms', { params });
      dispatch(roomSuccess(res.data));
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      dispatch(roomFailure(err.message || 'Failed to load room inventory'));
      toast.error('Failed to load room inventory');
    }
  };

  const handleOpenBooking = (room) => {
    if (!user) {
      dispatch(setClickedBookNow(true));
      return navigate('/register');
    }
    setSelectedRoom(room);
    setIsBookModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      dispatch(setClickedBookNow(true));
      toast.info('Please sign up to complete your booking');
      return navigate('/register');
    }

    if (user.role !== 'customer') {
      return toast.error('Only customers can book rooms. Please log in as a customer.');
    }

    try {
      await api.post('/bookings', {
        roomId: selectedRoom._id,
        checkInDate,
        checkOutDate,
      });
      toast.success('Room booked successfully! Head to your dashboard to pay or request service.');
      setIsBookModalOpen(false);
      navigate('/customer-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete booking');
    }
  };

  // Filter logic is now handled by the backend. Let filteredRooms simply be the rooms array.
  const filteredRooms = rooms;

  if (selectedDetailRoom) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 pt-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back button */}
          <button
            onClick={() => {
              setSelectedDetailRoom(null);
              navigate('/rooms');
            }}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-amber-500 font-bold transition-all text-sm uppercase tracking-wider outline-none"
          >
            <X className="h-4 w-4" />
            <span>Back to Rooms List</span>
          </button>

          {/* Full-width Room Details container */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            {/* Image Gallery / Hero */}
            <div className="relative w-full lg:w-3/5 aspect-video lg:aspect-auto lg:h-[500px] bg-slate-950">
              <img
                src={selectedDetailRoom.images?.[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800'}
                alt={`Room ${selectedDetailRoom.roomNumber}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded text-xs uppercase font-black tracking-wider ${
                  selectedDetailRoom.status === 'available' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-slate-100'
                }`}>
                  {selectedDetailRoom.status === 'available' ? 'Available' : 'Occupied'}
                </span>
              </div>
            </div>

            {/* Room Specifications */}
            <div className="p-8 lg:p-12 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-white mt-1">
                    Room {selectedDetailRoom.roomNumber}
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-850 py-4 text-sm">
                  <div>
                    <span className="text-slate-500 block">Category</span>
                    <span className="text-slate-200 font-bold text-base">{selectedDetailRoom.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Price Per Night</span>
                    <span className="text-amber-500 font-extrabold text-xl">₹{selectedDetailRoom.price}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-500 text-sm block">Description</span>
                  <p className="text-slate-350 text-sm leading-relaxed">
                    {selectedDetailRoom.description || 'Experience the highest standard of lodging with premium features, modern finishes, high-speed fiber internet, and detailed room service operations.'}
                  </p>
                </div>

               
              </div>

              {/* Book Now Button */}
              <div className="pt-8">
                <button
                  onClick={() => handleOpenBooking(selectedDetailRoom)}
                  disabled={selectedDetailRoom.status !== 'available'}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                >
                  {selectedDetailRoom.status === 'available' ? 'Book Room Now' : 'Occupied / Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Confirmation Dialog Modal if selected */}
        {isBookModalOpen && selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-200">Confirm Stay Reservation</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Room {selectedRoom.roomNumber} &bull; {selectedRoom.type}</p>
                </div>
                <button
                  onClick={() => setIsBookModalOpen(false)}
                  className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-250 transition-colors outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-450 uppercase block">Check-In Date</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-450 uppercase block">Check-Out Date</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Price / Night:</span>
                    <span className="font-mono text-slate-200">₹{selectedRoom.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Stay Duration:</span>
                    <span className="font-mono text-slate-200">{bookingDays} {bookingDays === 1 ? 'night' : 'nights'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-850 pt-2 font-bold text-sm">
                    <span className="text-slate-350">Estimated Total:</span>
                    <span className="font-mono text-amber-500">₹{selectedRoom.price * bookingDays}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all mt-4 uppercase tracking-wider outline-none"
                >
                  Confirm Stay Reservation
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-150">
            Our Luxury <span className="text-amber-500 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Rooms</span>
          </h1>
        </div>

        {/* Filter Trigger Button */}
        <div className="flex justify-end mb-8">
          <button 
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 border border-white hover:border-amber-500 text-slate-200 hover:text-amber-500 font-bold px-6 py-3 rounded-none shadow-md transition-all uppercase tracking-wider text-sm outline-none"
          >
            <Filter className="h-4 w-4" />
            <span>Filter Rooms</span>
          </button>
        </div>

        {/* Filter Modal Dialog */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-900 border border-white rounded-none overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-lg text-slate-200 uppercase tracking-wider">Filter Rooms</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)} 
                  className="p-1 hover:bg-slate-850 rounded-none text-slate-400 hover:text-slate-250 transition-colors outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Room Class Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">Room Class</label>
                  <div className="grid grid-cols-3 sm:flex sm:flex-wrap bg-slate-950 p-1 border border-slate-850 rounded-none gap-1">
                    {['All', 'Single', 'Double'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-2 text-center rounded-none text-xs font-semibold transition-all ${
                          filterType === type 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room Status Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">Room Status</label>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap bg-slate-950 p-1 border border-slate-850 rounded-none gap-1">
                    {['All', 'Available', 'Occupied'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-2 text-center rounded-none text-xs font-semibold transition-all ${
                          filterStatus === status 
                            ? 'bg-amber-500 text-slate-950' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Price Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">
                    Max Price per Night (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full bg-white text-slate-950 px-4 py-2.5 rounded-none outline-none font-bold text-sm"
                  />
                </div>

                <div className="pt-4 border-t border-slate-850 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFilterModalOpen(false);
                      setPage(1);
                      fetchRooms(1);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3 rounded-none text-sm uppercase tracking-wider shadow-md transition-all outline-none"
                  >
                    Apply & Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-16 text-slate-400">Loading grand suites catalogue...</div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-slate-700 transition-all flex flex-col group h-full"
              >
                {/* Image container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600'}
                    alt={`Room ${room.roomNumber}`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-full text-xs font-bold text-amber-500 font-mono">
                    ₹{room.price} / night
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-black tracking-wider ${room.status === 'available' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-slate-100'
                      }`}>
                      {room.status === 'available' ? 'Available' : 'Booked'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {room.description || 'Experience premium amenities, plush bedding, and high-speed fiber internet.'}
                    </p>
                  </div>

                  <div className="pt-2 mt-auto">
                    <button
                      onClick={() => navigate(`/rooms?roomDetailsId=${room._id}`)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs shadow-md transition-all active:scale-[0.98]"
                    >
                      View & Book Room
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {!loading && filteredRooms.length === 0 && (
            <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
              No suites available matching the selected criteria.
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {!loading && totalPages >= 1 && (
          <div className="flex justify-center mt-12">
            <Stack spacing={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => {
                  setPage(value);
                  fetchRooms(value);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                variant="outlined"
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#94a3b8',
                    borderColor: '#334155',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                      borderColor: '#f59e0b',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#f59e0b',
                      color: '#020617',
                      borderColor: '#f59e0b',
                      '&:hover': {
                        backgroundColor: '#d97706',
                      },
                    },
                  },
                }}
              />
            </Stack>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-200">Confirm Stay Reservation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Room {selectedRoom.roomNumber} &bull; {selectedRoom.type}</p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-250 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450 uppercase block">Check-In Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450 uppercase block">Check-Out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Price / Night:</span>
                  <span className="font-mono text-slate-200">₹{selectedRoom.price}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stay Duration:</span>
                  <span className="font-mono text-slate-200">{bookingDays} {bookingDays === 1 ? 'night' : 'nights'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-850 pt-2 font-bold text-sm">
                  <span className="text-slate-350">Estimated Total:</span>
                  <span className="font-mono text-amber-500">₹{selectedRoom.price * bookingDays}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all mt-4"
              >
                Confirm Stay Reservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
