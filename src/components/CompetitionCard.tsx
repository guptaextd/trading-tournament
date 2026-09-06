'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  ExternalLink, 
  ShieldCheck, 
  Users, 
  User, 
  Globe, 
  Sparkles, 
  CheckCircle,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { Competition } from '@/types';
import CountdownTimer from './CountdownTimer';

interface CompetitionCardProps {
  competition?: Competition;
  competitionId?: string;
}

export default function CompetitionCard({ competition: initialComp, competitionId }: CompetitionCardProps) {
  const [competition, setCompetition] = React.useState<Competition | null>(initialComp || null);

  React.useEffect(() => {
    if (!competition && competitionId) {
      fetch(`/api/competitions/${competitionId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.competition) {
            setCompetition(data.competition);
          }
        })
        .catch(() => {});
    }
  }, [competition, competitionId]);

  if (!competition) {
    return (
      <div className="h-48 rounded-2xl border border-white/10 bg-[#0f121e]/60 animate-pulse p-4 flex items-center justify-center text-xs text-slate-500">
        Loading tournament card...
      </div>
    );
  }

  const isLive = competition.status === 'live';
  const isUpcoming = competition.status === 'upcoming';
  const isEnded = competition.status === 'ended';

  const formatCurrency = (amount: number, curr: string) => {
    return `${curr === 'USD' ? '$' : ''}${amount.toLocaleString()} ${curr !== 'USD' ? curr : ''}`;
  };

  const getMarketColor = (market: string) => {
    switch (market) {
      case 'crypto':
        return 'border-violet-500/30 bg-violet-500/10 text-violet-300';
      case 'forex':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
      case 'futures':
        return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
      case 'stocks':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
      case 'demo':
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
      case 'copy_trading':
        return 'border-pink-500/30 bg-pink-500/10 text-pink-300';
      default:
        return 'border-slate-500/30 bg-slate-500/10 text-slate-300';
    }
  };

  return (
    <div className={`glass-card group relative flex flex-col justify-between rounded-2xl p-5 border transition-all duration-300 ${
      competition.featured 
        ? 'border-violet-500/40 bg-gradient-to-b from-violet-950/20 to-[#0d101d]' 
        : 'border-white/10 hover:border-violet-500/30'
    }`}>
      {/* Featured Ribbon */}
      {competition.featured && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md shadow-orange-500/30 uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Featured Arena
        </div>
      )}

      <div>
        {/* Top Header Row: Platform & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Platform Logo */}
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 flex items-center justify-center">
              {competition.platform?.logo_url ? (
                <img 
                  src={competition.platform.logo_url} 
                  alt={competition.platform.name} 
                  className="h-full w-full object-cover rounded-lg" 
                />
              ) : (
                <Trophy className="h-5 w-5 text-violet-400" />
              )}
            </div>
            <div>
              <Link 
                href={`/platforms/${competition.platform?.slug || competition.platform_id}`}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition"
              >
                {competition.platform?.name || 'Trading Host'}
                {competition.platform?.verified && (
                  <span title="Verified Organizer">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span>{competition.platform?.type?.replace('_', ' ').toUpperCase()}</span>
                <span>•</span>
                <span className="text-amber-400/90 font-mono">Trust {competition.platform?.trust_score || 90}%</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 badge-live-pulse shadow-sm shadow-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE NOW
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400"></span>
                UPCOMING
              </span>
            )}
            {isEnded && (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                ENDED
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/competitions/${competition.id}`} className="group/title block">
          <h3 className="text-base font-bold text-white transition group-hover/title:text-orange-400 line-clamp-2 leading-snug">
            {competition.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {competition.description}
        </p>

        {/* Badges Bar: Market, Format, Team, Entry */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {/* Market */}
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getMarketColor(competition.market_type)}`}>
            {competition.market_type.replace('_', ' ')}
          </span>

          {/* Entry Fee */}
          {competition.entry_fee === null || competition.entry_fee === 0 ? (
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
              Free Entry
            </span>
          ) : (
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
              ${competition.entry_fee} Fee
            </span>
          )}

          {/* Format */}
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300 capitalize">
            {competition.format}
          </span>

          {/* Team size */}
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300 capitalize flex items-center gap-1">
            {competition.team_type === 'team' ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {competition.team_type}
          </span>

          {/* Legitimacy Score */}
          <span className="ml-auto flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-950/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300" title="Legitimacy Score based on regulation & payout proof">
            <CheckCircle className="h-3 w-3 text-cyan-400" />
            <span>{competition.legitimacy_score}/100</span>
          </span>
        </div>

        {/* Prize Pool Display */}
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              Total Prize Pool
            </span>
            {competition.participant_count && (
              <span className="text-[10px] text-slate-400">
                {competition.participant_count.toLocaleString()} Traders
              </span>
            )}
          </div>
          <div className="mt-1 text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 font-mono">
            {formatCurrency(competition.prize_pool, competition.currency)}
          </div>
        </div>
      </div>

      {/* Bottom Section: Countdown & Actions */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-3">
        {/* Countdown */}
        <CountdownTimer 
          startDate={competition.start_date}
          endDate={competition.end_date}
          status={competition.status}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {/* Detail Link */}
          <Link
            href={`/competitions/${competition.id}`}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 px-3 text-center text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white hover:border-violet-500/40"
          >
            Rules & Tiers
          </Link>

          {/* Official Outbound Registration Link */}
          <a
            href={competition.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-2 px-4 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:brightness-110 active:scale-[0.98]"
            title="Official Tournament Registration Link"
          >
            <span>Enter</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
