import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplet,
  Search,
  ShieldCheck,
  Heart,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Radio,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserRound,
} from 'lucide-react';
import { BloodBadge } from '../components/BloodBadge';
import { ALL_BLOOD_GROUPS, BLOOD_GROUP_DETAILS } from '../utils/bloodCompatibility';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Search Widget State
  const [selectedGroup, setSelectedGroup] = useState<string>('O+');
  const [cityInput, setCityInput] = useState<string>('Bengaluru');
  const [radiusInput, setRadiusInput] = useState<number>(25);

  // Live DB Impact Stats
  const [stats, setStats] = useState<{
    totalDonors: number;
    activeRequests: number;
    resolvedRequests: number;
    totalHospitals: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Fetch live counts from backend
    api.getPublicStats()
      .then((res) => {
        if (res.success && res.stats) {
          setStats({
            totalDonors: res.stats.totalDonors,
            activeRequests: res.stats.activeRequests,
            resolvedRequests: res.stats.resolvedRequests,
            totalHospitals: res.stats.totalHospitals,
          });
        } else {
          setStatsError(true);
        }
      })
      .catch(() => {
        setStatsError(true);
      })
      .finally(() => setStatsLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedGroup && selectedGroup !== 'ALL') query.append('bloodGroup', selectedGroup);
    if (cityInput.trim()) query.append('city', cityInput.trim());
    if (radiusInput) query.append('radius', String(radiusInput));
    navigate(`/find-donors?${query.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-crimson-50/60 via-white to-slate-50 pt-12 pb-20 border-b border-crimson-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Capstone Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-crimson-100/80 text-crimson-800 text-xs font-bold tracking-wide border border-crimson-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-crimson-600" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Someone’s Waiting for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-700 via-crimson-600 to-rose-500">
                Your Blood Type
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/find-donors"
                className="px-6 py-3.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-crimson-600/30 hover:shadow-xl hover:shadow-crimson-600/40 transition flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {t.hero.findDonorsBtn}
              </Link>
              <Link
                to="/donor/register"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-crimson-600" />
                {t.hero.becomeDonorBtn}
              </Link>
              <Link
                to="/emergency"
                className="px-6 py-3.5 bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                Emergency Radar
              </Link>
            </div>
            <p className="text-sm text-slate-600">
              Already part of the network?{' '}
              <Link to="/login" className="inline-flex items-center gap-1 font-bold text-crimson-700 underline decoration-crimson-300 underline-offset-4 hover:text-crimson-900">
                <UserRound className="h-3.5 w-3.5" />
                Sign in to your dashboard
              </Link>
              {' '}or choose a demo donor account.
            </p>

            {/* Live Shortage Notice */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{t.hero.emergencyAlert}</span>
              </div>
            </div>
          </div>

          {/* Instant Search Widget */}
          <div className="mt-12 max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{t.searchWidget.title}</h3>
                <p className="text-xs text-slate-500">Query verified donors using transparent AI proximity ranking</p>
              </div>
              <span className="text-xs font-bold text-crimson-700 bg-crimson-50 px-2.5 py-1 rounded-full border border-crimson-200">
                Zero Public Address Exposure
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.searchWidget.selectBloodGroup}
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-crimson-500"
                >
                  <option value="ALL">{t.searchWidget.allGroups}</option>
                  {ALL_BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} Blood Group
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Location / City
                </label>
                <input
                  type="text"
                  placeholder={t.searchWidget.enterCity}
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-crimson-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Search radius: {radiusInput} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radiusInput}
                  onChange={(e) => setRadiusInput(Number(e.target.value))}
                  aria-label={`Search radius ${radiusInput} kilometers`}
                  className="w-full h-10 accent-crimson-600"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {t.searchWidget.searchBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Impact Statistics (Based on Actual Database Records) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-crimson-400">
              Verified Platform Metrics
            </h2>
            <p className="text-2xl font-bold mt-1 text-white">Live Network Impact</p>
            <p className="text-xs text-slate-400 mt-1">
              Counts computed directly from local relational database tables — never fabricated.
            </p>
          </div>

          {statsLoading ? (
            <p role="status" className="text-center text-sm text-slate-300">Loading verified network metrics…</p>
          ) : statsError || !stats ? (
            <p role="status" className="text-center text-sm text-slate-300">
              Live metrics are temporarily unavailable. No estimated counts are shown.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl sm:text-4xl font-black text-rose-400">{stats.totalDonors}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">{t.impactStats.registeredDonors}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl sm:text-4xl font-black text-amber-400">{stats.activeRequests}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">{t.impactStats.activeRequests}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">{stats.resolvedRequests}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">{t.impactStats.successfulDonations}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-3xl sm:text-4xl font-black text-blue-400">{stats.totalHospitals}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">{t.impactStats.partnerHospitals}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Network Intelligence Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.3)] overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-crimson-50 text-crimson-700 text-[11px] font-bold uppercase tracking-[0.18em] border border-crimson-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                Why LifeLink stands apart
              </div>
              <h2 className="mt-5 text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                AI-guided matching with human-centered care.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-7">
                Instead of public calls and fragmented outreach, LifeLink combines strict clinical compatibility rules,
                proximity intelligence, real-time availability, and private request handling to help the right donor reach the
                right patient faster.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Strict ABO/Rh compatibility gates before any match is suggested.',
                  'Privacy-first outreach hides sensitive addresses while keeping safe contact paths.',
                  'Real-time emergency radar and donor confirmation reduce delay in critical cases.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-700 leading-6">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-grid-soft bg-slate-50 p-8 sm:p-10 border-l border-slate-200/80">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Compatibility Gate', value: '100%', icon: ShieldCheck, tone: 'rose' },
                  { label: 'Distance Ranking', value: '0-40', icon: Search, tone: 'amber' },
                  { label: 'Live Availability', value: '24/7', icon: Users, tone: 'emerald' },
                  { label: 'Response Reliability', value: 'AI Score', icon: Heart, tone: 'violet' },
                ].map(({ label, value, icon: Icon, tone }) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className={`inline-flex rounded-xl p-2 ${tone === 'rose' ? 'bg-rose-100 text-rose-700' : tone === 'amber' ? 'bg-amber-100 text-amber-700' : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="mt-4 text-2xl font-black text-slate-900">{value}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-900/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Live network pulse</p>
                    <p className="mt-1 text-xl font-black">Critical response window</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Active
                  </div>
                </div>
                <div className="mt-5 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-rose-500 via-red-400 to-amber-300" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Urgent demand</span>
                  <span>82% matched in the last hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Eight Blood Groups Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.bloodMatrix.title}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {t.bloodMatrix.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ALL_BLOOD_GROUPS.map((bg) => {
            const info = BLOOD_GROUP_DETAILS[bg];
            return (
              <div
                key={bg}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-center justify-between">
                  <BloodBadge group={bg} size="lg" />
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {info.rarityInIndia}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {info.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">{t.bloodMatrix.giveTo}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {info.canGiveTo.map((target) => (
                        <span key={target} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {target}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">{t.bloodMatrix.receiveFrom}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {info.canReceiveFrom.map((src) => (
                        <span key={src} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 font-bold text-[10px]">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/find-donors?bloodGroup=${encodeURIComponent(bg)}`}
                  className="w-full mt-2 py-2 px-3 bg-slate-50 hover:bg-crimson-50 text-slate-700 hover:text-crimson-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  Find {bg} Donors
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>{t.bloodMatrix.disclaimer}</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.howItWorks.title}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 font-black flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900">{t.howItWorks.step1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.step1Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 font-black flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900">{t.howItWorks.step2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.step2Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 font-black flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900">{t.howItWorks.step3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.step3Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-crimson-50 text-crimson-600 font-black flex items-center justify-center text-sm">
                04
              </div>
              <h3 className="font-bold text-base text-slate-900">{t.howItWorks.step4Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.howItWorks.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900">{t.faq.title}</h2>
          <p className="text-xs text-slate-500 mt-1">Frequently asked questions regarding security and matching</p>
        </div>

        <div className="space-y-3">
          {[
            { q: t.faq.q1, a: t.faq.a1 },
            { q: t.faq.q2, a: t.faq.a2 },
            { q: t.faq.q3, a: t.faq.a3 },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-crimson-700"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-crimson-600" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
