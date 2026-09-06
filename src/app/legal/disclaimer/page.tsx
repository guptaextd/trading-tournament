import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Risk Disclaimer & Independent Aggregator Notice | AlphaArena',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="glass-panel rounded-3xl border border-white/10 p-8 sm:p-12 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-3 text-amber-400">
            <ShieldAlert className="h-8 w-8" />
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              RISK DISCLAIMER & AGGREGATOR NOTICE
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Independent Aggregator Status</h2>
            <p>
              AlphaArena (accessible at alphaarena.io) is an independent informational directory and tournament discovery platform. AlphaArena is not a broker, exchange, financial advisor, asset manager, or provider of financial services. AlphaArena is not affiliated with, sponsored by, or endorsed by any third-party cryptocurrency exchange, forex broker, proprietary trading firm, or tournament organizer listed on this site.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Financial Risk Warning</h2>
            <p>
              Trading financial instruments—including but not limited to cryptocurrencies, leveraged derivatives, foreign exchange (Forex), contracts for difference (CFDs), futures, and options—carries an exceptionally high level of risk and may not be suitable for all persons. You may sustain a total loss of your initial investment or deposit.
            </p>
            <p>
              Competitive trading tournaments, by their very design, encourage high volatility, rapid order execution, and aggressive risk-taking to maximize percentage returns within a finite time horizon. Such strategies inherently amplify the risk of rapid capital liquidation. Never participate in real-money trading tournaments with funds you cannot afford to lose entirely.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Tournament Terms & Payouts</h2>
            <p>
              All competition rules, evaluation criteria, payout distributions, eligibility criteria, and operational terms are determined solely and exclusively by the hosting platform (e.g. Binance, Bybit, FTMO, IC Markets, etc.). While AlphaArena makes reasonable efforts to keep directory listings up to date, terms may change without notice. Users are strictly responsible for verifying tournament conditions directly on the official host platform prior to registration.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Jurisdictional Restrictions</h2>
            <p>
              Financial derivatives and crypto competitions may be restricted or prohibited in certain jurisdictions (including specific restrictions in the United States, United Kingdom, European Union, or China). It is your sole responsibility to ensure that participating in any tournament listed complies with your local laws and regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
