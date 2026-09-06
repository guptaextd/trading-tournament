'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Trophy, 
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';
import { Competition } from '@/types';
import CompetitionCard from './CompetitionCard';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  matchedIds?: string[];
  competitions?: Competition[];
}

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your AlphaArena AI search assistant. Ask me to find crypto showdowns, forex contests, funded prop challenges, or explain rules.',
      matchedIds: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, history })
      });
      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.error, matchedIds: [] }]);
      } else {
        // Fetch competition details for cards
        let comps: Competition[] = [];
        if (data.matchedIds && data.matchedIds.length > 0) {
          const compFetches = await Promise.all(
            data.matchedIds.map((id: string) => 
              fetch(`/api/competitions/${id}`).then(r => r.json()).then(d => d.competition).catch(() => null)
            )
          );
          comps = compFetches.filter(Boolean);
        }

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: data.text, 
          matchedIds: data.matchedIds,
          competitions: comps
        }]);
        setHistory(data.updatedHistory || []);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Connection error. Please try again.", matchedIds: [] }]);
    } finally {
      setLoading(false);
    }
  }

  const samplePrompts = [
    'Any free crypto competitions open to India right now?',
    'Show zero-risk demo paper trading tournaments',
    'What are the biggest tournaments with prizes over $1,000,000?',
    'What does ROI-based ranking mean?'
  ];

  return (
    <div className="w-full flex flex-col rounded-3xl border border-violet-500/30 bg-[#0c0f1c] shadow-2xl overflow-hidden min-h-[600px] max-h-[85vh]">
      {/* Intro Header */}
      <div className="border-b border-white/10 bg-[#101426] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-orange-500 text-white shadow-lg shadow-violet-500/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wide text-white uppercase">
                AlphaArena <span className="text-orange-400">AI Assistant</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Claude Agent
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ask things like "free forex contests this week" or "competitions with prizes over $100K"
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([{
              role: 'assistant',
              text: 'Conversation reset. What tournaments can I help you find?',
              matchedIds: []
            }]);
            setHistory([]);
          }}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition"
          title="Reset Conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'assistant' ? 'items-start' : 'items-end'}`}>
            <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 space-y-2 ${
              m.role === 'assistant'
                ? 'bg-[#14182b] border border-white/10 text-slate-200'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {m.role === 'assistant' ? 'AlphaArena AI' : 'You'}
              </div>
              <p className="leading-relaxed whitespace-pre-line">{m.text}</p>

              {/* Render Matched Competition Cards */}
              {m.competitions && m.competitions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4" />
                    Matched Competitions ({m.competitions.length})
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {m.competitions.map(comp => (
                      <CompetitionCard key={comp.id} competition={comp} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#14182b] border border-white/10 rounded-2xl p-3 max-w-[200px]">
            <Sparkles className="h-4 w-4 text-orange-400 animate-spin" />
            <span>Searching competitions...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 pb-2">
          <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Suggested Questions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:border-violet-500/40 hover:text-white transition text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 bg-[#0e1122] p-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about trading competitions, free entry, eligibility..."
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-2 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldAlert className="h-3 w-3 text-amber-500" />
          <span>AlphaArena AI only presents verified directory facts. Never financial or trading advice.</span>
        </div>
      </div>
    </div>
  );
}
