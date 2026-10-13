import React from 'react';
import { X, Sparkles, MapPin, CheckCircle, Clock, Award, ShieldAlert } from 'lucide-react';
import { BloodBadge } from './BloodBadge';

interface ScoreItem {
  points: number;
  max: number;
  reason: string;
}

interface ScoreBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  donorName: string;
  bloodGroup: string;
  totalScore: number;
  compatibilityType: string;
  breakdown?: {
    distance: ScoreItem;
    availability: ScoreItem;
    freshness: ScoreItem;
    reliability: ScoreItem;
  };
  summaryText?: string;
  medicalNotice?: string;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownProps> = ({
  isOpen,
  onClose,
  donorName,
  bloodGroup,
  totalScore,
  compatibilityType,
  breakdown,
  summaryText,
  medicalNotice,
}) => {
  if (!isOpen) return null;

  const defaultBreakdown = breakdown || {
    distance: { points: 35, max: 40, reason: 'Within short transit radius' },
    availability: { points: 25, max: 25, reason: 'Donor marked active & available' },
    freshness: { points: 20, max: 20, reason: 'Verified within last 24 hours' },
    reliability: { points: 15, max: 15, reason: 'High historical emergency response rate' },
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="breakdown-title"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-crimson-50 text-crimson-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="breakdown-title" className="text-lg font-bold text-slate-900">
                Transparent AI Ranking Breakdown
              </h2>
              <p className="text-xs text-slate-500">Explainable Contact-Priority Algorithm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Overview Card */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{donorName}</span>
              <BloodBadge group={bloodGroup} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compatibility Category:{' '}
              <span className="font-semibold text-slate-700">
                {compatibilityType === 'UNASSESSED'
                  ? 'Not assessed — choose a patient blood group'
                  : compatibilityType === 'EXACT' ? 'Exact Match (Identical Group)' : 'Compatible Secondary Match'}
              </span>
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border text-center font-bold ${getScoreColor(totalScore)}`}>
            <div className="text-xl leading-none">{totalScore}</div>
            <div className="text-[10px] uppercase tracking-wider mt-0.5">out of 100</div>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Algorithmic Component Points
          </h3>

          {/* 1. Distance */}
          <div className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Transit Proximity & Distance
              </span>
              <span className="text-slate-900 font-bold">
                {defaultBreakdown.distance.points} / {defaultBreakdown.distance.max} pts
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(defaultBreakdown.distance.points / defaultBreakdown.distance.max) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{defaultBreakdown.distance.reason}</p>
          </div>

          {/* 2. Availability */}
          <div className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Live Availability Status
              </span>
              <span className="text-slate-900 font-bold">
                {defaultBreakdown.availability.points} / {defaultBreakdown.availability.max} pts
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(defaultBreakdown.availability.points / defaultBreakdown.availability.max) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{defaultBreakdown.availability.reason}</p>
          </div>

          {/* 3. Freshness */}
          <div className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Status Confirmation Freshness
              </span>
              <span className="text-slate-900 font-bold">
                {defaultBreakdown.freshness.points} / {defaultBreakdown.freshness.max} pts
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(defaultBreakdown.freshness.points / defaultBreakdown.freshness.max) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{defaultBreakdown.freshness.reason}</p>
          </div>

          {/* 4. Reliability */}
          <div className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Response History & Reliability
              </span>
              <span className="text-slate-900 font-bold">
                {defaultBreakdown.reliability.points} / {defaultBreakdown.reliability.max} pts
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(defaultBreakdown.reliability.points / defaultBreakdown.reliability.max) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{defaultBreakdown.reliability.reason}</p>
          </div>
        </div>

        {summaryText && (
          <p className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {summaryText}
          </p>
        )}

        {/* Clinical Disclaimer Notice */}
        <div className="mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5 text-xs leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p>
            {medicalNotice ||
              'CLINICAL SAFETY MANDATE: This score serves solely as an emergency contact prioritization aid. It does not certify clinical blood safety. A certified hospital blood bank must conduct full pre-transfusion cross-matching before any transfusion.'}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
