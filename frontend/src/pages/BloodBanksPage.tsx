import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Clock,
  ShieldCheck,
  MapPin,
  Search,
  Droplet,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { BloodBadge } from '../components/BloodBadge';
import { ALL_BLOOD_GROUPS } from '../utils/bloodCompatibility';

export const BloodBanksPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'bloodbanks' | 'hospitals'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hospRes, bankRes] = await Promise.all([
        api.listHospitals(cityFilter || undefined),
        api.listBloodBanks(cityFilter || undefined),
      ]);
      if (hospRes.success) setHospitals(hospRes.hospitals || []);
      if (bankRes.success) setBloodBanks(bankRes.bloodBanks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospitals & Blood Banks Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified regional medical institutions with live red blood cell component inventory.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by city (e.g. Bengaluru)"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 w-56 focus:ring-1 focus:ring-crimson-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'all'
              ? 'border-crimson-600 text-crimson-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          All Centers ({hospitals.length + bloodBanks.length})
        </button>
        <button
          onClick={() => setActiveTab('bloodbanks')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'bloodbanks'
              ? 'border-crimson-600 text-crimson-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          24x7 Blood Banks ({bloodBanks.length})
        </button>
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'hospitals'
              ? 'border-crimson-600 text-crimson-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Hospitals & Trauma Care ({hospitals.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading medical directories and stock data...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Blood Banks Section */}
          {(activeTab === 'all' || activeTab === 'bloodbanks') && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-crimson-600" />
                Licensed 24x7 Blood Banks
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bloodBanks.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{b.name}</h3>
                          {b.isVerified && (
                            <span className="p-0.5 bg-emerald-50 text-emerald-600 rounded-full" title="Verified Facility">
                              <ShieldCheck className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{b.address}, {b.city}</span>
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] shrink-0 border border-emerald-200">
                        {b.operatingHours || '24x7 Open'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <a
                        href={`tel:${b.phone}`}
                        className="inline-flex items-center gap-1.5 text-crimson-700 font-bold hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {b.phone}
                      </a>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {b.operatingHours}
                      </span>
                    </div>

                    {/* Blood Units Stock Inventory */}
                    {b.bloodStock && (
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Live Available Red Cell Units
                        </span>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                          {ALL_BLOOD_GROUPS.map((bg) => (
                            <div key={bg} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-700 block">{bg}</span>
                              <span className="text-xs font-black text-crimson-700">
                                {b.bloodStock[bg] || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hospitals Section */}
          {(activeTab === 'all' || activeTab === 'hospitals') && (
            <div className="space-y-4 pt-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Hospitals & Trauma Care Centers
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hospitals.map((h) => (
                  <div
                    key={h.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{h.name}</h3>
                          {h.isVerified && (
                            <span className="p-0.5 bg-blue-50 text-blue-600 rounded-full" title="Verified Hospital">
                              <ShieldCheck className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{h.address}, {h.city}</span>
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] shrink-0 border border-rose-200">
                        Emergency: {h.emergencyHelpline}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <a
                        href={`tel:${h.phone}`}
                        className="inline-flex items-center gap-1.5 text-crimson-700 font-bold hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {h.phone}
                      </a>
                    </div>

                    {/* Stock */}
                    {h.bloodStock && (
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Hospital Blood Bank Stock
                        </span>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                          {ALL_BLOOD_GROUPS.map((bg) => (
                            <div key={bg} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-700 block">{bg}</span>
                              <span className="text-xs font-black text-crimson-700">
                                {h.bloodStock[bg] || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
