import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ShieldCheck, 
  Globe, 
  Trophy, 
  ExternalLink, 
  ArrowLeft, 
  Calendar,
  Building2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { db } from '@/lib/db';
import CompetitionCard from '@/components/CompetitionCard';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const platform = db.getPlatformById(id);

  if (!platform) {
    return { title: 'Platform Not Found | AlphaArena' };
  }

  return {
    title: `${platform.name} Trading Tournaments & Profile | AlphaArena`,
    description: `Explore live, upcoming, and past trading competitions hosted by ${platform.name}. Legitimacy score: ${platform.trust_score}%. Regulation: ${platform.regulation_status}.`,
  };
}

export default async function PlatformDetailPage({ params }: Props) {
  const { id } = await params;
  const platform = db.getPlatformById(id);

  if (!platform) {
    notFound();
  }

  const liveComps = platform.competitions.filter(c => c.status === 'live');
  const upcomingComps = platform.competitions.filter(c => c.status === 'upcoming');
  const endedComps = platform.competitions.filter(c => c.status === 'ended');

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <Link 
          href="/platforms" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Platforms Directory</span>
        </Link>

        {/* Platform Hero Card */}
        <div className="glass-panel relative rounded-3xl border border-white/15 p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border border-white/15 bg-black/50 p-1 flex items-center justify-center">
                <img src={platform.logo_url} alt={platform.name} className="h-full w-full object-cover rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {platform.name}
                  </h1>
                  {platform.verified && (
                    <span title="Verified Host">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="rounded bg-white/10 px-2 py-0.5 font-semibold text-slate-200 uppercase">
                    {platform.type.replace('_', ' ')}
                  </span>
                  <span>•</span>
                  <span>Headquarters: <strong className="text-white">{platform.headquarters}</strong></span>
                  <span>•</span>
                  <span>Active: <strong className="text-white">{platform.years_active} Years</strong></span>
                </div>
              </div>
            </div>

            {/* Right trust indicator & Official link */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Platform Trust Rating
                </span>
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                  {platform.trust_score}/100
                </span>
              </div>
              <a
                href={platform.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition shadow-lg shadow-violet-600/30"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Description & Regulatory Details */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <div className="lg:col-span-2 space-y-2">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Overview</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {platform.description}
              </p>
            </div>
            <div className="space-y-2 rounded-xl bg-white/5 p-4 border border-white/10">
              <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Regulation & Governance</h3>
              <p className="text-slate-300 leading-relaxed">
                {platform.regulation_status}
              </p>
            </div>
          </div>
        </div>

        {/* Live Tournaments */}
        {liveComps.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Live Tournaments ({liveComps.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveComps.map(c => (
                <CompetitionCard key={c.id} competition={c} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Tournaments */}
        {upcomingComps.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400"></span>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Upcoming Tournaments ({upcomingComps.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingComps.map(c => (
                <CompetitionCard key={c.id} competition={c} />
              ))}
            </div>
          </div>
        )}

        {/* Ended / Past Tournaments */}
        {endedComps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-tight">
              Past Tournaments ({endedComps.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedComps.map(c => (
                <CompetitionCard key={c.id} competition={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
