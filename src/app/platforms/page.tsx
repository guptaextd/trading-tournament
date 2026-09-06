'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Globe, 
  Trophy, 
  ExternalLink, 
  Search, 
  SlidersHorizontal,
  Building2,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Platform, PlatformType } from '@/types';

export default function PlatformsDirectoryPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<PlatformType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    if (search) params.set('search', search);

    fetch(`/api/platforms?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setPlatforms(data || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [typeFilter, verifiedOnly, search]);

  const platformTypes: { label: string; value: PlatformType | 'all' }[] = [
    { label: 'All Platforms', value: 'all' },
    { label: 'Crypto Exchanges', value: 'exchange' },
    { label: 'Forex & CFD Brokers', value: 'broker' },
    { label: 'Prop Firms', value: 'prop_firm' },
    { label: 'Championship Hosts', value: 'championship' },
  ];

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1.5 text-xs font-semibold text-violet-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Vetted Host Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            PLATFORMS & ORGANIZERS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Browse crypto exchanges, forex brokers, and proprietary trading firms hosting tournaments. Inspect trust scores, regulatory licenses, and operational track records.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="rounded-2xl border border-white/10 bg-[#0d101d] p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {platformTypes.map(t => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  typeFilter === t.value
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search and Verified toggle */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search platforms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                verifiedOnly
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Only</span>
            </button>
          </div>
        </div>

        {/* Platforms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl border border-white/10 bg-[#0f121e] animate-pulse p-6"></div>
            ))}
          </div>
        ) : platforms.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0f121e] p-12 text-center text-slate-400">
            No platforms found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map(plt => (
              <div
                key={plt.id}
                className="glass-card rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:border-violet-500/40 transition group"
              >
                <div>
                  {/* Top Bar: Logo, Name, Trust */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 bg-black/40 p-1 flex items-center justify-center">
                        <img src={plt.logo_url} alt={plt.name} className="h-full w-full object-cover rounded-lg" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition flex items-center gap-1.5">
                          {plt.name}
                          {plt.verified && (
                            <span title="Verified Platform">
                              <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            </span>
                          )}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          {plt.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Trust Score</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">
                        {plt.trust_score}/100
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {plt.description}
                  </p>

                  {/* Specs row */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Years in Business:</span>
                      <strong className="text-white">{plt.years_active} Years</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Headquarters:</span>
                      <strong className="text-white">{plt.headquarters}</strong>
                    </div>
                    <div className="text-slate-400 pt-1">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Regulation Status</span>
                      <span className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                        {plt.regulation_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-2">
                  <Link
                    href={`/platforms/${plt.slug}`}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-center text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
                  >
                    View Tournaments
                  </Link>
                  <a
                    href={plt.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
                    title="Visit Official Website"
                  >
                    <ExternalLink className="h-4 w-4" />
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
