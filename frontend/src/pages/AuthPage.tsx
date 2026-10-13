import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Droplet,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ALL_BLOOD_GROUPS } from '../utils/bloodCompatibility';

const DEMO_DONOR_EMAILS: Record<string, string> = {
  'O-': 'donor.o@lifelink.demo',
  'O+': 'donor.o_pos@lifelink.demo',
  'A-': 'donor.a_neg@lifelink.demo',
  'A+': 'donor.a@lifelink.demo',
  'B-': 'donor.b_neg@lifelink.demo',
  'B+': 'donor.b@lifelink.demo',
  'AB-': 'donor.ab_neg@lifelink.demo',
  'AB+': 'donor.ab_pos@lifelink.demo',
};

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterInitial = location.pathname === '/register';
  const [isRegister, setIsRegister] = useState(isRegisterInitial);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'DONOR' | 'PATIENT' | 'HOSPITAL'>('DONOR');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Quick Demo Logins
  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        if (res.user.role === 'ADMIN') {
          navigate('/admin');
        } else if (res.user.role === 'DONOR') {
          navigate('/donor/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      } else {
        setError(res.error || 'Failed to authenticate demo account.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error while logging in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        const res = await api.register({
          fullName,
          email,
          password,
          phone: phone || undefined,
          role,
        });

        if (res.success && res.token && res.user) {
          login(res.token, res.user);
          if (role === 'DONOR') {
            navigate('/donor/register');
          } else {
            navigate('/patient/dashboard');
          }
        } else {
          setError(res.error || 'Registration failed.');
        }
      } else {
        const res = await api.login({ email, password });
        if (res.success && res.token && res.user) {
          login(res.token, res.user);
          if (res.user.role === 'ADMIN') {
            navigate('/admin');
          } else if (res.user.role === 'DONOR') {
            navigate('/donor/dashboard');
          } else {
            navigate('/patient/dashboard');
          }
        } else {
          setError(res.error || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-w-full min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-healthcare border border-slate-100">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-crimson-700 to-crimson-500 flex items-center justify-center shadow-lg shadow-crimson-500/30">
            <Droplet className="w-7 h-7 text-white fill-white" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? 'Join LifeLink Network' : 'Welcome to LifeLink'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            {isRegister
              ? 'Create a voluntary donor or patient account'
              : 'Sign in to access your dashboard and active matches'}
          </p>
          <Link to="/" className="mt-2 inline-block text-[11px] font-semibold text-crimson-700 hover:text-crimson-900">
            Back to LifeLink home
          </Link>
        </div>

        {/* Demo Accounts Pill Panel */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-crimson-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              1-Click Demo Evaluation Accounts
            </span>
          </div>
          <p className="text-[10px] font-semibold text-slate-500 mb-1.5">Donor accounts · password: DemoDonor@123</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            {ALL_BLOOD_GROUPS.map((bloodGroup) => (
              <button
                key={bloodGroup}
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin(DEMO_DONOR_EMAILS[bloodGroup], 'DemoDonor@123')}
                className="px-2.5 py-1.5 bg-white hover:bg-crimson-50 hover:text-crimson-700 text-slate-700 font-semibold rounded-lg border border-slate-200 text-left transition truncate shadow-xs"
                aria-label={`Sign in as demo donor with ${bloodGroup} blood group`}
              >
                🩸 Donor ({bloodGroup})
              </button>
            ))}
          </div>
          <p className="text-[10px] font-semibold text-slate-500 mt-2 mb-1.5">Other demo roles</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('patient@lifelink.demo', 'DemoPatient@123')}
              className="px-2.5 py-1.5 bg-white hover:bg-crimson-50 hover:text-crimson-700 text-slate-700 font-semibold rounded-lg border border-slate-200 text-left transition truncate shadow-xs"
            >
              🏥 Requester
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('hospital@lifelink.demo', 'DemoHospital@123')}
              className="px-2.5 py-1.5 bg-white hover:bg-crimson-50 hover:text-crimson-700 text-slate-700 font-semibold rounded-lg border border-slate-200 text-left transition truncate shadow-xs"
            >
              🏢 Hospital
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin@lifelink.demo', 'DemoAdmin@123')}
              className="col-span-2 sm:col-span-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 text-center transition truncate shadow-xs flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3 text-purple-700" /> System Admin
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition ${
              !isRegister
                ? 'border-crimson-600 text-crimson-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center transition ${
              isRegister
                ? 'border-crimson-600 text-crimson-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-crimson-600">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Role / Purpose <span className="text-crimson-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'DONOR', label: 'Blood Donor' },
                    { id: 'PATIENT', label: 'Requester' },
                    { id: 'HOSPITAL', label: 'Hospital' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`py-1.5 px-2 rounded-xl border text-center font-semibold transition ${
                        role === r.id
                          ? 'border-crimson-600 bg-crimson-50 text-crimson-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (Optional & Private)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-crimson-600">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Password <span className="text-crimson-600">*</span>
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-crimson-600 hover:text-crimson-700"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password <span className="text-crimson-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white text-xs font-bold rounded-xl shadow-md shadow-crimson-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{isRegister ? 'Register & Continue' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Privacy Assurance Footer */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Zero Spam • Anonymous Contact Requests • Data Protection
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500">Secure credential recovery</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Password Reset Dispatched
                </p>
                <p className="text-slate-600">
                  If an account exists for <span className="font-semibold">{forgotEmail}</span>, a secure one-time reset link has been dispatched to your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                    setForgotEmail('');
                  }}
                  className="w-full mt-2 py-1.5 bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter your registered email address. We will verify your identity and send recovery instructions.
                </p>
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl shadow-xs"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
