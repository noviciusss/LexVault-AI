"use client";

import React, { useState } from "react";
import {
  BotMessageSquare,
  Send,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Loader2,
  ArrowRight,
  HelpCircle,
  ArrowRightLeft,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";

const SUGGESTED_QUERIES = [
  "What is our firm strategy on resisting NCLT Section 9 IBC petitions when pre-existing disputes exist?",
  "धारा २७ भारतीय अनुबंध अधिनियम के अंतर्गत रोजगार समाप्ति उपरांत नॉन-कम्पीट खंड की क्या वैधता है?",
  "What are the mandatory Arnesh Kumar safeguards before arrest in Section 498A IPC / Section 85 BNS cases?",
  "Can our firm file an asylum petition before the French Immigration Court? (Test Out-of-Jurisdiction Guardrail)",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content:
        "Namaste. I am LexVault AI, your firm's guardrailed Indian legal intelligence assistant. " +
        "I provide strategic precedents grounded strictly in your firm's internal vault knowledge. Every answer cites verified internal Knowledge Item IDs and conforms to the Constitution of India and BNS/BNSS/BSA codes.",
      cited_items: [],
      guardrail_applied: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick Statute / BNS Resolver State
  const [quickCite, setQuickCite] = useState("");
  const [quickResolved, setQuickResolved] = useState<any | null>(null);
  const [resolvingCite, setResolvingCite] = useState(false);

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.chat.send(q);
      const assistantMsg = {
        role: "assistant",
        content: res.answer,
        cited_items: res.cited_items || [],
        guardrail_applied: res.guardrail_applied,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Encountered an issue querying the vault. Please try again.",
          cited_items: [],
          guardrail_applied: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCite.trim()) return;
    setResolvingCite(true);
    try {
      const res = await api.statutes.resolveCitation(quickCite);
      setQuickResolved(res);
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingCite(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-surface-border shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-0.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Stages 7 & 8: Safe RAG Legal Assistant</span>
          </div>
          <h1 className="text-lg font-bold text-content-primary">
            Institutional Legal Knowledge Assistant (Indian Jurisdiction)
          </h1>
        </div>

        <div className="flex items-center gap-2 text-[11px] bg-status-success/15 text-status-success border border-status-success/25 px-3 py-1 rounded-full font-medium">
          <span>Strict Firm Precedent Citations Active</span>
        </div>
      </div>

      {/* Quick BNS / IPC Citation Resolver Bar */}
      <div className="p-3 rounded-xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
        <form onSubmit={handleQuickResolve} className="flex items-center gap-2 flex-1">
          <ArrowRightLeft className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Quick BNS/IPC lookup (e.g. 'IPC 302', '376', '498A', 'CrPC 41A', '65B')..."
            value={quickCite}
            onChange={(e) => setQuickCite(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            type="submit"
            disabled={resolvingCite}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] whitespace-nowrap transition-all"
          >
            {resolvingCite ? "..." : "Resolve"}
          </button>
        </form>

        {quickResolved && (
          <div className="text-[11px] flex items-center gap-2 bg-surface-elevated px-3 py-1.5 rounded-lg border border-indigo-500/30">
            {quickResolved.matched ? (
              <>
                <span className="font-bold text-indigo-400 font-mono">
                  {quickResolved.target_act} §{quickResolved.target_section}
                </span>
                <span className="text-content-muted">↔</span>
                <span className="text-content-secondary truncate max-w-[200px]">
                  {quickResolved.details?.title_en}
                </span>
                <button
                  onClick={() => setQuickResolved(null)}
                  className="text-content-muted hover:text-content-primary font-bold ml-1"
                >
                  ✕
                </button>
              </>
            ) : (
              <span className="text-status-warning">{quickResolved.message}</span>
            )}
          </div>
        )}
      </div>

      {/* Suggested Queries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
        <span className="text-content-muted text-[11px] whitespace-nowrap">Suggested:</span>
        {SUGGESTED_QUERIES.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-elevated border border-surface-border text-content-secondary hover:text-accent whitespace-nowrap transition-colors text-[11px]"
          >
            {sq.length > 45 ? sq.substring(0, 45) + "..." : sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-surface border border-surface-border">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";

          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-2`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? "bg-accent text-background font-medium"
                    : "bg-surface-elevated border border-surface-border text-content-primary font-serif whitespace-pre-wrap"
                }`}
              >
                {/* Guardrail Banner if applied */}
                {!isUser && m.guardrail_applied && (
                  <div className="mb-3 p-3 rounded-lg bg-status-warning/15 border border-status-warning/30 text-status-warning text-[11px] font-sans flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Privilege & Jurisdiction Guardrail: </span>
                      Refusal enforced. No verified internal firm precedents exist for this question.
                    </div>
                  </div>
                )}

                <div>{m.content}</div>

                {/* Cited Sources Box */}
                {!isUser && m.cited_items && m.cited_items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-surface-border/50 space-y-2 font-sans">
                    <div className="text-[10px] uppercase font-bold text-accent tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Cited Internal Firm Precedents ({m.cited_items.length}):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.cited_items.map((src: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-lg bg-surface border border-accent/20 hover:border-accent/50 transition-colors text-[11px]"
                        >
                          <div className="font-bold text-accent truncate">
                            Item #{src.item_id}: {src.title}
                          </div>
                          <div className="text-[10px] text-content-muted">
                            {src.practice_area} • Relevance: {(src.score * 100).toFixed(0)}%
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

        {loading && (
          <div className="flex items-center gap-2 text-xs text-accent font-semibold p-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Consulting Qdrant vectors & synthesizing guardrailed response...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-3 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask a legal strategy or doctrine question (answers grounded strictly in internal precedents)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-3.5 rounded-xl bg-surface border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent shadow-sm disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold text-xs transition-all shadow-gold disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Ask Vault</span>
        </button>
      </form>
    </div>
  );
}
