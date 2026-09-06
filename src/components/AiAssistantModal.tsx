'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Trophy, 
  ArrowUpRight, 
  CheckCircle,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Competition } from '@/types';
import CompetitionCard from './CompetitionCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  competitions?: Competition[];
  timestamp: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiAssistantModal({ isOpen, onClose }: AiAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AlphaArena search assistant. I can help you find live or upcoming trading competitions by market, country, or prize size, compare tournaments, and explain competition mechanics. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();

      if (data && data.text) {
        // Strip the literal MATCHED_IDS line from the displayed text bubble
        const cleanText = data.text.replace(/MATCHED_IDS:\s*\[.*?\]/gi, '').trim();

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: cleanText,
          competitions: data.competitions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No answer received');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: 'I had trouble connecting to the competition database. Please check your connection or try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Any free crypto competitions open to India right now?',
    'Show zero-risk demo paper trading tournaments',
    'What are the biggest tournaments with prizes over $1,000,000?',
    'What does ROI-based ranking mean?'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl h-[85vh] flex flex-col rounded-3xl border border-violet-500/30 bg-[#0c0f1c] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#101426] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-orange-500 shadow-md shadow-violet-500/30 text-white">
              <Bot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-white uppercase">
                  AlphaArena <span className="text-orange-400">AI Assistant</span>
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Live Engine
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Tournament discovery & comparison • Not financial advice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {messages.map(msg => {
            const isAi = msg.role === 'assistant';
            return (
              <div key={msg.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                {/* Bubble */}
                <div className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 space-y-2 ${
                  isAi 
                    ? 'bg-[#14182b] border border-white/10 text-slate-200' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20'
                }`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold uppercase tracking-wider text-slate-300">
                      {isAi ? 'AlphaArena AI' : 'You'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>

                  {/* Render Embedded Tournament Cards if matched */}
                  {isAi && msg.competitions && msg.competitions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        Matched Tournaments ({msg.competitions.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.competitions.map(comp => (
                          <div 
                            key={comp.id}
                            className="rounded-xl border border-white/10 bg-black/40 p-3 flex flex-col justify-between space-y-2 hover:border-violet-500/40 transition"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                                <span className="font-bold text-slate-300">{comp.platform?.name}</span>
                                <span className="text-emerald-400 font-bold uppercase">{comp.status}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white line-clamp-1">
                                {comp.title}
                              </h4>
                              <div className="text-[11px] font-black text-amber-400 font-mono mt-1">
                                ${comp.prize_pool.toLocaleString()} {comp.currency}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                              <a
                                href={`/competitions/${comp.id}`}
                                className="flex-1 rounded bg-white/10 py-1 text-center text-[10px] font-semibold text-slate-200 hover:bg-white/20 transition"
                              >
                                View Details
                              </a>
                              <a
                                href={comp.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-orange-600 transition flex items-center gap-0.5"
                              >
                                <span>Join</span>
                                <ArrowUpRight className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#14182b] border border-white/10 rounded-2xl p-3 max-w-[200px]">
              <Sparkles className="h-4 w-4 text-orange-400 animate-spin" />
              <span>Querying tournament DB...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Suggested Searches
            </div>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map(p => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:border-violet-500/40 hover:text-white transition text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="border-t border-white/10 bg-[#0e1122] p-3 sm:p-4">
          <form 
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about free tournaments, India eligibility, or prop firm challenges..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <ShieldAlert className="h-3 w-3 text-amber-500" />
            <span>AlphaArena AI presents verified database facts only. Never financial advice.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
