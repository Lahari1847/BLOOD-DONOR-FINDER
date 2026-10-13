import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  PlusCircle,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  Share2,
  AlertCircle,
  MessageSquare,
  Droplet,
} from 'lucide-react';
import { api } from '../services/api';
import { BloodBadge } from '../components/BloodBadge';
import { ShareRequestModal } from '../components/ShareRequestModal';
import { useAuth } from '../context/AuthContext';

export const PatientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShare, setSelectedShare] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const res = await api.listMyRequests();
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
    fetchMyRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.updateRequestStatus(id, newStatus);
      if (res.success) {
        setActionSuccess(`Request marked as ${newStatus}.`);
        setTimeout(() => setActionSuccess(''), 3000);
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Requester Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your emergency blood requests, volunteer outreach responses, and fulfillment status.
          </p>
        </div>

        <Link
          to="/create-request"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Request
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {actionSuccess}
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 px-1">My Blood Requests</h2>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
            Loading your requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Blood Requests Created</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't posted any blood requests yet. If you need blood units for a patient, click below to post.
            </p>
            <Link
              to="/create-request"
              className="inline-block px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Post Emergency Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <BloodBadge group={req.bloodGroup} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{req.patientName}</h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            req.status === 'OPEN'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'FULFILLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'CANCELLED'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.hospitalName}, {req.city} • Units: <strong>{req.unitsRequired}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Required By: {new Date(req.requiredBy).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {req.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'FULFILLED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                        >
                          Mark Fulfilled
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'CANCELLED')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                        >
                          Close / Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedShare(req)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                      title="Share Summary"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Volunteer Responses Strip */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Donor Outreach Responses ({req.contactRequests?.length || 0})
                  </h4>

                  {(!req.contactRequests || req.contactRequests.length === 0) ? (
                    <p className="text-xs text-slate-400">
                      No direct contact requests sent for this case yet. Search matching donors in "Find Donors" to send requests.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {req.contactRequests.map((c: any) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">
                              {c.donor?.user?.fullName?.split(' ')[0]} (Donor)
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                c.status === 'ACCEPTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : c.status === 'RESERVED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : c.status === 'DECLINED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            {c.status === 'ACCEPTED' || c.status === 'RESERVED'
                              ? 'Donor has confirmed availability. Relay active.'
                              : c.status === 'DECLINED'
                              ? 'Donor is currently unable to donate.'
                              : 'Outreach delivered in-app. Pending donor confirmation.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {selectedShare && (
        <ShareRequestModal
          isOpen={!!selectedShare}
          onClose={() => setSelectedShare(null)}
          request={selectedShare}
        />
      )}
    </div>
  );
};
