import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Bot, Sparkles, ShieldCheck } from 'lucide-react';
import AgentChat from '@/components/AgentChat';

export const metadata: Metadata = {
  title: 'AI Tournament Assistant | AlphaArena',
  description: 'Ask our AI agent to search, filter, and compare live and upcoming trading competitions across crypto, forex, prop firms, and demo leagues.',
};

export default function AskPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Tournament Directory</span>
        </Link>

        {/* Page Title & Intro */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span>Autonomous Discovery Agent</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            ASK ALPHAARENA AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Find competitions by asset class, entry fee, regional eligibility, or rules without clicking through hundreds of broker pages.
          </p>
        </div>

        {/* Chat Component */}
        <AgentChat />
      </div>
    </div>
  );
}
