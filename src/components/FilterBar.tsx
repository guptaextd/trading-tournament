'use client';

import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  Table, 
  Sparkles, 
  X, 
  ChevronDown,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { MarketType, TournamentStatus, TournamentFormat, TeamType } from '@/types';

export interface FilterState {
  status: TournamentStatus | 'all';
  market: MarketType | 'all';
  entry: 'all' | 'free' | 'paid';
  format: TournamentFormat | 'all';
  team: TeamType | 'all';
  country: string;
  minPrize: number;
  beginnerOnly: boolean;
  sort: 'ending_soon' | 'starting_soon' | 'prize_high' | 'newest' | 'legitimacy';
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  viewMode: 'grid' | 'terminal';
  onViewModeChange: (mode: 'grid' | 'terminal') => void;
  totalCount: number;
}

export default function FilterBar({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalCount
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (partial: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...partial });
  };

  const resetFilters = () => {
    onFilterChange({
      status: 'all',
      market: 'all',
      entry: 'all',
      format: 'all',
      team: 'all',
      country: 'all',
      minPrize: 0,
      beginnerOnly: false,
      sort: 'ending_soon',
      search: ''
    });
  };

  const markets: { label: string; value: MarketType | 'all' }[] = [
    { label: 'All Markets', value: 'all' },
    { label: 'Crypto', value: 'crypto' },
    { label: 'Forex', value: 'forex' },
    { label: 'Futures', value: 'futures' },
    { label: 'Stocks', value: 'stocks' },
    { label: 'Copy Trading', value: 'copy_trading' },
    { label: 'Demo / Sim', value: 'demo' }
  ];

  const countries = [
    { label: 'Global (All Regions)', value: 'all' },
    { label: 'India', value: 'India' },
    { label: 'United States', value: 'USA' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'European Union', value: 'EU' },
    { label: 'United Arab Emirates', value: 'UAE' },
    { label: 'Japan / East Asia', value: 'Japan' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Southeast Asia', value: 'Vietnam' },
    { label: 'Latin America', value: 'Brazil' }
  ];

  const prizeTiers = [
    { label: 'Any Prize', value: 0 },
    { label: '$10,000+', value: 10000 },
    { label: '$50,000+', value: 50000 },
    { label: '$250,000+', value: 250000 },
    { label: '$1,000,000+', value: 1000000 }
  ];

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.market !== 'all' || 
    filters.entry !== 'all' || 
    filters.format !== 'all' || 
    filters.team !== 'all' || 
    filters.country !== 'all' || 
    filters.minPrize > 0 || 
    filters.beginnerOnly || 
    filters.search !== '';

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0d101d]/90 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs: Live / Upcoming / Ended / All */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-black/40 p-1 border border-white/10">
          {(['all', 'live', 'upcoming', 'ended'] as const).map((st) => {
            const active = filters.status === st;
            return (
              <button
                key={st}
                onClick={() => update({ status: st })}
                className={`relative rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  active 
                    ? st === 'live' 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                      : st === 'upcoming' 
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' 
                        : 'bg-white/15 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {st === 'live' && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 mr-1.5 animate-pulse"></span>
                )}
                {st === 'all' ? 'All Status' : st}
              </button>
            );
          })}
        </div>

        {/* Right side: Search, Advanced Filter Toggle & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title, coin, or broker..."
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-xs text-white placeholder-slate-400 transition focus:border-violet-500 focus:bg-white/10 focus:outline-none"
            />
            {filters.search && (
              <button 
                onClick={() => update({ search: '' })}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              showAdvanced || hasActiveFilters
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="flex h-2 w-2 rounded-full bg-orange-400"></span>
            )}
          </button>

          {/* View mode toggle (Card Grid vs Bloomberg Terminal) */}
          <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('terminal')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'terminal' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Terminal Grid View"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Market Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {markets.map((m) => {
          const active = filters.market === m.value;
          return (
            <button
              key={m.value}
              onClick={() => update({ market: m.value })}
              className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap border transition-all ${
                active
                  ? 'border-orange-500/50 bg-orange-500/15 text-orange-300 font-semibold shadow-sm'
                  : 'border-white/5 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          );
        })}

        {/* Free Entry Quick Pill */}
        <button
          onClick={() => update({ entry: filters.entry === 'free' ? 'all' : 'free' })}
          className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap border transition-all ${
            filters.entry === 'free'
              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-semibold'
              : 'border-white/5 bg-white/5 text-slate-300 hover:border-white/20'
          }`}
        >
          🎁 Free Entry Only
        </button>

        {/* Beginner / Demo Quick Pill */}
        <button
          onClick={() => update({ beginnerOnly: !filters.beginnerOnly })}
          className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap border transition-all ${
            filters.beginnerOnly
              ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300 font-semibold'
              : 'border-white/5 bg-white/5 text-slate-300 hover:border-white/20'
          }`}
        >
          🛡️ Zero-Risk Demo
        </button>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showAdvanced && (
        <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Country / Region */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Region Eligibility
            </label>
            <select
              value={filters.country}
              onChange={(e) => update({ country: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#121524] px-2.5 py-2 text-white focus:border-violet-500 focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#121524]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min Prize Pool */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Minimum Prize
            </label>
            <select
              value={filters.minPrize}
              onChange={(e) => update({ minPrize: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-[#121524] px-2.5 py-2 text-white focus:border-violet-500 focus:outline-none"
            >
              {prizeTiers.map((p) => (
                <option key={p.value} value={p.value} className="bg-[#121524]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Entry Fee (All, Free, Paid) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Entry Type
            </label>
            <select
              value={filters.entry}
              onChange={(e) => update({ entry: e.target.value as any })}
              className="w-full rounded-xl border border-white/10 bg-[#121524] px-2.5 py-2 text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="all" className="bg-[#121524]">All Entry Types</option>
              <option value="free" className="bg-[#121524]">Free Entry</option>
              <option value="paid" className="bg-[#121524]">Paid Ticket / Evaluation</option>
            </select>
          </div>

          {/* Format (Online / Offline) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Format
            </label>
            <select
              value={filters.format}
              onChange={(e) => update({ format: e.target.value as any })}
              className="w-full rounded-xl border border-white/10 bg-[#121524] px-2.5 py-2 text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="all" className="bg-[#121524]">All Formats</option>
              <option value="online" className="bg-[#121524]">Online Only</option>
              <option value="offline" className="bg-[#121524]">In-Person / Offline Event</option>
            </select>
          </div>

          {/* Team Type (Solo / Squad) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Team Type
            </label>
            <select
              value={filters.team}
              onChange={(e) => update({ team: e.target.value as any })}
              className="w-full rounded-xl border border-white/10 bg-[#121524] px-2.5 py-2 text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="all" className="bg-[#121524]">All Types</option>
              <option value="solo" className="bg-[#121524]">Solo Traders</option>
              <option value="team" className="bg-[#121524]">Team / Squad Battle</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as any })}
              className="w-full rounded-xl border border-white/10 bg-[#121524] px-2.5 py-2 text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="ending_soon" className="bg-[#121524]">Ending Soonest</option>
              <option value="starting_soon" className="bg-[#121524]">Starting Soonest</option>
              <option value="prize_high" className="bg-[#121524]">Highest Prize Pool</option>
              <option value="legitimacy" className="bg-[#121524]">Highest Legitimacy Score</option>
              <option value="newest" className="bg-[#121524]">Newest Added</option>
            </select>
          </div>
        </div>
      )}

      {/* Filter Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div>
          Showing <span className="font-bold text-white">{totalCount}</span> tournaments
          {filters.status !== 'all' && (
            <span className="capitalize"> • Status: <strong className="text-slate-200">{filters.status}</strong></span>
          )}
          {filters.market !== 'all' && (
            <span className="capitalize"> • Market: <strong className="text-slate-200">{filters.market}</strong></span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-slate-400 hover:text-orange-400 transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
