import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  Zap,
  Calendar,
  Building2,
  Droplet,
  Save,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLowBandwidth } from '../context/LowBandwidthContext';
import { api } from '../services/api';
import { BloodBadge } from '../components/BloodBadge';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { isLowBandwidth, toggleLowBandwidth } = useLowBandwidth();
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredContact, setPreferredContact] = useState<'IN_APP' | 'EMAIL' | 'PHONE'>(
    (user?.donorProfile?.preferredContact as any) || 'IN_APP'
  );
  const [isPublic, setIsPublic] = useState(user?.donorProfile?.isPublic ?? true);
  const [consentGiven, setConsentGiven] = useState(user?.donorProfile?.consentGiven ?? true);

  // Donation log form
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [donationType, setDonationType] = useState('WHOLE_BLOOD');
  const [hospitalName, setHospitalName] = useState('');
  const [notes, setNotes] = useState('');

  // Status
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      if (user.donorProfile) {
        setPreferredContact((user.donorProfile.preferredContact as any) || 'IN_APP');
        setIsPublic(user.donorProfile.isPublic ?? true);
        setConsentGiven(user.donorProfile.consentGiven ?? true);
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await api.updateProfile({
        fullName,
        phone,
      });

      if (res.success) {
        updateUser({ fullName, phone });
        // If donor profile exists, update contact preference & privacy
        if (user?.donorProfile) {
          await api.upsertDonorProfile({
            bloodGroup: user.donorProfile.bloodGroup,
            city: user.donorProfile.city,
            age: 25,
            preferredContact,
            isPublic,
            consentGiven,
          });
        }
        setStatusMsg({ type: 'success', text: 'Profile and privacy settings saved successfully.' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error updating settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName) return;
    try {
      const res = await api.addDonationRecord({
        donationDate,
        donationType,
        units: 1,
        hospitalName,
        notes,
      });

      if (res.success) {
        setShowAddDonationModal(false);
        setStatusMsg({ type: 'success', text: 'Donation recorded! Your next eligible donation date has been recalculated.' });
        window.location.reload();
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to add donation log.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error logging donation.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      const res = await api.deleteAccount();
      if (res.success) {
        logout();
        navigate('/');
      } else {
        alert(res.error || 'Failed to delete account');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during account removal.');
    }
  };

  // Next donation calculation
  const lastDonationDate = user?.donorProfile?.lastDonationDate
    ? new Date(user.donorProfile.lastDonationDate)
    : null;

  const nextEligibleDate = lastDonationDate
    ? new Date(lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000)
    : null;

  const isEligibleNow = !nextEligibleDate || new Date() >= nextEligibleDate;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & Privacy Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, contact disclosure preferences, consent flags, and donation timeline.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Profile & Privacy Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-healthcare space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-crimson-600" />
          Identity & Contact Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registered Email (Primary Identity)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed directly for audit integrity.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone (Never Publicly Displayed)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Contact Channel
            </label>
            <select
              value={preferredContact}
              onChange={(e) => setPreferredContact(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
            >
              <option value="IN_APP">In-App Secure Notification (Recommended)</option>
              <option value="EMAIL">Email Dispatch</option>
              <option value="PHONE">Direct Emergency Phone</option>
            </select>
          </div>
        </div>

        {/* Privacy & Consent Controls */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Privacy Controls & Consent Management
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100/60 transition">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mt-1 h-4 w-4 text-crimson-600 rounded border-slate-300 focus:ring-crimson-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">List in Anonymous Donor Search</span>
                <span className="text-slate-500 text-[11px]">
                  When checked, eligible requesters can discover your blood group and approximate locality without viewing your phone or email.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100/60 transition">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 h-4 w-4 text-crimson-600 rounded border-slate-300 focus:ring-crimson-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">LifeLink Voluntary Donor Consent</span>
                <span className="text-slate-500 text-[11px]">
                  I consent to receive high-urgency notifications when matching patient emergencies arise in my designated geographical radius.
                </span>
              </div>
            </label>

            {/* Low-Bandwidth Mode */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Zap className={`w-4 h-4 ${isLowBandwidth ? 'text-amber-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Low-Bandwidth Mode</span>
                  <span className="text-[11px] text-slate-500">
                    Disables heavy animations and high-res map tiles for rural 2G/3G connections.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleLowBandwidth}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                  isLowBandwidth
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isLowBandwidth ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow-md shadow-crimson-600/20 transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Donation History Tracker & Next Eligible Date */}
      {user?.role === 'DONOR' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-healthcare space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-crimson-600" />
                Donation History & Interval Countdown
              </h2>
              <p className="text-xs text-slate-500">
                Track past blood donations and monitor official rest interval eligibility.
              </p>
            </div>
            <button
              onClick={() => setShowAddDonationModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-crimson-50 text-crimson-700 border border-crimson-200 hover:bg-crimson-100 transition"
            >
              + Log New Donation
            </button>
          </div>

          {/* Eligibility Reminder Card */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isEligibleNow
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isEligibleNow ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <span className="font-extrabold block">
                {isEligibleNow
                  ? 'Eligible to Donate Blood Today'
                  : `Next Permissible Donation: ${nextEligibleDate?.toLocaleDateString()}`}
              </span>
              <p className="text-slate-600 text-[11px]">
                {isEligibleNow
                  ? 'You have completed the mandatory rest window (90 days for whole blood). You are clinically eligible to answer emergency calls.'
                  : 'The statutory recovery period allows bone marrow replenishment and restores red cell hemoglobin levels.'}
              </p>
            </div>
          </div>

          {/* Past Records List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recorded Donations ({user?.donorProfile?.donationRecords?.length || 0})
            </h3>
            {user?.donorProfile?.donationRecords && user.donorProfile.donationRecords.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {user.donorProfile.donationRecords.map((rec: any) => (
                  <div key={rec.id} className="p-3.5 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{rec.hospitalName}</span>
                      <span className="text-[11px] text-slate-500">
                        Type: {rec.donationType} • {new Date(rec.donationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                No past donations recorded yet. Click &ldquo;Log New Donation&rdquo; to start your journey.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Danger Zone: Account Deletion */}
      <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200 space-y-4">
        <h2 className="text-base font-bold text-rose-900 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-600" />
          Delete Account & Anonymize Data
        </h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          Permanent removal of your credentials, phone number, and personal donor profile. In accordance with data privacy regulations, active emergency requests associated with this account will be closed immediately.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          Permanently Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-rose-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Confirm Account Removal
            </h3>
            <p className="text-xs text-slate-600">
              This action cannot be undone. To confirm, type <span className="font-bold text-rose-700">DELETE</span> below:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-center uppercase"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Donation Modal */}
      {showAddDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-crimson-600" />
              Record Blood Donation
            </h3>
            <form onSubmit={handleAddDonation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Donation Date
                </label>
                <input
                  type="date"
                  required
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Donation Type
                </label>
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                >
                  <option value="WHOLE_BLOOD">Whole Blood (Standard 350-450ml)</option>
                  <option value="PLATELETS">Platelets (Apheresis)</option>
                  <option value="PLASMA">Plasma Donation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital / Blood Bank Center Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manipal Hospital Blood Bank"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-crimson-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDonationModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
