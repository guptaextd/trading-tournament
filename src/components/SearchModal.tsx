'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Trophy, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';
import { Competition, Platform } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setCompetitions([]);
      setPlatforms([]);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(() => {
      // Search competitions
      fetch(`/api/competitions?search=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setCompetitions((data.items || []).slice(0, 5));
        })
        .catch(() => {});

      // Search platforms
      fetch(`/api/platforms?search=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setPlatforms((data || []).slice(0, 3));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0f121e] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="relative flex items-center border-b border-white/10 px-4 py-3 bg-[#131728]">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search crypto, forex tournaments, FTMO, Bybit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Results / Suggestion Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-6 text-center text-xs text-slate-400">
              Searching tournament database...
            </div>
          )}

          {!loading && query && competitions.length === 0 && platforms.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">
              No tournaments or platforms matched <strong className="text-white">"{query}"</strong>.
            </div>
          )}

          {/* Competitions Category */}
          {competitions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                Tournaments ({competitions.length})
              </div>
              <div className="space-y-1.5">
                {competitions.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/competitions/${comp.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs font-bold text-violet-400 overflow-hidden">
                        {comp.platform?.logo_url ? (
                          <img src={comp.platform.logo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          comp.platform?.name.slice(0, 2)
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-orange-400 transition">
                          {comp.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {comp.platform?.name} • Prize: <strong className="text-amber-400 font-mono">${comp.prize_pool.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Platforms Category */}
          {platforms.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
                Hosts & Brokers ({platforms.length})
              </div>
              <div className="space-y-1.5">
                {platforms.map((plt) => (
                  <Link
                    key={plt.id}
                    href={`/platforms/${plt.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center text-xs font-bold">
                        <img src={plt.logo_url} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-orange-400 transition flex items-center gap-1">
                          {plt.name}
                          {plt.verified && <ShieldCheck className="h-3 w-3 text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {plt.regulation_status} • Trust: <strong className="text-cyan-400 font-mono">{plt.trust_score}%</strong>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Default Quick Discovery Links if Query is Empty */}
          {!query && (
            <div className="py-2">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Popular Searches</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Bybit WSOT', 'FTMO Demo', 'Apex Futures', 'Binance Grand Prix', 'Crypto', 'Free Entry'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#090b14] px-4 py-2 text-[10px] text-slate-500">
          <span>Navigate with mouse or click</span>
          <span>Press <kbd className="rounded border border-white/20 bg-white/5 px-1 py-0.5 text-slate-400">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
