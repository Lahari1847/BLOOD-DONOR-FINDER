import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Droplet,
  Clock,
  AlertTriangle,
  Building2,
  ShieldAlert,
  Send,
  MapPin,
} from 'lucide-react';
import { ALL_BLOOD_GROUPS } from '../utils/bloodCompatibility';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CreateRequestPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [unitsRequired, setUnitsRequired] = useState(2);
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [urgency, setUrgency] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [requiredBy, setRequiredBy] = useState(() => {
    // Default 12 hours ahead
    const d = new Date(Date.now() + 12 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [contactPreference, setContactPreference] = useState('IN_APP');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [matchedDonorsCount, setMatchedDonorsCount] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      alert('Please sign in or register to publish an emergency blood request.');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createRequest({
        patientName,
        bloodGroup,
        unitsRequired: Number(unitsRequired),
        hospitalName,
        city,
        locality: locality || undefined,
        pincode: pincode || undefined,
        requiredBy: new Date(requiredBy).toISOString(),
        urgency,
        contactPreference,
        note: note || undefined,
      });

      if (res.success) {
        setMatchedDonorsCount(res.matchedDonorsCount || 0);
        setTimeout(() => {
          navigate('/emergency');
        }, 2000);
      } else {
        setErrorMessage(res.error || 'Failed to submit blood request.');
      }
    } catch {
      setErrorMessage('Network connection error while submitting request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Post an Emergency Blood Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Broadcasting directly to nearby compatible, available donors using transparent AI priority ranking.
          </p>
        </div>

        {/* Emergency Medical Care Warning Banner */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p>
            <strong>EMERGENCY NOTICE:</strong> LifeLink is a volunteer contact mobilization platform.
            In life-threatening situations, always call national emergency services (112 / 108) and visit
            licensed regional blood banks immediately.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {matchedDonorsCount !== null && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
            ✓ Request created successfully! Automatically notified {matchedDonorsCount} top-ranked compatible donors. Redirecting to Emergency Radar...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name / Alias</label>
              <input
                type="text"
                required
                placeholder="e.g. Master Arjun"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Blood Group</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Units Required</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
              />
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              Hospital & Facility Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victoria Hospital & Trauma Care"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Locality / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Fort Area, City Market"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 560002"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                />
              </div>
            </div>
          </div>

          {/* Urgency & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-crimson-500"
              >
                <option value="CRITICAL">CRITICAL (Immediate surgery / ICU trauma)</option>
                <option value="HIGH">HIGH (Required within 24 hours)</option>
                <option value="MEDIUM">MEDIUM (Elective procedure / stable)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required By (Deadline / Expiry)</label>
              <input
                type="datetime-local"
                required
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
              />
            </div>
          </div>

          {/* Non-sensitive Medical Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brief Note for Donors (Non-Sensitive)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Scheduled emergency laparotomy. Whole blood or compatible red cells required."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-crimson-600/30 transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Publishing & Notifying Donors...' : 'Publish Emergency Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
