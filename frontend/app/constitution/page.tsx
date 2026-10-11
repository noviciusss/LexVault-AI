"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Landmark,
  Languages,
  Search,
  Sparkles,
  ArrowRight,
  Scale,
  X,
  Loader2,
  Columns2,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn, errorMessage } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { ConstitutionArticle, ConstitutionPart, ConstitutionResearch } from "@/types/domain";
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import LegalMarkdownRenderer from "@/components/assistant/LegalMarkdownRenderer";

const schema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Enter a research question with at least 3 characters.")
    .max(4000, "Keep your question under 4,000 characters."),
});
type Language = "en" | "hi" | "both";
function ConstitutionWorkspace() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAppStore((state) => state.currentUser);
  const [search, setSearch] = useState(params.get("q") || "");
  const [query, setQuery] = useState(search);
  const [part, setPart] = useState(params.get("part") || "all");
  const [language, setLanguage] = useState<Language>("en");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const selectedNumber = params.get("article") || "21";
  const [research, setResearch] = useState<ConstitutionResearch | null>(null);
  const [copied, setCopied] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { question: "" },
  });
  const storageKey = `lexvault_bookmarks_${user.firm_id}_${user.id}`;
  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    } catch {
      setSaved([]);
    }
  }, [storageKey]);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const articles = useQuery<ConstitutionArticle[]>({
    queryKey: ["constitution", "articles"],
    queryFn: () => api.constitution.listArticles(),
    staleTime: Infinity,
  });
  const parts = useQuery<ConstitutionPart[]>({
    queryKey: ["constitution", "parts"],
    queryFn: () => api.constitution.listParts(),
    staleTime: Infinity,
  });
  const active = articles.data?.find(
    (article) => article.article_number.toLowerCase() === selectedNumber.toLowerCase(),
  );
  const filtered = useMemo(
    () =>
      (articles.data || []).filter((article) => {
        const haystack = [
          article.article_number,
          article.title_en,
          article.title_hi,
          article.full_text_en,
          article.full_text_hi,
          article.landmark_cases,
          ...article.tags,
          ...article.key_doctrines,
        ]
          .join(" ")
          .toLowerCase();
        return (
          (part === "all" || article.part_id === part) &&
          (!savedOnly || saved.includes(article.article_number)) &&
          (!query || haystack.includes(query.toLowerCase().replace(/^article\s+/i, "")))
        );
      }),
    [articles.data, part, query, savedOnly, saved],
  );
  const selectArticle = (number: string) => {
    const url = new URLSearchParams();
    url.set("article", number);
    if (part !== "all") url.set("part", part);
    if (search) url.set("q", search);
    router.replace(`/constitution?${url}`, { scroll: false });
    setResearch(null);
    form.reset();
  };
  const bookmark = (number: string) => {
    const next = saved.includes(number)
      ? saved.filter((value) => value !== number)
      : [...saved, number];
    setSaved(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    toast.success(
      next.includes(number)
        ? "Article saved to your reading list"
        : "Article removed from reading list",
    );
  };
  const researchMutation = useMutation<ConstitutionResearch, Error, string>({
    mutationFn: (question) =>
      api.constitution.research(
        question,
        compare.length ? compare : [selectedNumber],
        language === "hi" ? "hi" : "en",
      ),
    onSuccess: setResearch,
    onError: (error) => toast.error(errorMessage(error)),
  });
  const copy = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(
        `${active.title_en}\n\n${language === "hi" ? active.full_text_hi : active.full_text_en}\n\nRelated case references: ${active.landmark_cases}\nSource: LexVault curated Constitution registry`,
      );
      setCopied(true);
      toast.success("Article reference copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard is unavailable. Select and copy the text instead.");
    }
  };
  const suggestions = active
    ? [
        `Explain Article ${active.article_number} and its key research themes.`,
        `What does Article ${active.article_number} say about ${active.key_doctrines[0]?.toLowerCase()}?`,
      ]
    : [];
  return (
    <Reveal className="space-y-7">
      <PageHeader
        eyebrow="The Constitution of India"
        title="Understand the article. Connect the argument."
        description="Explore constitutional provisions, English and Hindi references, and the doctrines that shape Indian law."
        action={
          <a
            href="https://legislative.gov.in/constitution-of-india/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-border px-4 py-2.5 text-sm text-content-secondary hover:text-accent"
          >
            Official Constitution <ExternalLink className="h-4 w-4" />
          </a>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            number: "14",
            title: "Equality & the rule of law",
            detail: "Non-arbitrariness · reasonable classification",
          },
          {
            number: "21",
            title: "Life, liberty & dignity",
            detail: "Privacy · fairness · human dignity",
          },
          {
            number: "32",
            title: "Constitutional remedies",
            detail: "Writs · access to constitutional justice",
          },
        ].map((item) => (
          <button
            key={item.number}
            onClick={() => {
              setPart("all");
              setSearch("");
              selectArticle(item.number);
            }}
            className={cn(
              "flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
              selectedNumber === item.number
                ? "border-accent/40 bg-accent/5"
                : "border-surface-border bg-surface hover:border-accent/30",
            )}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-serif text-lg text-accent">
              {item.number}
            </span>
            <span>
              <span className="block text-sm font-medium">{item.title}</span>
              <span className="mt-1 block text-[11px] text-content-muted">{item.detail}</span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-content-muted" />
          </button>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="overflow-hidden xl:sticky xl:top-24">
          <div className="space-y-4 border-b border-surface-border p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Article library</h2>
              <span className="text-xs text-content-muted">
                {articles.data?.length || "—"} references
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-content-muted" />
              <Input
                className="pl-9"
                aria-label="Search constitutional articles"
                placeholder="Article, doctrine, or हिन्दी…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              aria-label="Filter constitutional part"
              value={part}
              onChange={(event) => setPart(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-surface-border bg-surface-elevated px-3 text-xs"
            >
              <option value="all">All constitutional parts</option>
              {parts.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {language === "hi" ? item.name_hi : item.name_en}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              aria-pressed={savedOnly}
              className={cn(
                "flex items-center gap-2 text-xs",
                savedOnly ? "text-accent" : "text-content-secondary",
              )}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Reading list{" "}
              <span className="rounded bg-surface-elevated px-1.5">{saved.length}</span>
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-2 xl:max-h-[600px]">
            {articles.isPending ? (
              Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="m-2 h-16" />)
            ) : articles.isError ? (
              <ErrorState message={errorMessage(articles.error)} retry={() => articles.refetch()} />
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-content-muted">
                No articles match. Try a different term or clear your filters.
              </div>
            ) : (
              filtered.map((article) => (
                <button
                  key={article.article_number}
                  onClick={() => selectArticle(article.article_number)}
                  className={cn(
                    "mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors",
                    selectedNumber.toLowerCase() === article.article_number.toLowerCase()
                      ? "bg-accent/10"
                      : "hover:bg-surface-elevated",
                  )}
                >
                  <span className="mt-0.5 min-w-10 rounded-lg border border-surface-border bg-surface-elevated px-2 py-1 text-center font-mono text-xs text-accent">
                    {article.article_number === "Preamble" ? "P" : article.article_number}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-xs font-medium leading-relaxed">
                      {language === "hi"
                        ? article.title_hi
                        : article.title_en.replace(/^Article [\w]+:\s*/, "")}
                    </span>
                    <span className="mt-1 block text-[10px] text-content-muted">
                      {article.part_label}
                    </span>
                  </span>
                  {saved.includes(article.article_number) && (
                    <Bookmark className="mt-1 h-3 w-3 shrink-0 fill-accent text-accent" />
                  )}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-surface-border px-5 py-3 text-[11px] text-content-muted">
            {filtered.length} results · curated research registry
          </div>
        </Card>
        <div className="min-w-0 space-y-6">
          {articles.isPending ? (
            <Card className="space-y-5 p-7">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-40" />
              <Skeleton className="h-24" />
            </Card>
          ) : !active ? (
            <EmptyState
              title="Choose an article to start"
              description="Select a provision from the library to read its reference, explore doctrines, and conduct source-linked research."
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={active.article_number}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-5 py-4 sm:px-7">
                    <Badge>
                      <Landmark className="h-3 w-3" />
                      {active.article_number === "Preamble"
                        ? "Preamble"
                        : `Article ${active.article_number}`}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          saved.includes(active.article_number)
                            ? "Remove article bookmark"
                            : "Bookmark article"
                        }
                        onClick={() => bookmark(active.article_number)}
                      >
                        <Bookmark
                          className={cn(
                            "h-4 w-4",
                            saved.includes(active.article_number) && "fill-accent text-accent",
                          )}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Copy article reference"
                        onClick={copy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-status-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Add article to comparison"
                        onClick={() => {
                          if (compare.includes(active.article_number)) {
                            setCompare(
                              compare.filter((number) => number !== active.article_number),
                            );
                            return;
                          }
                          if (compare.length === 2) {
                            toast.info("Choose up to two articles to compare");
                            return;
                          }
                          setCompare([...compare, active.article_number]);
                          toast.success("Added to article comparison");
                        }}
                      >
                        <Columns2
                          className={cn(
                            "h-4 w-4",
                            compare.includes(active.article_number) && "text-accent",
                          )}
                        />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-6 p-5 sm:p-7">
                    <div>
                      <p className="mb-3 text-xs text-content-muted">{active.part_label}</p>
                      <h2 className="font-serif text-2xl font-semibold leading-snug sm:text-3xl">
                        {language === "hi"
                          ? active.title_hi
                          : active.title_en.replace(/^Article [\w]+:\s*/, "")}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-2 text-xs text-content-muted">
                        <BookOpen className="h-3.5 w-3.5" />
                        Reference & interpretation
                      </p>
                      <div
                        aria-label="Reading language"
                        className="flex rounded-lg border border-surface-border bg-surface-elevated p-1"
                      >
                        {(
                          [
                            { id: "en", label: "English" },
                            { id: "hi", label: "हिन्दी" },
                            { id: "both", label: "Both" },
                          ] as const
                        ).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setLanguage(item.id)}
                            aria-pressed={language === item.id}
                            className={cn(
                              "rounded-md px-3 py-1.5 text-xs transition-colors",
                              language === item.id
                                ? "bg-surface text-accent shadow-sm"
                                : "text-content-muted",
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={cn("grid gap-6", language === "both" && "lg:grid-cols-2")}>
                      {language !== "hi" && (
                        <div lang="en">
                          <p className="font-serif text-[17px] leading-[1.9] text-content-primary">
                            {active.full_text_en}
                          </p>
                        </div>
                      )}
                      {language !== "en" && (
                        <div
                          lang="hi"
                          className={cn(
                            language === "both" &&
                              "border-t border-surface-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0",
                          )}
                        >
                          <p className="text-[17px] leading-[2] text-content-primary">
                            {active.full_text_hi}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-surface-border pt-5">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-content-muted">
                        Research themes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {active.key_doctrines.map((doctrine) => (
                          <button
                            key={doctrine}
                            className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-xs hover:border-accent/40 hover:text-accent"
                            onClick={() =>
                              form.setValue(
                                "question",
                                `Explain ${doctrine} in relation to Article ${active.article_number}.`,
                              )
                            }
                          >
                            {doctrine}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-surface-elevated/70 p-4">
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Scale className="h-4 w-4 text-accent" />
                        Landmark case references
                      </h3>
                      <p className="text-sm leading-relaxed text-content-secondary">
                        {active.landmark_cases}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-content-muted">
                      <span>Curated excerpts and commentary · {active.tags.length} topic tags</span>
                      <a
                        href="https://legislative.gov.in/constitution-of-india/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent"
                      >
                        Read official text <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
          {compare.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/25 bg-accent/5 p-4">
              <Columns2 className="h-4 w-4 text-accent" />
              <span className="flex-1 text-xs">
                Compare: {compare.map((number) => `Article ${number}`).join(" & ")}
              </span>
              <Button
                variant="secondary"
                size="small"
                disabled={compare.length < 2}
                onClick={() => setCompareOpen(true)}
              >
                Open comparison
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Clear comparison"
                onClick={() => setCompare([])}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Card className="p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <span className="rounded-xl bg-accent/10 p-2.5 text-accent">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold">Research with the source beside you</h2>
                <p className="mt-1 text-xs leading-relaxed text-content-secondary">
                  Ask about the selected article{compare.length ? "s in your comparison" : ""}.
                  Answers stay linked to the curated constitutional references.
                </p>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {suggestions.map((question) => (
                <button
                  key={question}
                  onClick={() => form.setValue("question", question)}
                  className="rounded-lg border border-surface-border px-3 py-2 text-left text-xs text-content-secondary hover:border-accent/40"
                >
                  {question}
                </button>
              ))}
            </div>
            <form
              onSubmit={form.handleSubmit((data) => researchMutation.mutate(data.question))}
              className="space-y-3"
            >
              <label htmlFor="constitution-question" className="sr-only">
                Constitutional research question
              </label>
              <textarea
                id="constitution-question"
                {...form.register("question")}
                rows={3}
                placeholder="How do Articles 14, 19 and 21 relate to personal liberty?"
                className="w-full resize-y rounded-xl border border-surface-border bg-surface-elevated p-4 text-sm leading-relaxed placeholder:text-content-muted"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-content-muted">
                  {form.formState.errors.question ? (
                    <span role="alert" className="text-status-danger">
                      {form.formState.errors.question.message}
                    </span>
                  ) : (
                    "English / हिन्दी · article-grounded research"
                  )}
                </p>
                <Button type="submit" disabled={!active || researchMutation.isPending}>
                  {researchMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {researchMutation.isPending ? "Researching…" : "Research question"}
                </Button>
              </div>
            </form>
            {research && (
              <div className="mt-6 border-t border-surface-border pt-6">
                <Badge className="mb-4">
                  {research.mode === "source_extract"
                    ? "Source reference mode"
                    : "Grounded analysis"}
                </Badge>
                <LegalMarkdownRenderer content={research.answer} onArticleClick={selectArticle} />
                <div className="mt-5 flex flex-wrap gap-2">
                  {research.sources.map((source) => (
                    <button
                      key={source.article_number}
                      className="rounded-lg border border-accent/25 px-3 py-2 text-xs text-accent"
                      onClick={() => selectArticle(source.article_number)}
                    >
                      Article {source.article_number} ↗
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      <Dialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        title="Compare constitutional articles"
        description="Read the selected provisions together and connect their research themes."
        className="max-w-5xl"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {articles.data
            ?.filter((article) => compare.includes(article.article_number))
            .map((article) => (
              <div
                key={article.article_number}
                className="space-y-4 rounded-xl border border-surface-border p-5"
              >
                <Badge>Article {article.article_number}</Badge>
                <h3 className="font-serif text-xl font-semibold">
                  {language === "hi" ? article.title_hi : article.title_en}
                </h3>
                <p className="text-sm leading-loose text-content-secondary">
                  {language === "hi" ? article.full_text_hi : article.full_text_en}
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.key_doctrines.map((doctrine) => (
                    <Badge key={doctrine}>{doctrine}</Badge>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </Dialog>
    </Reveal>
  );
}
export default function ConstitutionPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ConstitutionWorkspace />
    </Suspense>
  );
}
