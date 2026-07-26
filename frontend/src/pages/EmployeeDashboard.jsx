import React, { useState, useEffect } from 'react';
import { 
  User, CheckCircle2, Circle, Sparkles, Calendar, AlertCircle, RefreshCw 
} from 'lucide-react';
import api from '../utils/api.js';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileSuccess } from '../store/authSlice.js';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceMarkedToday, setAttendanceMarkedToday] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
    checkTodayAttendance();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const [tasksRes, roomsRes] = await Promise.all([
        api.get('/tasks/my-tasks'),
        api.get('/rooms'),
      ]);
      setTasks(tasksRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      console.error('Error fetching employee records:', err);
      toast.error('Failed to load tasks/rooms');
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAttendance = () => {
    if (!user || !user.employeeDetails?.attendance) return;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const marked = user.employeeDetails.attendance.some((record) => {
      const d = new Date(record.date);
      d.setHours(0,0,0,0);
      return d.getTime() === today.getTime();
    });
    setAttendanceMarkedToday(marked);
  };

  const handleMarkAttendance = async () => {
    try {
      const res = await api.post('/tasks/attendance');
      toast.success('Attendance marked successfully!');
      setAttendanceMarkedToday(true);
      // Update Redux state
      dispatch(updateProfileSuccess({
        employeeDetails: {
          ...user.employeeDetails,
          attendance: res.data.attendance
        }
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await api.put(`/tasks/${taskId}/status`, { status: nextStatus });
      toast.success(`Task marked as ${nextStatus}`);
      setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: nextStatus } : t));
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-500 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Staff Work Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Review assigned daily tasks and log attendance details</p>
        </div>
        <button 
          onClick={fetchEmployeeData} 
          className="flex items-center gap-2 self-start bg-slate-900 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reload Assigned Work</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Profile Card & Attendance */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Details */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-500/10 p-3.5 rounded-full border border-amber-500/25 text-amber-500">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-200">{user?.name}</h3>
                <span className="text-xs text-amber-500 uppercase font-mono tracking-wider">
                  Hotel Staff
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-slate-350 border-t border-slate-850 pt-4">
              <div className="flex justify-between">
                <span>Email Address:</span>
                <span className="font-semibold text-slate-200">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-semibold text-slate-200">{user?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold capitalize text-emerald-400">
                  {user?.employeeDetails?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Attendance Action */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
            <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              <span>Shift Attendance</span>
            </h3>
            <p className="text-slate-400 text-xs mb-4">Mark present at the start of your hotel shift daily.</p>

            {attendanceMarkedToday ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>Attendance Logged for Today!</span>
              </div>
            ) : (
              <button
                onClick={handleMarkAttendance}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all active:scale-[0.98]"
              >
                Mark Today's Attendance
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-slate-850">
              <h4 className="text-xs font-semibold text-slate-450 uppercase mb-2">Shift Attendance History</h4>
              <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1">
                {user?.employeeDetails?.attendance?.map((att, i) => (
                  <div key={i} className="flex justify-between text-xs bg-slate-950 px-3 py-2 rounded border border-slate-850 text-slate-400">
                    <span>{new Date(att.date).toLocaleDateString()}</span>
                    <span className="text-emerald-400 font-semibold">Present</span>
                  </div>
                ))}
                {(!user?.employeeDetails?.attendance || user.employeeDetails.attendance.length === 0) && (
                  <p className="text-slate-500 text-xs py-2">No shift records found.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Assigned Tasks & Cleaning Status */}
        <div className="space-y-6 lg:col-span-2">
          {/* Assigned Tasks */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-850 flex items-center justify-between">
              <h3 className="font-bold text-slate-200">My Operations Checklist</h3>
              <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-mono">
                {tasks.filter(t => t.status === 'pending').length} Remaining
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-550">Loading operations list...</div>
            ) : (
              <div className="divide-y divide-slate-850">
                {tasks.map((task) => (
                  <div 
                    key={task._id} 
                    onClick={() => toggleTaskStatus(task._id, task.status)}
                    className="p-6 hover:bg-slate-850/20 cursor-pointer transition-colors flex gap-4 items-start"
                  >
                    <button className="mt-0.5 text-slate-500 hover:text-amber-500 transition-colors">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </div>
                      <p className={`text-xs mt-1 ${task.status === 'completed' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {task.description || 'No additional instructions provided.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-slate-500">
                        {task.room && (
                          <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded font-bold text-amber-500">
                            Room {task.room.roomNumber}
                          </span>
                        )}
                        <span>Assigned by: {task.assignedBy?.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="p-12 text-center text-slate-500 text-sm">
                    No assigned tasks found. Enjoy your shifts!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Rooms List Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-850">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Hotel Rooms Directory</span>
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              {/* Desktop View */}
              <div className="hidden md:block">
                <table className="w-full text-left text-sm text-slate-350">
                  <thead className="bg-slate-950/60 text-xs text-slate-450 uppercase border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">Room #</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {rooms.map((room) => (
                      <tr key={room._id} className="hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-amber-500">{room.roomNumber}</td>
                        <td className="px-6 py-4 font-semibold text-slate-200">{room.type}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold ${
                            room.status === 'available' ? 'bg-emerald-500/10 text-emerald-450' :
                            room.status === 'occupied' ? 'bg-rose-500/10 text-rose-455' :
                            'bg-amber-500/10 text-amber-450'
                          }`}>
                            {room.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid View */}
              <div className="block md:hidden p-4 space-y-4">
                {rooms.map((room) => (
                  <div key={room._id} className="bg-slate-950 p-4 border border-slate-850 rounded-none space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-amber-500 text-lg">Room {room.roomNumber}</span>
                      <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold ${
                        room.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        room.status === 'occupied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                    <div className="text-sm space-y-1 text-slate-350">
                      <div><span className="text-slate-500">Type:</span> <span className="font-semibold text-slate-300">{room.type}</span></div>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <div className="text-center py-6 text-slate-500">No rooms available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
