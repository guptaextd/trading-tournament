'use client';

import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Trophy, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { MarketType } from '@/types';

export default function AlertsPage() {
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [country, setCountry] = useState('Global');
  const [minPrize, setMinPrize] = useState<number>(50000);
  const [selectedMarkets, setSelectedMarkets] = useState<MarketType[]>([
    'crypto',
    'forex',
    'futures',
    'demo'
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleMarket = (m: MarketType) => {
    setSelectedMarkets(prev => 
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          telegram_handle: telegram,
          country,
          min_prize: minPrize,
          markets: selectedMarkets
        })
      });

      if (!res.ok) throw new Error('Subscription failed.');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete subscription.');
    } finally {
      setLoading(false);
    }
  };

  const marketOptions: { id: MarketType; label: string }[] = [
    { id: 'crypto', label: 'Crypto Derivatives & Spot' },
    { id: 'forex', label: 'Forex & Currencies' },
    { id: 'futures', label: 'Index & Commodity Futures' },
    { id: 'stocks', label: 'Equities & Stocks' },
    { id: 'copy_trading', label: 'Copy Trading Clashes' },
    { id: 'demo', label: 'Zero-Risk Demo & Paper Cups' },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-400">
            <BellRing className="h-3.5 w-3.5" />
            <span>Real-Time Tournament Notifications</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            TOURNAMENT ALERTS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Never miss high-stakes tournaments or free prop firm evaluations. Receive daily digests tailored to your country and preferred markets.
          </p>
        </div>

        {/* Telegram Direct Box */}
        <div className="glass-card rounded-2xl border border-cyan-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/30 via-[#0e1220] to-transparent">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Join the Instant Telegram Feed</h3>
              <p className="text-xs text-slate-400">
                Instant push pings when new tournaments launch with &gt;$100,000 prize pools.
              </p>
            </div>
          </div>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 transition whitespace-nowrap"
          >
            <span>Open Telegram</span>
            <Send className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Subscription Form */}
        <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Alert Preferences Saved!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                You will receive your tournament digest at <strong className="text-orange-400">{email}</strong>. You can update your filters or unsubscribe anytime.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
              >
                Change Preferences
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-6 text-xs">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email and Telegram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    placeholder="trader@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Telegram Username (Optional)</label>
                  <input
                    type="text"
                    placeholder="@yourhandle"
                    value={telegram}
                    onChange={e => setTelegram(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Country & Minimum Prize */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Your Country / Region</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:outline-none"
                  >
                    <option value="Global">Global (All Regions)</option>
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="EU">European Union</option>
                    <option value="UAE">United Arab Emirates</option>
                    <option value="Australia">Australia</option>
                    <option value="East Asia">Japan / Korea / East Asia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Minimum Tournament Prize Pool</label>
                  <select
                    value={minPrize}
                    onChange={e => setMinPrize(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-white focus:outline-none"
                  >
                    <option value={0}>Any Prize Amount ($0+)</option>
                    <option value={10000}>$10,000+ Prize Pools</option>
                    <option value={50000}>$50,000+ Prize Pools</option>
                    <option value={250000}>$250,000+ Major Tournaments</option>
                    <option value={1000000}>$1,000,000+ Mega Grand Prix Only</option>
                  </select>
                </div>
              </div>

              {/* Market Preferences */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Preferred Markets (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {marketOptions.map(opt => {
                    const checked = selectedMarkets.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => toggleMarket(opt.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          checked
                            ? 'border-orange-500/50 bg-orange-500/10 text-white font-medium'
                            : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/15'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded flex items-center justify-center border ${
                          checked ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-600'
                        }`}>
                          {checked && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-3 text-sm font-bold text-white shadow-xl shadow-orange-500/20 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50"
              >
                {loading ? 'Activating Alerts...' : 'Subscribe to Custom Digest'}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                We respect your privacy. Zero spam. One-click unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
