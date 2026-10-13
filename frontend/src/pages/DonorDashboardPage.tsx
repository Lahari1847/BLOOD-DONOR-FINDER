import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Heart,
  Droplet,
  Radio,
  Plus,
  Award,
  BarChart3,
  MessageSquareText,
  TrendingUp,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BloodBadge } from '../components/BloodBadge';

export const DonorDashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(user?.donorProfile || null);
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggleLoading, setToggleLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Log donation modal state
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [donationType, setDonationType] = useState('WHOLE_BLOOD');
  const [units, setUnits] = useState(1);
  const [hospitalName, setHospitalName] = useState('Victoria Hospital Blood Bank');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const userRes = await api.getMe();
      if (userRes.success && userRes.user) {
        setProfile(userRes.user.donorProfile || null);
      }

      const [requestsRes, analyticsRes] = await Promise.all([
        api.getDonorContactRequests(),
        api.getDonorAnalytics(),
      ]);
      if (requestsRes.success) {
        setContactRequests(requestsRes.contactRequests || []);
      }
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.analytics);
        setAnalyticsError(null);
      } else {
        setAnalyticsError(analyticsRes.error || 'Unable to load donor analytics.');
      }
    } catch (err) {
      console.error(err);
      setAnalyticsError('Unable to load donor analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async () => {
    setToggleLoading(true);
    try {
      const res = await api.toggleAvailability();
      if (res.success) {
        setProfile((prev: any) => ({
          ...prev,
          isAvailable: res.isAvailable,
          lastConfirmedAt: res.lastConfirmedAt,
        }));
        setActionSuccess(res.message);
        setTimeout(() => setActionSuccess(''), 3000);
        await refreshUser();
      }
    } catch (err) {
      alert('Failed to toggle availability.');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleRespond = async (id: string, action: 'ACCEPT' | 'DECLINE' | 'RESERVE') => {
    try {
      const res = await api.respondToContactRequest(id, action);
      if (res.success) {
        setActionSuccess(res.message);
        setContactRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: res.contactRequest.status } : r))
        );
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch {
      alert('Failed to update request response.');
    }
  };

  const handleLogDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addDonationRecord({
        donationType,
        units,
        hospitalName,
        notes,
      });

      if (res.success) {
        setLogModalOpen(false);
        setActionSuccess('Donation successfully recorded. Next eligible date calculated.');
        setTimeout(() => setActionSuccess(''), 3000);
        await loadData();
      }
    } catch {
      alert('Failed to record donation.');
    }
  };

  // Calculate Next Eligible Donation countdown
  const calculateNextEligibleDays = () => {
    if (!profile?.donationRecords || profile.donationRecords.length === 0) return 0;
    const lastRec = profile.donationRecords[0];
    const nextDate = new Date(lastRec.nextEligibleDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const remainingDays = calculateNextEligibleDays();

  const handleExportAnalytics = () => {
    if (!analytics) return;

    const rows = [
      ['LifeLink donor impact report'],
      ['Generated at', new Date().toISOString()],
      ['Lifetime donations', analytics.totalDonations],
      ['Units in verified records', analytics.unitsDonated],
      ['Total inquiries', analytics.totalInquiries],
      ['Inquiries answered', analytics.respondedInquiries],
      ['Response rate', `${analytics.responseRate}%`],
      ['Inquiries awaiting response', analytics.pendingInquiries],
      [],
      ['Month', 'Year', 'Donation records'],
      ...analytics.monthlyDonations.map((month: { month: string; year: number; count: number }) => [
        month.month,
        month.year,
        month.count,
      ]),
    ];
    const csv = rows
      .map((row: (string | number)[]) =>
        row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifelink-donor-impact-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading donor portal...</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-600 flex items-center justify-center mx-auto">
          <Droplet className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Donor Profile Found</h2>
        <p className="text-xs text-slate-500">
          You are currently signed in with a standard account. Register your donor profile to participate
          in the network.
        </p>
        <a
          href="/donor/register"
          className="inline-block px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          Create Donor Profile
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Status & Quick Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-crimson-50 text-crimson-700 flex items-center justify-center font-black text-xl shrink-0">
            {profile.bloodGroup}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Donor Dashboard
              </h1>
              <BloodBadge group={profile.bloodGroup} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Location: <strong>{profile.locality ? `${profile.locality}, ` : ''}{profile.city}</strong> • Lifetime Donations: <strong>{profile.totalDonations}</strong>
            </p>
          </div>
        </div>

        {/* Live Availability Switch */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 self-start md:self-auto">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              {profile.isAvailable ? 'Currently Available' : 'Currently Unavailable'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Last confirmed: {new Date(profile.lastConfirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={toggleLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              profile.isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
            }`}
          >
            {toggleLoading ? 'Updating...' : profile.isAvailable ? 'Available' : 'Make Available'}
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {actionSuccess}
        </div>
      )}

      <section className="space-y-4" aria-labelledby="donor-analytics-title">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-crimson-700 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              Donor impact
            </div>
            <h2 id="donor-analytics-title" className="text-xl font-extrabold text-slate-900 mt-1">
              Your contribution, at a glance
            </h2>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <p className="text-xs text-slate-500">Live insights from your verified activity</p>
            <button
              type="button"
              onClick={handleExportAnalytics}
              disabled={!analytics}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-crimson-200 hover:bg-crimson-50 hover:text-crimson-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export impact report
            </button>
          </div>
        </div>

        {analyticsError ? (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            {analyticsError}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="grid grid-cols-2 gap-4 lg:col-span-1">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Lifetime donations</span>
                  <Heart className="w-4 h-4 text-crimson-600" />
                </div>
                <p className="text-3xl font-black text-slate-900 mt-3">{analytics.totalDonations}</p>
                <p className="text-[11px] text-slate-500 mt-1">Recorded on your donor profile</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Units logged</span>
                  <Droplet className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-3xl font-black text-slate-900 mt-3">{analytics.unitsDonated}</p>
                <p className="text-[11px] text-slate-500 mt-1">Across verified donation records</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Requests answered</span>
                  <MessageSquareText className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-3xl font-black text-slate-900 mt-3">{analytics.responseRate}%</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {analytics.respondedInquiries} of {analytics.totalInquiries} inquiries
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Awaiting response</span>
                  <Radio className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-3xl font-black text-slate-900 mt-3">{analytics.pendingInquiries}</p>
                <p className="text-[11px] text-slate-500 mt-1">Open donor inquiries</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">Donation activity</h3>
                  <p className="text-xs text-slate-500 mt-1">Verified donations recorded over the last six months</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-crimson-50 text-crimson-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="grid grid-cols-6 gap-3 items-end h-40 mt-6" aria-label="Donation activity by month">
                {analytics.monthlyDonations.map((month: { month: string; year: number; count: number }) => {
                  const maxCount = Math.max(1, ...analytics.monthlyDonations.map((item: { count: number }) => item.count));
                  const barHeight = month.count > 0 ? Math.max(16, (month.count / maxCount) * 100) : 6;
                  return (
                    <div
                      key={`${month.year}-${month.month}`}
                      className="h-full flex flex-col items-center justify-end gap-2"
                      aria-label={`${month.count} donation${month.count === 1 ? '' : 's'} in ${month.month} ${month.year}`}
                    >
                      <span className="text-[10px] font-bold text-slate-500">{month.count || ''}</span>
                      <div className="w-full h-28 flex items-end justify-center">
                        <div
                          className={`w-full max-w-10 rounded-t-lg transition-all ${month.count ? 'bg-gradient-to-t from-crimson-700 to-rose-400' : 'bg-slate-100'}`}
                          style={{ height: `${barHeight}%` }}
                          title={`${month.count} donation${month.count === 1 ? '' : 's'} in ${month.month} ${month.year}`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{month.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-crimson-600" />
                Donation records are based on your logged clinical history.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-sm text-slate-500">
            Loading your donor insights...
          </div>
        )}
      </section>

      {/* Grid: Eligibility Tracker & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Donation Eligibility Calculator */}
        <div className="bg-gradient-to-br from-crimson-900 to-rose-950 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-rose-300 uppercase tracking-wider mb-3">
              <span>Recovery Interval</span>
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold">Next Eligible Donation</h3>
            <p className="text-xs text-slate-300 mt-1">
              Standard 90-day whole blood recovery window as per National Blood Transfusion Council guidelines.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-800/60">
            {remainingDays === 0 ? (
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>You are fully eligible to donate now!</span>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-black text-rose-300">{remainingDays} Days</div>
                <div className="text-xs text-slate-300">Remaining until next recommended safe donation</div>
              </div>
            )}
          </div>
        </div>

        {/* Reliability Score Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <span>Reliability Index</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Emergency Response Metric</h3>
            <p className="text-xs text-slate-500 mt-1">
              Contributes 15 points to your transparent AI priority ranking score for emergency patient matches.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">
              {Math.round((profile.reliabilityScore || 1.0) * 100)}%
            </span>
            <span className="text-xs text-slate-400">Response Integrity Rate</span>
          </div>
        </div>

        {/* Log Donation Action */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <span>Verified Records</span>
              <Droplet className="w-4 h-4 text-crimson-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Record a Donation</h3>
            <p className="text-xs text-slate-500 mt-1">
              Completed a voluntary blood donation? Add it to your verified clinical history.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setLogModalOpen(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Log New Donation
            </button>
          </div>
        </div>
      </div>

      {/* Incoming Contact Requests */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Incoming Contact Inquiries</h2>
            <p className="text-xs text-slate-500">
              Direct outreach inquiries from verified patients and hospitals.
            </p>
          </div>
          <span className="text-xs font-bold bg-crimson-50 text-crimson-800 px-2.5 py-1 rounded-full border border-crimson-200">
            {contactRequests.length} Total
          </span>
        </div>

        {contactRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No incoming contact requests at the moment. Keep your availability active to receive matches!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {contactRequests.map((req) => (
              <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      {req.bloodRequest?.patientName || 'Emergency Patient'}
                    </span>
                    <BloodBadge group={req.bloodRequest?.bloodGroup || profile.bloodGroup} size="sm" />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'RESERVED' ? 'bg-blue-100 text-blue-800' :
                      req.status === 'DECLINED' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Hospital: <strong>{req.bloodRequest?.hospitalName}</strong>, {req.bloodRequest?.city}
                  </p>
                  {req.message && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg max-w-xl">
                      "{req.message}"
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 block">
                    Received {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRespond(req.id, 'ACCEPT')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, 'RESERVE')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                      title="Donor Commitment: Temporarily reserve yourself for this patient"
                    >
                      Commit & Reserve
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, 'DECLINE')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation History List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Donation History Log</h2>
        {(!profile.donationRecords || profile.donationRecords.length === 0) ? (
          <p className="text-xs text-slate-400">No donation records registered yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {profile.donationRecords.map((rec: any) => (
              <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{rec.hospitalName}</span>
                  <span className="text-slate-400 block mt-0.5">
                    {new Date(rec.donationDate).toLocaleDateString()} • {rec.donationType.replace('_', ' ')} ({rec.units} unit/s)
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                  Verified
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Donation Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-3">Record Blood Donation</h3>
            <form onSubmit={handleLogDonationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Donation Type</label>
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="WHOLE_BLOOD">Whole Blood (90 days interval)</option>
                  <option value="PLATELETS">Single Donor Platelets (14 days interval)</option>
                  <option value="PLASMA">Plasma (28 days interval)</option>
                  <option value="RED_CELLS">Double Red Cells (112 days interval)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital / Blood Bank</label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Units Donated</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={units}
                  onChange={(e) => setUnits(parseInt(e.target.value, 10))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl font-bold"
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
