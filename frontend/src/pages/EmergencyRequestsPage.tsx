import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  MapPin,
  Building2,
  AlertTriangle,
  Share2,
  Heart,
  Flag,
  CheckCircle,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { BloodBadge } from '../components/BloodBadge';
import { EmergencyRadar } from '../components/EmergencyRadar';
import { ShareRequestModal } from '../components/ShareRequestModal';
import { ALL_BLOOD_GROUPS } from '../utils/bloodCompatibility';
import { useAuth } from '../context/AuthContext';

export const EmergencyRequestsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBloodGroup, setFilterBloodGroup] = useState('ALL');
  const [filterCity, setFilterCity] = useState('');

  // Modals
  const [selectedShareRequest, setSelectedShareRequest] = useState<any | null>(null);
  const [reportModalRequest, setReportModalRequest] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchEmergencyRequests = async () => {
    setLoading(true);
    try {
      const res = await api.listEmergencyRequests({
        bloodGroup: filterBloodGroup !== 'ALL' ? filterBloodGroup : undefined,
        city: filterCity.trim() || undefined,
      });
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyRequests();
  }, [filterBloodGroup]);

  const handleReportAbuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalRequest) return;
    try {
      const res = await api.reportAbuse({
        targetType: 'REQUEST',
        targetId: reportModalRequest.id,
        reason: reportReason,
      });
      if (res.success) {
        setActionSuccess(res.message);
        setTimeout(() => {
          setActionSuccess('');
          setReportModalRequest(null);
          setReportReason('');
        }, 2000);
      }
    } catch {
      alert('Failed to submit abuse report.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Emergency Match Radar Widget */}
      <EmergencyRadar
        bloodGroup={filterBloodGroup !== 'ALL' ? filterBloodGroup : 'O-'}
        city={filterCity || 'Bengaluru'}
        candidateCount={requests.length > 0 ? 8 : 4}
        urgency="CRITICAL"
      />

      {/* Emergency Notice */}
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-rose-950 font-bold mb-0.5">CRITICAL CLINICAL NOTICE</strong>
          LifeLink connects community volunteers. If you or a family member are in acute trauma, call
          emergency medical services (<strong>112</strong> / <strong>108</strong>) and mobilize immediately
          to the nearest government hospital blood bank.
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
          {actionSuccess}
        </div>
      )}

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700">Filter Emergencies:</span>
          <select
            value={filterBloodGroup}
            onChange={(e) => setFilterBloodGroup(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
          >
            <option value="ALL">All Blood Groups</option>
            {ALL_BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg} Group
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by city (e.g. Bengaluru)"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl w-48 text-slate-800"
          />

          <button
            onClick={fetchEmergencyRequests}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition"
          >
            Filter
          </button>
        </div>

        <span className="text-slate-400 font-medium">
          Showing <strong>{requests.length}</strong> active emergency requests
        </span>
      </div>

      {/* Emergency Requests Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading active emergency requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Critical Shortages Reported</h3>
          <p className="text-xs text-slate-500">
            All current emergency blood requirements have been matched or resolved.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => {
            const isCritical = req.urgency === 'CRITICAL';
            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2 ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.urgency} REQUIREMENT
                      </span>
                      <h3 className="font-bold text-base text-slate-900">{req.patientName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.hospitalName}</span>
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.locality ? `${req.locality}, ` : ''}{req.city}</span>
                      </p>
                    </div>

                    <BloodBadge group={req.bloodGroup} size="lg" />
                  </div>

                  {/* Countdown Expiry Progress */}
                  <div className="mt-4 p-3 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        Expires in {req.remainingHours} hrs
                      </span>
                      <span>{req.unitsRequired} Unit(s) Needed</span>
                    </div>
                    <div className="w-full bg-rose-200/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(15, (req.remainingHours / 24) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {req.note && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3 leading-relaxed">
                      "{req.note}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`/find-donors?bloodGroup=${encodeURIComponent(req.bloodGroup)}&city=${encodeURIComponent(req.city)}`}
                    className="flex-1 py-2 px-3 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Mobilize Donors
                  </a>

                  <button
                    onClick={() => setSelectedShareRequest(req)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="Share Request Summary"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setReportModalRequest(req)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Report Abuse / Spam"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {selectedShareRequest && (
        <ShareRequestModal
          isOpen={!!selectedShareRequest}
          onClose={() => setSelectedShareRequest(null)}
          request={selectedShareRequest}
        />
      )}

      {/* Abuse Report Modal */}
      {reportModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Report Inappropriate Request</h3>
            <p className="text-xs text-slate-500">
              Help preserve safety. Reports are sent directly to the central administrator moderation desk.
            </p>

            <form onSubmit={handleReportAbuse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Report</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Suspected duplicate spam, inaccurate hospital information, or abusive language."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalRequest(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
