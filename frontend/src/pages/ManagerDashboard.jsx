import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Key, LogOut, ShieldCheck, ClipboardList, Briefcase, Plus, UserPlus, Search, RefreshCw, X 
} from 'lucide-react';
import api from '../utils/api.js';
import { toast } from 'sonner';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', password: 'customer123' });
  
 
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', roomId: '' });


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerBookings, setSelectedCustomerBookings] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const res = await api.get('/bookings');
        setBookings(res.data);
      } else if (activeTab === 'rooms') {
        const res = await api.get('/rooms');
        setRooms(res.data);
      } else if (activeTab === 'customers') {
        const res = await api.get('/admin/users?role=customer');
        setCustomers(res.data);
      } else if (activeTab === 'tasks') {
        const [tasksRes, empRes, roomsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/admin/users?role=employee'),
          api.get('/rooms'),
        ]);
        setTasks(tasksRes.data);
        setEmployees(empRes.data);
        setRooms(roomsRes.data);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Booking Status Updates
  const updateBookingStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/bookings/${id}/status`, { status: newStatus });
      toast.success(`Booking status updated to ${newStatus}`);
      
      // Update local state
      setBookings(bookings.map((b) => b._id === id ? res.data : b));
      fetchData(); // Sync room states if they changed
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  // Room Status override
  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      await api.put(`/rooms/${roomId}/availability`, { status: newStatus });
      toast.success('Room status updated');
      setRooms(rooms.map((r) => r._id === roomId ? { ...r, status: newStatus } : r));
    } catch (err) {
      toast.error('Failed to update room availability');
    }
  };

  // Create Offline Customer
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', { ...customerForm, role: 'customer' });
      toast.success('Customer profile created successfully!');
      setIsCustomerModalOpen(false);
      setCustomerForm({ name: '', email: '', password: 'customer123' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
    }
  };

  // Assign Task
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.assignedTo) return toast.error('Please select an employee');
    try {
      await api.post('/tasks', taskForm);
      toast.success('Task assigned successfully!');
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', assignedTo: '', roomId: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign task');
    }
  };

  // View Customer Booking History
  const viewCustomerHistory = async (customer) => {
    setViewingCustomer(customer);
    setSelectedCustomerBookings(null);
    setIsCustomerDetailsModalOpen(true);
    try {
      const res = await api.get('/bookings');
      // filter offline for this customer
      const history = res.data.filter((b) => b.customer?._id === customer._id);
      setSelectedCustomerBookings(history);
    } catch (err) {
      toast.error('Failed to fetch history');
    }
  };

  // Filter customer list
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-500 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Hotel Operations Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Accept bookings and manage guest check-in/out workflows</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-slate-850 grid grid-cols-2 md:flex gap-2 pb-px">
        {[
          { id: 'bookings', label: 'Manage Bookings', icon: ClipboardList },
          { id: 'rooms', label: 'Room Statuses', icon: Key },
          { id: 'customers', label: 'Customer Management', icon: UserPlus },
          { id: 'tasks', label: 'Task Assignments', icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setViewingCustomer(null);
                setSelectedCustomerBookings(null);
              }}
              className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-5 py-3 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {loading && <div className="text-center py-12 text-slate-400">Loading operational details...</div>}

        {!loading && activeTab === 'bookings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-850">
              <h2 className="text-lg font-bold text-slate-200">Active Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">Guest</th>
                      <th className="px-6 py-4">Room #</th>
                      <th className="px-6 py-4">Check-in / Check-out</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Fulfillment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200">{b.customer?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-amber-500">
                          {b.room?.roomNumber || 'N/A'}
                          <span className="text-xs text-slate-400 font-normal block">{b.room?.type}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          <div>In: {new Date(b.checkInDate).toLocaleDateString()}</div>
                          <div>Out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
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
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {b.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateBookingStatus(b._id, 'accepted')}
                                  className="bg-blue-600 hover:bg-blue-750 text-slate-100 px-3 py-1 rounded text-xs font-bold transition-all"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(b._id, 'cancelled')}
                                  className="bg-rose-600 hover:bg-rose-750 text-slate-100 px-3 py-1 rounded text-xs font-bold transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {b.status === 'accepted' && (
                              <button
                                onClick={() => updateBookingStatus(b._id, 'checked-in')}
                                className="bg-emerald-600 hover:bg-emerald-750 text-slate-100 px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                  <Key className="h-3.5 w-3.5" />
                                  <span>Check-In</span>
                              </button>
                            )}
                            {b.status === 'checked-in' && (
                              <button
                                onClick={() => updateBookingStatus(b._id, 'checked-out')}
                                className="bg-indigo-600 hover:bg-indigo-750 text-slate-100 px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                  <LogOut className="h-3.5 w-3.5" />
                                  <span>Check-Out</span>
                              </button>
                            )}
                            {['checked-out', 'cancelled'].includes(b.status) && (
                              <span className="text-slate-500 text-xs font-mono">Archived</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                          No guest bookings available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid View */}
              <div className="block md:hidden p-4 space-y-4">
                {bookings.map((b) => (
                  <div key={b._id} className="bg-slate-950 p-4 border border-slate-850 rounded-none space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-200 text-base">{b.customer?.name || 'N/A'}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'checked-in' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        b.status === 'checked-out' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        b.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        b.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-400 border-t border-slate-850 pt-2">
                      <div><span className="text-slate-500">Room:</span> <span className="font-mono font-bold text-amber-500">{b.room?.roomNumber || 'N/A'} ({b.room?.type || 'N/A'})</span></div>
                      <div><span className="text-slate-500">Check-In:</span> <span className="text-slate-300">{new Date(b.checkInDate).toLocaleDateString()}</span></div>
                      <div><span className="text-slate-500">Check-Out:</span> <span className="text-slate-300">{new Date(b.checkOutDate).toLocaleDateString()}</span></div>
                      <div><span className="text-slate-500">Total Price:</span> <span className="text-slate-200 font-semibold">₹{b.totalAmount}</span></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b._id, 'accepted')}
                            className="bg-blue-600 hover:bg-blue-750 text-slate-100 px-3 py-1.5 rounded-none text-xs font-bold transition-all"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateBookingStatus(b._id, 'cancelled')}
                            className="bg-rose-600 hover:bg-rose-750 text-slate-100 px-3 py-1.5 rounded-none text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {b.status === 'accepted' && (
                        <button
                          onClick={() => updateBookingStatus(b._id, 'checked-in')}
                          className="bg-emerald-600 hover:bg-emerald-750 text-slate-100 px-3.5 py-1.5 rounded-none text-xs font-bold flex items-center gap-1 transition-all"
                        >
                            <Key className="h-3.5 w-3.5" />
                            <span>Check-In</span>
                        </button>
                      )}
                      {b.status === 'checked-in' && (
                        <button
                          onClick={() => updateBookingStatus(b._id, 'checked-out')}
                          className="bg-indigo-600 hover:bg-indigo-750 text-slate-100 px-3.5 py-1.5 rounded-none text-xs font-bold flex items-center gap-1 transition-all"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Check-Out</span>
                        </button>
                      )}
                      {['checked-out', 'cancelled'].includes(b.status) && (
                        <span className="text-slate-500 text-xs font-mono">Archived</span>
                      )}
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="text-center py-6 text-slate-500">No bookings available.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'rooms' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-850">
              <h2 className="text-lg font-bold text-slate-200">Daily Room Inventory Override</h2>
            </div>
            <div className="overflow-x-auto">
              {/* Desktop View */}
              <div className="hidden md:block">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">Room #</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Availability Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {rooms.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-amber-500">{r.roomNumber}</td>
                        <td className="px-6 py-4 font-semibold text-slate-200">{r.type}</td>
                        <td className="px-6 py-4 font-semibold">₹{r.price}</td>
                        <td className="px-6 py-4">
                          <select
                            value={r.status}
                            onChange={(e) => handleRoomStatusChange(r._id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-350 text-xs rounded-md px-2 py-1 focus:border-amber-500 outline-none transition-all font-semibold"
                          >
                            <option value="available">available</option>
                            <option value="occupied">occupied</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid View */}
              <div className="block md:hidden p-4 space-y-4">
                {rooms.map((r) => (
                  <div key={r._id} className="bg-slate-950 p-4 border border-slate-850 rounded-none space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-amber-500 text-lg">Room {r.roomNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Status:</span>
                        <select
                          value={r.status}
                          onChange={(e) => handleRoomStatusChange(r._id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-none px-2 py-1 focus:border-amber-500 outline-none transition-all font-semibold"
                        >
                          <option value="available">available</option>
                          <option value="occupied">occupied</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-sm space-y-1 text-slate-350">
                      <div><span className="text-slate-500">Type:</span> <span className="font-semibold text-slate-300">{r.type}</span></div>
                      <div><span className="text-slate-500">Price:</span> <span className="font-semibold text-slate-300">₹{r.price} / Night</span></div>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <div className="text-center py-6 text-slate-500">No rooms available.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search guests by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 pl-10 pr-4 py-2.5 rounded-lg outline-none focus:border-amber-500 text-sm text-slate-200 transition-all placeholder:text-slate-600"
                />
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-1.5 self-start md:self-auto transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Customer Details</span>
              </button>
            </div>

            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-850">
                <h3 className="font-bold text-slate-200">Registered Guests</h3>
              </div>
              
              {/* Desktop View */}
              <div className="hidden md:block overflow-y-auto max-h-[500px]">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">Guest Name & Email</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredCustomers.map((c) => (
                      <tr 
                        key={c._id} 
                        className="hover:bg-slate-850/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.email}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => viewCustomerHistory(c)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                          No matching customers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid View */}
              <div className="block md:hidden p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <div 
                    key={c._id}
                    className="p-4 border rounded-lg bg-slate-950 border-slate-850 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.email}</div>
                      </div>
                      <button
                        onClick={() => viewCustomerHistory(c)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    No matching customers found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Task assignment top bar */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200">Staff Task Delegator</h2>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Assign New Task</span>
              </button>
            </div>

            {/* Task log */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850">
                      <tr>
                        <th className="px-6 py-4">Task Details</th>
                        <th className="px-6 py-4">Assigned To</th>
                        <th className="px-6 py-4">Associated Room</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {tasks.map((t) => (
                        <tr key={t._id} className="hover:bg-slate-850/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-200">{t.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{t.description || 'No description'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-200">{t.assignedTo?.name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-amber-500">
                            {t.room ? `Room ${t.room.roomNumber}` : 'General'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              t.status === 'completed' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {tasks.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                            No tasks have been assigned.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Grid View */}
                <div className="block md:hidden p-4 space-y-4">
                  {tasks.map((t) => (
                    <div key={t._id} className="bg-slate-950 p-4 border border-slate-850 rounded-none space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-slate-200 text-base">{t.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{t.description || 'No description'}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-slate-400 border-t border-slate-850 pt-2">
                        <div><span className="text-slate-500">Assigned To:</span> <span className="text-slate-300 font-semibold">{t.assignedTo?.name || 'N/A'}</span></div>
                        <div><span className="text-slate-500">Associated Room:</span> <span className="font-mono font-bold text-amber-500">{t.room ? `Room ${t.room.roomNumber}` : 'General'}</span></div>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-6 text-slate-500">No tasks have been assigned.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Guest Profile Creation Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-200">Register Offline Guest</h3>
              <button 
                onClick={() => setIsCustomerModalOpen(false)} 
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-250 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Full Name</label>
                <input 
                  type="text" 
                  value={customerForm.name} 
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Email Address</label>
                <input 
                  type="email" 
                  value={customerForm.email} 
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all mt-4"
              >
                Save Guest Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task Delegation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-200">Assign Operations Task</h3>
              <button 
                onClick={() => setIsTaskModalOpen(false)} 
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-250 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Task Title</label>
                <input 
                  type="text" 
                  value={taskForm.title} 
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="e.g. Clean room 102"
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Description</label>
                <textarea 
                  value={taskForm.description} 
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  rows="3"
                  placeholder="Instructions for the employee..."
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Assign to Staff Member</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Associated Room</label>
                <select
                  value={taskForm.roomId}
                  onChange={(e) => setTaskForm({...taskForm, roomId: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                >
                  <option value="">None / General</option>
                  {rooms.map((rm) => (
                    <option key={rm._id} value={rm._id}>Room {rm.roomNumber}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all mt-4"
              >
                Assign Task
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Guest Details & Booking History Modal */}
      {isCustomerDetailsModalOpen && viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-200">Guest Profile & Booking History</h3>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive view of customer information</p>
              </div>
              <button 
                onClick={() => setIsCustomerDetailsModalOpen(false)} 
                className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Customer Info Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-amber-500">{viewingCustomer.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{viewingCustomer.email}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-900 border border-slate-850 rounded-full text-xs font-semibold text-slate-300">
                    {viewingCustomer.role ? viewingCustomer.role.toUpperCase() : 'CUSTOMER'}
                  </span>
                </div>
              </div>

              {/* History Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Stay & Booking Records</h4>
                
                {selectedCustomerBookings === null ? (
                  <div className="text-center py-6 text-slate-500 text-xs">Loading reservation history...</div>
                ) : selectedCustomerBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCustomerBookings.map((b) => (
                      <div key={b._id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-slate-200 text-sm">Room {b.room?.roomNumber || 'N/A'} ({b.room?.type || 'Standard'})</span>
                          <span className="text-amber-500 text-sm">₹{b.totalAmount}</span>
                        </div>
                        <div className="text-slate-400 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          <span>Check-In: <strong className="text-slate-300">{new Date(b.checkInDate).toLocaleDateString()}</strong></span>
                          <span>Check-Out: <strong className="text-slate-300">{new Date(b.checkOutDate).toLocaleDateString()}</strong></span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                            b.status === 'checked-in' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            b.status === 'checked-out' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            b.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {b.status}
                          </span>

                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-950/50 border border-slate-850/60 rounded-xl text-slate-500 text-xs">
                    No bookings on file.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-850 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setIsCustomerDetailsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
