import React, { useState, useEffect } from 'react';
import { 
  Building, Users, UserCheck, Calendar, IndianRupee, Plus, Trash2, Edit, RefreshCw, X, ShieldAlert 
} from 'lucide-react';
import api from '../utils/api.js';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  
  // Managers & Employees States
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', password: '', phone: '', role: 'manager', status: 'active' });
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Rooms States
  const [rooms, setRooms] = useState([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({ id: '', roomNumber: '', type: 'Single', price: '', description: '', imageUrl: '' });
  const [isEditingRoom, setIsEditingRoom] = useState(false);

  // Bookings States
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(false);

  // Load Initial Data
  useEffect(() => {
    fetchStats();
    if (activeTab === 'stats') fetchRooms();
    if (activeTab === 'managers') fetchUsers('manager');
    if (activeTab === 'employees') fetchUsers('employee');
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Could not fetch stats');
    }
  };

  const fetchUsers = async (role) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${role}`);
      if (role === 'manager') setManagers(res.data);
      if (role === 'employee') setEmployees(res.data);
    } catch (err) {
      toast.error(`Error loading ${role}s`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      toast.error('Error loading rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  // User Actions (Create / Update / Delete)
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingUser) {
        await api.put(`/admin/users/${userForm.id}`, {
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          status: userForm.status,
        });
        toast.success('User updated successfully');
      } else {
        await api.post('/admin/users', userForm);
        toast.success(`${userForm.role} added successfully`);
      }
      setIsUserModalOpen(false);
      fetchUsers(userForm.role);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleDeleteUser = async (id, role) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers(role);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const openAddUserModal = (role) => {
    setIsEditingUser(false);
    setUserForm({ id: '', name: '', email: '', password: '', phone: '', role, status: 'active' });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u) => {
    setIsEditingUser(true);
    setUserForm({
      id: u._id,
      name: u.name,
      email: u.email,
      password: '', // blank password on edit
      phone: u.phone || '',
      role: u.role,
      status: u.employeeDetails?.status || 'active',
    });
    setIsUserModalOpen(true);
  };

  // Room Actions (Create / Update / Delete)
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    const roomPayload = {
      roomNumber: roomForm.roomNumber,
      type: roomForm.type,
      price: Number(roomForm.price),
      description: roomForm.description,
      images: roomForm.imageUrl ? [roomForm.imageUrl] : [],
    };

    try {
      if (isEditingRoom) {
        await api.put(`/rooms/${roomForm.id}`, roomPayload);
        toast.success('Room updated successfully');
      } else {
        await api.post('/rooms', roomPayload);
        toast.success('Room created successfully');
      }
      setIsRoomModalOpen(false);
      fetchRooms();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room deleted');
      fetchRooms();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete room');
    }
  };

  const openAddRoomModal = () => {
    setIsEditingRoom(false);
    setRoomForm({ id: '', roomNumber: '', type: 'Single', price: '', description: '', imageUrl: '' });
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (r) => {
    setIsEditingRoom(true);
    setRoomForm({
      id: r._id,
      roomNumber: r.roomNumber,
      type: r.type,
      price: r.price,
      description: r.description || '',
      imageUrl: r.images?.[0] || '',
    });
    setIsRoomModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-500 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">System Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Manage global operations, staff permissions, and hotel properties</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-slate-850 grid grid-cols-2 md:flex gap-2 pb-px">
        {[
          { id: 'stats', label: 'Dashboard Stats', icon: Building },
          { id: 'managers', label: 'Manage Managers', icon: Users },
          { id: 'employees', label: 'Manage Employees', icon: UserCheck },
          { id: 'bookings', label: 'All Bookings', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'stats' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stat Box */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Rooms</span>
                    <span className="text-3xl font-extrabold mt-1 block">{stats.totalRooms}</span>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-500">
                    <Building className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-3">
                  <div>Available: <span className="font-semibold text-emerald-500">{stats.availableRooms}</span></div>
                  <div>Occupied: <span className="font-semibold text-rose-500">{stats.occupiedRooms}</span></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Bookings</span>
                    <span className="text-3xl font-extrabold mt-1 block">{stats.totalBookings}</span>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-amber-500">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-3">
                  <div>Active Stay: <span className="font-semibold text-amber-500">{stats.activeBookings}</span></div>
                  <div>Pending Approval: <span className="font-semibold text-sky-400">{stats.pendingBookings}</span></div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Est. Revenue</span>
                    <span className="text-3xl font-extrabold mt-1 block">₹{stats.totalRevenue}</span>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-emerald-500">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-400 border-t border-slate-850 pt-3">
                  <span>Calculated from active reservations</span>
                </div>
              </div>
            </div>

            {/* Room Catalogue Section with overflow limit */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-850 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-bold text-slate-200">Room Catalogue</h2>
                <button
                  onClick={openAddRoomModal}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Room</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400">Loading rooms...</div>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-y-auto max-h-[400px]">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4">Room #</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Price / Night</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {rooms.map((r) => (
                          <tr key={r._id} className="hover:bg-slate-850/30 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-amber-500">{r.roomNumber}</td>
                            <td className="px-6 py-4 font-semibold text-slate-200">{r.type}</td>
                            <td className="px-6 py-4 font-semibold">₹{r.price}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                r.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                r.status === 'occupied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-slate-850 text-slate-400 border border-slate-700'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                              <button
                                onClick={() => openEditRoomModal(r)}
                                className="p-1.5 hover:bg-slate-800 rounded-md text-amber-500 transition-colors"
                                title="Edit details / price"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(r._id)}
                                className="p-1.5 hover:bg-slate-800 rounded-md text-rose-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {rooms.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                              No rooms setup in the database.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Grid View */}
                  <div className="block md:hidden p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {rooms.map((r) => (
                      <div key={r._id} className="bg-slate-950 p-4 border border-slate-850 rounded-none space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-amber-500 text-lg">Room {r.roomNumber}</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            r.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            r.status === 'occupied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-slate-850 text-slate-400 border border-slate-700'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <div className="text-sm space-y-1 text-slate-300">
                          <div><span className="text-slate-500">Type:</span> <span className="font-semibold">{r.type}</span></div>
                          <div><span className="text-slate-500">Price:</span> <span className="font-semibold">₹{r.price} / Night</span></div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                          <button
                            onClick={() => openEditRoomModal(r)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-none transition-colors text-xs font-semibold flex items-center gap-1"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(r._id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-3 py-1.5 rounded-none transition-colors text-xs font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {rooms.length === 0 && (
                      <div className="text-center py-6 text-slate-500">No rooms setup.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Manager/Employee views */}
        {(activeTab === 'managers' || activeTab === 'employees') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-bold text-slate-200 capitalize">
                List of {activeTab}s
              </h2>
              <button
                onClick={() => openAddUserModal(activeTab === 'managers' ? 'manager' : 'employee')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add {activeTab === 'managers' ? 'Manager' : 'Employee'}</span>
              </button>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading staff data...</div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {(activeTab === 'managers' ? managers : employees).map((u) => (
                        <tr key={u._id} className="hover:bg-slate-850/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-200">{u.name}</td>
                          <td className="px-6 py-4">{u.email}</td>
                          <td className="px-6 py-4">{u.phone || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              u.employeeDetails?.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {u.employeeDetails?.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => openEditUserModal(u)}
                              className="p-1.5 hover:bg-slate-800 rounded-md text-amber-500 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id, u.role)}
                              className="p-1.5 hover:bg-slate-800 rounded-md text-rose-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(activeTab === 'managers' ? managers : employees).length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                            No {activeTab} records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Grid View */}
                <div className="block md:hidden p-4 space-y-4">
                  {(activeTab === 'managers' ? managers : employees).map((u) => (
                    <div key={u._id} className="bg-slate-950 p-4 border border-slate-850 rounded-none space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200 text-base">{u.name}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.employeeDetails?.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {u.employeeDetails?.status || 'active'}
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-slate-400">
                        <div><span className="text-slate-500">Email:</span> <span className="text-slate-300">{u.email}</span></div>
                        <div><span className="text-slate-500">Phone:</span> <span className="text-slate-300">{u.phone || 'N/A'}</span></div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                        <button
                          onClick={() => openEditUserModal(u)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-none transition-colors text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.role)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-3 py-1.5 rounded-none transition-colors text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {(activeTab === 'managers' ? managers : employees).length === 0 && (
                    <div className="text-center py-6 text-slate-500">No {activeTab} records found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}



        {/* Bookings View */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-850">
              <h2 className="text-lg font-bold text-slate-200">All Guest Bookings</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading bookings list...</div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850">
                      <tr>
                        <th className="px-6 py-4">Guest</th>
                        <th className="px-6 py-4">Room</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4">Total Price</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-850/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-200">{b.customer?.name || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{b.customer?.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-amber-500">
                            {b.room?.roomNumber || 'N/A'} ({b.room?.type || 'N/A'})
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div>Check-in: {new Date(b.checkInDate).toLocaleDateString()}</div>
                            <div>Check-out: {new Date(b.checkOutDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-200">
                            ₹{b.totalAmount}
                          </td>
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

                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                            No bookings made yet.
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
                          <div className="text-xs text-slate-500">{b.customer?.email || 'N/A'}</div>
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
                        <div className="pt-1">
                          <span className="text-slate-500">Total Price:</span> <span className="text-slate-200 font-semibold">₹{b.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-6 text-slate-500">No bookings made yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Staff Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-200">
                {isEditingUser ? 'Edit Staff Details' : `Add New ${userForm.role}`}
              </h3>
              <button 
                onClick={() => setIsUserModalOpen(false)} 
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-250 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Name</label>
                <input 
                  type="text" 
                  value={userForm.name} 
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Email</label>
                <input 
                  type="email" 
                  value={userForm.email} 
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                  required
                />
              </div>

              {!isEditingUser && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450 uppercase block">Password</label>
                  <input 
                    type="password" 
                    value={userForm.password} 
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Phone</label>
                <input 
                  type="text" 
                  value={userForm.phone} 
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                />
              </div>

              {isEditingUser && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450 uppercase block">Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({...userForm, status: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all mt-4"
              >
                {isEditingUser ? 'Save Changes' : `Register ${userForm.role}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-200">
                {isEditingRoom ? `Edit Room ${roomForm.roomNumber}` : 'Add New Room'}
              </h3>
              <button 
                onClick={() => setIsRoomModalOpen(false)} 
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-250 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450 uppercase block">Room Number</label>
                  <input 
                    type="text" 
                    value={roomForm.roomNumber} 
                    onChange={(e) => setRoomForm({...roomForm, roomNumber: e.target.value})}
                    placeholder="e.g. 104"
                    disabled={isEditingRoom}
                    className="w-full bg-slate-950 border border-slate-850 disabled:opacity-50 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450 uppercase block">Price per Night (₹)</label>
                  <input 
                    type="number" 
                    value={roomForm.price} 
                    onChange={(e) => setRoomForm({...roomForm, price: e.target.value})}
                    placeholder="e.g. 150"
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Room Type</label>
                <select
                  value={roomForm.type}
                  onChange={(e) => setRoomForm({...roomForm, type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Image URL</label>
                <input 
                  type="text" 
                  value={roomForm.imageUrl} 
                  onChange={(e) => setRoomForm({...roomForm, imageUrl: e.target.value})}
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase block">Description</label>
                <textarea 
                  value={roomForm.description} 
                  onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 px-4 py-2.5 rounded-lg outline-none focus:border-amber-500 transition-all text-sm resize-none"
                  placeholder="Describe the layout, view, beds..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all mt-4"
              >
                {isEditingRoom ? 'Update Room Details' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
