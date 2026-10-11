"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  Copy,
  FileText,
  Landmark,
  Loader2,
  MessageSquare,
  PanelLeft,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { cn, errorMessage } from "@/lib/utils";
import type {
  ConstitutionArticle,
  ConstitutionResearch,
  KnowledgeItem,
  ResearchMessage,
} from "@/types/domain";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Drawer,
  ErrorState,
  Input,
  Skeleton,
} from "@/components/ui/primitives";
import LegalMarkdownRenderer from "@/components/assistant/LegalMarkdownRenderer";
import PrecedentDrawer from "@/components/assistant/PrecedentDrawer";
import LegalMemoModal from "@/components/assistant/LegalMemoModal";

interface Thread {
  id: string;
  title: string;
  practiceArea: string;
  updatedAt: string;
  messages: ResearchMessage[];
}
const questions = [
  "How do Articles 14, 19 and 21 protect personal liberty?",
  "What is the difference between Articles 32 and 226?",
  "Explain Article 368 and the basic structure doctrine.",
  "अनुच्छेद २१ में निजता के अधिकार का क्या महत्व है?",
];
export default function AssistantPage() {
  const user = useAppStore((state) => state.currentUser);
  const query = useQuery<Thread[]>({
    queryKey: ["threads", user.firm_id, user.id],
    queryFn: () => api.workspace.threads(),
  });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"constitution" | "firm">("constitution");
  const [language, setLanguage] = useState("en");
  const [action, setAction] = useState("advisory");
  const [mobile, setMobile] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [source, setSource] = useState<KnowledgeItem | null>(null);
  const [memo, setMemo] = useState<{
    query: string;
    answer: string;
    citedItems: KnowledgeItem[];
  } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (query.data) {
      setThreads(query.data);
      setActiveId((previous) => previous || query.data[0]?.id || "");
    }
  }, [query.data]);
  useEffect(() => () => controller.current?.abort(), []);
  const active = threads.find((thread) => thread.id === activeId);
  const messages = active?.messages || [];
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [messages.length]);
  const persist = async (thread: Thread) => {
    try {
      await api.workspace.saveThread(thread.id, thread);
    } catch (error) {
      toast.error(`Conversation could not be saved: ${errorMessage(error)}`);
    }
  };
  const makeThread = async (name = "Constitutional research") => {
    const thread: Thread = {
      id: crypto.randomUUID(),
      title: name,
      practiceArea: "Constitutional Law & Fundamental Rights",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    await api.workspace.saveThread(thread.id, thread);
    setThreads((previous) => [thread, ...previous]);
    setActiveId(thread.id);
    setCreating(false);
    setTitle("");
    return thread;
  };
  const updateMessage = (threadId: string, messageId: string, updates: Partial<ResearchMessage>) =>
    setThreads((previous) =>
      previous.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: thread.messages.map((message) =>
                message.id === messageId ? { ...message, ...updates } : message,
              ),
            }
          : thread,
      ),
    );
  const send = async (question = input) => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setInput("");
    let thread = active;
    const requestMode = mode;
    const requestAction = action;
    const assistantId = crypto.randomUUID();
    let answer = "";
    let citations: KnowledgeItem[] = [];
    let articles: ConstitutionArticle[] = [];
    let guardrail = false;
    let responseMode = "";
    let failed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const abort = new AbortController();
    controller.current = abort;
    try {
      if (!thread) thread = await makeThread(question.substring(0, 70));
      const original = thread;
      const userMessage: ResearchMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
      };
      const placeholder: ResearchMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
        action_type: requestAction,
      };
      const history = original.messages
        .filter((message) => !message.error)
        .map((message) => ({ role: message.role, content: message.content }))
        .slice(-8);
      thread = { ...original, messages: [...original.messages, userMessage, placeholder] };
      const threadId = thread.id;
      setThreads((previous) => previous.map((item) => (item.id === threadId ? thread! : item)));
      if (requestMode === "constitution") {
        const result: ConstitutionResearch = await api.constitution.research(
          question,
          [],
          language,
          abort.signal,
        );
        if (abort.signal.aborted) throw new DOMException("Aborted", "AbortError");
        answer = result.answer;
        articles = result.sources;
        guardrail = result.guardrail_applied;
        responseMode = result.mode;
      } else {
        await api.chat.stream(
          question,
          original.practiceArea === "All practice areas" ? undefined : original.practiceArea,
          history,
          requestAction,
          (token) => {
            answer += token;
            if (!timer)
              timer = setTimeout(() => {
                updateMessage(threadId, assistantId, { content: answer });
                timer = undefined;
              }, 60);
          },
          (metadata) => {
            citations = metadata.cited_items || citations;
            guardrail = metadata.guardrail_applied ?? guardrail;
          },
          abort.signal,
        );
      }
    } catch (error) {
      failed = !(error instanceof DOMException && error.name === "AbortError");
      if (failed) toast.error(errorMessage(error));
      if (!answer)
        answer = failed
          ? "The research request could not complete. Retry when the service is available."
          : "Generation stopped.";
    } finally {
      if (timer) clearTimeout(timer);
      if (thread) {
        const complete: ResearchMessage = {
          id: assistantId,
          role: "assistant",
          content: answer,
          cited_items: citations,
          article_sources: articles,
          guardrail_applied: guardrail,
          isStreaming: false,
          error: failed,
          mode: responseMode,
          action_type: requestMode === "firm" ? requestAction : "advisory",
        };
        const finished: Thread = {
          ...thread,
          updatedAt: new Date().toISOString(),
          messages: thread.messages.map((message) =>
            message.id === assistantId ? complete : message,
          ),
        };
        setThreads((previous) =>
          previous.map((item) => (item.id === finished.id ? finished : item)),
        );
        await persist(finished);
      }
      controller.current = null;
      setLoading(false);
    }
  };
  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
          Research threads
        </h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="New research thread"
          onClick={() => setCreating(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {query.isPending ? (
          <Skeleton className="h-20" />
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              className={cn(
                "flex items-center rounded-xl border",
                thread.id === activeId
                  ? "border-accent/30 bg-accent/10"
                  : "border-surface-border bg-surface",
              )}
            >
              <button
                disabled={loading}
                onClick={() => {
                  setActiveId(thread.id);
                  setMobile(false);
                }}
                className="min-w-0 flex-1 p-3 text-left"
              >
                <p className="truncate text-xs font-medium">{thread.title}</p>
                <p className="mt-1 text-[10px] text-content-muted">
                  {thread.messages.length} messages
                </p>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={`Delete ${thread.title}`}
                disabled={loading}
                onClick={() => setDeleting(thread.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
      <Link
        href="/constitution"
        className="mt-5 flex items-center gap-2 border-t border-surface-border pt-4 text-xs text-accent"
      >
        <Landmark className="h-4 w-4" />
        Open article workspace ↗
      </Link>
    </div>
  );
  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[560px] overflow-hidden rounded-2xl border border-surface-border bg-surface-subtle">
      <aside className="hidden w-60 shrink-0 border-r border-surface-border bg-surface p-4 xl:block">
        {sidebar}
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border bg-surface px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              aria-label="Open research threads"
              onClick={() => setMobile(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold">
                {active?.title || "Indian constitutional research assistant"}
              </h1>
              <p className="mt-1 text-[11px] text-content-muted">
                Source-linked research · English & हिन्दी
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Research source mode"
              value={mode}
              disabled={loading}
              onChange={(event) => setMode(event.target.value as "constitution" | "firm")}
              className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-xs"
            >
              <option value="constitution">Constitution references</option>
              <option value="firm">Published firm knowledge</option>
            </select>
            <select
              aria-label="Response language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-lg border border-surface-border bg-surface-elevated px-2 py-2 text-xs"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {query.isError && (
              <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />
            )}
            {!messages.length && (
              <div className="py-8 sm:py-14">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                  <Landmark className="h-7 w-7" />
                </div>
                <p className="mb-3 text-xs uppercase tracking-[.18em] text-accent">
                  Begin with the constitutional foundation
                </p>
                <h2 className="font-serif text-3xl font-semibold leading-snug">
                  A stronger argument starts
                  <br className="hidden sm:block" /> with the right source.
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-content-secondary">
                  Explore constitutional articles and doctrines, or switch to your firm’s published
                  knowledge for institutional strategies.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {questions.map((question) => (
                    <button
                      disabled={loading}
                      onClick={() => send(question)}
                      key={question}
                      className="rounded-xl border border-surface-border bg-surface p-4 text-left text-xs leading-relaxed text-content-secondary hover:border-accent/40"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[90%] rounded-2xl bg-accent/10 px-5 py-4 text-sm"
                    : "rounded-2xl border border-surface-border bg-surface p-5 sm:p-6"
                }
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-2 text-xs text-accent">
                      <Sparkles className="h-4 w-4" />
                      {message.mode === "source_extract"
                        ? "Constitution reference extracts"
                        : "Research response"}
                    </div>
                    {message.guardrail_applied && (
                      <p className="mb-4 rounded-xl bg-status-warning/10 p-3 text-xs text-status-warning">
                        No matching supporting sources were found for this question.
                      </p>
                    )}
                    {message.isStreaming && !message.content ? (
                      <div
                        role="status"
                        className="flex items-center gap-2 text-sm text-content-muted"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Finding supporting sources…
                      </div>
                    ) : (
                      <LegalMarkdownRenderer
                        content={message.content}
                        isStreaming={message.isStreaming}
                        onCiteClick={(id) => {
                          const item = message.cited_items?.find(
                            (item) => String(item.item_id || item.id) === String(id),
                          );
                          if (item) setSource(item);
                          else
                            api.knowledge
                              .get(id)
                              .then(setSource)
                              .catch((error) => toast.error(errorMessage(error)));
                        }}
                        onArticleClick={(number) => {
                          window.location.href = `/constitution?article=${encodeURIComponent(number)}`;
                        }}
                      />
                    )}
                    {!!message.article_sources?.length && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {message.article_sources.map((article) => (
                          <Link
                            key={article.article_number}
                            href={`/constitution?article=${article.article_number}`}
                            className="rounded-lg border border-accent/25 px-3 py-2 text-xs text-accent"
                          >
                            Article {article.article_number} ↗
                          </Link>
                        ))}
                      </div>
                    )}
                    {!!message.cited_items?.length && (
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        {message.cited_items.map((item) => (
                          <button
                            key={item.item_id || item.id}
                            onClick={() => setSource(item)}
                            className="rounded-xl border border-surface-border p-3 text-left text-xs text-content-secondary"
                          >
                            {item.title}
                            <span className="mt-1 block text-accent">Inspect source ↗</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {!message.isStreaming && (
                      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-surface-border pt-3 text-xs text-content-muted">
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(message.content);
                              toast.success("Research response copied");
                            } catch {
                              toast.error("Clipboard is unavailable");
                            }
                          }}
                          className="flex items-center gap-1.5 hover:text-accent"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </button>
                        <button
                          onClick={() =>
                            setMemo({
                              query: messages[index - 1]?.content || active?.title || "Research",
                              answer: message.content,
                              citedItems: message.cited_items || [],
                            })
                          }
                          className="flex items-center gap-1.5 hover:text-accent"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Export memo
                        </button>
                        {message.error && (
                          <button
                            disabled={loading}
                            onClick={() => send(messages[index - 1]?.content)}
                            className="flex items-center gap-1.5 text-accent"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Retry question
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div ref={bottom} />
          </div>
        </div>
        <div className="border-t border-surface-border bg-surface p-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            {mode === "firm" && (
              <select
                aria-label="Drafting mode"
                value={action}
                onChange={(event) => setAction(event.target.value)}
                className="mb-3 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-xs"
              >
                <option value="advisory">Research advisory</option>
                <option value="draft_objection">Draft preliminary objections</option>
                <option value="draft_reply">Draft notice reply</option>
              </select>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
              className="flex items-end gap-3"
            >
              <textarea
                aria-label="Research question"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                placeholder={
                  mode === "constitution"
                    ? "Ask about equality, liberty, writs, or a constitutional article…"
                    : "Ask about your firm’s published knowledge…"
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    send();
                  }
                }}
                className="min-w-0 flex-1 resize-none rounded-xl border border-surface-border bg-surface-elevated p-3 text-sm"
              />
              {loading ? (
                <Button
                  type="button"
                  variant="secondary"
                  aria-label="Stop generation"
                  onClick={() => controller.current?.abort()}
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" aria-label="Send research question" disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
            <p className="mt-2 text-[10px] text-content-muted">
              Enter to send · Shift+Enter for a new line ·{" "}
              {mode === "constitution"
                ? "Curated article registry and case references"
                : "Firm-scoped published sources"}
            </p>
          </div>
        </div>
      </section>
      <Drawer open={mobile} onOpenChange={setMobile} title="Research threads">
        {sidebar}
      </Drawer>
      <Dialog open={creating} onOpenChange={setCreating} title="Start a research thread">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await makeThread(title.trim());
            } catch (error) {
              toast.error(errorMessage(error));
            }
          }}
        >
          <Input
            aria-label="Research thread title"
            placeholder="Article 21 privacy analysis…"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Button className="mt-4" disabled={!title.trim()}>
            Create thread
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this research thread?"
        description="This removes the saved conversation from your personal firm workspace."
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!deleting) return;
              try {
                await api.workspace.deleteThread(deleting);
                setThreads((previous) => previous.filter((thread) => thread.id !== deleting));
                if (activeId === deleting) setActiveId("");
                setDeleting(null);
                toast.success("Research thread deleted");
              } catch (error) {
                toast.error(errorMessage(error));
              }
            }}
          >
            Delete thread
          </Button>
        </div>
      </Dialog>
      <PrecedentDrawer
        isOpen={!!source}
        onClose={() => setSource(null)}
        item={source}
        onAskFollowUp={setInput}
      />
      {memo && (
        <LegalMemoModal
          isOpen
          onClose={() => setMemo(null)}
          matterTitle={active?.title || "Constitutional research"}
          practiceArea={active?.practiceArea || "Constitutional Law & Fundamental Rights"}
          query={memo.query}
          answer={memo.answer}
          citedItems={memo.citedItems}
          firmName={user.firm_name}
        />
      )}
    </div>
  );
}
