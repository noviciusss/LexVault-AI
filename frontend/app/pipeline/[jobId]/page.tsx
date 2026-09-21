"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Brain,
  Database,
  Cpu,
  RefreshCw,
  FileText,
  UserCheck,
} from "lucide-react";
import io from "socket.io-client";
import PipelineDiagram from "@/components/pipeline/PipelineDiagram";
import { api } from "@/lib/api";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000";

export default function LivePipelinePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId ? String(params.jobId) : "1";

  const [pipelineData, setPipelineData] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // Fetch pipeline status
  const loadJob = async () => {
    try {
      const data = await api.pipeline.getJob(jobId);
      setPipelineData(data);
      if (data.current_stage) {
        setSelectedStage(data.current_stage);
      }
    } catch (err) {
      console.error("Pipeline fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();

    // WebSocket connection for live stage progress updates
    const socket = io(WS_URL, {
      path: "/ws/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_job", { job_id: jobId });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("stage_update", (event: any) => {
      if (String(event.job_id) === String(jobId)) {
        // Refresh or update state
        setPipelineData((prev: any) => {
          if (!prev) return prev;
          const updatedStages = prev.stages.map((s: any) => {
            if (s.stage === event.stage) {
              return {
                ...s,
                status: event.status,
                output: event.output || s.output,
              };
            }
            return s;
          });
          return {
            ...prev,
            current_stage: event.stage,
            stages: updatedStages,
          };
        });
        setSelectedStage(event.stage);
      }
    });

    // Polling fallback every 2 seconds
    const interval = setInterval(loadJob, 2000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [jobId]);

  const stages = pipelineData?.stages || [
    { stage: 1, name: "Raw Capture", status: "running" },
    { stage: 2, name: "Local AI Processing", status: "pending" },
    { stage: 3, name: "PII Sanitization", status: "pending" },
    { stage: 4, name: "Strategy Abstraction", status: "pending" },
    { stage: 5, name: "Lawyer Approval Gate", status: "pending" },
    { stage: 6, name: "Vector & Graph DB", status: "pending" },
    { stage: 7, name: "RAG Retrieval", status: "pending" },
    { stage: 8, name: "Safe Response", status: "pending" },
  ];

  const currentStageObj = stages.find((s: any) => s.stage === selectedStage) || stages[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-accent tracking-wider">
              Live Pipeline Monitor #{jobId}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-status-success" : "bg-status-warning animate-ping"
              }`}
            />
            <span className="text-[11px] text-content-muted">
              {connected ? "WebSocket Connected" : "Polling Active"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-content-primary mt-1">
            {pipelineData?.title || "Legal Matter Pipeline Processing"}
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Status: <span className="font-semibold text-accent uppercase">{pipelineData?.status || "Processing"}</span> • Input Type: {pipelineData?.raw_input_type || "text"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadJob}
            className="p-2.5 rounded-lg bg-surface-elevated hover:bg-surface border border-surface-border text-content-secondary hover:text-content-primary transition-colors text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {pipelineData?.status === "pending_approval" && (
            <Link
              href="/approvals"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-status-warning text-background font-bold text-xs transition-all shadow-md animate-pulse"
            >
              <UserCheck className="w-4 h-4" />
              <span>Review in Approvals Queue</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Split: React Flow Canvas on Left / Intermediate Output Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 8-Stage React Flow Diagram */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-content-secondary">
            <span>Click any node to inspect that stage&apos;s intermediate output</span>
            <span className="text-accent font-medium">Stage {selectedStage} Selected</span>
          </div>
          <PipelineDiagram
            stages={stages}
            selectedStage={selectedStage}
            onSelectStage={setSelectedStage}
            className="h-[480px]"
          />
        </div>

        {/* Right: Intermediate Stage Output Inspection Drawer */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
                  Stage {selectedStage} Output
                </span>
                <h3 className="text-sm font-bold text-content-primary">{currentStageObj?.name}</h3>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  currentStageObj?.status === "done"
                    ? "bg-status-success/20 text-status-success border border-status-success/30"
                    : currentStageObj?.status === "running"
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : currentStageObj?.status === "waiting_approval"
                    ? "bg-status-warning/20 text-status-warning border border-status-warning/30"
                    : "bg-surface-elevated text-content-muted"
                }`}
              >
                {currentStageObj?.status}
              </span>
            </div>

            {/* Stage-Specific Output Display */}
            {selectedStage === 1 && (
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-content-secondary">Raw Client Ingestion:</div>
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border text-content-primary font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto">
                  {pipelineData?.stages?.[0]?.output || pipelineData?.raw_text || "Processing initial capture stream..."}
                </div>
              </div>
            )}

            {selectedStage === 2 && (
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-content-secondary">Local AI Cleaned & Structured Text:</div>
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border text-content-primary text-[11px] leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                  {pipelineData?.stages?.[1]?.output || "Awaiting Local AI processing..."}
                </div>
              </div>
            )}

            {selectedStage === 3 && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between font-semibold text-content-secondary">
                  <span>Presidio PII Redaction Audit:</span>
                  <span className="text-status-success text-[11px]">
                    {pipelineData?.pii_entities?.length || 0} Entities Redacted
                  </span>
                </div>

                {pipelineData?.pii_entities && pipelineData.pii_entities.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {pipelineData.pii_entities.map((e: any, i: number) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-status-danger/10 border border-status-danger/25 flex items-center justify-between text-[11px]"
                      >
                        <span className="font-semibold text-status-danger">{e.entity_type}</span>
                        <span className="text-content-muted line-through truncate max-w-[140px]">{e.text}</span>
                        <span className="text-[10px] text-content-secondary">Score: {e.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 text-content-muted text-[11px] italic">
                    No PII entities detected yet.
                  </div>
                )}

                <div className="space-y-1">
                  <div className="font-semibold text-content-secondary text-[11px]">Sanitized Result:</div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-[11px] font-mono leading-relaxed text-content-primary max-h-36 overflow-y-auto">
                    {pipelineData?.sanitized_text || "Sanitizing..."}
                  </div>
                </div>
              </div>
            )}

            {selectedStage === 4 && (
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-content-secondary">Abstracted Institutional Precedent:</div>
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-accent/20 text-content-primary text-[11px] leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                  {pipelineData?.abstracted_insight || "Generating reusable strategy..."}
                </div>
              </div>
            )}

            {selectedStage === 5 && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-status-warning/10 border border-status-warning/30 space-y-2">
                  <div className="font-semibold text-status-warning flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Human-in-the-Loop Approval Gate</span>
                  </div>
                  <p className="text-[11px] text-content-secondary leading-relaxed">
                    This insight cannot be embedded or shared firm-wide until a senior partner signs off.
                  </p>
                  <Link
                    href="/approvals"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline pt-1"
                  >
                    <span>Open Review Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {selectedStage === 6 && (
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-content-secondary">Vector & Graph Indexing:</div>
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border text-content-primary text-[11px] leading-relaxed space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Qdrant Vector DB:</span>
                    <span className="text-status-success font-semibold">Indexed (384-dim)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Neo4j Graph:</span>
                    <span className="text-status-success font-semibold">Nodes & Edges Linked</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-accent font-semibold">Firm-Wide Published</span>
                  </div>
                </div>
              </div>
            )}

            {selectedStage >= 7 && (
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-content-secondary">RAG & Safe Retrieval:</div>
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border text-content-primary text-[11px] leading-relaxed space-y-2">
                  <p>
                    This precedent is now active in the Safe AI Assistant. Any attorney can query it with automatic citations.
                  </p>
                  <Link
                    href="/assistant"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    <span>Query in AI Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-surface-border text-[11px] text-content-muted flex items-center justify-between">
            <span>Knowledge Item #{pipelineData?.knowledge_item_id || jobId}</span>
            <span>Audit Trail Preserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
