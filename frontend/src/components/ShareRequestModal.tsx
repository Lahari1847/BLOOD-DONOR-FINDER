import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { BloodBadge } from './BloodBadge';

interface ShareRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    patientName: string;
    bloodGroup: string;
    unitsRequired: number;
    hospitalName: string;
    city: string;
    urgency: string;
    requiredBy: string;
  };
}

export const ShareRequestModal: React.FC<ShareRequestModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Mask patient surname for privacy
  const nameParts = request.patientName.split(' ');
  const maskedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];

  const shareText = `🚨 URGENT BLOOD REQUIREMENT: ${request.bloodGroup} Needed
• Patient: ${maskedName}
• Units: ${request.unitsRequired} unit(s)
• Hospital: ${request.hospitalName}, ${request.city}
• Urgency: ${request.urgency}
• Respond via verified LifeLink portal: http://localhost:5173/emergency

*Please share only in trusted volunteer donor groups.*`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-crimson-50 text-crimson-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Share Emergency Request</h2>
              <p className="text-xs text-slate-500">Privacy-protected broadcast summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              {request.urgency} REQUIREMENT
            </span>
            <BloodBadge group={request.bloodGroup} size="sm" />
          </div>
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {shareText}
          </pre>
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          Shielded by LifeLink Privacy: Private phone numbers and exact medical files are safely excluded.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
          >
            <MessageSquare className="w-4 h-4" />
            Share to WhatsApp
          </button>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Summary!' : 'Copy Text'}
          </button>
        </div>
      </div>
    </div>
  );
};
