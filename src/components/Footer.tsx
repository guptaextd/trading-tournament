'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ShieldAlert, Send, ArrowUpRight, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#06070c] text-slate-400 mt-20">
      {/* Upper Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-orange-500 text-white shadow-md">
                <Trophy className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-wider text-white uppercase">
                ALPHA<span className="text-orange-400">ARENA</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premier independent tournament intelligence directory. Discover, track, and compare competitive trading tournaments across verified crypto exchanges, forex brokers, and prop firms worldwide.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Join Telegram Community</span>
              </a>
              <Link
                href="/alerts"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-orange-500/40 hover:text-orange-400 transition"
              >
                <span>Daily Digest</span>
              </Link>
            </div>
          </div>

          {/* Directory Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Directory</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition">All Tournaments</Link></li>
              <li><Link href="/?status=live" className="hover:text-white transition">Live Competitions</Link></li>
              <li><Link href="/?entry=free" className="hover:text-white transition">Free Entry Cups</Link></li>
              <li><Link href="/platforms" className="hover:text-white transition">Brokers & Exchanges</Link></li>
              <li><Link href="/results" className="hover:text-white transition">Past Winners & Results</Link></li>
              <li><Link href="/hall-of-fame" className="hover:text-white transition">Hall of Fame</Link></li>
            </ul>
          </div>

          {/* Organizers Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Organizers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/submit" className="text-orange-400 hover:text-orange-300 transition font-medium">+ Submit Tournament</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Moderation Queue</Link></li>
              <li><Link href="/platforms" className="hover:text-white transition">Verified Badge Guide</Link></li>
              <li><a href="mailto:partners@alphaarena.io" className="hover:text-white transition">Partnerships & Promotion</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Legal & Risk</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/legal/disclaimer" className="hover:text-white transition">Risk Disclaimer</Link></li>
              <li><Link href="/legal/affiliate" className="hover:text-white transition">Affiliate Disclosure</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Mandatory Transparency & Regulatory Warning Box */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs leading-relaxed space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" />
            <span>Independent Aggregator & High-Risk Investment Warning</span>
          </div>
          <p className="text-slate-400">
            <strong>Independent Status:</strong> AlphaArena is an independent directory, data aggregator, and informational research resource. AlphaArena is not an exchange, broker, financial advisor, or financial service provider. We are not affiliated with, sponsored by, or endorsed by any featured cryptocurrency exchange, forex brokerage, or proprietary trading firm unless explicitly stated.
          </p>
          <p className="text-slate-400">
            <strong>Financial Risk Warning:</strong> Trading derivatives, cryptocurrencies, forex, contracts for difference (CFDs), futures, and options involves extreme financial risk and can result in the loss of your entire capital. Competitive trading tournaments encourage aggressive performance which may magnify risk. Never trade with money you cannot afford to lose.
          </p>
          <p className="text-slate-400">
            <strong>Affiliate Disclosure:</strong> Some links on this directory are outbound affiliate or partner links. If you click on an external link and sign up or participate in a competition, AlphaArena may receive marketing compensation at no additional cost to you. This does not influence our editorial independence or legitimacy scoring.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} AlphaArena. All rights reserved. Real-time tournament intelligence.
          </div>
          <div className="flex items-center gap-1">
            <span>Built for competitive traders with precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
