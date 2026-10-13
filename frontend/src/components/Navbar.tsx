import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Droplet,
  Search,
  Radio,
  PlusCircle,
  Building2,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Languages,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useLowBandwidth } from '../context/LowBandwidthContext';
import { NotificationBell } from './NotificationBell';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isLowBandwidth, toggleLowBandwidth } = useLowBandwidth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-crimson-700 to-crimson-500 flex items-center justify-center shadow-md shadow-crimson-500/20 group-hover:scale-105 transition">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Life<span className="text-crimson-600">Link</span>
                </span>
                <span className="text-[10px] font-bold bg-crimson-50 text-crimson-700 px-1.5 py-0.5 rounded border border-crimson-200">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium tracking-wide">
                Smart Blood Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/find-donors"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive('/find-donors')
                  ? 'bg-crimson-50 text-crimson-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              {t.nav.findDonors}
            </Link>

            <Link
              to="/emergency"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive('/emergency')
                  ? 'bg-rose-100 text-rose-800'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
              {t.nav.emergencyRequests}
            </Link>

            <Link
              to="/create-request"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive('/create-request')
                  ? 'bg-crimson-50 text-crimson-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t.nav.createRequest}
            </Link>

            <Link
              to="/directory"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive('/directory')
                  ? 'bg-crimson-50 text-crimson-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              {t.nav.directory}
            </Link>

            <Link
              to="/eligibility"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive('/eligibility')
                  ? 'bg-crimson-50 text-crimson-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t.nav.eligibility}
            </Link>

            {/* Role specific shortcuts */}
            {isAuthenticated && (
              <>
                <Link
                  to="/donor/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/donor/dashboard')
                      ? 'bg-crimson-50 text-crimson-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {t.nav.donorDashboard}
                </Link>

                <Link
                  to="/patient/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isActive('/patient/dashboard')
                      ? 'bg-crimson-50 text-crimson-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  {t.nav.patientDashboard}
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isActive('/admin')
                        ? 'bg-purple-100 text-purple-900 font-bold'
                        : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {t.nav.admin}
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Tools (Lang, Bandwidth, Notifications, Auth) */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="p-1.5 text-xs font-bold text-slate-700 hover:text-crimson-600 rounded-lg hover:bg-slate-100 flex items-center gap-1 transition"
              title="Switch Language (English / ಕನ್ನಡ)"
            >
              <Languages className="w-4 h-4 text-crimson-600" />
              <span className="hidden sm:inline">{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {/* Low-Bandwidth Mode Toggle */}
            <button
              onClick={toggleLowBandwidth}
              className={`p-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
                isLowBandwidth
                  ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle Low-Bandwidth Data Saver Mode"
            >
              <Zap className={`w-4 h-4 ${isLowBandwidth ? 'text-amber-600 fill-amber-500' : ''}`} />
              <span className="hidden xl:inline">
                {isLowBandwidth ? t.nav.lowBandwidth : t.nav.normalBandwidth}
              </span>
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <Link
                  to="/settings"
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-crimson-100 text-crimson-700 flex items-center justify-center font-bold text-[11px]">
                    {user?.fullName[0] || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.fullName.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/donor/register"
                  className="px-3.5 py-1.5 text-xs font-bold bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl shadow-sm shadow-crimson-600/30 transition"
                >
                  {t.hero.becomeDonorBtn}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Open mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/find-donors"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Search className="w-4 h-4 text-crimson-600" />
            {t.nav.findDonors}
          </Link>
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            <Radio className="w-4 h-4 text-rose-600" />
            {t.nav.emergencyRequests}
          </Link>
          <Link
            to="/create-request"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <PlusCircle className="w-4 h-4 text-crimson-600" />
            {t.nav.createRequest}
          </Link>
          <Link
            to="/directory"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Building2 className="w-4 h-4 text-crimson-600" />
            {t.nav.directory}
          </Link>
          <Link
            to="/eligibility"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="w-4 h-4 text-crimson-600" />
            {t.nav.eligibility}
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/donor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Layers className="w-4 h-4 text-crimson-600" />
                {t.nav.donorDashboard}
              </Link>
              <Link
                to="/patient/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-crimson-600" />
                {t.nav.patientDashboard}
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:bg-purple-50"
                >
                  <Shield className="w-4 h-4" />
                  {t.nav.admin}
                </Link>
              )}
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4" />
                Settings & Privacy
              </Link>
            </>
          )}
          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 mt-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-crimson-800 bg-crimson-50 hover:bg-crimson-100"
              >
                Sign in / Demo access
              </Link>
              <Link
                to="/donor/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-white bg-crimson-600 hover:bg-crimson-700"
              >
                Become a donor
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
