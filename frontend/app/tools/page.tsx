"use client";
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Calculator, FileText, HelpCircle, Search, Trash2, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { errorMessage } from "@/lib/utils";
import type { Hearing } from "@/types/domain";
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

export default function LitigationToolsPage() {
  const [tab, setTab] = useState("limitation");
  return (
    <Reveal className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Indian litigation practice"
        title="Practical tools, connected to your workflow."
        description="Calculate supported limitation periods, inspect matter matches, summarize judgments, and keep a shared firm hearing diary."
      />
      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List
          className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-surface-border bg-surface p-1"
          aria-label="Legal practice tools"
        >
          {[
            { id: "limitation", label: "Limitation", icon: Calculator },
            { id: "conflict", label: "Matter conflicts", icon: Search },
            { id: "judgment", label: "Judgment brief", icon: FileText },
            { id: "quiz", label: "Practice quiz", icon: HelpCircle },
            { id: "hearings", label: "Hearing diary", icon: Calendar },
          ].map((item) => (
            <Tabs.Trigger
              key={item.id}
              value={item.id}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-xs text-content-secondary data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="limitation">
          <LimitationTool />
        </Tabs.Content>
        <Tabs.Content value="conflict">
          <ConflictTool />
        </Tabs.Content>
        <Tabs.Content value="judgment">
          <JudgmentTool />
        </Tabs.Content>
        <Tabs.Content value="quiz">
          <QuizTool />
        </Tabs.Content>
        <Tabs.Content value="hearings">
          <HearingDiary />
        </Tabs.Content>
      </Tabs.Root>
    </Reveal>
  );
}
function LimitationTool() {
  const types = useQuery<{ case_type: string; label: string; governing_article: string }[]>({
    queryKey: ["limitation-types"],
    queryFn: () => api.tools.getLimitationTypes(),
  });
  const [type, setType] = useState("specific_performance");
  const [date, setDate] = useState("");
  const mutation = useMutation<
    {
      computed_deadline: string;
      days_remaining: number;
      status: string;
      act: string;
      governing_article: string;
      legal_notes: string;
      section_5_guidance: string;
    },
    Error
  >({
    mutationFn: () => api.tools.calculateLimitation(type, date),
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold">Compute a supported deadline</h2>
        {types.isError && (
          <ErrorState message={errorMessage(types.error)} retry={() => types.refetch()} />
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <label className="block text-xs text-content-secondary">
            Action category
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-surface-border bg-surface-elevated px-3 text-xs"
            >
              {types.data?.map((item) => (
                <option key={item.case_type} value={item.case_type}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-content-secondary">
            Cause of action / trigger date
            <Input
              className="mt-2"
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <Button disabled={mutation.isPending || !types.data?.length}>Calculate deadline</Button>
        </form>
      </Card>
      <Card className="p-6">
        {mutation.data ? (
          <div className="space-y-5">
            <Badge
              className={
                mutation.data.days_remaining < 0
                  ? "border-status-danger/30 bg-status-danger/10 text-status-danger"
                  : ""
              }
            >
              {mutation.data.status}
            </Badge>
            <h3 className="text-3xl font-semibold tabular-nums">
              {mutation.data.computed_deadline}
            </h3>
            <p className="text-sm text-content-secondary">
              {mutation.data.days_remaining < 0
                ? `${Math.abs(mutation.data.days_remaining)} days elapsed`
                : `${mutation.data.days_remaining} days remaining`}
            </p>
            <p className="text-sm font-medium text-accent">
              {mutation.data.act} · {mutation.data.governing_article}
            </p>
            <p className="text-sm leading-relaxed text-content-secondary">
              {mutation.data.legal_notes}
            </p>
            <p className="rounded-xl bg-surface-elevated p-4 text-xs leading-relaxed">
              {mutation.data.section_5_guidance}
            </p>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-content-muted">
            Select an action and trigger date to view the computation.
          </p>
        )}
      </Card>
    </div>
  );
}
function ConflictTool() {
  const [search, setSearch] = useState("");
  const mutation = useMutation<
    {
      has_potential_conflict: boolean;
      conflict_count: number;
      recommendation: string;
      matches: { item_id: number; title: string; match_snippet: string }[];
    },
    Error
  >({
    mutationFn: () => api.tools.checkConflicts(search),
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold">Look for prior matter matches</h2>
      <p className="my-3 text-sm text-content-secondary">
        Search your firm’s records for a party or organization before reviewing engagement
        conflicts.
      </p>
      <form
        className="flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <Input
          className="min-w-0 flex-1"
          aria-label="Party or organization"
          required
          minLength={3}
          placeholder="Party or organization name…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button disabled={mutation.isPending}>Check records</Button>
      </form>
      {mutation.data && (
        <div className="mt-6 space-y-4">
          <Badge>{mutation.data.conflict_count} prior matches</Badge>
          <p className="text-sm leading-relaxed">{mutation.data.recommendation}</p>
          {mutation.data.matches.map((item) => (
            <div key={item.item_id} className="rounded-xl border border-surface-border p-4">
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="mt-2 text-xs text-content-muted">{item.match_snippet}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
function JudgmentTool() {
  const [title, setTitle] = useState("");
  const [court, setCourt] = useState("Supreme Court of India");
  const [text, setText] = useState("");
  const mutation = useMutation<{ structured_summary: string }, Error>({
    mutationFn: () => api.tools.summarizeJudgment({ raw_judgment: text, case_title: title, court }),
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold">Judgment source</h2>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <Input
            aria-label="Judgment title"
            placeholder="Case title or reference"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            aria-label="Judgment court"
            required
            value={court}
            onChange={(event) => setCourt(event.target.value)}
          />
          <textarea
            aria-label="Judgment text"
            required
            minLength={50}
            rows={14}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the judgment excerpt for structured analysis…"
            className="w-full rounded-xl border border-surface-border bg-surface-elevated p-4 text-sm leading-relaxed"
          />
          <Button disabled={mutation.isPending}>
            {mutation.isPending ? "Preparing brief…" : "Generate structured brief"}
          </Button>
        </form>
      </Card>
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold">Legal digest</h2>
        {mutation.data ? (
          <LegalMarkdownRenderer content={mutation.data.structured_summary} />
        ) : (
          <p className="py-16 text-center text-sm text-content-muted">
            Your structured digest will appear here.
          </p>
        )}
      </Card>
    </div>
  );
}
function QuizTool() {
  const [revealed, setRevealed] = useState(false);
  const query = useQuery<{
    prompt: string;
    hint: string;
    answer: string;
    full_insight: string;
    practice_area: string;
  }>({ queryKey: ["quiz"], queryFn: () => api.tools.getQuiz(), staleTime: 0 });
  return (
    <Card className="mx-auto max-w-3xl p-6">
      {query.isError ? (
        <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />
      ) : query.isPending ? (
        <Skeleton className="h-60" />
      ) : (
        query.data && (
          <div className="space-y-5">
            <Badge>{query.data.practice_area}</Badge>
            <h2 className="font-serif text-xl leading-relaxed">{query.data.prompt}</h2>
            <p className="text-xs text-content-muted">{query.data.hint}</p>
            {revealed && (
              <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
                <h3 className="text-sm font-semibold">{query.data.answer}</h3>
                <p className="mt-3 text-sm leading-relaxed text-content-secondary">
                  {query.data.full_insight}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => setRevealed(true)} disabled={revealed}>
                Reveal reasoning
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setRevealed(false);
                  query.refetch();
                }}
              >
                Next question
              </Button>
            </div>
          </div>
        )
      )}
    </Card>
  );
}
function HearingDiary() {
  const user = useAppStore((state) => state.currentUser);
  const client = useQueryClient();
  const query = useQuery<Hearing[]>({
    queryKey: ["hearings", user.firm_id],
    queryFn: () => api.workspace.hearings(),
  });
  const [title, setTitle] = useState("");
  const [court, setCourt] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const add = useMutation({
    mutationFn: () => api.workspace.addHearing({ title, court, date, note }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["hearings"] });
      setTitle("");
      setNote("");
      toast.success("Hearing saved to the firm diary");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.workspace.deleteHearing(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["hearings"] });
      setDeleting(null);
      toast.success("Hearing removed");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold">Add a court listing</h2>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            add.mutate();
          }}
        >
          <Input
            aria-label="Hearing matter title"
            required
            placeholder="Matter title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            aria-label="Court and bench"
            required
            placeholder="Court / bench"
            value={court}
            onChange={(event) => setCourt(event.target.value)}
          />
          <Input
            aria-label="Hearing date"
            required
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <Input
            aria-label="Listing notes"
            placeholder="Listing stage / notes"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Button disabled={add.isPending}>
            <Plus className="h-4 w-4" />
            Save hearing
          </Button>
        </form>
        <p className="mt-4 text-xs text-content-muted">
          Saved on the server and scoped to your firm.
        </p>
      </Card>
      <div>
        {query.isError ? (
          <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />
        ) : query.isPending ? (
          <Skeleton className="h-60" />
        ) : !query.data?.length ? (
          <EmptyState
            title="Your court diary is ready"
            description="Add an upcoming matter listing to share it with your firm."
          />
        ) : (
          <div className="space-y-3">
            {query.data.map((hearing) => (
              <Card key={hearing.id} className="flex items-start gap-4 p-5">
                <div className="rounded-xl bg-accent/10 p-3 text-accent">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-accent">
                    {new Date(`${hearing.date}T00:00:00`).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold">{hearing.title}</h3>
                  <p className="mt-1 text-xs text-content-secondary">{hearing.court}</p>
                  <p className="mt-2 text-xs text-content-muted">{hearing.note}</p>
                </div>
                {(user.id === hearing.user_id || user.role === "admin") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete hearing ${hearing.title}`}
                    onClick={() => setDeleting(hearing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Remove this hearing?"
        description="The listing will be removed from the shared firm diary."
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={remove.isPending}
            onClick={() => deleting && remove.mutate(deleting)}
          >
            Remove listing
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
