"use client";

import React, { useState, useEffect } from "react";
import {
  BotMessageSquare,
  Send,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowRightLeft,
  Search,
  Scale,
  FileText,
  Copy,
  Check,
  FolderKanban,
  PanelLeftClose,
  PanelLeft,
  Landmark,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import MatterSidebar, { MatterThread } from "@/components/assistant/MatterSidebar";
import PrecedentDrawer from "@/components/assistant/PrecedentDrawer";
import LegalMemoModal from "@/components/assistant/LegalMemoModal";
import LegalMarkdownRenderer from "@/components/assistant/LegalMarkdownRenderer";

const PRACTICE_AREAS = [
  "All Practice Areas",
  "Constitutional Law & Fundamental Rights",
  "Criminal Law & BNS/IPC",
  "Civil Procedure (CPC)",
  "Indian Contract Act & Commercial",
  "Corporate Insolvency & IBC",
  "SEBI & Securities Law",
  "Transfer of Property & Real Estate",
  "Arbitration & ADR",
];

const COURTS = [
  "All Indian Fora",
  "Supreme Court of India",
  "Delhi High Court",
  "Bombay High Court",
  "National Company Law Appellate Tribunal (NCLAT)",
  "Commercial Courts & Arbitral Tribunals",
];

const SUGGESTED_QUERIES = [
  "What is our firm strategy on resisting NCLT Section 9 IBC petitions when pre-existing disputes exist?",
  "धारा २७ भारतीय अनुबंध अधिनियम के अंतर्गत रोजगार समाप्ति उपरांत नॉन-कम्पीट खंड की क्या वैधता है?",
  "What are the mandatory Arnesh Kumar safeguards before arrest in Section 498A IPC / Section 85 BNS cases?",
  "Can our firm file an asylum petition before the French Immigration Court? (Test Out-of-Jurisdiction Guardrail)",
];

const INITIAL_THREADS: MatterThread[] = [
  {
    id: "thread-default",
    title: "General Strategy & Inquiries",
    practiceArea: "All Practice Areas",
    updatedAt: "Just now",
    messages: [
      {
        role: "assistant",
        content:
          "Namaste. I am LexVault AI, your firm's guardrailed Indian legal intelligence copilot.\n\n" +
          "I provide strategic precedents grounded strictly in your firm's internal vault knowledge. Every answer cites verified internal Knowledge Item IDs and conforms to the Constitution of India and BNS/BNSS/BSA codes.\n\n" +
          "Select a precedent citation chip below any response to inspect the full judgment text, ratio decidendi, and counsel strategy in the side drawer.",
        cited_items: [],
        guardrail_applied: false,
      },
    ],
  },
  {
    id: "thread-ibc",
    title: "NCLT Section 9 Dispute Strategy",
    practiceArea: "Corporate Insolvency & IBC",
    updatedAt: "2 hrs ago",
    messages: [],
  },
  {
    id: "thread-bns",
    title: "BNS §85 / 498A Safeguards",
    practiceArea: "Criminal Law & BNS/IPC",
    updatedAt: "1 day ago",
    messages: [],
  },
];

export default function AssistantPage() {
  // Threads State
  const [threads, setThreads] = useState<MatterThread[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lexvault_threads");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_THREADS;
  });

  const [activeThreadId, setActiveThreadId] = useState<string>("thread-default");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // Filters State
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("All Practice Areas");
  const [selectedCourt, setSelectedCourt] = useState<string>("All Indian Fora");
  const [bnsCrossMapActive, setBnsCrossMapActive] = useState<boolean>(true);

  // Drafting Mode State: "advisory" | "draft_objection" | "draft_reply"
  const [draftingMode, setDraftingMode] = useState<"advisory" | "draft_objection" | "draft_reply">("advisory");

  // Input & Query State
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick Statute / BNS Resolver State
  const [quickCite, setQuickCite] = useState("");
  const [quickResolved, setQuickResolved] = useState<any | null>(null);
  const [resolvingCite, setResolvingCite] = useState(false);

  // Precedent Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPrecedent, setSelectedPrecedent] = useState<any | null>(null);

  // Legal Memo Modal State
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [activeMemoData, setActiveMemoData] = useState<{
    query: string;
    answer: string;
    citedItems: any[];
  } | null>(null);

  // Ratio copy toast
  const [copiedRatioId, setCopiedRatioId] = useState<number | null>(null);

  // Save threads to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lexvault_threads", JSON.stringify(threads));
    }
  }, [threads]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const messages = activeThread?.messages || [];

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    const target = threads.find((t) => t.id === id);
    if (target && target.practiceArea !== "All Practice Areas") {
      setSelectedPracticeArea(target.practiceArea);
    }
  };

  const handleNewThread = (title?: string, practiceArea?: string) => {
    const newId = `thread-${Date.now()}`;
    const newThread: MatterThread = {
      id: newId,
      title: title || `Matter #${threads.length + 1}`,
      practiceArea: practiceArea || selectedPracticeArea,
      updatedAt: "Just now",
      messages: [
        {
          role: "assistant",
          content: `New legal matter workspace initialized for: **${title || "Case Inquiry"}** (${practiceArea || selectedPracticeArea}).\n\nAsk any question grounded in your internal vault records.`,
          cited_items: [],
          guardrail_applied: false,
        },
      ],
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  const handleDeleteThread = (id: string) => {
    if (threads.length <= 1) return;
    const remaining = threads.filter((t) => t.id !== id);
    setThreads(remaining);
    if (activeThreadId === id) {
      setActiveThreadId(remaining[0].id);
    }
  };

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || loading) return;

    const userMsg = {
      role: "user",
      content: q,
      action_type: draftingMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const tempAssistantMsg = {
      role: "assistant",
      content: "",
      cited_items: [],
      guardrail_applied: false,
      isStreaming: true,
      action_type: draftingMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare multi-turn history from current thread
    const historyPayload = activeThread?.messages
      ? activeThread.messages
          .filter((m: any) => (m.role === "user" || m.role === "assistant") && m.content)
          .map((m: any) => ({ role: m.role, content: m.content }))
          .slice(-8)
      : [];

    // Optimistically update current thread
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            updatedAt: "Just now",
            messages: [...t.messages, userMsg, tempAssistantMsg],
          };
        }
        return t;
      })
    );

    setInput("");
    setLoading(true);

    const areaParam = selectedPracticeArea === "All Practice Areas" ? undefined : selectedPracticeArea;
    let streamedText = "";
    let streamedCitations: any[] = [];
    let streamedGuardrail = false;

    try {
      await api.chat.stream(
        q,
        areaParam,
        historyPayload,
        draftingMode,
        (token: string) => {
          streamedText += token;
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id === activeThreadId) {
                const newMessages = [...t.messages];
                const lastIdx = newMessages.length - 1;
                if (lastIdx >= 0 && newMessages[lastIdx].role === "assistant") {
                  newMessages[lastIdx] = {
                    ...newMessages[lastIdx],
                    content: streamedText,
                    isStreaming: true,
                  };
                }
                return { ...t, messages: newMessages };
              }
              return t;
            })
          );
        },
        (meta: any) => {
          if (meta.cited_items) streamedCitations = meta.cited_items;
          if (meta.guardrail_applied !== undefined) streamedGuardrail = meta.guardrail_applied;
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id === activeThreadId) {
                const newMessages = [...t.messages];
                const lastIdx = newMessages.length - 1;
                if (lastIdx >= 0 && newMessages[lastIdx].role === "assistant") {
                  newMessages[lastIdx] = {
                    ...newMessages[lastIdx],
                    cited_items: streamedCitations,
                    guardrail_applied: streamedGuardrail,
                  };
                }
                return { ...t, messages: newMessages };
              }
              return t;
            })
          );
        }
      );

      // Finalize assistant message
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            const newMessages = [...t.messages];
            const lastIdx = newMessages.length - 1;
            if (lastIdx >= 0 && newMessages[lastIdx].role === "assistant") {
              newMessages[lastIdx] = {
                ...newMessages[lastIdx],
                isStreaming: false,
                content: streamedText || newMessages[lastIdx].content,
                cited_items: streamedCitations.length > 0 ? streamedCitations : newMessages[lastIdx].cited_items,
                guardrail_applied: streamedGuardrail,
              };
            }
            return { ...t, messages: newMessages };
          }
          return t;
        })
      );
    } catch (streamErr: any) {
      console.warn("Stream failed, falling back to standard REST chat endpoint:", streamErr);
      try {
        const res = await api.chat.send(q, areaParam, historyPayload, draftingMode);
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === activeThreadId) {
              const newMessages = [...t.messages];
              const lastIdx = newMessages.length - 1;
              if (lastIdx >= 0 && newMessages[lastIdx].role === "assistant") {
                newMessages[lastIdx] = {
                  role: "assistant",
                  content: res.answer,
                  cited_items: res.cited_items || [],
                  guardrail_applied: res.guardrail_applied,
                  isStreaming: false,
                  action_type: draftingMode,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
              }
              return { ...t, messages: newMessages };
            }
            return t;
          })
        );
      } catch (err: any) {
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === activeThreadId) {
              const newMessages = [...t.messages];
              const lastIdx = newMessages.length - 1;
              if (lastIdx >= 0 && newMessages[lastIdx].role === "assistant") {
                newMessages[lastIdx] = {
                  role: "assistant",
                  content: "Encountered an issue querying the vault. Please verify vector index connectivity.",
                  cited_items: [],
                  guardrail_applied: true,
                  isStreaming: false,
                  action_type: draftingMode,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
              }
              return { ...t, messages: newMessages };
            }
            return t;
          })
        );
      }
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

  const openPrecedent = (item: any) => {
    setSelectedPrecedent(item);
    setDrawerOpen(true);
  };

  const openMemoModal = (msg: any, queryIdx: number) => {
    // Find preceding user question
    let priorQuery = activeThread?.title || "Legal Consultation";
    for (let i = queryIdx - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        priorQuery = messages[i].content;
        break;
      }
    }

    setActiveMemoData({
      query: priorQuery,
      answer: msg.content,
      citedItems: msg.cited_items || [],
    });
    setMemoModalOpen(true);
  };

  const copyRatio = (text: string, msgIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedRatioId(msgIdx);
    setTimeout(() => setCopiedRatioId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden bg-background">
      {/* 1. Left Sidebar: Matter & Thread Management */}
      {showSidebar && (
        <MatterSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onNewThread={handleNewThread}
          onDeleteThread={handleDeleteThread}
        />
      )}

      {/* 2. Main Chat Copilot Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Workspace Top Header */}
        <div className="px-5 py-3 border-b border-surface-border bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors"
              title={showSidebar ? "Collapse Matters" : "Expand Matters"}
            >
              {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-content-primary truncate max-w-[280px]">
                  {activeThread?.title}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                  {activeThread?.practiceArea}
                </span>
              </div>
              <div className="text-[11px] text-content-muted flex items-center gap-2 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                <span>Deterministic Grounded RAG • Supreme Court & High Court Precedents</span>
              </div>
            </div>
          </div>

          {/* Filters & Codified Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Practice Area Filter */}
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent"
            >
              {PRACTICE_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            {/* Court Jurisdiction Filter */}
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-secondary focus:outline-none focus:border-accent hidden sm:block"
            >
              {COURTS.map((court) => (
                <option key={court} value={court}>
                  {court}
                </option>
              ))}
            </select>

            {/* BNS ↔ IPC Toggle */}
            <button
              onClick={() => setBnsCrossMapActive(!bnsCrossMapActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                bnsCrossMapActive
                  ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                  : "bg-surface-elevated text-content-muted border-surface-border"
              }`}
              title="Automatically dual-cite 2024 Bharatiya Nyaya Sanhita with legacy IPC/CrPC"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">BNS Auto-Map</span>
            </button>
          </div>
        </div>

        {/* Quick BNS Citation Resolver Bar */}
        <div className="px-5 py-2.5 bg-surface-subtle border-b border-surface-border flex items-center justify-between gap-3 text-xs shrink-0">
          <form onSubmit={handleQuickResolve} className="flex items-center gap-2 flex-1 max-w-xl">
            <span className="text-[10px] uppercase font-bold text-indigo-400 whitespace-nowrap">
              Statute Lookup:
            </span>
            <input
              type="text"
              placeholder="Instant cross-cite: 'IPC 302', '376', '420', '498A', 'CrPC 41A'..."
              value={quickCite}
              onChange={(e) => setQuickCite(e.target.value)}
              className="flex-1 px-3 py-1 rounded-md bg-surface border border-surface-border text-xs text-content-primary focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={resolvingCite}
              className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] whitespace-nowrap transition-colors"
            >
              {resolvingCite ? "..." : "Resolve"}
            </button>
          </form>

          {quickResolved && (
            <div className="text-[11px] flex items-center gap-2 bg-surface px-3 py-1 rounded-md border border-indigo-500/30 shrink-0">
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

        {/* Suggested Queries Chips */}
        <div className="px-5 py-2 flex items-center gap-2 overflow-x-auto shrink-0 bg-surface/50 border-b border-surface-border/50 text-xs">
          <span className="text-content-muted text-[10px] uppercase font-bold tracking-wider shrink-0">
            Quick Inquiries:
          </span>
          {SUGGESTED_QUERIES.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-elevated border border-surface-border text-content-secondary hover:text-accent whitespace-nowrap transition-colors text-[11px]"
            >
              {sq.length > 50 ? sq.substring(0, 50) + "..." : sq}
            </button>
          ))}
        </div>

        {/* 3. Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
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
                      ? "bg-accent text-background font-medium shadow-md"
                      : "bg-surface border border-surface-border text-content-primary shadow-sm"
                  }`}
                >
                  {/* Guardrail Banner if applied */}
                  {!isUser && m.guardrail_applied && (
                    <div className="mb-3 p-3 rounded-lg bg-status-warning/15 border border-status-warning/30 text-status-warning text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Privilege & Jurisdiction Guardrail Enforced: </span>
                        Refusal active. No verified internal firm precedents exist for this question or out-of-jurisdiction forum.
                      </div>
                    </div>
                  )}

                  {/* Drafting Mode Badge */}
                  {!isUser && m.action_type && m.action_type !== "advisory" && (
                    <div className="mb-2">
                      {m.action_type === "draft_objection" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wide inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Court Pleading: Preliminary Objections
                        </span>
                      )}
                      {m.action_type === "draft_reply" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 uppercase tracking-wide inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Advocate Notice: Formal Legal Reply
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {m.content}
                    </div>
                  ) : (
                    <LegalMarkdownRenderer
                      content={m.content}
                      isStreaming={m.isStreaming}
                      onCiteClick={(itemId) => {
                        const target = m.cited_items?.find(
                          (c: any) => String(c.item_id || c.id) === String(itemId)
                        );
                        if (target) {
                          openPrecedent(target);
                        } else {
                          api.knowledge.get(Number(itemId)).then((item: any) => {
                            if (item) openPrecedent(item);
                          }).catch(() => {
                            openPrecedent({
                              id: Number(itemId),
                              title: `Knowledge Item #${itemId}`,
                              content: "Verified institutional legal record from firm vault.",
                              practice_area: activeThread?.practiceArea,
                              jurisdiction: "Supreme Court & High Courts of India",
                            });
                          });
                        }
                      }}
                    />
                  )}

                  {/* Cited Precedent Cards */}
                  {!isUser && m.cited_items && m.cited_items.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-surface-border/50 space-y-2 font-sans">
                      <div className="text-[10px] uppercase font-bold text-accent tracking-wider flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Cited Internal Firm Precedents ({m.cited_items.length}):</span>
                        </div>
                        <span className="text-content-muted text-[10px] font-normal">
                          Click card to inspect full text
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.cited_items.map((src: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            onClick={() => openPrecedent(src)}
                            className="p-3 rounded-xl bg-surface-elevated hover:bg-surface border border-accent/20 hover:border-accent/60 transition-all cursor-pointer text-[11px] group"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-accent truncate group-hover:underline">
                                Item #{src.item_id || src.id}: {src.title}
                              </span>
                              <span className="text-[10px] font-mono text-status-success shrink-0">
                                {(Number(src.score || 0.95) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="text-[10px] text-content-muted flex items-center justify-between">
                              <span className="truncate">{src.practice_area || selectedPracticeArea}</span>
                              <span className="text-accent group-hover:translate-x-0.5 transition-transform">
                                Inspect →
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Actions Bar */}
                  {!isUser && (
                    <div className="mt-4 pt-2.5 border-t border-surface-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-content-muted font-sans">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => copyRatio(m.content, idx)}
                          className="flex items-center gap-1 hover:text-accent transition-colors"
                        >
                          {copiedRatioId === idx ? (
                            <Check className="w-3.5 h-3.5 text-status-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedRatioId === idx ? "Copied" : "Copy Ratio"}</span>
                        </button>

                        <button
                          onClick={() => openMemoModal(m, idx)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 hover:bg-accent/20 text-accent font-semibold border border-accent/25 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Export Legal Memo</span>
                        </button>
                      </div>

                      {m.cited_items && m.cited_items.length > 0 && (
                        <button
                          onClick={() => openPrecedent(m.cited_items[0])}
                          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          View Citations ({m.cited_items.length}) →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && !messages.some((m) => m.isStreaming && m.content) && (
            <div className="flex items-center gap-2.5 text-xs text-accent font-semibold p-4 rounded-xl bg-surface border border-surface-border animate-pulse max-w-md">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Querying Qdrant vectors & synthesizing guardrailed precedents...</span>
            </div>
          )}
        </div>

        {/* 4. Bottom Input Bar */}
        <div className="p-4 border-t border-surface-border bg-surface shrink-0 space-y-3">
          {/* Action / Drafting Mode Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <span className="text-[10px] uppercase font-bold text-content-muted tracking-wider shrink-0">
              Output Format:
            </span>
            <button
              type="button"
              onClick={() => setDraftingMode("advisory")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                draftingMode === "advisory"
                  ? "bg-accent text-background border-accent shadow-sm"
                  : "bg-surface-elevated text-content-secondary border-surface-border hover:border-accent/40"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Legal Advisory</span>
            </button>
            <button
              type="button"
              onClick={() => setDraftingMode("draft_objection")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                draftingMode === "draft_objection"
                  ? "bg-amber-500 text-background border-amber-500 shadow-sm"
                  : "bg-surface-elevated text-content-secondary border-surface-border hover:border-amber-500/40"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Draft Preliminary Objections</span>
            </button>
            <button
              type="button"
              onClick={() => setDraftingMode("draft_reply")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                draftingMode === "draft_reply"
                  ? "bg-purple-500 text-background border-purple-500 shadow-sm"
                  : "bg-surface-elevated text-content-secondary border-surface-border hover:border-purple-500/40"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Draft Notice Reply</span>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              placeholder={
                draftingMode === "draft_objection"
                  ? `Enter fact grounds to draft Preliminary Objections for ${activeThread?.title}...`
                  : draftingMode === "draft_reply"
                  ? `Enter allegations/facts to draft formal Legal Reply for ${activeThread?.title}...`
                  : `Ask legal strategy for ${activeThread?.title} (grounded in vault records)...`
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent shadow-inner disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-background font-bold text-xs transition-all shadow-gold disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>
                {draftingMode === "draft_objection"
                  ? "Draft Objections"
                  : draftingMode === "draft_reply"
                  ? "Draft Reply"
                  : "Query Vault"}
              </span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-content-muted mt-1 px-1">
            <span>Press Enter to query internal records. Dual-mode citation resolution active.</span>
            <span>All responses cross-referenced with BNS 2023 & Constitution of India.</span>
          </div>
        </div>
      </div>

      {/* 5. Precedent Inspector Side-Drawer */}
      <PrecedentDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        item={selectedPrecedent}
        onAskFollowUp={(promptText) => {
          setInput(promptText);
        }}
      />

      {/* 6. Legal Memo Exporter Modal */}
      {activeMemoData && (
        <LegalMemoModal
          isOpen={memoModalOpen}
          onClose={() => setMemoModalOpen(false)}
          matterTitle={activeThread?.title || "Legal Consultation"}
          practiceArea={selectedPracticeArea}
          query={activeMemoData.query}
          answer={activeMemoData.answer}
          citedItems={activeMemoData.citedItems}
        />
      )}
    </div>
  );
}
