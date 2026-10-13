import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Heart,
  Droplet,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
  Apple,
  Coffee,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { BloodBadge } from '../components/BloodBadge';
import { ALL_BLOOD_GROUPS, BLOOD_GROUP_DETAILS, BloodGroup } from '../utils/bloodCompatibility';

interface QuizAnswers {
  age: 'yes' | 'no' | null;
  weight: 'yes' | 'no' | null;
  interval: 'yes' | 'no' | null;
  healthy: 'yes' | 'no' | null;
  surgery: 'yes' | 'no' | null;
}

export const EligibilityGuidePage: React.FC = () => {
  const [answers, setAnswers] = useState<QuizAnswers>({
    age: null,
    weight: null,
    interval: null,
    healthy: null,
    surgery: null,
  });

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O+');

  const handleAnswer = (key: keyof QuizAnswers, val: 'yes' | 'no') => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const isEligible =
    answers.age === 'yes' &&
    answers.weight === 'yes' &&
    answers.interval === 'yes' &&
    answers.healthy === 'yes' &&
    answers.surgery === 'no';

  const isAnsweredAll = Object.values(answers).every((v) => v !== null);

  const resetQuiz = () => {
    setAnswers({
      age: null,
      weight: null,
      interval: null,
      healthy: null,
      surgery: null,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-50 border border-crimson-200 text-crimson-800 text-xs font-bold">
          <Heart className="w-3.5 h-3.5 text-crimson-600 fill-crimson-600" />
          Clinical Guidelines & Safety Protocols
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Blood Donation Eligibility & Preparation Guide
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Safe blood donation protects both the selfless donor and the vulnerable recipient. Review the standard statutory eligibility criteria, take our quick interactive self-check, and learn how to prepare.
        </p>
      </div>

      {/* Medical Caution Notice */}
      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-2xl flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold text-amber-950">
            Mandatory Clinical Assessment Disclaimer
          </p>
          <p>
            LifeLink is a donor discovery matching network. Final donation authorization and transfusion cross-matching must always be conducted by a licensed physician and authorized blood bank technicians after testing hemoglobin, blood pressure, and infectious disease markers.
          </p>
        </div>
      </div>

      {/* Interactive Self-Assessment Quiz */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-healthcare space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-crimson-600" />
              Quick Eligibility Self-Assessment
            </h2>
            <p className="text-xs text-slate-500">
              Answer 5 standard criteria questions to verify your eligibility before visiting a center.
            </p>
          </div>
          <button
            type="button"
            onClick={resetQuiz}
            className="text-xs font-semibold text-slate-500 hover:text-crimson-600 underline"
          >
            Reset Questions
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question 1: Age */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-bold text-crimson-700 uppercase tracking-wider">Criterion 1</span>
              <p className="text-xs font-bold text-slate-800 mt-1">Are you between 18 and 65 years of age?</p>
              <p className="text-[11px] text-slate-500 mt-0.5">First-time voluntary donors must be at least 18 years old.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAnswer('age', 'yes')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.age === 'yes' ? 'bg-crimson-600 text-white border-crimson-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('age', 'no')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.age === 'no' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 2: Weight */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-bold text-crimson-700 uppercase tracking-wider">Criterion 2</span>
              <p className="text-xs font-bold text-slate-800 mt-1">Do you weigh at least 45 kg (50 kg for 450ml units)?</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Adequate body weight ensures sufficient blood volume buffer.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAnswer('weight', 'yes')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.weight === 'yes' ? 'bg-crimson-600 text-white border-crimson-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('weight', 'no')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.weight === 'no' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 3: Interval */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-bold text-crimson-700 uppercase tracking-wider">Criterion 3</span>
              <p className="text-xs font-bold text-slate-800 mt-1">Has it been at least 90 days since your last whole blood donation?</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Males: 90 days (3 months); Females: 120 days (4 months).</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAnswer('interval', 'yes')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.interval === 'yes' ? 'bg-crimson-600 text-white border-crimson-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Yes / First-Timer
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('interval', 'no')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.interval === 'no' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 4: Health */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-bold text-crimson-700 uppercase tracking-wider">Criterion 4</span>
              <p className="text-xs font-bold text-slate-800 mt-1">Are you feeling completely well today with no fever, cold, or flu?</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Donors must have normal temperature and pulse rate on donation day.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAnswer('healthy', 'yes')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.healthy === 'yes' ? 'bg-crimson-600 text-white border-crimson-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('healthy', 'no')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.healthy === 'no' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 5: Major Surgery / Tattoo */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3 md:col-span-2">
            <div>
              <span className="text-[11px] font-bold text-crimson-700 uppercase tracking-wider">Criterion 5 (Deferral Check)</span>
              <p className="text-xs font-bold text-slate-800 mt-1">Have you received a tattoo, body piercing, or major surgery in the last 6 months?</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Standard deferral period protects against incubation of blood-borne pathogens.</p>
            </div>
            <div className="flex gap-2 max-w-sm">
              <button
                type="button"
                onClick={() => handleAnswer('surgery', 'yes')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.surgery === 'yes' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Yes (Temporary Deferral)
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('surgery', 'no')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                  answers.surgery === 'no' ? 'bg-crimson-600 text-white border-crimson-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Outcome Banner */}
        {isAnsweredAll && (
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in ${
              isEligible
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {isEligible ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="font-extrabold text-sm">
                  {isEligible
                    ? '🎉 You Appear Eligible to Donate Blood!'
                    : '⚠️ Temporary Deferral Indicated'}
                </h3>
                <p className="text-xs mt-1 text-slate-700">
                  {isEligible
                    ? 'Your self-reported answers meet the baseline eligibility requirements. You can register as an active LifeLink donor or check nearby emergency requests.'
                    : 'Based on standard health guidelines, you may need to wait before donating. Check with a blood center physician for personalized clearance.'}
                </p>
              </div>
            </div>
            {isEligible && (
              <Link
                to="/donor/register"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 flex items-center gap-1.5"
              >
                Register as Donor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Preparation & Recovery Dos and Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pre-Donation Preparation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-healthcare space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Before Your Donation (Preparation)</h3>
              <p className="text-xs text-slate-500">Steps to ensure a comfortable donation experience</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Hydrate Plenty:</strong> Drink at least 500ml of water or fresh juice 2-3 hours before donating to stabilize blood volume.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Eat a Healthy Meal:</strong> Have an iron-rich snack (spinach, dates, jaggery, lentils) 2-3 hours prior. Never donate on an empty stomach.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Adequate Sleep:</strong> Ensure at least 6 to 8 hours of uninterrupted rest the night before.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span><strong>Avoid Alcohol & Smoking:</strong> Refrain from alcohol for 24 hours and smoking for at least 2 hours before donation.</span>
            </li>
          </ul>
        </div>

        {/* Post-Donation Recovery */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-healthcare space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-crimson-50 text-crimson-700 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">After Your Donation (Recovery)</h3>
              <p className="text-xs text-slate-500">Post-phlebotomy care recommendations</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Rest at Center:</strong> Sit and relax for 10-15 minutes after donation and enjoy refreshments provided by the team.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Fluid Replacement:</strong> Drink plenty of liquids throughout the next 24 to 48 hours to quickly replenish plasma.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span><strong>No Heavy Lifting:</strong> Avoid rigorous exercise, gym workouts, or heavy lifting with the venipuncture arm for 12 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span><strong>Bandage Care:</strong> Keep the adhesive strip dry and on for at least 4 hours to prevent minor bruising.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ABO / Rh Transfusion Compatibility Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-healthcare space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson-50 text-crimson-800 text-xs font-bold mb-2">
            <Droplet className="w-3.5 h-3.5 text-crimson-600" />
            Transfusion Compatibility Explorer
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Interactive ABO & Rh Compatibility Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Select any blood group below to inspect who they can donate red blood cells to and receive from.
          </p>
        </div>

        {/* Group Selector */}
        <div className="flex flex-wrap gap-2">
          {ALL_BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setSelectedGroup(bg)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition border ${
                selectedGroup === bg
                  ? 'bg-crimson-600 text-white border-crimson-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>

        {/* Selected Group Breakdown */}
        {selectedGroup && BLOOD_GROUP_DETAILS[selectedGroup] && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BloodBadge bloodGroup={selectedGroup} size="lg" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Blood Group {selectedGroup} Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedGroup === 'O-'
                      ? 'Universal Red Cell Donor'
                      : selectedGroup === 'AB+'
                      ? 'Universal Recipient (All groups compatible)'
                      : `ABO/Rh antigen group ${selectedGroup}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Can Donate Red Cells To ({BLOOD_GROUP_DETAILS[selectedGroup].canGiveTo.length} Groups)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BLOOD_GROUP_DETAILS[selectedGroup].canGiveTo.map((grp: BloodGroup) => (
                    <span
                      key={grp}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold"
                    >
                      {grp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-crimson-700 uppercase tracking-wider block">
                  Can Safely Receive Red Cells From ({BLOOD_GROUP_DETAILS[selectedGroup].canReceiveFrom.length} Groups)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BLOOD_GROUP_DETAILS[selectedGroup].canReceiveFrom.map((grp: BloodGroup) => (
                    <span
                      key={grp}
                      className="px-2.5 py-1 bg-crimson-50 text-crimson-800 border border-crimson-200 rounded-lg text-xs font-bold"
                    >
                      {grp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1">
              * Note: In severe medical emergencies, O- negative blood may be issued as uncrossmatched universal red blood cells, whereas AB+ positive individuals can safely receive packed cells from any ABO/Rh donor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
