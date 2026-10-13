import React from 'react';
import { Radio, Users, ShieldCheck } from 'lucide-react';
import { BloodBadge } from './BloodBadge';

interface EmergencyRadarProps {
  bloodGroup: string;
  city: string;
  candidateCount: number;
  urgency?: string;
}

export const EmergencyRadar: React.FC<EmergencyRadarProps> = ({
  bloodGroup,
  city,
  candidateCount,
  urgency = 'CRITICAL',
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 p-6 text-white shadow-xl border border-rose-900/40">
      {/* Background Radar Rings */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 pointer-events-none opacity-20">
        <div className="absolute inset-0 rounded-full border border-rose-400 animate-ping duration-1000" />
        <div className="absolute inset-6 rounded-full border border-rose-400" />
        <div className="absolute inset-16 rounded-full border border-rose-400" />
        <div className="absolute inset-28 rounded-full border border-rose-400" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
              Emergency Match Radar
            </span>
            <span className="text-xs text-slate-400">Live Geo-Broadcast</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold tracking-tight">
            Mobilizing <span className="text-rose-400">{bloodGroup}</span> Donors in {city}
          </h3>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Our multi-factor matching engine is actively scanning nearby registered volunteers
            within a 25 km transit radius.
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Privacy Guard Active: Contact sent via secure proxy. Exact addresses remain masked.</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-xl border border-white/10">
          <div className="p-3 bg-rose-500/20 rounded-xl text-rose-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white leading-none">{candidateCount}</div>
            <div className="text-xs text-rose-200 mt-1 font-medium">Eligible Candidates In Range</div>
          </div>
          <BloodBadge group={bloodGroup} size="lg" />
        </div>
      </div>
    </div>
  );
};
