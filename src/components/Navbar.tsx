'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Trophy, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Send, 
  Menu, 
  X, 
  SlidersHorizontal,
  Flame,
  Globe,
  Bot,
  Sparkles
} from 'lucide-react';
import SearchModal from '@/components/SearchModal';
import AiAssistantModal from '@/components/AiAssistantModal';

export default function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveCount, setLiveCount] = useState<number>(34);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch real stats
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.liveCount === 'number') {
          setLiveCount(data.liveCount);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: 'Tournaments', href: '/' },
    { name: 'Platforms', href: '/platforms' },
    { name: 'Results Archive', href: '/results' },
    { name: 'Hall of Fame', href: '/hall-of-fame' },
    { name: 'Ask AI', href: '/ask' },
    { name: 'Alerts', href: '/alerts' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07080e]/90 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-orange-500 shadow-lg shadow-violet-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
                <Trophy className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                  ALPHA<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">ARENA</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase -mt-1">
                  Trading Championships
                </span>
              </div>
            </Link>

            {/* Live Indicator Chip */}
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span><strong className="text-white">{liveCount}</strong> Live Tournaments</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                    active 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 sm:px-3 py-1.5 text-xs text-slate-400 transition hover:border-violet-500/50 hover:bg-white/10 hover:text-white"
              title="Search competitions & platforms (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden lg:inline-flex items-center rounded border border-white/15 bg-white/5 px-1 py-0.5 text-[10px] text-slate-300 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Ask AI Copilot Button */}
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-300 shadow-md shadow-violet-500/10 hover:bg-violet-500/25 hover:text-white transition"
              title="Ask AI Assistant"
            >
              <Bot className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Telegram Channel Link */}
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400"
              title="Join Telegram Alerts Channel"
            >
              <Send className="h-4 w-4" />
            </a>

            {/* Submit Tournament Button */}
            <Link
              href="/submit"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02]"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Submit</span>
            </Link>

            {/* Admin Panel Link */}
            <Link
              href="/admin"
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border transition ${
                pathname.startsWith('/admin')
                  ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-violet-500/40 hover:text-white'
              }`}
              title="Admin & Moderation Panel"
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-[#0c0e18] px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === link.href ? 'bg-violet-600/30 text-violet-300' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAssistantOpen(true);
              }}
              className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-violet-600/20 text-violet-300"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        )}
      </header>

      {/* Floating Action Beacon for AI Assistant */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-orange-500 p-3 sm:px-4 sm:py-3 text-white shadow-2xl shadow-violet-600/50 hover:scale-105 active:scale-95 transition-all border border-violet-400/40 group"
        title="Ask AlphaArena AI Assistant"
      >
        <div className="relative">
          <Bot className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
          Ask AI Assistant
        </span>
      </button>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* AI Assistant Modal */}
      <AiAssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
}
