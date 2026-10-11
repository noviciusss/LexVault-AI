"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Search, Edit3, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { ApprovalItem } from "@/types/domain";
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

export default function ApprovalsPage() {
  const user = useAppStore((state) => state.currentUser);
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const canReview = user.role === "admin" || user.role === "reviewer";
  const query = useQuery<ApprovalItem[]>({
    queryKey: ["approvals", user.firm_id],
    queryFn: () => api.approvals.list(),
  });
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "approve" | "reject" }) =>
      api.approvals.takeAction(
        id,
        action,
        editing === id ? text : undefined,
        action === "reject" ? reason : undefined,
      ),
    onSuccess: async (_, variables) => {
      client.setQueryData<ApprovalItem[]>(["approvals", user.firm_id], (items) =>
        items?.filter((item) => item.id !== variables.id),
      );
      setEditing(null);
      setRejecting(null);
      setReason("");
      toast.success(
        variables.action === "approve"
          ? "Approved. Indexing will continue in the pipeline."
          : "Submission rejected with reviewer feedback.",
      );
      await client.invalidateQueries({ queryKey: ["stats"] });
      await client.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const items =
    query.data?.filter((item) =>
      `${item.title} ${item.practice_area}`.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  return (
    <Reveal className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Stage 5 · Human review"
        title="Good knowledge starts with careful review."
        description="Inspect sanitized facts and reusable legal strategy before it becomes part of your firm’s institutional knowledge."
        action={<Badge>{query.data?.length || 0} awaiting review</Badge>}
      />
      {!canReview && (
        <Card className="border-accent/25 p-4 text-sm text-content-secondary">
          You can inspect your firm’s submissions. Switch to the senior partner demo role to approve
          or reject.
        </Card>
      )}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-content-muted" />
        <Input
          aria-label="Filter pending submissions"
          placeholder="Search title or practice area…"
          className="pl-9"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {query.isError ? (
        <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />
      ) : query.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : !items.length ? (
        <EmptyState
          title={search ? "No matching submissions" : "Your review queue is clear"}
          description={
            search
              ? "Try another title or practice area."
              : "New captured insights will appear here after sanitization and abstraction."
          }
        />
      ) : (
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              exit={{ opacity: 0, x: 30, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="mb-5 p-5 sm:p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge>{item.practice_area}</Badge>
                    <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
                    <p className="mt-1 text-xs text-content-muted">
                      Submission #{item.id} · Author #{item.author_id}
                    </p>
                  </div>
                  <Badge className="border-status-warning/30 bg-status-warning/10 text-status-warning">
                    Awaiting sign-off
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-surface-border bg-surface-elevated/50 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      Sanitized facts
                    </h3>
                    <p className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-content-secondary">
                      {item.sanitized_text}
                    </p>
                    <div className="mt-4 border-t border-surface-border pt-3 text-xs text-content-muted">
                      {item.pii_entities_found.length} identifiers removed ·{" "}
                      {Array.from(
                        new Set(item.pii_entities_found.map((entity) => entity.entity_type)),
                      ).join(", ") || "No detected identifiers"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-accent/25 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-accent">Proposed firm insight</h3>
                      {canReview && (
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => {
                            setEditing(item.id);
                            setText(item.abstracted_insight);
                          }}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {editing === item.id ? (
                      <textarea
                        aria-label="Edit proposed insight"
                        rows={10}
                        className="w-full rounded-xl border border-surface-border bg-surface-elevated p-3 text-sm leading-relaxed"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                      />
                    ) : (
                      <p className="max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
                        {item.abstracted_insight}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-surface-border pt-4">
                  <p className="text-xs text-content-muted">
                    Reviewer identity and decision are recorded in the audit trail.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      disabled={!canReview || mutation.isPending}
                      onClick={() => setRejecting(item.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      disabled={
                        !canReview || mutation.isPending || (editing === item.id && !text.trim())
                      }
                      onClick={() => mutation.mutate({ id: item.id, action: "approve" })}
                    >
                      {mutation.isPending && mutation.variables?.id === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {editing === item.id ? "Save & approve" : "Approve insight"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      <Dialog
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open) setRejecting(null);
        }}
        title="Return this insight with feedback"
        description="Explain what needs to change so the author can improve the submission."
      >
        <label htmlFor="rejection-reason" className="text-sm">
          Reviewer feedback
        </label>
        <textarea
          id="rejection-reason"
          className="mt-2 w-full rounded-xl border border-surface-border bg-surface-elevated p-3 text-sm"
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRejecting(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!reason.trim() || mutation.isPending}
            onClick={() => rejecting && mutation.mutate({ id: rejecting, action: "reject" })}
          >
            Reject with feedback
          </Button>
        </div>
      </Dialog>
    </Reveal>
  );
}
