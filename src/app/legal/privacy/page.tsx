import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | AlphaArena',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="glass-panel rounded-3xl border border-white/10 p-8 sm:p-12 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            PRIVACY POLICY
          </h1>

          <p>
            This Privacy Policy describes how AlphaArena collects, uses, and safeguards information when you use our website, subscribe to alerts, or submit trading tournaments.
          </p>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Information We Collect</h2>
            <p>
              <strong>Email & Preferences:</strong> When you subscribe to our daily tournament alerts, we collect your email address, selected market preferences, minimum prize threshold, and country selection to personalize your digest.
            </p>
            <p>
              <strong>Tournament Submissions:</strong> When you submit a tournament via our public submission form, we collect the submitter name, contact email, and platform details for moderation and verification purposes.
            </p>
            <p>
              <strong>Usage Data:</strong> We may collect standard aggregate anonymous analytics (pages visited, browser type, referral URLs) to improve platform performance.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">How We Use Information</h2>
            <p>
              We use your information solely to deliver customized tournament digest emails, notify you of high-priority competitions matching your criteria, and manage the tournament submission workflow. We never sell, rent, or trade your personal data to third parties.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Unsubscribing & Data Deletion</h2>
            <p>
              Every alert email contains a direct one-click unsubscribe link. You may also contact privacy@alphaarena.io at any time to request complete deletion of your subscriber record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
