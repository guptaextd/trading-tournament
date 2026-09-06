'use client';

import React from 'react';
import Link from 'next/link';
import { Competition } from '@/types';
import { ShieldCheck, ArrowUpRight, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface TerminalDataGridProps {
  competitions: Competition[];
}

export default function TerminalDataGrid({ competitions }: TerminalDataGridProps) {
  if (competitions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0c0e18] p-8 text-center text-slate-400">
        No tournaments found matching the active criteria.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d18]/90 backdrop-blur-md shadow-2xl font-mono text-xs">
      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
          <span className="font-semibold text-slate-300 ml-2">TERMINAL FEED // GLOBAL TRADING TOURNAMENTS</span>
        </div>
        <div className="text-emerald-400 flex items-center gap-1.5 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          STREAMING DATA
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Tournament & Platform</th>
              <th className="py-3 px-4">Market</th>
              <th className="py-3 px-4">Entry</th>
              <th className="py-3 px-4 text-right">Prize Pool</th>
              <th className="py-3 px-4">Timer</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {competitions.map((comp) => {
              const isLive = comp.status === 'live';
              const isUpcoming = comp.status === 'upcoming';

              return (
                <tr 
                  key={comp.id}
                  className="transition-colors hover:bg-white/[0.04] group"
                >
                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isLive && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        LIVE
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="inline-flex items-center gap-1 rounded bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300 border border-violet-500/30">
                        UPCOMING
                      </span>
                    )}
                    {comp.status === 'ended' && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                        ENDED
                      </span>
                    )}
                  </td>

                  {/* Title & Platform */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <Link 
                        href={`/competitions/${comp.id}`}
                        className="font-sans font-bold text-slate-200 group-hover:text-orange-400 transition"
                      >
                        {comp.title}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-sans mt-0.5">
                        <span>{comp.platform?.name}</span>
                        {comp.platform?.verified && (
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        )}
                        <span>•</span>
                        <span className="text-slate-500 capitalize">{comp.format} / {comp.team_type}</span>
                      </div>
                    </div>
                  </td>

                  {/* Market */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                      {comp.market_type.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Entry */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {comp.entry_fee === null || comp.entry_fee === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">${comp.entry_fee}</span>
                    )}
                  </td>

                  {/* Prize Pool */}
                  <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-amber-400">
                    {comp.currency === 'USD' ? '$' : ''}{comp.prize_pool.toLocaleString()} {comp.currency !== 'USD' ? comp.currency : ''}
                  </td>

                  {/* Timer */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <CountdownTimer 
                      startDate={comp.start_date}
                      endDate={comp.end_date}
                      status={comp.status}
                      compact={true}
                    />
                  </td>

                  {/* Score */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="rounded bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 text-cyan-300 font-bold">
                      {comp.legitimacy_score}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/competitions/${comp.id}`}
                        className="rounded bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 transition"
                      >
                        Details
                      </Link>
                      <a
                        href={comp.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-orange-500/90 px-2.5 py-1 text-xs font-bold text-white hover:bg-orange-600 transition flex items-center gap-0.5"
                      >
                        <span>Join</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
