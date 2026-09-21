"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  Database,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  Loader2,
  Landmark,
  FileText,
  Tag,
  Scale,
  ShieldCheck,
  ChevronRight,
  Info,
  BookMarked,
  ArrowRightLeft,
  Building2,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api";

const PRACTICE_AREAS = [
  "All",
  "Constitutional Law & Fundamental Rights",
  "Criminal Law & BNS/IPC",
  "Civil Procedure (CPC)",
  "Indian Contract Act & Commercial",
  "Corporate Insolvency & IBC",
  "SEBI & Securities Law",
  "Transfer of Property & Real Estate",
  "Family Law & Personal Law",
  "Commercial Litigation & Civil",
  "Arbitration & ADR",
];

export default function KnowledgeHubPage() {
  const [activeTab, setActiveTab] = useState<"precedents" | "constitution" | "statutes">("precedents");

  // User & Firm State
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Precedents State
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  // Constitution Explorer State
  const [articles, setArticles] = useState<any[]>([]);
  const [constitutionParts, setConstitutionParts] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<string>("all");
  const [constitutionQuery, setConstitutionQuery] = useState<string>("");
  const [loadingConstitution, setLoadingConstitution] = useState(false);
  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  // Statute Library & BNS State
  const [statuteSections, setStatuteSections] = useState<any[]>([]);
  const [statuteActs, setStatuteActs] = useState<any[]>([]);
  const [selectedStatuteAct, setSelectedStatuteAct] = useState<string>("ALL");
  const [statuteQuery, setStatuteQuery] = useState<string>("");
  const [loadingStatutes, setLoadingStatutes] = useState(false);
  const [activeStatute, setActiveStatute] = useState<any | null>(null);

  // BNS / IPC Quick Resolver State
  const [bnsCiteInput, setBnsCiteInput] = useState("IPC 302");
  const [bnsResolved, setBnsResolved] = useState<any | null>(null);
  const [resolvingBns, setResolvingBns] = useState(false);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (activeItem || activeArticle || activeStatute) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeItem, activeArticle, activeStatute]);

  // Load User Info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await api.auth.getMe();
        setCurrentUser(user);
      } catch (e) {
        // Fallback or unauthenticated
      }
    };
    fetchUser();
  }, []);

  // Load Precedents
  const loadItems = async (area?: string, q?: string) => {
    setLoading(true);
    try {
      const data = await api.knowledge.list({
        practice_area: area === "All" ? undefined : area,
        q: q || undefined,
      });
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load knowledge hub items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "precedents") {
      loadItems(selectedArea, searchQuery);
    }
  }, [selectedArea, activeTab]);

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadItems(selectedArea);
      return;
    }

    setSearching(true);
    try {
      const results = await api.knowledge.semanticSearch(
        searchQuery,
        selectedArea === "All" ? undefined : selectedArea
      );
      setItems(results || []);
    } catch (err) {
      console.error("Semantic search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  // Load Constitution Data
  const loadConstitution = async () => {
    setLoadingConstitution(true);
    try {
      const [partsData, articlesData] = await Promise.all([
        api.constitution.listParts(),
        api.constitution.listArticles({
          part: selectedPart === "all" ? undefined : selectedPart,
          q: constitutionQuery || undefined,
        }),
      ]);
      setConstitutionParts(partsData || []);
      setArticles(articlesData || []);
    } catch (err) {
      console.error("Failed to load constitution data:", err);
    } finally {
      setLoadingConstitution(false);
    }
  };

  useEffect(() => {
    if (activeTab === "constitution") {
      loadConstitution();
    }
  }, [activeTab, selectedPart]);

  const handleConstitutionSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadConstitution();
  };

  // Load Statute Library Data
  const loadStatutes = async () => {
    setLoadingStatutes(true);
    try {
      const [actsData, sectionsData] = await Promise.all([
        api.statutes.listActs(),
        api.statutes.listLibrary({
          act: selectedStatuteAct === "ALL" ? undefined : selectedStatuteAct,
          q: statuteQuery || undefined,
        }),
      ]);
      setStatuteActs(actsData || []);
      setStatuteSections(sectionsData || []);
    } catch (err) {
      console.error("Failed to load statute library:", err);
    } finally {
      setLoadingStatutes(false);
    }
  };

  useEffect(() => {
    if (activeTab === "statutes") {
      loadStatutes();
      if (!bnsResolved) {
        handleBnsResolve("IPC 302");
      }
    }
  }, [activeTab, selectedStatuteAct]);

  const handleStatuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStatutes();
  };

  const handleBnsResolve = async (overrideCite?: string) => {
    const target = overrideCite || bnsCiteInput;
    if (!target.trim()) return;
    setResolvingBns(true);
    try {
      const res = await api.statutes.resolveCitation(target);
      setBnsResolved(res);
    } catch (e) {
      console.error("Failed to resolve BNS citation:", e);
    } finally {
      setResolvingBns(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Multi-Tenant Firm Indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
              Knowledge Hub
            </span>
            <span className="text-xs text-content-muted">Institutional Precedents & Indian Law</span>
          </div>
          <h1 className="text-2xl font-bold text-content-primary">
            Institutional Knowledge Vault & Legal Reference
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Peer-reviewed legal strategies, Indian Constitution articles, and BNS/BNSS/BSA codified statutes.
          </p>
        </div>

        {/* Firm Isolation Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-surface-border shadow-sm">
          <Building2 className="w-4 h-4 text-accent" />
          <div className="text-xs">
            <div className="text-content-muted text-[10px] flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-status-success" />
              <span>Multi-Tenant Vault Isolation Active</span>
            </div>
            <div className="font-semibold text-content-primary">
              {currentUser?.firm_name || (currentUser?.firm_id === 1 ? "Chandra & Rao Associates (Mumbai)" : "NyayaVault India Platform (New Delhi)")}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-elevated border border-surface-border sticky top-20 z-30 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={() => {
            setActiveTab("precedents");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "precedents"
              ? "bg-accent/20 text-accent border border-accent/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Firm Precedents (Vector & Graph Hub)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("constitution");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "constitution"
              ? "bg-status-success/20 text-status-success border border-status-success/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>🇮🇳 India Constitution Explorer</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("statutes");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "statutes"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-semibold shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>📜 Statute Library & BNS/IPC Mapper</span>
        </button>
      </div>

      {/* ---------------- TAB 1: PRECEDENTS ---------------- */}
      {activeTab === "precedents" && (
        <div className="space-y-6">
          {/* Semantic Search & Practice Filters */}
          <div className="space-y-4">
            <form onSubmit={handleSemanticSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-content-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search doctrines, BNS 64, Order 39 injunctions, Article 21 privacy, Section 27 non-compete, IBC Section 9..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold text-xs transition-all shadow-gold disabled:opacity-50"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Semantic Search</span>
              </button>
            </form>

            {/* Practice Area Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {PRACTICE_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-xs ${
                    selectedArea === area
                      ? "bg-accent/20 text-accent font-semibold border border-accent/40 shadow-sm"
                      : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-content-muted">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
              <p className="text-xs">Loading institutional precedents...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center p-8 rounded-2xl bg-surface border border-surface-border text-content-muted space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-40 text-accent" />
              <h3 className="text-sm font-semibold text-content-primary">No published precedents found</h3>
              <p className="text-xs max-w-sm mx-auto">
                No published precedents match your query for your firm. Knowledge items from other firms are strictly isolated.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-accent/50 transition-all flex flex-col justify-between space-y-4 group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 truncate max-w-[200px]">
                        {item.practice_area}
                      </span>
                      <span className="text-[10px] font-mono text-content-muted">
                        Item #{item.id}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-content-primary group-hover:text-accent transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-content-secondary line-clamp-3 leading-relaxed font-serif">
                      {item.abstracted_insight}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-surface-border text-[11px] text-content-muted">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                      <span>Partner Approved</span>
                    </div>
                    <span className="text-accent group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                      <span>View Strategy</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 2: CONSTITUTION EXPLORER ---------------- */}
      {activeTab === "constitution" && (
        <div className="space-y-6">
          {/* Search & Part Filter Controls */}
          <div className="space-y-4">
            <form onSubmit={handleConstitutionSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-content-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search articles e.g., 'Article 21', 'Right to Equality', '32', 'Preamble', 'समानता'..."
                  value={constitutionQuery}
                  onChange={(e) => setConstitutionQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-surface-border text-xs text-content-primary focus:outline-none focus:border-status-success shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-status-success hover:bg-status-success/90 text-background font-semibold text-xs transition-all shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search Articles</span>
              </button>
            </form>

            {/* Part Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedPart("all")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-xs ${
                  selectedPart === "all"
                    ? "bg-status-success/20 text-status-success font-semibold border border-status-success/40 shadow-sm"
                    : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
                }`}
              >
                All Parts
              </button>
              {constitutionParts.map((part) => (
                <button
                  key={part.id}
                  onClick={() => setSelectedPart(part.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-xs ${
                    selectedPart === part.id
                      ? "bg-status-success/20 text-status-success font-semibold border border-status-success/40 shadow-sm"
                      : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
                  }`}
                >
                  {part.name_en} ({part.name_hi})
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {loadingConstitution ? (
            <div className="py-20 flex flex-col items-center justify-center text-content-muted">
              <Loader2 className="w-8 h-8 animate-spin text-status-success mb-3" />
              <p className="text-xs">Loading Constitution of India dataset...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-20 text-center p-8 rounded-2xl bg-surface border border-surface-border text-content-muted space-y-2">
              <Landmark className="w-10 h-10 mx-auto opacity-40 text-status-success" />
              <h3 className="text-sm font-semibold text-content-primary">No Constitution articles found</h3>
              <p className="text-xs max-w-sm mx-auto">
                Try searching by article number (e.g. "21", "14", "32") or keyword ("equality", "liberty").
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((art) => (
                <div
                  key={art.article_number}
                  onClick={() => setActiveArticle(art)}
                  className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-status-success/50 transition-all flex flex-col justify-between space-y-4 group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-status-success/15 text-status-success border border-status-success/30 font-mono">
                          Art. {art.article_number}
                        </span>
                        <span className="text-[10px] text-content-muted truncate max-w-[200px]">
                          {art.part_label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                        Bilingual
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-content-primary group-hover:text-status-success transition-colors leading-snug">
                        {art.title_en}
                      </h3>
                      <h4 className="text-xs font-medium text-content-secondary mt-1 font-serif text-status-success/80">
                        {art.title_hi}
                      </h4>
                    </div>

                    <p className="text-xs text-content-secondary line-clamp-3 leading-relaxed">
                      {art.full_text_en}
                    </p>

                    {art.key_doctrines && art.key_doctrines.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {art.key_doctrines.slice(0, 3).map((d: string) => (
                          <span
                            key={d}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated border border-surface-border text-content-secondary"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-surface-border text-[11px] text-content-muted">
                    <span className="text-[10px] truncate max-w-[260px] italic">
                      {art.landmark_cases}
                    </span>
                    <span className="text-status-success group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium whitespace-nowrap">
                      <span>Full Text</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 3: STATUTE LIBRARY & BNS MAPPER ---------------- */}
      {activeTab === "statutes" && (
        <div className="space-y-6">
          {/* Live BNS <-> IPC Resolver Tool */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-surface to-surface border border-indigo-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-content-primary">
                Live BNS / BNSS / BSA Criminal Code Cross-Reference Tool
              </h3>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                1 July 2024 Legal Transition
              </span>
            </div>
            <p className="text-xs text-content-secondary">
              Type any legacy IPC, CrPC, or Evidence section (e.g. <b>IPC 302</b>, <b>376</b>, <b>420</b>, <b>498A</b>, <b>CrPC 41A</b>, <b>65B</b>) or descriptive keywords to resolve the new 2024 codified section:
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px] relative">
                <input
                  type="text"
                  placeholder="e.g., IPC 302, 376, 420, 498A, CrPC 41A, 65B, murder, hit and run..."
                  value={bnsCiteInput}
                  onChange={(e) => setBnsCiteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBnsResolve();
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-content-primary focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => handleBnsResolve()}
                disabled={resolvingBns}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-all"
              >
                {resolvingBns ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                <span>Resolve Citation</span>
              </button>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                {["IPC 302", "IPC 376", "IPC 498A", "IPC 420", "CrPC 41A", "65B"].map((cite) => (
                  <button
                    key={cite}
                    type="button"
                    onClick={() => {
                      setBnsCiteInput(cite);
                      handleBnsResolve(cite);
                    }}
                    className="px-2 py-1 rounded bg-surface border border-surface-border text-[11px] font-mono text-content-secondary hover:text-indigo-400 hover:border-indigo-500/40"
                  >
                    {cite}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolved Result Card */}
            {bnsResolved && (
              <div className="mt-3 p-4 rounded-xl bg-surface-elevated border border-indigo-500/30 text-xs space-y-2 animate-fade-in">
                {bnsResolved.matched ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-400 bg-indigo-500/15 px-2.5 py-1 rounded-md border border-indigo-500/30 font-mono text-xs">
                          {bnsResolved.target_act} Section {bnsResolved.target_section}
                        </span>
                        <span className="text-content-muted text-[11px]">
                          replaces legacy {bnsResolved.source_act} Section {bnsResolved.source_section}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-success/15 text-status-success border border-status-success/20">
                        {bnsResolved.details?.bailable === false ? "Non-Bailable" : "Bailable"} | {bnsResolved.details?.cognizable ? "Cognizable" : "Non-Cognizable"}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-content-primary text-sm">
                        {bnsResolved.details?.title_en}
                      </h4>
                      <h5 className="font-medium text-indigo-400 text-xs font-serif mt-0.5">
                        {bnsResolved.details?.title_hi}
                      </h5>
                    </div>

                    <p className="text-content-secondary leading-relaxed">
                      {bnsResolved.details?.description_en}
                    </p>
                    <p className="text-content-secondary/80 font-serif leading-relaxed text-[11px]">
                      {bnsResolved.details?.description_hi}
                    </p>
                  </div>
                ) : (
                  <div className="text-status-warning text-xs">
                    {bnsResolved.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statute Library Filters */}
          <div className="space-y-4">
            <form onSubmit={handleStatuteSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-content-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search statutes e.g. 'Order 39', 'Section 27 non-compete', 'Section 9 IBC', 'Specific Performance', 'Frustration'..."
                  value={statuteQuery}
                  onChange={(e) => setStatuteQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-surface-border text-xs text-content-primary focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search Statutes</span>
              </button>
            </form>

            {/* Act Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedStatuteAct("ALL")}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-xs ${
                  selectedStatuteAct === "ALL"
                    ? "bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/40 shadow-sm"
                    : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
                }`}
              >
                All Acts
              </button>
              {statuteActs.map((act) => (
                <button
                  key={act.code}
                  onClick={() => setSelectedStatuteAct(act.code)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-xs ${
                    selectedStatuteAct === act.code
                      ? "bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/40 shadow-sm"
                      : "bg-surface-elevated text-content-secondary hover:text-content-primary border border-surface-border"
                  }`}
                >
                  {act.code} ({act.name_hi})
                </button>
              ))}
            </div>
          </div>

          {/* Statute Sections Grid */}
          {loadingStatutes ? (
            <div className="py-20 flex flex-col items-center justify-center text-content-muted">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
              <p className="text-xs">Loading codified statute library...</p>
            </div>
          ) : statuteSections.length === 0 ? (
            <div className="py-20 text-center p-8 rounded-2xl bg-surface border border-surface-border text-content-muted space-y-2">
              <BookMarked className="w-10 h-10 mx-auto opacity-40 text-indigo-400" />
              <h3 className="text-sm font-semibold text-content-primary">No statute provisions found</h3>
              <p className="text-xs max-w-sm mx-auto">
                Try switching the act filter or searching for section numbers like "Order 39", "Section 54", or "Section 9".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {statuteSections.map((sec, idx) => (
                <div
                  key={`${sec.act_code}-${sec.section}-${idx}`}
                  onClick={() => setActiveStatute(sec)}
                  className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 group cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-mono">
                          {sec.act_code}
                        </span>
                        <span className="text-xs font-bold text-content-primary">
                          {sec.section}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-content-muted">
                        Codified
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-content-primary group-hover:text-indigo-400 transition-colors leading-snug">
                        {sec.title_en}
                      </h3>
                      <h4 className="text-xs font-medium text-content-secondary mt-1 font-serif text-indigo-400/80">
                        {sec.title_hi}
                      </h4>
                    </div>

                    <p className="text-xs text-content-secondary line-clamp-3 leading-relaxed">
                      {sec.text_en}
                    </p>

                    {sec.tags && sec.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sec.tags.slice(0, 3).map((t: string) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated border border-surface-border text-content-secondary"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-surface-border text-[11px] text-content-muted">
                    <span className="text-[10px] truncate max-w-[260px] italic">
                      {sec.landmark_cases}
                    </span>
                    <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium whitespace-nowrap">
                      <span>Full Section</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Precedent Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start pt-8 sm:pt-14">
          <div className="w-full max-w-2xl bg-surface border border-surface-border rounded-2xl p-6 space-y-5 shadow-2xl relative mb-12 animate-fade-in">
            <div className="flex items-start justify-between gap-4 border-b border-surface-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
                  {activeItem.practice_area}
                </span>
                <h2 className="text-lg font-bold text-content-primary mt-2">{activeItem.title}</h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-content-muted hover:text-content-primary text-xs font-semibold px-2 py-1 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">
                Full Institutional Legal Strategy
              </h4>
              <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border text-xs text-content-primary leading-relaxed whitespace-pre-wrap font-serif">
                {activeItem.abstracted_insight}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-content-muted pt-2 border-t border-surface-border">
              <div>Vector Status: Indexed in Qdrant (Firm #{activeItem.firm_id})</div>
              <div className="text-right">Knowledge Graph: Ingested in Neo4j</div>
            </div>
          </div>
        </div>
      )}

      {/* Constitution Article Bilingual Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start pt-8 sm:pt-14">
          <div className="w-full max-w-3xl bg-surface border border-surface-border rounded-2xl p-6 space-y-5 shadow-2xl relative mb-12 animate-fade-in">
            <div className="flex items-start justify-between gap-4 border-b border-surface-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-status-success/15 text-status-success border border-status-success/30 font-mono">
                    Article {activeArticle.article_number}
                  </span>
                  <span className="text-xs text-content-muted">
                    {activeArticle.part_label}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-content-primary mt-2">
                  {activeArticle.title_en}
                </h2>
                <h3 className="text-sm font-semibold text-status-success mt-0.5 font-serif">
                  {activeArticle.title_hi}
                </h3>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="text-content-muted hover:text-content-primary text-xs font-semibold px-2 py-1 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-xl bg-surface-elevated border border-surface-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">English Text</span>
                <p className="text-xs text-content-primary leading-relaxed whitespace-pre-wrap">
                  {activeArticle.full_text_en}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-surface-elevated border border-surface-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-status-success">हिन्दी पाठ (Devanagari)</span>
                <p className="text-xs text-content-primary font-serif leading-relaxed whitespace-pre-wrap">
                  {activeArticle.full_text_hi}
                </p>
              </div>
            </div>

            {activeArticle.landmark_cases && (
              <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-xs">
                <span className="font-semibold text-accent">Landmark Precedents: </span>
                <span className="text-content-secondary italic">{activeArticle.landmark_cases}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statute Section Detail Modal */}
      {activeStatute && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start pt-8 sm:pt-14">
          <div className="w-full max-w-3xl bg-surface border border-surface-border rounded-2xl p-6 space-y-5 shadow-2xl relative mb-12 animate-fade-in">
            <div className="flex items-start justify-between gap-4 border-b border-surface-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-mono">
                    {activeStatute.act_name}
                  </span>
                  <span className="text-xs font-bold text-content-primary font-mono">
                    {activeStatute.section}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-content-primary mt-2">
                  {activeStatute.title_en}
                </h2>
                <h3 className="text-sm font-semibold text-indigo-400 mt-0.5 font-serif">
                  {activeStatute.title_hi}
                </h3>
              </div>
              <button
                onClick={() => setActiveStatute(null)}
                className="text-content-muted hover:text-content-primary text-xs font-semibold px-2 py-1 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-xl bg-surface-elevated border border-surface-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">English Statutory Text</span>
                <p className="text-xs text-content-primary leading-relaxed whitespace-pre-wrap">
                  {activeStatute.text_en}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-surface-elevated border border-surface-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">हिन्दी पाठ (Devanagari)</span>
                <p className="text-xs text-content-primary font-serif leading-relaxed whitespace-pre-wrap">
                  {activeStatute.text_hi}
                </p>
              </div>
            </div>

            {activeStatute.landmark_cases && (
              <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-xs">
                <span className="font-semibold text-indigo-400">Landmark Precedents: </span>
                <span className="text-content-secondary italic">{activeStatute.landmark_cases}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
