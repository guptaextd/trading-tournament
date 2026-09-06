'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Send, 
  Sparkles, 
  AlertCircle, 
  RotateCcw,
  CheckCircle,
  BellRing
} from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import FilterBar, { FilterState } from '@/components/FilterBar';
import CompetitionCard from '@/components/CompetitionCard';
import TerminalDataGrid from '@/components/TerminalDataGrid';
import { Competition, MarketType } from '@/types';

export default function HomePage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'terminal'>('grid');
  const [stats, setStats] = useState({
    liveCount: 34,
    upcomingCount: 12,
    totalPrize: 26500000,
    platformsCount: 12,
    totalParticipants: 380000
  });

  const [filters, setFilters] = useState<FilterState>({
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

  // Fetch stats once
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.liveCount === 'number') {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch competitions with active filters
  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.market !== 'all') params.set('market', filters.market);
      if (filters.entry !== 'all') params.set('entry', filters.entry);
      if (filters.format !== 'all') params.set('format', filters.format);
      if (filters.team !== 'all') params.set('team', filters.team);
      if (filters.country !== 'all') params.set('country', filters.country);
      if (filters.minPrize > 0) params.set('minPrize', filters.minPrize.toString());
      if (filters.beginnerOnly) params.set('beginnerOnly', 'true');
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/competitions?${params.toString()}`);
      const data = await res.json();
      setCompetitions(data.items || []);
    } catch (err) {
      console.error('Failed to load competitions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCompetitions();
    }, 150);
    return () => clearTimeout(timeout);
  }, [fetchCompetitions]);

  // Quick Filter handlers
  const handleQuickFilter = (type: string) => {
    if (type === 'live') {
      setFilters(prev => ({ ...prev, status: 'live' }));
    } else if (type === 'free') {
      setFilters(prev => ({ ...prev, entry: 'free' }));
    } else if (type === 'demo') {
      setFilters(prev => ({ ...prev, beginnerOnly: true, market: 'demo' }));
    } else if (type === 'prop') {
      setFilters(prev => ({ ...prev, market: 'prop_firm' as MarketType }));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroSection stats={stats} onQuickFilter={handleQuickFilter} />

        {/* Filter Controls Bar */}
        <div className="mt-4 mb-8">
          <FilterBar 
            filters={filters}
            onFilterChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={competitions.length}
          />
        </div>

        {/* Content Listing Area */}
        {loading ? (
          // Skeleton Loaders
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="h-80 rounded-2xl border border-white/10 bg-[#0f121e]/60 animate-pulse p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10"></div>
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 rounded bg-white/10"></div>
                      <div className="h-2 w-16 rounded bg-white/10"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 rounded-full bg-white/10"></div>
                </div>
                <div className="h-4 w-3/4 rounded bg-white/10"></div>
                <div className="h-16 rounded-xl bg-white/5"></div>
                <div className="h-10 rounded-xl bg-white/10"></div>
              </div>
            ))}
          </div>
        ) : competitions.length === 0 ? (
          // Empty State
          <div className="my-12 rounded-3xl border border-white/10 bg-[#0f121e]/80 p-12 text-center max-w-xl mx-auto backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Tournaments Match Your Filter</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              We couldn’t find any tournaments matching your active filter criteria. Try clearing some filters or changing your market selection.
            </p>
            <button
              onClick={() => setFilters({
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
              })}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Esports Card Deck View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((comp) => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))}
          </div>
        ) : (
          // Dense Bloomberg Terminal View
          <TerminalDataGrid competitions={competitions} />
        )}

        {/* Telegram & Digest Subscription Callout Box */}
        <div className="mt-16 rounded-3xl border border-white/15 bg-gradient-to-r from-violet-950/40 via-[#0e1120] to-orange-950/30 p-8 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 mb-3">
              <BellRing className="h-3.5 w-3.5" />
              <span>Never Miss a High-Stakes Tournament</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Get Daily Tournament Alerts in Your Inbox & Telegram
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sign up for free notifications filtered by your country and preferred market. Get early-bird registration reminders before prize pools cap out.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/alerts"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition"
              >
                <span>Customize Alert Preferences</span>
                <Sparkles className="h-4 w-4" />
              </Link>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                <Send className="h-4 w-4 text-cyan-400" />
                <span>Join Official Telegram Channel</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
