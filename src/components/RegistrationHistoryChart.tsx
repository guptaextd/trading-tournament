'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Users, ShieldCheck } from 'lucide-react';
import { ParticipantCountHistory } from '@/types';

interface RegistrationHistoryChartProps {
  history: ParticipantCountHistory[];
  competitionTitle: string;
}

export default function RegistrationHistoryChart({ history, competitionTitle }: RegistrationHistoryChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ParticipantCountHistory | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter valid points with numeric counts
  const points = history
    .filter(h => h.count !== null && h.count !== undefined && h.count > 0)
    .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime());

  if (points.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-white/5 bg-[#0f121e]/60 text-center text-xs text-slate-500">
        <Users className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
        No historical registration trends recorded for this tournament yet.
      </div>
    );
  }

  const counts = points.map(p => p.count as number);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const range = maxCount - minCount === 0 ? 1 : maxCount - minCount;

  // Chart Dimensions
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  // Coordinate mapping
  const coords = points.map((p, idx) => {
    const x = points.length === 1 
      ? width / 2 
      : paddingX + (idx / (points.length - 1)) * chartW;
    const normY = ((p.count as number) - minCount) / range;
    const y = paddingTop + (1 - normY) * chartH;
    return { x, y, point: p };
  });

  // SVG Path generator
  let linePath = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    // Smooth Bézier curve
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }

  // Area path for gradient fill
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

  // Calculate Growth %
  const firstCount = counts[0];
  const latestCount = counts[counts.length - 1];
  const growth = firstCount > 0 ? ((latestCount - firstCount) / firstCount) * 100 : 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const formatFullDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-[#0f121e]/80 backdrop-blur-md relative overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Live Registration Traction
            </span>
            {growth > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                +{growth.toFixed(1)}% growth
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Audited history extracted by AlphaArena background agents
          </p>
        </div>

        <div className="text-right">
          <div className="text-base font-bold text-white tracking-tight">
            {latestCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">traders</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Current public headcount
          </div>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full h-[180px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#10b981" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line 
            x1={paddingX} 
            y1={paddingTop} 
            x2={width - paddingX} 
            y2={paddingTop} 
            stroke="rgba(255,255,255,0.06)" 
            strokeDasharray="3 3" 
          />
          <line 
            x1={paddingX} 
            y1={height - paddingBottom} 
            x2={width - paddingX} 
            y2={height - paddingBottom} 
            stroke="rgba(255,255,255,0.08)" 
          />

          {/* Area Fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line Stroke */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />

          {/* Points */}
          {coords.map((c, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g key={i} className="cursor-pointer">
                {/* Hit target */}
                <circle 
                  cx={c.x} 
                  cy={c.y} 
                  r="12" 
                  fill="transparent" 
                  onMouseEnter={() => {
                    setHoverIndex(i);
                    setHoveredPoint(c.point);
                  }}
                  onMouseLeave={() => {
                    setHoverIndex(null);
                    setHoveredPoint(null);
                  }}
                />
                {/* Outer Glow on hover */}
                {isHovered && (
                  <circle 
                    cx={c.x} 
                    cy={c.y} 
                    r="8" 
                    fill="rgba(16, 185, 129, 0.3)" 
                    className="animate-ping" 
                  />
                )}
                {/* Center Circle */}
                <circle 
                  cx={c.x} 
                  cy={c.y} 
                  r={isHovered ? '5' : '3.5'} 
                  fill="#10b981" 
                  stroke="#0f121e" 
                  strokeWidth="2" 
                  className="transition-all duration-150"
                />
                {/* X-axis date labels */}
                <text 
                  x={c.x} 
                  y={height - 8} 
                  textAnchor="middle" 
                  fontSize="9.5" 
                  fill={isHovered ? '#ffffff' : '#64748b'}
                  className="transition-colors select-none font-medium"
                >
                  {formatDate(c.point.checked_at)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Interactive Tooltip */}
        {hoveredPoint && hoverIndex !== null && (
          <div 
            className="absolute z-30 pointer-events-none -translate-x-1/2 px-3 py-2 rounded-xl bg-[#131828] border border-emerald-500/40 shadow-xl shadow-black/50 text-[11px] text-white animate-in fade-in zoom-in-95 duration-100"
            style={{ 
              left: `${(coords[hoverIndex].x / width) * 100}%`,
              top: `${Math.max(10, coords[hoverIndex].y - 50)}px`
            }}
          >
            <div className="font-bold text-emerald-300 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {(hoveredPoint.count ?? 0).toLocaleString()} Registered
            </div>
            <div className="text-[9.5px] text-slate-400 mt-0.5">
              {formatFullDate(hoveredPoint.checked_at)}
            </div>
          </div>
        )}
      </div>

      {/* Footer reassurance */}
      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Never estimated or interpolated
        </span>
        <span>{points.length} verification scans</span>
      </div>
    </div>
  );
}
