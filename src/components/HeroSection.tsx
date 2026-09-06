'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Users, 
  Gift, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface HeroSectionProps {
  stats: {
    liveCount: number;
    upcomingCount: number;
    totalPrize: number;
    platformsCount: number;
    totalParticipants: number;
  };
  onQuickFilter: (filterType: string) => void;
}

export default function HeroSection({ stats, onQuickFilter }: HeroSectionProps) {
  const formatMillions = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="relative pt-6 pb-10 overflow-hidden">
      {/* Background Decorative Neon Glow Orbs */}
      <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-violet-600/15 blur-[100px] pointer-events-none"></div>
      <div className="absolute top-10 right-1/4 -z-10 h-64 w-64 rounded-full bg-orange-500/15 blur-[100px] pointer-events-none"></div>

      <div className="text-center max-w-4xl mx-auto px-4">
        {/* Top Live Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur-md mb-5 shadow-lg shadow-violet-500/10">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">Live Global Directory:</span>
          <span className="text-orange-400 font-bold">{stats.liveCount} Active Tournaments</span>
          <Sparkles className="h-3.5 w-3.5 text-amber-400 ml-1" />
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.1]">
          THE GLOBAL ARENA FOR{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-violet-400">
            TRADING TOURNAMENTS
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Aggregating verified crypto showdowns, forex derbies, funded prop firm challenges, and risk-free paper cups. Compare prize pools, rules, and join officially.
        </p>

        {/* Live Stats Ticker Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {/* Stat 1: Live Competitions */}
          <div className="glass-panel rounded-2xl p-3 sm:p-4 text-left border border-white/10 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Tournaments</span>
            </div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black text-white font-mono">
              {stats.liveCount}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
              + {stats.upcomingCount} Starting Soon
            </div>
          </div>

          {/* Stat 2: Total Prize Pool */}
          <div className="glass-panel rounded-2xl p-3 sm:p-4 text-left border border-white/10 hover:border-amber-500/40 transition">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Total Prize Pool</span>
            </div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {formatMillions(stats.totalPrize)}
            </div>
            <div className="text-[10px] text-amber-400/80 font-medium mt-0.5">
              Cash, USDT & Accounts
            </div>
          </div>

          {/* Stat 3: Tracked Platforms */}
          <div className="glass-panel rounded-2xl p-3 sm:p-4 text-left border border-white/10 hover:border-violet-500/40 transition">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
              <span>Hosts & Brokers</span>
            </div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black text-white font-mono">
              {stats.platformsCount}
            </div>
            <div className="text-[10px] text-violet-400 font-medium mt-0.5">
              100% Legitimacy Vetted
            </div>
          </div>

          {/* Stat 4: Active Traders */}
          <div className="glass-panel rounded-2xl p-3 sm:p-4 text-left border border-white/10 hover:border-orange-500/40 transition">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Users className="h-3.5 w-3.5 text-orange-400" />
              <span>Registered Traders</span>
            </div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black text-white font-mono">
              {(stats.totalParticipants / 1000).toFixed(0)}k+
            </div>
            <div className="text-[10px] text-orange-400 font-medium mt-0.5">
              Worldwide Participants
            </div>
          </div>
        </div>

        {/* Quick Filter Navigation Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 text-xs font-medium mr-1 hidden sm:inline">Quick Jump:</span>
          
          <button
            onClick={() => onQuickFilter('live')}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Live Competitions
          </button>

          <button
            onClick={() => onQuickFilter('free')}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 hover:bg-white/10 hover:border-violet-500/30 transition"
          >
            <Gift className="h-3 w-3 text-amber-400" />
            100% Free Entry
          </button>

          <button
            onClick={() => onQuickFilter('demo')}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 hover:bg-white/10 hover:border-cyan-500/30 transition"
          >
            <ShieldCheck className="h-3 w-3 text-cyan-400" />
            Zero-Risk Demo Cups
          </button>

          <button
            onClick={() => onQuickFilter('prop')}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 hover:bg-white/10 hover:border-orange-500/30 transition"
          >
            <Zap className="h-3 w-3 text-orange-400" />
            Prop Firm Showdowns
          </button>
        </div>
      </div>
    </div>
  );
}
