import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, PhoneCall, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* 24x7 Emergency Contact Strip */}
      <div className="bg-rose-950/70 border-b border-rose-900/50 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-300 font-semibold">
            <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
            <span>National Emergency Medical Helplines: <strong>112 (All Emergency)</strong> / <strong>108 (Ambulance)</strong></span>
          </div>
          <p className="text-slate-400 text-[11px] text-center sm:text-right">
            LifeLink does not replace emergency clinical services. Seek immediate hospital care in acute trauma.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center">
                <Droplet className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Life<span className="text-crimson-500">Link</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Blood Donor Network powered by explainable AI matching. Connecting patients, voluntary donors, hospitals, and blood banks safely and swiftly.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>DPDP Act Privacy Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Network Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/find-donors" className="hover:text-white transition">Find Donors by Blood Group</Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-white transition">Emergency Radar Feed</Link>
              </li>
              <li>
                <Link to="/create-request" className="hover:text-white transition">Publish Emergency Blood Request</Link>
              </li>
              <li>
                <Link to="/directory" className="hover:text-white transition">Verified Blood Banks & Hospitals</Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-white transition">Eligibility Checker & Guide</Link>
              </li>
            </ul>
          </div>

          {/* Blood Groups */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Compatibility Matrix
            </h4>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <Link
                  key={bg}
                  to={`/find-donors?bloodGroup=${encodeURIComponent(bg)}`}
                  className="px-2 py-1 text-center rounded bg-slate-800 hover:bg-crimson-900 hover:text-white transition text-slate-300"
                >
                  {bg}
                </Link>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal pt-2">
              Final ABO/Rh compatibility is subject to pre-transfusion laboratory testing.
            </p>
          </div>

          {/* Platform information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              About LifeLink
            </h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs space-y-1.5">
              <p className="font-semibold text-slate-100">A smarter way to connect donors and communities.</p>
              <p className="text-slate-400">Privacy-first tools for donor discovery and emergency coordination.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 LifeLink – Smart Blood Donor Network. Built for public good.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-crimson-500 fill-crimson-500" />
            <span>for emergency healthcare resilience</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
