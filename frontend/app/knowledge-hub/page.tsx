"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Search,
  Landmark,
  Sparkles,
  LayoutGrid,
  List,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { errorMessage, cn } from "@/lib/utils";
import type { KnowledgeItem } from "@/types/domain";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import LegalMarkdownRenderer from "@/components/assistant/LegalMarkdownRenderer";
import StatuteLibrary from "@/components/research/StatuteLibrary";

function KnowledgeWorkspace() {
  const user = useAppStore((state) => state.currentUser);
  const params = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(params.get("q") || "");
  const [debounced, setDebounced] = useState(search);
  const [area, setArea] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [semantic, setSemantic] = useState<KnowledgeItem[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState(params.get("tab") === "statutes" ? "statutes" : "precedents");
  const [active, setActive] = useState<KnowledgeItem | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setSemantic(null);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  const query = useQuery<KnowledgeItem[]>({
    queryKey: ["knowledge", user.firm_id, debounced, area],
    queryFn: () =>
      api.knowledge.list({ q: debounced, practice_area: area === "All" ? undefined : area }),
    enabled: tab === "precedents",
  });
  const all = useQuery<KnowledgeItem[]>({
    queryKey: ["knowledge", user.firm_id],
    queryFn: () => api.knowledge.list(),
  });
  const requestedId = params.get("id");
  const detail = useQuery<KnowledgeItem>({
    queryKey: ["knowledge-detail", user.firm_id, requestedId],
    queryFn: () => api.knowledge.get(requestedId!),
    enabled: !!requestedId,
  });
  useEffect(() => {
    if (detail.data) setActive(detail.data);
  }, [detail.data]);
  const areas = Array.from(new Set(all.data?.map((item) => item.practice_area) || []));
  const items = semantic || query.data || [];
  const semanticSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const result = await api.knowledge.semanticSearch(search, area === "All" ? undefined : area);
      setSemantic(result.map((item: KnowledgeItem) => ({ ...item, id: item.id || item.item_id })));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSearching(false);
    }
  };
  return (
    <Reveal className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Reviewed institutional knowledge"
        title="Find the reasoning your firm can reuse."
        description="Browse partner-reviewed strategies and statutory references. Constitutional research has its own focused workspace."
        action={
          <Link
            href="/constitution"
            className="inline-flex items-center gap-2 rounded-xl border border-accent/30 px-4 py-2.5 text-sm text-accent"
          >
            <Landmark className="h-4 w-4" />
            Constitution of India
          </Link>
        }
      />
      <div className="flex gap-2 border-b border-surface-border pb-3">
        {[
          { id: "precedents", label: "Firm precedents" },
          { id: "statutes", label: "Statutes & code mapper" },
        ].map((item) => (
          <button
            key={item.id}
            aria-pressed={tab === item.id}
            onClick={() => {
              setTab(item.id);
              router.replace(`/knowledge-hub?tab=${item.id}`, { scroll: false });
            }}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm",
              tab === item.id ? "bg-accent/10 text-accent" : "text-content-secondary",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "statutes" ? (
        <StatuteLibrary />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-content-muted" />
              <Input
                aria-label="Search published knowledge"
                className="pl-9"
                placeholder="Search constitutional reasoning, doctrines, or matters…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button disabled={searching || !search.trim()} onClick={semanticSearch}>
              <Sparkles className="h-4 w-4" />
              {searching ? "Searching…" : "Semantic search"}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              aria-label="Filter practice area"
              className="min-h-10 max-w-full rounded-xl border border-surface-border bg-surface px-3 text-xs"
              value={area}
              onChange={(event) => {
                setArea(event.target.value);
                setSemantic(null);
              }}
            >
              <option value="All">All practice areas</option>
              {areas.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="mr-2 text-xs text-content-muted">
                {items.length} results{semantic && " · semantic matches"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="List view"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {query.isError ? (
            <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />
          ) : query.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((key) => (
                <Skeleton key={key} className="h-60" />
              ))}
            </div>
          ) : !items.length ? (
            <EmptyState
              title="No published insights match"
              description="Try a broader search or publish a reviewed insight through the capture pipeline."
            />
          ) : (
            <div className={cn("grid gap-4", view === "grid" && "sm:grid-cols-2 lg:grid-cols-3")}>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item)}
                  className="group rounded-2xl border border-surface-border bg-surface p-5 text-left transition-colors hover:border-accent/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="max-w-[80%] truncate">{item.practice_area}</Badge>
                    <span className="text-[10px] text-content-muted">#{item.id}</span>
                  </div>
                  <h2 className="mb-3 mt-4 text-base font-semibold leading-snug group-hover:text-accent">
                    {item.title}
                  </h2>
                  <p className="line-clamp-3 text-sm leading-relaxed text-content-secondary">
                    {item.abstracted_insight}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-surface-border pt-3 text-xs">
                    <span className="flex items-center gap-1.5 text-content-muted">
                      <ShieldCheck className="h-3.5 w-3.5 text-status-success" />
                      Partner reviewed
                    </span>
                    <span className="text-accent">Read insight ↗</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {detail.isError && <ErrorState message={errorMessage(detail.error)} />}
      <Drawer
        open={!!active}
        onOpenChange={(open) => {
          if (!open) {
            setActive(null);
            if (requestedId) router.replace("/knowledge-hub", { scroll: false });
          }
        }}
        title={active?.title || "Knowledge insight"}
      >
        {active && (
          <div className="space-y-5">
            <Badge>{active.practice_area}</Badge>
            <LegalMarkdownRenderer
              content={
                active.abstracted_insight || "No strategy text is available for this source."
              }
            />
            <Link href="/assistant" className="inline-flex items-center gap-2 text-sm text-accent">
              Continue in research assistant <ArrowUpRight className="h-4 w-4" />
            </Link>
            <p className="border-t border-surface-border pt-4 text-xs text-content-muted">
              Firm source #{active.id} · reviewed institutional record
            </p>
          </div>
        )}
      </Drawer>
    </Reveal>
  );
}
export default function KnowledgeHubPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <KnowledgeWorkspace />
    </Suspense>
  );
}
