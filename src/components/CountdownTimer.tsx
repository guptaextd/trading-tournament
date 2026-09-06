'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { TournamentStatus } from '@/types';

interface CountdownTimerProps {
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function CountdownTimer({
  startDate,
  endDate,
  status,
  compact = false
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTime = (): TimeLeft => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      let target = end;
      if (now < start) {
        target = start; // upcoming
      }

      const diff = target - now;

      if (diff <= 0 || now > end) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isExpired: false };
    };

    // Calculate initial
    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (!timeLeft) {
    return (
      <div className="animate-pulse flex items-center gap-1.5 text-xs text-slate-500">
        <Clock className="h-3.5 w-3.5" />
        <span>Calculating time...</span>
      </div>
    );
  }

  if (status === 'ended' || timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-400 border border-slate-700">
        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
        <span>Concluded</span>
      </div>
    );
  }

  const isUpcoming = new Date().getTime() < new Date(startDate).getTime();

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 font-mono text-xs font-medium">
        <span className={isUpcoming ? 'text-amber-400' : 'text-emerald-400'}>
          {isUpcoming ? 'Starts in ' : 'Ends in '}
        </span>
        <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {String(timeLeft.hours).padStart(2, '0')}h:
          {String(timeLeft.minutes).padStart(2, '0')}m:
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {isUpcoming ? (
          <>
            <PlayCircle className="h-3 w-3 text-amber-400" />
            <span className="text-amber-400">Starts in</span>
          </>
        ) : (
          <>
            <Clock className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400">Ends in</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center justify-center rounded bg-black/40 border border-white/10 px-2 py-1 min-w-[34px]">
            <span className="text-sm text-slate-100">{timeLeft.days}</span>
            <span className="text-[9px] text-slate-400 font-sans uppercase font-normal">days</span>
          </div>
        )}
        <div className="flex flex-col items-center justify-center rounded bg-black/40 border border-white/10 px-2 py-1 min-w-[34px]">
          <span className="text-sm text-slate-100">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-400 font-sans uppercase font-normal">hrs</span>
        </div>
        <span className="text-slate-500">:</span>
        <div className="flex flex-col items-center justify-center rounded bg-black/40 border border-white/10 px-2 py-1 min-w-[34px]">
          <span className="text-sm text-slate-100">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-400 font-sans uppercase font-normal">min</span>
        </div>
        <span className="text-slate-500">:</span>
        <div className="flex flex-col items-center justify-center rounded bg-black/40 border border-white/10 px-2 py-1 min-w-[34px]">
          <span className="text-sm text-orange-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-400 font-sans uppercase font-normal">sec</span>
        </div>
      </div>
    </div>
  );
}
