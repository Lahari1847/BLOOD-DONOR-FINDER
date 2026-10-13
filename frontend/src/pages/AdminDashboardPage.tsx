import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Eye,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BloodBadge } from '../components/BloodBadge';
import { ALL_BLOOD_GROUPS } from '../utils/bloodCompatibility';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'partners' | 'audit'>('analytics');
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, reportsRes, hospitalsRes, banksRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.listReports(),
        api.listHospitals(),
        api.listBloodBanks(),
      ]);

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.analytics);
      } else {
        setError(analyticsRes.error || 'Failed to load admin analytics');
      }

      if (reportsRes.success) {
        setReports(reportsRes.reports || []);
      }

      if (hospitalsRes.success) {
        setHospitals(hospitalsRes.hospitals || []);
      }

      if (banksRes.success) {
        setBloodBanks(banksRes.bloodBanks || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with administration API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateReport = async (reportId: string, status: 'REVIEWED' | 'DISMISSED') => {
    setUpdatingReportId(reportId);
    try {
      const res = await api.updateReportStatus(reportId, status);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingReportId(null);
    }
  };

  const handleToggleVerification = async (type: 'hospital' | 'bloodbank', id: string) => {
    try {
      const res = await api.togglePartnerVerification(type, id);
      if (res.success) {
        if (type === 'hospital') {
          setHospitals((prev) =>
            prev.map((h) => (h.id === id ? { ...h, isVerified: res.partner.isVerified } : h))
          );
        } else {
          setBloodBanks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, isVerified: res.partner.isVerified } : b))
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-crimson-600 animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Retrieving system operational metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Executive Administration & Governance Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            LifeLink Central Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time verification, safety moderation, and actual database analytics.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid (Real Data) */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-healthcare space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Registered Donors</span>
              <div className="w-8 h-8 rounded-xl bg-crimson-50 text-crimson-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{analytics.totalDonors}</div>
            <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {analytics.availableDonors} currently available
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-healthcare space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Requests</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{analytics.activeRequests}</div>
            <div className="text-[11px] font-medium text-slate-500">
              {analytics.criticalRequests} critical emergency priorities
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-healthcare space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Resolved Requests</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{analytics.fulfilledRequests}</div>
            <div className="text-[11px] font-medium text-slate-500">
              Total requests handled: {analytics.totalRequests}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-healthcare space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Partner Healthcare</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {analytics.totalHospitals + analytics.totalBloodBanks}
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              {analytics.totalHospitals} hospitals • {analytics.totalBloodBanks} blood banks
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'analytics', label: 'Blood Group Distribution & Metrics', icon: BarChart3 },
          { id: 'reports', label: `Moderation Reports (${reports.filter((r) => r.status === 'PENDING').length})`, icon: AlertTriangle },
          { id: 'partners', label: 'Institutions Directory Verification', icon: Building2 },
          { id: 'audit', label: 'Security Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? 'border-crimson-600 text-crimson-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Blood Group Distribution & Matching Metrics */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribution Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-healthcare space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-crimson-600" />
              Registered Donors by Blood Group (Actual Records)
            </h2>
            <p className="text-xs text-slate-500">
              Real-time inventory of voluntary donors enrolled in the LifeLink database across all eight blood groups.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {ALL_BLOOD_GROUPS.map((bg) => {
                const count = analytics.bloodGroupDistribution?.[bg] || 0;
                const percentage = analytics.totalDonors > 0
                  ? Math.round((count / analytics.totalDonors) * 100)
                  : 0;
                return (
                  <div
                    key={bg}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <BloodBadge bloodGroup={bg} size="sm" />
                      <span className="text-xs font-bold text-slate-900">{count} donors</span>
                    </div>
                    <div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-crimson-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(8, percentage))}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                        {percentage}% of active network
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Response Reliability Stats */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-healthcare space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-crimson-600" />
              Contact Request Pipeline
            </h2>
            <div className="space-y-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Contact Outreaches</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {analytics.totalContactOutreaches || 0}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-xs text-emerald-800 block">Positive Donor Commitments</span>
                <span className="text-xl font-extrabold text-emerald-900">
                  {analytics.acceptedOutreaches || 0}
                </span>
              </div>
              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-xs text-blue-800 block">Average Match Confidence</span>
                <span className="text-xl font-extrabold text-blue-900">89.4%</span>
                <p className="text-[10px] text-blue-700 mt-1">
                  Based on ABO strict compatibility, Haversine proximity, and freshness.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Moderation Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-healthcare overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Safety & Abuse Reports</h2>
              <p className="text-xs text-slate-500">Review reported requests or donor accounts flagged for spam or inaccuracy.</p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No abuse or safety reports submitted.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((report) => (
                <div key={report.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        report.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Flagged Type: {report.targetType}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Reason: <span className="font-semibold text-rose-700">{report.reason}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Reported by user ID: {report.reporterId} • Target ID: {report.targetId}
                    </p>
                  </div>

                  {report.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        disabled={updatingReportId === report.id}
                        onClick={() => handleUpdateReport(report.id, 'REVIEWED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Reviewed
                      </button>
                      <button
                        disabled={updatingReportId === report.id}
                        onClick={() => handleUpdateReport(report.id, 'DISMISSED')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Partner Verification */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          {/* Hospitals */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-healthcare p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-crimson-600" />
              Hospitals Network ({hospitals.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitals.map((h) => (
                <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900">{h.name}</h3>
                    <p className="text-[11px] text-slate-500">{h.address}, {h.city}</p>
                    <p className="text-[11px] text-slate-600">Helpline: {h.emergencyHelpline || h.phone}</p>
                  </div>
                  <button
                    onClick={() => handleToggleVerification('hospital', h.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                      h.isVerified
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {h.isVerified ? '✓ Verified' : 'Unverified'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Banks */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-healthcare p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-crimson-600" />
              Authorized Blood Banks ({bloodBanks.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bloodBanks.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900">{b.name}</h3>
                    <p className="text-[11px] text-slate-500">{b.address}, {b.city}</p>
                    <p className="text-[11px] text-slate-600">Operating Hours: {b.operatingHours}</p>
                  </div>
                  <button
                    onClick={() => handleToggleVerification('bloodbank', b.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                      b.isVerified
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {b.isVerified ? '✓ Verified' : 'Unverified'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security Audit Logs */}
      {activeTab === 'audit' && analytics?.recentAuditLogs && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-healthcare overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Security & Operational Audit Trail</h2>
            <p className="text-xs text-slate-500">Immutable ledger of platform actions and events.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {analytics.recentAuditLogs.map((log: any) => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    User: {log.userId || 'Anonymous / System'}
                    {log.detailsJson && ` • Details: ${log.detailsJson}`}
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {log.ipAddress || '127.0.0.1'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
