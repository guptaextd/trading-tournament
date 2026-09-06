import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Affiliate & Advertising Disclosure | AlphaArena',
};

export default function AffiliatePage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="glass-panel rounded-3xl border border-white/10 p-8 sm:p-12 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            AFFILIATE & ADVERTISING DISCLOSURE
          </h1>

          <p>
            In compliance with Federal Trade Commission (FTC) guidelines and global transparency standards, AlphaArena discloses that some outbound links on this website are referral, affiliate, or partner links.
          </p>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">How Affiliate Links Work</h2>
            <p>
              When you click an outbound link to join a trading tournament, open an account, or purchase a prop firm evaluation challenge, AlphaArena may receive a referral fee or commission from the host broker, exchange, or firm. This comes at <strong>zero additional cost to you</strong>. In many cases, using our partner links may provide you with discounted entry fees, deposit bonuses, or fee rebates.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Editorial Independence & Legitimacy Scoring</h2>
            <p>
              Our editorial team maintains strict separation between advertising partnerships and our tournament curation. We assign Legitimacy Scores based on transparent, objective criteria:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tier-1 and Tier-2 regulatory licensing status (FCA, ASIC, CySEC, VARA, etc.)</li>
              <li>Years of continuous verified corporate operation</li>
              <li>Documented historical proof of prize escrow and verified winner payouts</li>
              <li>Community sentiment and transparent dispute resolution records</li>
            </ul>
            <p>
              Platforms cannot purchase higher legitimacy scores or manipulate tournament rankings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
