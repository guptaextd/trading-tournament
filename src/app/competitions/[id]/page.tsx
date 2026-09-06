import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Trophy, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  ArrowUpRight,
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { db } from '@/lib/db';
import CountdownTimer from '@/components/CountdownTimer';
import CompetitionCard from '@/components/CompetitionCard';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = db.getCompetitionById(id);

  if (!result) {
    return {
      title: 'Tournament Not Found | AlphaArena',
    };
  }

  const { competition } = result;
  return {
    title: `${competition.title} | AlphaArena`,
    description: `Compete for ${competition.currency} ${competition.prize_pool.toLocaleString()} in the ${competition.title}. Full rules, prize breakdown, eligibility, and official entry link.`,
    openGraph: {
      title: `${competition.title} - $${competition.prize_pool.toLocaleString()} Prize Pool`,
      description: competition.description,
      type: 'article',
    }
  };
}

export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params;
  const result = db.getCompetitionById(id);

  if (!result) {
    notFound();
  }

  const { competition, related } = result;
  const platform = competition.platform;

  const isLive = competition.status === 'live';
  const isUpcoming = competition.status === 'upcoming';
  const isEnded = competition.status === 'ended';

  // Structured Data for Google Rich Snippets (Schema.org/Event)
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': competition.title,
    'description': competition.description,
    'startDate': competition.start_date,
    'endDate': competition.end_date,
    'eventStatus': isLive ? 'https://schema.org/EventMovedOnline' : 'https://schema.org/EventScheduled',
    'eventAttendanceMode': competition.format === 'online' 
      ? 'https://schema.org/OnlineEventAttendanceMode' 
      : 'https://schema.org/OfflineEventAttendanceMode',
    'location': {
      '@type': 'VirtualLocation',
      'url': competition.official_url
    },
    'organizer': {
      '@type': 'Organization',
      'name': platform?.name || 'Trading Host',
      'url': platform?.website_url
    },
    'offers': {
      '@type': 'Offer',
      'price': competition.entry_fee || 0,
      'priceCurrency': 'USD',
      'url': competition.official_url,
      'availability': 'https://schema.org/InStock'
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="min-h-screen py-8">
      {/* Inject Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Tournaments</span>
          </Link>
          <div className="flex items-center gap-2">
            <span>Market:</span>
            <span className="rounded bg-white/10 px-2 py-0.5 font-bold uppercase text-slate-200">
              {competition.market_type}
            </span>
          </div>
        </div>

        {/* Hero Banner Card */}
        <div className="glass-panel relative rounded-3xl border border-white/15 p-6 sm:p-8 md:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -z-10 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              {/* Platform & Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/platforms/${platform?.slug || competition.platform_id}`}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
                >
                  {platform?.logo_url && (
                    <img src={platform.logo_url} alt="" className="h-4 w-4 rounded object-cover" />
                  )}
                  <span>{platform?.name}</span>
                  {platform?.verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                </Link>

                {/* Status */}
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 badge-live-pulse">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE NOW
                  </span>
                )}
                {isUpcoming && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
                    UPCOMING
                  </span>
                )}
                {isEnded && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                    CONCLUDED
                  </span>
                )}

                {/* Legitimacy Score */}
                <div className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                  <CheckCircle className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Legitimacy Score: {competition.legitimacy_score}/100</span>
                </div>
              </div>

              {/* Tournament Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {competition.title}
              </h1>

              {/* Tournament Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {competition.description}
              </p>

              {/* Meta Quick Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-slate-300">
                  Format: <strong className="text-white capitalize">{competition.format}</strong>
                </span>
                <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-slate-300">
                  Team Size: <strong className="text-white capitalize">{competition.team_type}</strong>
                </span>
                <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-slate-300">
                  Entry: <strong className="text-white">
                    {competition.entry_fee ? `$${competition.entry_fee}` : '100% Free'}
                  </strong>
                </span>
                {competition.participant_count && (
                  <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-slate-300">
                    Traders: <strong className="text-white">{competition.participant_count.toLocaleString()}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Prize & CTA Card */}
            <div className="lg:w-80 flex-shrink-0 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-[#101322] to-transparent p-5 text-center flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Total Prize Pool
                </span>
                <div className="mt-2 text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 font-mono">
                  {competition.currency === 'USD' ? '$' : ''}{competition.prize_pool.toLocaleString()} {competition.currency !== 'USD' ? competition.currency : ''}
                </div>
              </div>

              {/* Countdown */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <CountdownTimer 
                  startDate={competition.start_date}
                  endDate={competition.end_date}
                  status={competition.status}
                />
              </div>

              {/* Outbound Join Button */}
              <a
                href={competition.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-3 px-5 text-sm font-bold text-white shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-[0.98] transition"
              >
                <span>Register on Official Platform</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <p className="text-[10px] text-slate-500 leading-tight">
                Outbound link to {platform?.name || 'host'}. AlphaArena is an independent aggregator.
              </p>
            </div>
          </div>
        </div>

        {/* Content Columns: Rules & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rules Summary & Evaluation Metric */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                Tournament Rules & Evaluation
              </h2>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Primary Ranking Metric
                </span>
                <p className="text-sm font-semibold text-white mt-1">
                  {competition.evaluation_metric}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Rules & Guidelines
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {competition.rules_summary.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prize Breakdown Tier Table */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Prize Distribution Breakdown
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-bold uppercase text-slate-400">
                      <th className="py-2.5 px-3">Standing / Rank</th>
                      <th className="py-2.5 px-3">Reward / Allocation</th>
                      <th className="py-2.5 px-3 text-right">Approx Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {competition.prize_breakdown.map((tier, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          {idx === 0 && <Trophy className="h-3.5 w-3.5 text-amber-400" />}
                          {tier.rank}
                        </td>
                        <td className="py-3 px-3 text-amber-300 font-mono font-semibold">
                          {tier.reward}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400 font-mono">
                          {tier.value ? `$${tier.value.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schedule Timeline */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-violet-400" />
                Tournament Timeline
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Start Date & Time</span>
                  <div className="text-sm font-bold text-white">{formatDate(competition.start_date)}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Closing Date & Time</span>
                  <div className="text-sm font-bold text-white">{formatDate(competition.end_date)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="space-y-6">
            {/* Entry Requirements Card */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Entry Requirements
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {competition.entry_requirements}
              </p>
              <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Entry Fee:</span>
                  <span className="font-bold text-emerald-400">
                    {competition.entry_fee ? `$${competition.entry_fee}` : 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Beginner Friendly:</span>
                  <span className="font-bold text-slate-200">
                    {competition.is_beginner_friendly ? 'Yes' : 'Competitive / Advanced'}
                  </span>
                </div>
              </div>
            </div>

            {/* Regional Eligibility */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-cyan-400" />
                Eligible Regions & Countries
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {competition.country_eligibility.map((c) => (
                  <span key={c} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Check host platform's terms for full jurisdictional compliance.
              </p>
            </div>

            {/* Platform Trust & Verification Card */}
            {platform && (
              <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Platform Safety Profile
                  </h3>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/30 border border-cyan-500/30 px-2 py-0.5 rounded">
                    Trust {platform.trust_score}%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Years in Operation:</span>
                    <span className="font-bold text-white">{platform.years_active} Years</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Headquarters:</span>
                    <span className="font-bold text-white">{platform.headquarters}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-slate-400 block mb-1">Regulation & Licensing:</span>
                    <span className="font-medium text-slate-300 bg-white/5 p-2 rounded block leading-relaxed">
                      {platform.regulation_status}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/platforms/${platform.slug}`}
                  className="block text-center rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                >
                  View Full Platform Profile
                </Link>
              </div>
            )}

            {/* Disclaimer Callout */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[11px] text-slate-400 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Aggregator Notice</span>
              </div>
              <p>
                Tournament rules and prize allocations are managed exclusively by {platform?.name}. AlphaArena is an independent directory.
              </p>
            </div>
          </div>
        </div>

        {/* Related Competitions Section */}
        {related.length > 0 && (
          <div className="pt-8 border-t border-white/10 space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Related Tournaments on {platform?.name || 'Platform'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((c) => (
                <CompetitionCard key={c.id} competition={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
