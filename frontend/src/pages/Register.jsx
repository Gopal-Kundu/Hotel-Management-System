import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../store/authSlice.js';
import { User, Mail, KeyRound, ArrowRight, Loader2, ShieldCheck, X, RefreshCw, Shield } from 'lucide-react';
import api from '../utils/api.js';
import { toast } from 'sonner';
import validator from 'validator';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { loading, isClickedBookedNow } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error('Please fill in all required fields');
    }
    if (!validator.isEmail(email)) {
      return toast.error('Please enter a valid email address');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    dispatch(authStart());
    try {
      const response = await api.post('/auth/generate-otp', { email, name });
      toast.success(response.data.message || 'OTP sent to your email!');
      setIsOtpSent(true);
      dispatch(authFailure());
    } catch (error) {
      console.error('OTP request error:', error);
      const msg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      dispatch(authFailure(msg));
      toast.error(msg);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      const response = await api.post('/auth/generate-otp', { email, name });
      toast.success(response.data.message || `New OTP sent to ${email}!`);
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      return toast.error('Please enter the 4-digit OTP code');
    }

    dispatch(authStart());
    try {
      const selectedRole = isClickedBookedNow ? 'customer' : role;
      const response = await api.post('/auth/register', { name, email, password, otp, role: selectedRole });
      const userData = response.data;
      dispatch(authSuccess({ user: userData }));
      toast.success(`Account created & verified! Welcome, ${userData.name}!`);

      if (userData.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (userData.role === 'manager') {
        navigate('/manager-dashboard');
      } else if (userData.role === 'employee') {
        navigate('/employee-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Registration verification error:', error);
      const msg = error.response?.data?.message || 'OTP verification failed';
      dispatch(authFailure(msg));
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-2 text-sm">
            Sign up to access your portal and hotel services
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isClickedBookedNow && (
            <div className="space-y-1.5 mb-2">
              <label className="text-sm font-semibold text-slate-300 block">Account Role</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'customer', label: 'Customer' },
                  { id: 'employee', label: 'Employee' },
                  { id: 'manager', label: 'Manager' },
                  { id: 'admin', label: 'Admin' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                      role === r.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 block">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-amber-500 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-amber-500 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-300 block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <KeyRound className="h-5 w-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-amber-500 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm border-t border-slate-800/85 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-500 hover:underline font-semibold transition-colors">
            Login here
          </Link>
        </p>
      </div>

      {/* OTP Verification Modal */}
      {isOtpSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => setIsOtpSent(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Verify Your Account</h3>
              <p className="text-xs text-slate-400 mt-1">Enter the 4-digit OTP sent to <span className="text-amber-400 font-semibold">{email}</span></p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="0 0 0 0"
                  className="w-full bg-slate-950 border border-slate-800 text-center tracking-[0.5em] text-2xl font-mono text-amber-500 py-3 rounded-lg outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${resendLoading ? 'animate-spin' : ''}`} />
                  <span>Resend OTP</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Complete Signup'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
