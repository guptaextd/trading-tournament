'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Search, 
  Medal, 
  Flame, 
  Globe, 
  TrendingUp,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { HallOfFameTrader } from '@/types';

export default function HallOfFamePage() {
  const [traders, setTraders] = useState<HallOfFameTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/hall-of-fame')
      .then(res => res.json())
      .then(data => setTraders(data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = traders.filter(t => 
    t.handle.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.country.toLowerCase().includes(search.toLowerCase()) ||
    t.primary_market.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1.5 text-xs font-semibold text-violet-300">
            <Medal className="h-3.5 w-3.5 text-orange-400" />
            <span>Competitive Legend Registry</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            HALL OF FAME
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Celebrating the most decorated tournament traders across crypto derivatives, forex cups, and prop firm showdowns. Verified tournament winnings and historical ROI records.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by trader handle, country, or market..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0d101d] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 shadow-xl"
          />
        </div>

        {/* Hall of Fame Traders Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 rounded-2xl border border-white/10 bg-[#0f121e] animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0f121e] p-12 text-center text-slate-400">
            No traders found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trader, index) => (
              <div
                key={trader.id}
                className="glass-card relative rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:border-violet-500/40 transition group"
              >
                {/* Standing Rank Badge */}
                <div className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-xs font-black font-mono text-slate-300">
                  #{index + 1}
                </div>

                <div>
                  {/* Trader Avatar & Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/15 bg-black p-0.5">
                      <img src={trader.avatar_url} alt={trader.handle} className="h-full w-full object-cover rounded-xl" />
                      {trader.win_streak >= 2 && (
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white font-bold" title={`${trader.win_streak} Tournament Win Streak`}>
                          🔥
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition">
                        {trader.handle}
                      </h3>
                      <div className="text-xs text-slate-400">{trader.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Globe className="h-3 w-3 text-cyan-400" />
                        <span>{trader.country} ({trader.country_code})</span>
                      </div>
                    </div>
                  </div>

                  {/* Career Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/40 border border-white/5 p-3 text-xs mb-4">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Prize Won</span>
                      <span className="text-sm font-black text-amber-400 font-mono">
                        ${trader.total_prize_money.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Championships</span>
                      <span className="text-sm font-black text-white font-mono flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-amber-400" />
                        {trader.tournaments_won} Titles
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Best Tournament ROI</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {trader.best_roi}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Discipline</span>
                      <span className="text-xs font-bold text-violet-300 uppercase">
                        {trader.primary_market}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Honor Badges
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {trader.badges.map(b => (
                        <span key={b} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Win */}
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                  <span>Latest Title: </span>
                  <strong className="text-slate-200">{trader.recent_win}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
