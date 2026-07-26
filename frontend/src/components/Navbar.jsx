import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess } from '../store/authSlice.js';
import { Menu, X, Hotel, LogOut,} from 'lucide-react';
import api from '../utils/api.js';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logoutSuccess());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logoutSuccess());
      navigate('/login');
    }
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'manager':
        return '/manager-dashboard';
      case 'employee':
        return '/employee-dashboard';
      case 'customer':
        return '/customer-dashboard';
      default:
        return '/';
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 text-slate-100 shadow-xl shadow-slate-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-amber-500 hover:text-amber-400 transition-colors">
              <Hotel className="h-7 w-7 text-amber-500" />
              <span className="text-amber-500 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Hotel Booking System</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-base font-medium hover:text-amber-400 transition-colors">Home</Link>
            <Link to="/rooms" className="text-base font-medium hover:text-amber-400 transition-colors">Rooms</Link>
            
            {user ? (
              <>
                <Link
                  to={dashboardLink}
                  className="text-base font-medium hover:text-amber-400 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
                  <div className="flex flex-col items-end">
                    <span className="text-base font-semibold text-slate-200">{user.name}</span>
                    <span className="text-xs text-amber-500 capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/login"
                  className="text-base font-medium hover:text-amber-400 transition-colors"
                >
                  Sign In
                </Link>
                
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-none text-slate-400 hover:text-amber-400 hover:bg-slate-800/50 transition-colors"
            >
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with transition */}
      <div 
        className={`md:hidden bg-slate-900 px-4 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[400px] opacity-100 py-4 space-y-2' : 'max-h-0 opacity-0 py-0 border-none'
        }`}
      >
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="block px-3 py-2 rounded-none text-base font-medium hover:bg-slate-800 hover:text-amber-400 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/rooms"
          onClick={() => setIsOpen(false)}
          className="block px-3 py-2 rounded-none text-base font-medium hover:bg-slate-800 hover:text-amber-400 transition-colors"
        >
          Rooms
        </Link>
        {user ? (
          <>
            <Link
              to={dashboardLink}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-none text-base font-medium hover:bg-slate-800 hover:text-amber-400 transition-colors"
            >
              Dashboard
            </Link>
            <div className="border-t border-slate-800 pt-3 mt-3 flex items-center justify-between px-3">
              <div>
                <div className="font-semibold text-slate-200">{user.name}</div>
                <div className="text-xs text-amber-500 capitalize">{user.role}</div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-none text-base font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="pt-2 border-t border-slate-800">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center py-2 rounded-none text-base font-medium border border-slate-700 hover:bg-slate-800 transition-colors w-full mb-2"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
