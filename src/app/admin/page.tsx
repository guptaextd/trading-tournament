'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  PlusCircle, 
  Trash2, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit3, 
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  Trophy,
  ArrowUpRight
} from 'lucide-react';
import { Competition, Submission, Platform, MarketType, TournamentFormat, TeamType } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'competitions' | 'submissions'>('submissions');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New Competition Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formPlatformId, setFormPlatformId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrizePool, setFormPrizePool] = useState<number>(50000);
  const [formCurrency, setFormCurrency] = useState('USDT');
  const [formMarketType, setFormMarketType] = useState<MarketType>('crypto');
  const [formEntryFee, setFormEntryFee] = useState<string>('0');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formCountry, setFormCountry] = useState('Global');
  const [formFormat, setFormFormat] = useState<TournamentFormat>('online');
  const [formTeamType, setFormTeamType] = useState<TeamType>('solo');
  const [formOfficialUrl, setFormOfficialUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formLegitimacy, setFormLegitimacy] = useState(95);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [compRes, subRes, pltRes] = await Promise.all([
        fetch('/api/competitions').then(r => r.json()),
        fetch('/api/submissions').then(r => r.json()),
        fetch('/api/platforms').then(r => r.json()),
      ]);
      setCompetitions(compRes.items || []);
      setSubmissions(subRes || []);
      setPlatforms(pltRes || []);
      if (pltRes && pltRes.length > 0 && !formPlatformId) {
        setFormPlatformId(pltRes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Handle Approve Submission
  const handleApprove = async (submissionId: string) => {
    setActionLoading(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        await loadAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Reject Submission
  const handleReject = async (submissionId: string) => {
    setActionLoading(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          rejection_reason: 'Does not satisfy tournament eligibility transparency standards.'
        })
      });
      if (res.ok) {
        await loadAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = async (comp: Competition) => {
    try {
      const res = await fetch(`/api/competitions/${comp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !comp.featured })
      });
      if (res.ok) {
        setCompetitions(prev => prev.map(c => c.id === comp.id ? { ...c, featured: !c.featured } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Competition
  const handleDeleteCompetition = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;
    try {
      const res = await fetch(`/api/competitions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCompetitions(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormPrizePool(100000);
    setFormCurrency('USDT');
    setFormMarketType('crypto');
    setFormEntryFee('0');
    setFormStartDate(new Date().toISOString().slice(0, 16));
    setFormEndDate(new Date(Date.now() + 86400000 * 20).toISOString().slice(0, 16));
    setFormCountry('Global');
    setFormFormat('online');
    setFormTeamType('solo');
    setFormOfficialUrl('https://');
    setFormFeatured(false);
    setFormLegitimacy(95);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (comp: Competition) => {
    setModalMode('edit');
    setEditingId(comp.id);
    setFormTitle(comp.title);
    setFormPlatformId(comp.platform_id);
    setFormDescription(comp.description);
    setFormPrizePool(comp.prize_pool);
    setFormCurrency(comp.currency);
    setFormMarketType(comp.market_type);
    setFormEntryFee(comp.entry_fee ? String(comp.entry_fee) : '0');
    setFormStartDate(new Date(comp.start_date).toISOString().slice(0, 16));
    setFormEndDate(new Date(comp.end_date).toISOString().slice(0, 16));
    setFormCountry(comp.country_eligibility.join(', '));
    setFormFormat(comp.format);
    setFormTeamType(comp.team_type);
    setFormOfficialUrl(comp.official_url);
    setFormFeatured(comp.featured);
    setFormLegitimacy(comp.legitimacy_score);
    setIsModalOpen(true);
  };

  // Save Modal (Create or Edit)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formTitle,
      platform_id: formPlatformId,
      description: formDescription,
      prize_pool: Number(formPrizePool),
      currency: formCurrency,
      market_type: formMarketType,
      entry_fee: Number(formEntryFee) > 0 ? Number(formEntryFee) : null,
      start_date: new Date(formStartDate).toISOString(),
      end_date: new Date(formEndDate).toISOString(),
      country_eligibility: formCountry.split(',').map(s => s.trim()).filter(Boolean),
      format: formFormat,
      team_type: formTeamType,
      official_url: formOfficialUrl,
      featured: formFeatured,
      legitimacy_score: Number(formLegitimacy)
    };

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/competitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsModalOpen(false);
          await loadAll();
        }
      } else if (modalMode === 'edit' && editingId) {
        const res = await fetch(`/api/competitions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsModalOpen(false);
          await loadAll();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3 py-1 text-xs font-semibold text-violet-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin Management Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              DIRECTORY ADMIN & MODERATION
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAll}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
              title="Refresh Data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add New Tournament</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Tournaments
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {competitions.length}
            </span>
          </div>
          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Pending Submissions
            </span>
            <span className="text-2xl font-black text-orange-400 font-mono mt-1 block">
              {pendingSubmissions.length}
            </span>
          </div>
          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Hosts
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {platforms.length}
            </span>
          </div>
          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Prize Volume
            </span>
            <span className="text-2xl font-black text-amber-300 font-mono mt-1 block">
              ${(competitions.reduce((acc, c) => acc + c.prize_pool, 0) / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold tracking-wide transition border-b-2 ${
              activeTab === 'submissions'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Submission Queue</span>
            {pendingSubmissions.length > 0 && (
              <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300 font-mono">
                {pendingSubmissions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('competitions')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold tracking-wide transition border-b-2 ${
              activeTab === 'competitions'
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>All Directory Tournaments ({competitions.length})</span>
          </button>
        </div>

        {/* TAB 1: Submissions Moderation Queue */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0f121e] p-8 text-center text-slate-400">
                No submissions in queue.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map(sub => {
                  const data = sub.competition_data;
                  const isPending = sub.status === 'pending';

                  return (
                    <div
                      key={sub.id}
                      className={`glass-card rounded-2xl border p-5 transition ${
                        isPending ? 'border-orange-500/30 bg-[#0e111d]' : 'border-white/5 opacity-70'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Details */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`rounded px-2 py-0.5 font-bold uppercase text-[10px] ${
                              sub.status === 'approved' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : sub.status === 'rejected'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            }`}>
                              {sub.status}
                            </span>
                            <span className="text-slate-400">
                              Submitted by: <strong className="text-white">{sub.submitted_by}</strong> ({sub.contact_email})
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">{new Date(sub.submitted_at).toLocaleString()}</span>
                          </div>

                          <h3 className="text-base font-bold text-white">
                            {data.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span>Host: <strong className="text-slate-200">{data.platform_name}</strong></span>
                            <span>•</span>
                            <span>Prize: <strong className="text-amber-400 font-mono">${Number(data.prize_pool).toLocaleString()} {data.currency}</strong></span>
                            <span>•</span>
                            <span className="capitalize">{data.market_type} • {data.format}</span>
                          </div>

                          {/* AI Triage Quality Note */}
                          {sub.ai_quality_note && (
                            <div className="mt-2 rounded-xl bg-violet-950/30 border border-violet-500/20 p-2.5 text-[11px] font-mono text-slate-300 whitespace-pre-line">
                              <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1 font-sans flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                <span>AI Submission Triage Assessment</span>
                              </div>
                              {sub.ai_quality_note}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Approve & Publish Live</span>
                            </button>
                            <button
                              onClick={() => handleReject(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="flex items-center gap-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-2 text-xs font-semibold transition disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic">
                            Moderation status finalized.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: All Competitions CRUD Table */}
        {activeTab === 'competitions' && (
          <div className="rounded-2xl border border-white/10 bg-[#0c0e18] overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold uppercase text-slate-400">
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4">Title & Platform</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Market</th>
                    <th className="py-3 px-4 text-right">Prize</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {competitions.map(comp => (
                    <tr key={comp.id} className="hover:bg-white/[0.02] transition">
                      {/* Featured Star toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(comp)}
                          className={`p-1 rounded transition ${
                            comp.featured ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                          title="Toggle Featured Pin"
                        >
                          <Star className={`h-4 w-4 ${comp.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Title & Platform */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          <Link href={`/competitions/${comp.id}`} className="hover:text-orange-400">
                            {comp.title}
                          </Link>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {comp.platform?.name} • {comp.format}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          comp.status === 'live' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : comp.status === 'upcoming' 
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                              : 'bg-slate-800 text-slate-400'
                        }`}>
                          {comp.status}
                        </span>
                      </td>

                      {/* Market */}
                      <td className="py-3 px-4 uppercase text-slate-300">
                        {comp.market_type.replace('_', ' ')}
                      </td>

                      {/* Prize */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                        ${comp.prize_pool.toLocaleString()}
                      </td>

                      {/* Score */}
                      <td className="py-3 px-4 text-center font-mono text-cyan-300">
                        {comp.legitimacy_score}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(comp)}
                            className="rounded p-1.5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                            title="Edit Competition"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCompetition(comp.id)}
                            className="rounded p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                            title="Delete Competition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create or Edit Competition */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0f121e] p-6 sm:p-8 shadow-2xl my-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                  {modalMode === 'create' ? 'Add New Tournament' : 'Edit Tournament'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Tournament Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1">Host Platform *</label>
                    <select
                      value={formPlatformId}
                      onChange={e => setFormPlatformId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                    >
                      {platforms.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Market Category</label>
                    <select
                      value={formMarketType}
                      onChange={e => setFormMarketType(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none capitalize"
                    >
                      <option value="crypto">Crypto</option>
                      <option value="forex">Forex</option>
                      <option value="futures">Futures</option>
                      <option value="stocks">Stocks</option>
                      <option value="copy_trading">Copy Trading</option>
                      <option value="demo">Demo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1">Prize Pool</label>
                    <input
                      type="number"
                      value={formPrizePool}
                      onChange={e => setFormPrizePool(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Currency</label>
                    <input
                      type="text"
                      value={formCurrency}
                      onChange={e => setFormCurrency(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Entry Fee (0=Free)</label>
                    <input
                      type="number"
                      value={formEntryFee}
                      onChange={e => setFormEntryFee(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1">Start Date (UTC)</label>
                    <input
                      type="datetime-local"
                      value={formStartDate}
                      onChange={e => setFormStartDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">End Date (UTC)</label>
                    <input
                      type="datetime-local"
                      value={formEndDate}
                      onChange={e => setFormEndDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Official Registration URL *</label>
                  <input
                    type="url"
                    value={formOfficialUrl}
                    onChange={e => setFormOfficialUrl(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={e => setFormFeatured(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-white">Pin as Featured Tournament</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20"
                  >
                    {modalMode === 'create' ? 'Create Tournament' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
