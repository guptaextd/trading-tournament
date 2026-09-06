'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Calendar,
  Sparkles
} from 'lucide-react';
import { TournamentResult, MarketType } from '@/types';

export default function ResultsArchivePage() {
  const [results, setResults] = useState<TournamentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [marketFilter, setMarketFilter] = useState<MarketType | 'all'>('all');

  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        setResults(data || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter(r => {
    const matchesSearch = 
      r.competition_title.toLowerCase().includes(search.toLowerCase()) ||
      r.winner_handle.toLowerCase().includes(search.toLowerCase()) ||
      r.platform_name.toLowerCase().includes(search.toLowerCase()) ||
      r.winner_country.toLowerCase().includes(search.toLowerCase());
    
    const matchesMarket = marketFilter === 'all' || r.market_type === marketFilter;

    return matchesSearch && matchesMarket;
  });

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Official Payout Records</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            RESULTS & ARCHIVES
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Historical records of concluded trading championships, verified first-place payouts, winning ROI percentages, and proof links from organizers.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d101d] p-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {(['all', 'crypto', 'forex', 'futures', 'copy_trading', 'demo'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMarketFilter(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  marketFilter === m
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {m === 'all' ? 'All Markets' : m.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search winners, tournaments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Results Cards List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-2xl border border-white/10 bg-[#0f121e] animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0f121e] p-12 text-center text-slate-400">
            No past tournament records matched your query.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(res => (
              <div
                key={res.id}
                className="glass-card rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-amber-500/40 transition"
              >
                {/* Tournament & Platform */}
                <div className="space-y-1.5 md:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300">
                      {res.market_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(res.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {res.competition_title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Host: <strong className="text-slate-200">{res.platform_name}</strong></span>
                    <span>•</span>
                    <span>{res.participants.toLocaleString()} Participants</span>
                  </div>
                </div>

                {/* Winner Details */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-center gap-4 md:w-1/3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-md">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      1st Place Champion
                    </div>
                    <div className="text-sm font-bold text-white">
                      {res.winner_handle}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span>{res.winner_country}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono font-bold">{res.winner_roi} ROI</span>
                    </div>
                  </div>
                </div>

                {/* Prize Payout & Proof */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:w-1/4 gap-2">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Champion Prize
                    </span>
                    <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                      {res.winner_prize}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Total pool: ${res.total_prize_paid.toLocaleString()}
                    </span>
                  </div>

                  <a
                    href={res.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>Leaderboard Proof</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
