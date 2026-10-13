import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Check,
  X,
  RefreshCw,
  Mail,
  ShieldCheck,
  ArrowRight,
  Send,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BloodBadge } from '../components/BloodBadge';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'notifications' | 'contact_requests'>('notifications');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const notifsRes = await api.getNotifications();
      if (notifsRes.success) {
        setNotifications(notifsRes.notifications || []);
      }

      if (user?.role === 'DONOR') {
        const contactRes = await api.getDonorContactRequests();
        if (contactRes.success) {
          setContactRequests(contactRes.contactRequests || []);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching notifications feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondToRequest = async (id: string, action: 'ACCEPT' | 'DECLINE' | 'RESERVE') => {
    setActionLoadingId(id);
    try {
      const res = await api.respondToContactRequest(id, action);
      if (res.success) {
        setContactRequests((prev) =>
          prev.map((cr) => (cr.id === id ? { ...cr, status: res.contactRequest.status } : cr))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-50 text-crimson-800 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5 text-crimson-600" />
            Live Communications & Request Radar
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications & Request Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time emergency broadcast alerts, match notices, and direct contact outreach.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition"
            >
              Mark All as Read
            </button>
          )}
          <button
            onClick={fetchData}
            className="p-2 text-slate-600 hover:text-crimson-600 bg-white border border-slate-200 rounded-xl shadow-xs transition"
            title="Refresh feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'notifications'
              ? 'border-crimson-600 text-crimson-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>System Alerts {unreadCount > 0 && `(${unreadCount})`}</span>
        </button>

        {user?.role === 'DONOR' && (
          <button
            onClick={() => setActiveTab('contact_requests')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'contact_requests'
                ? 'border-crimson-600 text-crimson-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Incoming Contact Requests ({contactRequests.length})</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-crimson-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Checking for new transmissions...</p>
        </div>
      ) : activeTab === 'notifications' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-healthcare overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No notifications in your inbox.</p>
              <p className="text-[11px] text-slate-400">
                You will be notified immediately when a matching request or status update occurs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition ${
                    !n.isRead ? 'bg-crimson-50/40' : 'bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-700'
                          : n.type === 'MATCH_ALERT'
                          ? 'bg-crimson-100 text-crimson-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {n.type === 'EMERGENCY' ? (
                        <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-crimson-600" />
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-crimson-600 shrink-0 p-1"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Contact Requests Tab */
        <div className="space-y-4">
          {contactRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2 shadow-healthcare">
              <Mail className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No direct contact inquiries yet.</p>
              <p className="text-[11px] text-slate-400">
                When a hospital or verified requester reaches out for your blood group, it will show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {contactRequests.map((cr) => (
                <div
                  key={cr.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-healthcare space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <BloodBadge bloodGroup={cr.bloodRequest.bloodGroup} size="sm" />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          {cr.bloodRequest.hospitalName} ({cr.bloodRequest.city})
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Patient: {cr.bloodRequest.patientName} • Required: {cr.bloodRequest.unitsRequired} unit(s)
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        cr.status === 'ACCEPTED' || cr.status === 'RESERVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cr.status === 'DECLINED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cr.status}
                    </span>
                  </div>

                  {cr.message && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                      <span className="font-bold text-slate-500 text-[10px] uppercase block mb-0.5">
                        Requester Message:
                      </span>
                      &ldquo;{cr.message}&rdquo;
                    </div>
                  )}

                  {cr.status === 'PENDING' && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        disabled={actionLoadingId === cr.id}
                        onClick={() => handleRespondToRequest(cr.id, 'ACCEPT')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept & Share Safe Contact
                      </button>
                      <button
                        disabled={actionLoadingId === cr.id}
                        onClick={() => handleRespondToRequest(cr.id, 'RESERVE')}
                        className="px-3.5 py-1.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Temporarily Reserve Me
                      </button>
                      <button
                        disabled={actionLoadingId === cr.id}
                        onClick={() => handleRespondToRequest(cr.id, 'DECLINE')}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
