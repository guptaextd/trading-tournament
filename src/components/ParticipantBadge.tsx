'use client';

import React from 'react';
import { Users, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ParticipantConfidence } from '@/types';

interface ParticipantBadgeProps {
  count?: number | null;
  confidence?: ParticipantConfidence;
  checkedAt?: string | null;
  sourceText?: string | null;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export default function ParticipantBadge({
  count,
  confidence = 'unavailable',
  checkedAt,
  sourceText,
  variant = 'compact',
  className = ''
}: ParticipantBadgeProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Helper for friendly relative time (e.g., "12 min ago", "2h ago", "1d ago")
  const formatTimeAgo = (iso?: string | null) => {
    if (!iso) return 'recently';
    const elapsedSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (elapsedSec < 60) return 'just now';
    const min = Math.floor(elapsedSec / 60);
    if (min < 60) return `${min}m ago`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Case 1: Count is unavailable or not publicly visible
  if (!count || confidence === 'unavailable') {
    return (
      <div 
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-700/60 bg-slate-800/40 text-slate-400 group cursor-help transition-colors hover:border-slate-600 ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Participant count not publicly available on official platform page"
      >
        <Users className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span className="truncate">Participant count not publicly available</span>
        <HelpCircle className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100 flex-shrink-0" />

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 bg-[#121622] border border-slate-700/80 rounded-xl shadow-2xl text-[11px] text-slate-300 leading-relaxed text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Honest Data Policy
            </div>
            <p className="text-slate-400 text-[10.5px]">
              This trading platform does not publish an open registration counter on its tournament landing page. We never estimate or fabricate counts.
            </p>
            {checkedAt && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-500">
                Last checked: {formatTimeAgo(checkedAt)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Case 2: Count is available
  const isLowConfidence = confidence === 'low';
  const timeAgoStr = formatTimeAgo(checkedAt);

  return (
    <div 
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border cursor-help ${
        isLowConfidence
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-500/50'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/50'
      } ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Users className={`w-3.5 h-3.5 flex-shrink-0 ${isLowConfidence ? 'text-amber-400' : 'text-emerald-400'}`} />
      
      <span>
        {isLowConfidence ? '~' : ''}{count.toLocaleString()} joined
      </span>

      <span className="opacity-40 font-normal">·</span>

      <span className="text-[11px] opacity-75 font-normal">
        {timeAgoStr}
      </span>

      {isLowConfidence && (
        <span 
          className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" 
          title="Extracted with low confidence"
        />
      )}

      {/* Hover Tooltip showing extracted quote and verification timestamp */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 p-3 bg-[#101422] border border-slate-700/80 rounded-xl shadow-2xl text-[11px] text-slate-300 leading-relaxed text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isLowConfidence ? 'text-amber-400' : 'text-emerald-400'}`} />
              Verified Public Count
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
              isLowConfidence 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {confidence} confidence
            </span>
          </div>

          {sourceText && (
            <div className="my-1.5 p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-slate-300 italic break-words">
              &ldquo;{sourceText}&rdquo;
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800">
            <span>Official page scan</span>
            <span className="text-slate-300 font-medium">Checked {timeAgoStr}</span>
          </div>
        </div>
      )}
    </div>
  );
}
