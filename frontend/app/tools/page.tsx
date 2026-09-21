"use client";

import React, { useState, useEffect } from "react";
import {
  Calculator,
  AlertTriangle,
  FileText,
  HelpCircle,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  Lock,
  Loader2,
  ChevronRight,
  Gavel,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function LitigationToolsPage() {
  const [activeTab, setActiveTab] = useState<"limitation" | "conflict" | "judgment" | "quiz" | "hearings">("limitation");

  // Limitation Calculator State
  const [limitationTypes, setLimitationTypes] = useState<any[]>([]);
  const [selectedCaseType, setSelectedCaseType] = useState<string>("specific_performance");
  const [triggerDate, setTriggerDate] = useState<string>("2024-01-15");
  const [limitationResult, setLimitationResult] = useState<any | null>(null);
  const [calculatingLimit, setCalculatingLimit] = useState<boolean>(false);

  // Conflict Checker State
  const [conflictQuery, setConflictQuery] = useState<string>("");
  const [conflictResult, setConflictResult] = useState<any | null>(null);
  const [checkingConflict, setCheckingConflict] = useState<boolean>(false);

  // Judgment Summarizer State
  const [judgmentText, setJudgmentText] = useState<string>(
    `CIVIL APPELLATE JURISDICTION
Special Leave Petition (Civil) No. 12948 of 2020
Dahiben ... Appellant(s) versus Arvindbhai Kalyanji Bhanusali ... Respondent(s)
JUDGMENT:
The present appeal arises out of an application filed by the Defendants under Order VII Rule 11 of the Code of Civil Procedure, 1908 praying for rejection of the Plaint on the ground that the suit is barred by limitation and does not disclose a cause of action.
The plaintiff executed a registered sale deed dated 02.07.2009 for agricultural land. The consideration was paid via 36 cheques. The suit was instituted on 15.12.2014 claiming that the cheques were never encashed and praying for cancellation of the sale deed.
HELD:
1. Under Order VII Rule 11(a) and (d), the court must look only at the averments in the plaint.
2. The period of limitation for setting aside a sale deed under Article 58 or 59 of the Limitation Act is three years from the date when the cause of action first accrues.
3. The suit filed more than 5 years after registration is manifestly barred by limitation. Clever drafting attempting to create an illusory cause of action must be nipped in the bud. The plaint is rejected.`
  );
  const [judgmentCaseTitle, setJudgmentCaseTitle] = useState<string>("Dahiben v. Arvindbhai Kalyanji Bhanusali (2020)");
  const [judgmentCourt, setJudgmentCourt] = useState<string>("Supreme Court of India");
  const [judgmentSummary, setJudgmentSummary] = useState<any | null>(null);
  const [summarizing, setSummarizing] = useState<boolean>(false);

  // Intern Quiz State
  const [quizData, setQuizData] = useState<any | null>(null);
  const [quizRevealed, setQuizRevealed] = useState<boolean>(false);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);

  // Hearing Tracker State (localStorage backed)
  const [hearings, setHearings] = useState<any[]>([]);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCourt, setNewCourt] = useState("Delhi High Court");
  const [newDate, setNewDate] = useState("2026-10-15");
  const [newNote, setNewNote] = useState("Arguments on interim stay application");

  // Load limitation types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await api.tools.getLimitationTypes();
        setLimitationTypes(types || []);
        if (types && types.length > 0) {
          setSelectedCaseType(types[0].case_type);
        }
      } catch (e) {
        console.error("Failed to load limitation types:", e);
      }
    };
    fetchTypes();

    // Load hearings from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lexvault_hearings");
      if (saved) {
        try {
          setHearings(JSON.parse(saved));
        } catch (e) {}
      } else {
        const defaultHearings = [
          { id: 1, title: "Cipla v. Sun Health (Trademark Injunction)", court: "Delhi High Court (Bench 4)", date: "2026-10-05", note: "Hearing on Order 39 interim injunction" },
          { id: 2, title: "Kalpataru v. Metalfab (Section 9 CIRP)", court: "NCLT Mumbai Bench 1", date: "2026-10-18", note: "Arguments on Pre-Existing Dispute under Mobilox" },
          { id: 3, title: "State of Maharashtra v. Sawant (BNS 64 Trial)", court: "Sessions Court Thane", date: "2026-11-02", note: "Cross-examination of IO on BSA 61 digital chats" },
        ];
        setHearings(defaultHearings);
        localStorage.setItem("lexvault_hearings", JSON.stringify(defaultHearings));
      }
    }
  }, []);

  const handleCalculateLimitation = async () => {
    setCalculatingLimit(true);
    try {
      const res = await api.tools.calculateLimitation(selectedCaseType, triggerDate);
      setLimitationResult(res);
    } catch (e) {
      console.error("Limitation calculation failed:", e);
    } finally {
      setCalculatingLimit(false);
    }
  };

  const handleConflictCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conflictQuery.trim()) return;
    setCheckingConflict(true);
    try {
      const res = await api.tools.checkConflicts(conflictQuery);
      setConflictResult(res);
    } catch (e) {
      console.error("Conflict check failed:", e);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleSummarizeJudgment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgmentText.trim()) return;
    setSummarizing(true);
    try {
      const res = await api.tools.summarizeJudgment({
        raw_judgment: judgmentText,
        case_title: judgmentCaseTitle,
        court: judgmentCourt,
      });
      setJudgmentSummary(res);
    } catch (e) {
      console.error("Judgment summarization failed:", e);
    } finally {
      setSummarizing(false);
    }
  };

  const loadQuizQuestion = async () => {
    setLoadingQuiz(true);
    setQuizRevealed(false);
    try {
      const res = await api.tools.getQuiz();
      setQuizData(res);
    } catch (e) {
      console.error("Quiz load failed:", e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAddHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;
    const item = {
      id: Date.now(),
      title: newCaseTitle,
      court: newCourt,
      date: newDate,
      note: newNote,
    };
    const updated = [...hearings, item];
    setHearings(updated);
    localStorage.setItem("lexvault_hearings", JSON.stringify(updated));
    setNewCaseTitle("");
    setNewNote("");
  };

  const handleDeleteHearing = (id: number) => {
    const updated = hearings.filter((h) => h.id !== id);
    setHearings(updated);
    localStorage.setItem("lexvault_hearings", JSON.stringify(updated));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
            Indian Litigation Utilities
          </span>
          <span className="text-xs text-content-muted">Bar Council Compliant Practice Tools</span>
        </div>
        <h1 className="text-2xl font-bold text-content-primary">
          Litigation Suite & Practice Management Tools
        </h1>
        <p className="text-xs text-content-secondary mt-1">
          Statutory limitation calculator, multi-tenant conflict of interest check, AI judgment briefing, associate quiz, and court hearing tracker.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-elevated border border-surface-border overflow-x-auto sticky top-20 z-30 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={() => {
            setActiveTab("limitation");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "limitation"
              ? "bg-accent/20 text-accent border border-accent/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Limitation Calculator</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("conflict");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "conflict"
              ? "bg-status-warning/20 text-status-warning border border-status-warning/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Conflict Checker</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("judgment");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "judgment"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Judgment Summarizer</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("quiz");
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (!quizData) loadQuizQuestion();
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "quiz"
              ? "bg-status-success/20 text-status-success border border-status-success/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Associate Quiz Mode</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("hearings");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "hearings"
              ? "bg-accent/20 text-accent border border-accent/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Hearing Tracker</span>
        </button>
      </div>

      {/* ---------------- 1. LIMITATION CALCULATOR ---------------- */}
      {activeTab === "limitation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-6 rounded-2xl bg-surface border border-surface-border space-y-5">
            <div>
              <h2 className="text-sm font-bold text-content-primary">Indian Limitation Act, 1963 Calculator</h2>
              <p className="text-xs text-content-secondary mt-1">
                Computes statutory deadlines under the Limitation Act Schedule & special statutes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1.5">
                  Matter / Action Category
                </label>
                <select
                  value={selectedCaseType}
                  onChange={(e) => setSelectedCaseType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent"
                >
                  {limitationTypes.map((t) => (
                    <option key={t.case_type} value={t.case_type}>
                      {t.label} ({t.governing_article})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1.5">
                  Cause of Action / Refusal / Trigger Date
                </label>
                <input
                  type="date"
                  value={triggerDate}
                  onChange={(e) => setTriggerDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleCalculateLimitation}
                disabled={calculatingLimit}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold text-xs transition-all shadow-gold flex items-center justify-center gap-2"
              >
                {calculatingLimit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                <span>Calculate Deadline</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-surface-border space-y-5">
            <h2 className="text-sm font-bold text-content-primary">Statutory Computation Output</h2>
            {limitationResult ? (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
                    <span className="text-[10px] uppercase font-bold text-content-muted">Statutory Deadline</span>
                    <div className="text-lg font-bold text-accent font-mono mt-1">
                      {limitationResult.computed_deadline}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
                    <span className="text-[10px] uppercase font-bold text-content-muted">Days Remaining</span>
                    <div className={`text-lg font-bold font-mono mt-1 ${
                      limitationResult.days_remaining < 0
                        ? "text-status-error"
                        : limitationResult.days_remaining < 30
                        ? "text-status-warning"
                        : "text-status-success"
                    }`}>
                      {limitationResult.days_remaining < 0
                        ? `${Math.abs(limitationResult.days_remaining)} days elapsed`
                        : `${limitationResult.days_remaining} days`}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
                    <span className="text-[10px] uppercase font-bold text-content-muted">Status</span>
                    <div className={`text-xs font-bold mt-2 ${
                      limitationResult.days_remaining < 0
                        ? "text-status-error"
                        : "text-status-success"
                    }`}>
                      {limitationResult.status}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-surface-border pb-2">
                    <span className="text-content-muted">Governing Statute & Article:</span>
                    <span className="font-bold text-content-primary font-mono">
                      {limitationResult.act} — {limitationResult.governing_article}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-accent">Trigger Rule: </span>
                    <span className="text-content-secondary">{limitationResult.legal_notes}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-status-warning">Section 5 Condonation of Delay Note: </span>
                    <span className="text-content-secondary">{limitationResult.section_5_guidance}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-content-muted">
                <Clock className="w-10 h-10 mx-auto opacity-40 text-accent mb-2" />
                <p className="text-xs">Select matter category, enter cause of action date, and click Calculate.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 2. CONFLICT CHECKER ---------------- */}
      {activeTab === "conflict" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-content-primary">Client & Adversary Conflict Checker</h2>
                <p className="text-xs text-content-secondary mt-1">
                  Scans all matter files and knowledge entries in your firm vault before issuing a Vakalatnama.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/15 text-status-success text-[11px] font-semibold border border-status-success/30">
                <Lock className="w-3 h-3" />
                <span>Strict Firm Isolation</span>
              </div>
            </div>

            <form onSubmit={handleConflictCheck} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter client name, opposing party, director, or corporate entity (e.g. 'Kalpataru', 'Sachin Gupta', 'Cipla')..."
                value={conflictQuery}
                onChange={(e) => setConflictQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-status-warning"
              />
              <button
                type="submit"
                disabled={checkingConflict}
                className="px-6 py-3 rounded-xl bg-status-warning hover:bg-status-warning/90 text-background font-semibold text-xs transition-all shadow-sm flex items-center gap-2"
              >
                {checkingConflict ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Check Conflicts</span>
              </button>
            </form>

            {conflictResult && (
              <div className="mt-4 p-5 rounded-xl bg-surface-elevated border border-surface-border space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-md ${
                    conflictResult.has_potential_conflict
                      ? "bg-status-error/15 text-status-error border border-status-error/30"
                      : "bg-status-success/15 text-status-success border border-status-success/30"
                  }`}>
                    {conflictResult.has_potential_conflict ? "⚠️ Potential Conflict Detected" : "✅ No Conflicts Found"}
                  </span>
                  <span className="text-[11px] text-content-muted">
                    Found {conflictResult.conflict_count} prior matches in firm records
                  </span>
                </div>

                <p className="text-xs text-content-secondary">
                  {conflictResult.recommendation}
                </p>

                {conflictResult.matches && conflictResult.matches.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-surface-border">
                    <span className="text-[11px] font-semibold text-content-muted uppercase">Prior Firm Matters:</span>
                    {conflictResult.matches.map((m: any) => (
                      <div key={m.item_id} className="p-3 rounded-lg bg-surface border border-surface-border text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-content-primary">
                          <span>{m.title}</span>
                          <span className="text-[10px] text-accent font-mono">Item #{m.item_id}</span>
                        </div>
                        <div className="text-content-secondary text-[11px]">{m.match_snippet}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 3. JUDGMENT SUMMARIZER ---------------- */}
      {activeTab === "judgment" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <div>
              <h2 className="text-sm font-bold text-content-primary">Raw Judgment & Order Input</h2>
              <p className="text-xs text-content-secondary mt-1">
                Paste Supreme Court, High Court, or NCLT judgment text for structured ratio extraction.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-content-secondary mb-1">Matter Reference / Title</label>
                <input
                  type="text"
                  value={judgmentCaseTitle}
                  onChange={(e) => setJudgmentCaseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-content-secondary mb-1">Forum / Court</label>
                <input
                  type="text"
                  value={judgmentCourt}
                  onChange={(e) => setJudgmentCourt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-secondary mb-1">Judgment Excerpt</label>
              <textarea
                rows={12}
                value={judgmentText}
                onChange={(e) => setJudgmentText(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-elevated border border-surface-border text-xs text-content-primary font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleSummarizeJudgment}
              disabled={summarizing}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {summarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
              <span>Generate Structured Legal Brief</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <h2 className="text-sm font-bold text-content-primary">Structured AI Legal Digest</h2>
            {judgmentSummary ? (
              <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border text-xs text-content-primary leading-relaxed whitespace-pre-wrap font-serif animate-fade-in max-h-[600px] overflow-y-auto">
                {judgmentSummary.structured_summary}
              </div>
            ) : (
              <div className="py-24 text-center text-content-muted">
                <FileText className="w-10 h-10 mx-auto opacity-40 text-indigo-400 mb-2" />
                <p className="text-xs">Click Generate to run AI ratio extraction on the judgment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 4. INTERN QUIZ MODE ---------------- */}
      {activeTab === "quiz" && (
        <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-surface border border-surface-border space-y-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <div>
              <h2 className="text-base font-bold text-content-primary">Junior Associate Precedent Quiz</h2>
              <p className="text-xs text-content-secondary mt-1">
                Blind test yourself on your firm's institutional strategies and landmark doctrines.
              </p>
            </div>
            <button
              type="button"
              onClick={loadQuizQuestion}
              disabled={loadingQuiz}
              className="px-4 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary hover:text-accent flex items-center gap-1.5 font-semibold transition-all"
            >
              {loadingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-accent" />}
              <span>Next Question</span>
            </button>
          </div>

          {quizData ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
                  {quizData.practice_area}
                </span>
                <span className="text-xs text-content-muted">{quizData.hint}</span>
              </div>

              <div className="p-5 rounded-xl bg-surface-elevated border border-surface-border space-y-3">
                <h3 className="text-xs font-semibold text-content-muted uppercase">Prompt:</h3>
                <p className="text-sm font-medium text-content-primary leading-relaxed font-serif">
                  {quizData.prompt}
                </p>
              </div>

              {!quizRevealed ? (
                <button
                  type="button"
                  onClick={() => setQuizRevealed(true)}
                  className="w-full py-3 rounded-xl bg-status-success hover:bg-status-success/90 text-background font-semibold text-xs transition-all shadow-sm"
                >
                  Reveal Institutional Precedent & Strategy
                </button>
              ) : (
                <div className="p-5 rounded-xl bg-status-success/10 border border-status-success/30 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-status-success font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Answer Precedent:</span>
                  </div>
                  <h4 className="text-sm font-bold text-content-primary">{quizData.answer}</h4>
                  <p className="text-xs text-content-secondary leading-relaxed whitespace-pre-wrap font-serif">
                    {quizData.full_insight}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-content-muted">
              <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-2" />
              <p className="text-xs">Loading precedent question...</p>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 5. HEARING TRACKER ---------------- */}
      {activeTab === "hearings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <h2 className="text-sm font-bold text-content-primary">Log Court Hearing Date</h2>
            <form onSubmit={handleAddHearing} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-content-secondary mb-1">Case / Matter Title</label>
                <input
                  type="text"
                  placeholder="e.g., Godrej Real Estate v. Landowners"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-content-secondary mb-1">Forum / Court / Bench</label>
                <input
                  type="text"
                  placeholder="e.g., Bombay High Court (Commercial Division)"
                  value={newCourt}
                  onChange={(e) => setNewCourt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-content-secondary mb-1">Hearing Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-content-secondary mb-1">Listing Stage / Notes</label>
                <input
                  type="text"
                  placeholder="e.g., Admission / Interim stay arguments"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold text-xs transition-all shadow-gold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Hearing</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-content-primary">Scheduled Court Appearances</h2>
              <span className="text-[11px] text-content-muted">{hearings.length} listings</span>
            </div>

            <div className="space-y-3">
              {hearings.map((h) => (
                <div
                  key={h.id}
                  className="p-4 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-content-primary text-xs">{h.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
                        {h.court}
                      </span>
                    </div>
                    <div className="text-[11px] text-content-secondary">{h.note}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-content-primary">{h.date}</div>
                      <div className="text-[10px] text-content-muted">Hearing</div>
                    </div>
                    <button
                      onClick={() => handleDeleteHearing(h.id)}
                      className="text-content-muted hover:text-status-error p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
