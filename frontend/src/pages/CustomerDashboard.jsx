import React, { useState, useEffect } from 'react';
import { 
  Coffee, Trash2, Calendar, ShieldAlert, X, RefreshCw 
} from 'lucide-react';
import api from '../utils/api.js';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Room Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState('Food');



  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      toast.success('Booking cancelled successfully');
      fetchMyBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };


  // Service Request Submit
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await api.post(`/bookings/${selectedBooking._id}/room-service`, { requestType: serviceType });
      toast.success(`${serviceType} requested successfully!`);
      setIsServiceModalOpen(false);
      fetchMyBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Room service request failed');
    }
  };




  const openServiceModal = (b) => {
    setSelectedBooking(b);
    setIsServiceModalOpen(true);
  };



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-500 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">My Guest Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your active reservations and submit room service</p>
        </div>
        
      </div>

      {/* Bookings history */}
      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-850">
          <h2 className="text-lg font-bold text-slate-200">Reservation History</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading booking records...</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-350">
                <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850">
                  <tr>
                    <th className="px-6 py-4">Room Reserved</th>
                    <th className="px-6 py-4">Check-In / Out Dates</th>
                    <th className="px-6 py-4">Invoiced Amount</th>
                    <th className="px-6 py-4">Booking Status</th>
                    <th className="px-6 py-4 text-right">Cancel Booking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-850/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-amber-500">
                        Room {b.room?.roomNumber || 'N/A'}
                        <span className="text-xs text-slate-400 font-semibold block">{b.room?.type}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        <div>Check-in: {new Date(b.checkInDate).toLocaleDateString()}</div>
                        <div>Check-out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-200">₹{b.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'checked-in' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          b.status === 'checked-out' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          b.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          b.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">

                          {/* Room Service Requests */}
                          {b.status === 'checked-in' && (
                            <button
                              onClick={() => openServiceModal(b)}
                              className="bg-blue-600 hover:bg-blue-750 text-slate-100 text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 transition-all"
                            >
                              <Coffee className="h-3.5 w-3.5" />
                              <span>Room Service</span>
                            </button>
                          )}



                          {/* Cancel reservation */}
                          {['pending', 'accepted'].includes(b.status) && (
                            <button
                              onClick={() => handleCancelBooking(b._id)}
                              className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded transition-all"
                              title="Cancel Booking"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          {b.status === 'cancelled' && <span className="text-xs text-slate-500">Cancelled</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No reservations found. Browse our available rooms on the Home page to make a booking!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid View */}
            <div className="block md:hidden p-4 space-y-4">
              {bookings.map((b) => (
                <div key={b._id} className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-amber-500 text-base block">
                        Room {b.room?.roomNumber || 'N/A'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{b.room?.type}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'checked-in' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        b.status === 'checked-out' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        b.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        b.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {b.status}
                      </span>

                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-350 font-mono">
                    <div><span className="text-slate-500">Check-In:</span> {new Date(b.checkInDate).toLocaleDateString()}</div>
                    <div><span className="text-slate-500">Check-Out:</span> {new Date(b.checkOutDate).toLocaleDateString()}</div>
                    <div><span className="text-slate-500">Bill Amount:</span> <span className="font-bold text-slate-200">₹{b.totalAmount}</span></div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-900/60">

                    {/* Room Service Requests */}
                    {b.status === 'checked-in' && (
                      <button
                        onClick={() => openServiceModal(b)}
                        className="bg-blue-600 hover:bg-blue-750 text-slate-100 text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 transition-all"
                      >
                        <Coffee className="h-3.5 w-3.5" />
                        <span>Room Service</span>
                      </button>
                    )}



                    {/* Cancel reservation */}
                    {['pending', 'accepted'].includes(b.status) && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded transition-all flex items-center gap-1"
                        title="Cancel Booking"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                    {b.status === 'cancelled' && <span className="text-xs text-slate-500">Cancelled</span>}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No reservations found. Browse our available rooms on the Home page to make a booking!
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Room Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                <Coffee className="h-5 w-5 text-amber-500" />
                <span>Request Room Service</span>
              </h3>
              <button 
                onClick={() => setIsServiceModalOpen(false)} 
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-250 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                >
                  <option value="Food">Food / Dining</option>
                  <option value="Laundry">Laundry Services</option>
                  <option value="Cleaning">Room Cleaning</option>
                  <option value="Towels/Toiletries">Towels & Toiletries</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all mt-4"
              >
                Submit Service Request
              </button>

              {/* Service Requests list */}
              {selectedBooking?.roomServiceRequests?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-850">
                  <h4 className="text-xs font-bold text-slate-400 mb-2">Previous Requests</h4>
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                    {selectedBooking.roomServiceRequests.map((req, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-slate-950 px-3 py-2 rounded border border-slate-850">
                        <span className="font-semibold text-slate-350">{req.requestType}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          req.status === 'completed' ? 'bg-emerald-550/20 text-emerald-400' : 'bg-amber-550/20 text-amber-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default CustomerDashboard;
