'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PlatformType, MarketType, TournamentFormat, TeamType, Competition } from '@/types';
import CompetitionCard from '@/components/CompetitionCard';

export default function SubmitCompetitionPage() {
  const [submittedBy, setSubmittedBy] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [platformType, setPlatformType] = useState<PlatformType>('exchange');
  const [platformWebsite, setPlatformWebsite] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizePool, setPrizePool] = useState<number>(100000);
  const [currency, setCurrency] = useState('USDT');
  const [marketType, setMarketType] = useState<MarketType>('crypto');
  const [entryFee, setEntryFee] = useState<number | null>(null);
  const [isFree, setIsFree] = useState(true);
  const [startDate, setStartDate] = useState('2026-10-01T00:00');
  const [endDate, setEndDate] = useState('2026-10-25T23:59');
  const [countryEligibility, setCountryEligibility] = useState('Global, India, UK, EU');
  const [format, setFormat] = useState<TournamentFormat>('online');
  const [teamType, setTeamType] = useState<TeamType>('solo');
  const [officialUrl, setOfficialUrl] = useState('');
  const [evaluationMetric, setEvaluationMetric] = useState('Highest Net PnL %');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !platformName || !contactEmail || !officialUrl) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitted_by: submittedBy || 'Anonymous Organizer',
          contact_email: contactEmail,
          competition_data: {
            platform_name: platformName,
            platform_type: platformType,
            platform_website: platformWebsite || officialUrl,
            title,
            description: description || 'Competitive trading tournament submitted by community.',
            prize_pool: Number(prizePool),
            currency,
            market_type: marketType,
            entry_fee: isFree ? null : Number(entryFee) || 0,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            country_eligibility: countryEligibility.split(',').map(s => s.trim()).filter(Boolean),
            format,
            team_type: teamType,
            official_url: officialUrl,
            evaluation_metric: evaluationMetric
          }
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit tournament.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  // Construct mock preview object
  const previewCompetition: Competition = {
    id: 'preview-comp',
    title: title || 'Your Tournament Title Here',
    slug: 'preview',
    platform_id: 'preview-plt',
    platform: {
      id: 'preview-plt',
      name: platformName || 'Your Platform Name',
      slug: 'preview',
      logo_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=128&auto=format&fit=crop&q=80',
      website_url: platformWebsite || 'https://example.com',
      type: platformType,
      verified: false,
      years_active: 3,
      regulation_status: 'Community Submitted',
      headquarters: 'Global',
      trust_score: 88,
      description: 'Host platform.'
    },
    description: description || 'Detailed tournament description will appear here on the competition card.',
    prize_pool: Number(prizePool) || 50000,
    currency: currency || 'USD',
    market_type: marketType,
    entry_fee: isFree ? null : Number(entryFee) || 25,
    entry_requirements: 'Check official registration link for rules.',
    start_date: new Date(startDate || Date.now()).toISOString(),
    end_date: new Date(endDate || Date.now() + 86400000 * 14).toISOString(),
    country_eligibility: countryEligibility.split(',').map(s => s.trim()).filter(Boolean),
    format,
    team_type: teamType,
    official_url: officialUrl || 'https://example.com',
    status: 'upcoming',
    featured: false,
    legitimacy_score: 90,
    evaluation_metric: evaluationMetric,
    rules_summary: ['Standard tournament rules.'],
    prize_breakdown: [{ rank: '1st Place', reward: `${prizePool} ${currency}` }],
    created_at: new Date().toISOString()
  };

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-400">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Community & Host Submissions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            SUBMIT A TOURNAMENT
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Are you a crypto exchange, forex broker, prop firm, or tournament organizer? Submit your trading competition to get featured in the AlphaArena directory.
          </p>
        </div>

        {success ? (
          <div className="max-w-xl mx-auto rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center backdrop-blur-xl shadow-2xl space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Tournament Submitted Successfully!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your competition has been submitted to the AlphaArena moderation queue. Our verification team will review your rules and legitimacy score before publishing to the live directory.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                href="/admin"
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition"
              >
                View Admin Queue
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                Submit Another
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submitter & Host Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/10 pb-2">
                    1. Submitter & Host Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Your Name / Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. Bybit Marketing Team"
                        value={submittedBy}
                        onChange={e => setSubmittedBy(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Contact Email *</label>
                      <input
                        type="email"
                        placeholder="partner@exchange.com"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Platform Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. OKX, FTMO"
                        value={platformName}
                        onChange={e => setPlatformName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Platform Type</label>
                      <select
                        value={platformType}
                        onChange={e => setPlatformType(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="exchange">Crypto Exchange</option>
                        <option value="broker">Forex / CFD Broker</option>
                        <option value="prop_firm">Prop Firm</option>
                        <option value="championship">Championship Host</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Official Platform URL</label>
                      <input
                        type="url"
                        placeholder="https://bybit.com"
                        value={platformWebsite}
                        onChange={e => setPlatformWebsite(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Competition Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/10 pb-2">
                    2. Tournament Specifications
                  </h3>
                  <div>
                    <label className="block text-slate-400 mb-1">Tournament Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. World Series of Trading: Autumn Clash"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Brief overview of the tournament, special prizes, categories..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Prize Pool *</label>
                      <input
                        type="number"
                        min="1"
                        value={prizePool}
                        onChange={e => setPrizePool(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:border-violet-500 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Currency</label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:border-violet-500 font-mono"
                      >
                        <option value="USDT">USDT</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="BTC">BTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Market Category</label>
                      <select
                        value={marketType}
                        onChange={e => setMarketType(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:border-violet-500 capitalize"
                      >
                        <option value="crypto">Crypto</option>
                        <option value="forex">Forex</option>
                        <option value="futures">Futures</option>
                        <option value="stocks">Stocks</option>
                        <option value="copy_trading">Copy Trading</option>
                        <option value="demo">Demo / Simulated</option>
                      </select>
                    </div>
                  </div>

                  {/* Entry fee */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-slate-400 mb-1">Entry Requirement</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={isFree}
                            onChange={() => setIsFree(true)}
                            className="text-orange-500"
                          />
                          <span className="text-white">100% Free Entry</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!isFree}
                            onChange={() => setIsFree(false)}
                            className="text-orange-500"
                          />
                          <span className="text-white">Paid Entry / Challenge Fee</span>
                        </label>
                      </div>
                    </div>
                    {!isFree && (
                      <div>
                        <label className="block text-slate-400 mb-1">Fee Amount (USD)</label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={entryFee || ''}
                          onChange={e => setEntryFee(Number(e.target.value))}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Start Date & Time (UTC)</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">End Date & Time (UTC)</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Format & Team & Region */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Format</label>
                      <select
                        value={format}
                        onChange={e => setFormat(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none capitalize"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline / In-Person</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Team Type</label>
                      <select
                        value={teamType}
                        onChange={e => setTeamType(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none capitalize"
                      >
                        <option value="solo">Solo Traders</option>
                        <option value="team">Team / Squad</option>
                        <option value="both">Both (Solo & Team)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Eligible Regions</label>
                      <input
                        type="text"
                        placeholder="Global, India, UK..."
                        value={countryEligibility}
                        onChange={e => setCountryEligibility(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Evaluation / Ranking Metric</label>
                    <input
                      type="text"
                      placeholder="e.g. Highest Net PnL %, Max ROI with <5% Drawdown"
                      value={evaluationMetric}
                      onChange={e => setEvaluationMetric(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Official Registration Link *</label>
                    <input
                      type="url"
                      placeholder="https://platform.com/register-tournament"
                      value={officialUrl}
                      onChange={e => setOfficialUrl(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50"
                >
                  {loading ? 'Submitting to Moderation Queue...' : 'Submit Tournament for Review'}
                </button>
              </form>
            </div>

            {/* Live Interactive Card Preview Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4 sticky top-24">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
                  <Eye className="h-4 w-4" />
                  Live Directory Preview
                </span>
                <span className="text-[11px] text-slate-500">Updates as you type</span>
              </div>

              <CompetitionCard competition={previewCompetition} />

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Moderation Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Submissions are reviewed within 12 hours. We verify platform licensing, clear rules transparency, and payout mechanics before issuing a verified badge.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
