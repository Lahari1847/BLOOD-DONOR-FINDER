import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Droplet,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  MapPin,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { ALL_BLOOD_GROUPS } from '../utils/bloodCompatibility';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DonorRegisterPage: React.FC = () => {
  const { user, isAuthenticated, login, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [age, setAge] = useState<number>(24);
  const [lastDonationDate, setLastDonationDate] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [preferredContact, setPreferredContact] = useState<string>('IN_APP');
  const [consentGiven, setConsentGiven] = useState<boolean>(true);
  const [isPublic, setIsPublic] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (age < 18 || age > 65) {
      setErrorMessage('Donors must be between 18 and 65 years old to donate safely.');
      return;
    }

    if (!consentGiven) {
      setErrorMessage('Consent to LifeLink voluntary donor network guidelines is required.');
      return;
    }

    setLoading(true);

    try {
      // 1. If not authenticated, register user account first
      let activeToken = localStorage.getItem('lifelink_token');

      if (!isAuthenticated) {
        if (!email || !password) {
          setErrorMessage('Please provide an email and password to create your account.');
          setLoading(false);
          return;
        }

        const regRes = await api.register({
          email,
          password,
          fullName,
          phone,
          role: 'DONOR',
        });

        if (!regRes.success) {
          setErrorMessage(regRes.error || 'Failed to create user account.');
          setLoading(false);
          return;
        }

        login(regRes.token, regRes.user);
        activeToken = regRes.token;
      }

      // 2. Upsert Donor Profile
      const profileRes = await api.upsertDonorProfile({
        bloodGroup,
        city,
        locality: locality || undefined,
        pincode: pincode || undefined,
        age: Number(age),
        lastDonationDate: lastDonationDate || null,
        isAvailable,
        preferredContact,
        consentGiven,
        isPublic,
      });

      if (profileRes.success) {
        setSuccessMessage('Donor profile created successfully! Redirecting to your dashboard...');
        await refreshUser();
        setTimeout(() => {
          navigate('/donor/dashboard');
        }, 1500);
      } else {
        setErrorMessage(profileRes.error || 'Failed to register donor profile.');
      }
    } catch {
      setErrorMessage('Network connection error while submitting profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-600 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 fill-crimson-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Register as a Blood Donor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join a network of verified voluntary donors. Your personal contact details remain shielded
            by privacy proxy rules.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Details if not signed in */}
          {!isAuthenticated && (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600" />
                Account Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Hegde"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91-9800000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Phone is kept strictly private and never shown publicly.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Clinical Profile Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-crimson-600" />
              Blood & Eligibility Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-crimson-800 focus:ring-1 focus:ring-crimson-500"
                >
                  {ALL_BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} Blood Group
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (18-65)</label>
                <input
                  type="number"
                  min="18"
                  max="65"
                  required
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Last Donation Date (Optional)
                </label>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-600" />
              Location (Approximate)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Locality / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Koramangala"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 560034"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>
            </div>
          </div>

          {/* Availability & Contact Preferences */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Available to Donate Right Now</span>
                <span className="text-[11px] text-slate-500">
                  You can toggle this on or off anytime with 1 click from your dashboard.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 rounded text-crimson-600 focus:ring-crimson-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Contact Method</label>
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <option value="IN_APP">LifeLink In-App Notifications (Recommended for Privacy)</option>
                <option value="EMAIL">Verified Email Notifications</option>
                <option value="PHONE">Encrypted Contact Relay</option>
              </select>
            </div>
          </div>

          {/* DPDP Consent Checkbox */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="w-4 h-4 rounded text-crimson-600 focus:ring-crimson-500 mt-0.5"
              />
              <span className="text-slate-700 leading-relaxed">
                I hereby declare that I am voluntarily registering as a blood donor. I understand that
                LifeLink is an algorithmic contact facilitation network and that final transfusion
                compatibility must be verified by a hospital blood bank.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-crimson-600/30 transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Registering Profile...' : 'Complete Donor Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
