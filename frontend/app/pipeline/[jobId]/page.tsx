"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { RefreshCw, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, cn } from "@/lib/utils";
import { Card, Badge, Button, ErrorState, PageHeader, Skeleton } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import type { StageData } from "@/components/pipeline/PipelineDiagram";
const PipelineDiagram = dynamic(() => import("@/components/pipeline/PipelineDiagram"), {
  ssr: false,
  loading: () => <Skeleton className="h-[480px]" />,
});
interface PipelineJob {
  job_id: number;
  title: string;
  status: string;
  current_stage: number;
  knowledge_item_id: number;
  raw_input_type: string;
  stages: StageData[];
  sanitized_text: string;
  abstracted_insight: string;
  pii_entities: { entity_type: string; text: string; score: number }[];
  job_details: {
    status: string;
    error_message: string | null;
    started_at: string;
    finished_at: string | null;
  };
}
export default function LivePipelinePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const client = useQueryClient();
  const [selected, setSelected] = useState(1);
  const [connected, setConnected] = useState(false);
  const query = useQuery<PipelineJob>({
    queryKey: ["pipeline", jobId],
    queryFn: () => api.pipeline.getJob(jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        data &&
        (data.status === "published" ||
          data.status === "rejected" ||
          data.job_details.status === "failed")
      )
        return false;
      return data?.status === "pending_approval" ? 10000 : connected ? 10000 : 2500;
    },
  });
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000", {
      path: "/ws/socket.io",
      auth: { token: localStorage.getItem("lexvault_token") },
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_job", { job_id: jobId });
      client.invalidateQueries({ queryKey: ["pipeline", jobId] });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("stage_update", () => client.invalidateQueries({ queryKey: ["pipeline", jobId] }));
    return () => {
      socket.disconnect();
    };
  }, [jobId, client]);
  const retry = useMutation({
    mutationFn: () => api.pipeline.retry(jobId),
    onSuccess: () => {
      toast.success("Pipeline retry started");
      query.refetch();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const data = query.data;
  const stage = data?.stages.find((stage) => stage.stage === selected);
  const done = data?.stages.slice(0, 6).filter((stage) => stage.status === "done").length || 0;
  const failed = data?.job_details.status === "failed";
  const output =
    selected === 3
      ? data?.sanitized_text
      : selected === 4
        ? data?.abstracted_insight
        : stage?.output;
  return (
    <Reveal className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={`Live pipeline · job #${jobId}`}
        title={data?.title || "Following your captured insight"}
        description="Inspect each stage as the capture becomes sanitized, reviewed, and published knowledge."
        action={
          <Button variant="secondary" onClick={() => query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {query.isError && (
        <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />
      )}
      {query.isPending ? (
        <Skeleton className="h-96" />
      ) : (
        data && (
          <>
            <Card className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{failed ? "Processing failed" : data.status.replaceAll("_", " ")}</Badge>
                  <span className="flex items-center gap-2 text-xs text-content-muted">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        connected ? "bg-status-success" : "bg-status-warning",
                      )}
                    />
                    {connected ? "Live connection" : "Polling fallback"}
                  </span>
                </div>
                <span className="text-xs text-content-secondary">
                  {done} / 6 publication stages complete
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={done}
                aria-valuemin={0}
                aria-valuemax={6}
                aria-label="Publication progress"
                className="h-1.5 overflow-hidden rounded-full bg-surface-elevated"
              >
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(done / 6) * 100}%` }}
                />
              </div>
            </Card>
            {failed && (
              <Card
                role="alert"
                className="flex flex-wrap items-center gap-4 border-status-danger/30 p-5"
              >
                <AlertCircle className="h-5 w-5 text-status-danger" />
                <div className="flex-1">
                  <h2 className="text-sm font-medium">This job needs attention</h2>
                  <p className="mt-1 text-xs text-content-secondary">
                    {data.job_details.error_message || "Processing was interrupted."}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={retry.isPending}
                  onClick={() => retry.mutate()}
                >
                  Retry processing
                </Button>
                <Link href="/capture" className="text-xs text-accent">
                  New capture ↗
                </Link>
              </Card>
            )}
            <div className="grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]">
              <div className="space-y-4">
                <PipelineDiagram
                  stages={data.stages}
                  selectedStage={selected}
                  onSelectStage={setSelected}
                  className="h-[440px] sm:h-[480px]"
                />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Pipeline stages">
                  {data.stages.map((stage) => (
                    <button
                      key={stage.stage}
                      onClick={() => setSelected(stage.stage)}
                      className={cn(
                        "rounded-xl border p-3 text-left text-xs",
                        selected === stage.stage
                          ? "border-accent/40 bg-accent/10"
                          : "border-surface-border bg-surface",
                      )}
                    >
                      <span className="text-accent">{stage.stage}.</span> {stage.name}
                      <span className="mt-2 block text-[10px] text-content-muted">
                        {stage.stage > 6 && data.status === "published"
                          ? "Available at query time"
                          : stage.status.replaceAll("_", " ")}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-content-muted">
                  Stages 1–6 publish the insight. Retrieval and response run when you ask a research
                  question.
                </p>
              </div>
              <Card className="p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-accent">
                      Stage {selected} inspection
                    </p>
                    <h2 className="text-base font-semibold">{stage?.name}</h2>
                  </div>
                  <Badge>{stage?.status.replaceAll("_", " ")}</Badge>
                </div>
                {selected === 3 && (
                  <div className="mb-4 rounded-xl border border-surface-border p-4">
                    <p className="mb-3 flex items-center gap-2 text-xs text-accent">
                      <ShieldCheck className="h-4 w-4" />
                      {data.pii_entities.length} identifiers removed
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set(data.pii_entities.map((entity) => entity.entity_type)),
                      ).map((type) => (
                        <Badge key={type}>{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selected > 6 ? (
                  <p className="text-sm leading-relaxed text-content-secondary">
                    Once published, this knowledge is available to the firm’s source-grounded
                    research assistant.
                  </p>
                ) : (
                  <div className="max-h-[480px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-surface-elevated p-4 text-sm leading-relaxed text-content-secondary">
                    {typeof output === "string"
                      ? output
                      : output
                        ? JSON.stringify(output, null, 2)
                        : "No output yet. This stage will update as processing continues."}
                  </div>
                )}
                {data.status === "pending_approval" && selected === 5 && (
                  <Link
                    href="/approvals"
                    className="mt-5 inline-flex items-center gap-2 text-sm text-accent"
                  >
                    Open partner review <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {data.status === "published" && (
                  <Link
                    href={`/knowledge-hub?id=${data.knowledge_item_id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm text-accent"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Open published insight
                  </Link>
                )}
              </Card>
            </div>
          </>
        )
      )}
    </Reveal>
  );
}
