"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  FileText,
  Cpu,
  ShieldAlert,
  Brain,
  UserCheck,
  Database,
  Search,
  CheckCircle,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export interface StageData {
  stage: number;
  name: string;
  subtitle: string;
  status: "pending" | "running" | "done" | "failed" | "waiting_approval";
  output?: any;
  iconName?: string;
  selectedStage?: number;
  onSelectStage?: (stage: number) => void;
}

const STAGE_CONFIGS = [
  { stage: 1, name: "Raw Capture", subtitle: "Notes / Voice / OCR", icon: FileText },
  { stage: 2, name: "Local AI Processing", subtitle: "On-device structure & title", icon: Cpu },
  { stage: 3, name: "PII Sanitization", subtitle: "Presidio entity redaction", icon: ShieldAlert },
  { stage: 4, name: "Strategy Abstraction", subtitle: "Generalize facts to principles", icon: Brain },
  { stage: 5, name: "Lawyer Approval Gate", subtitle: "Human-in-the-loop audit", icon: UserCheck },
  { stage: 6, name: "Vector & Graph DB", subtitle: "Qdrant + Neo4j indexing", icon: Database },
  { stage: 7, name: "RAG Retrieval", subtitle: "Hybrid semantic & graph walk", icon: Search },
  { stage: 8, name: "Safe Response", subtitle: "Grounded & cited response", icon: CheckCircle },
];

function PipelineStageNode({ data }: NodeProps<StageData>) {
  const isSelected = data.stage === data.selectedStage;
  const config = STAGE_CONFIGS[data.stage - 1] || STAGE_CONFIGS[0];
  const Icon = config.icon;

  let statusBadge = (
    <span className="flex items-center gap-1 text-[10px] text-content-muted">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
  let borderClass = "border-surface-border";
  let pulseGlow = "";

  if (data.status === "running") {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] text-accent font-semibold">
        <Loader2 className="w-3 h-3 animate-spin" /> In Progress
      </span>
    );
    borderClass = "border-accent shadow-gold";
    pulseGlow = "animate-pulse-gold";
  } else if (data.status === "waiting_approval") {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] text-status-warning font-semibold">
        <AlertTriangle className="w-3 h-3" /> Awaiting Sign-off
      </span>
    );
    borderClass = "border-status-warning shadow-md shadow-status-warning/20";
  } else if (data.status === "done") {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] text-status-success font-semibold">
        <CheckCircle className="w-3 h-3" /> Verified Done
      </span>
    );
    borderClass = "border-status-success/50";
  } else if (data.status === "failed") {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] text-status-danger font-semibold">
        <AlertTriangle className="w-3 h-3" /> Declined
      </span>
    );
    borderClass = "border-status-danger";
  }

  return (
    <div
      onClick={() => data.onSelectStage && data.onSelectStage(data.stage)}
      className={`w-56 p-3.5 rounded-xl bg-surface-elevated/95 backdrop-blur-md border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${borderClass} ${pulseGlow} ${
        isSelected ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-accent !w-2 !h-2" />
      
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            data.status === "done"
              ? "bg-status-success/15 text-status-success border border-status-success/30"
              : data.status === "running"
              ? "bg-accent/20 text-accent border border-accent/40"
              : data.status === "waiting_approval"
              ? "bg-status-warning/20 text-status-warning border border-status-warning/40"
              : "bg-surface text-content-muted border border-surface-border"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
              Stage {data.stage}
            </span>
            {statusBadge}
          </div>
          <h4 className="text-xs font-semibold text-content-primary truncate">{data.name}</h4>
          <p className="text-[10px] text-content-secondary truncate">{config.subtitle}</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-accent !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  stageNode: PipelineStageNode,
};

interface PipelineDiagramProps {
  stages: Array<{
    stage: number;
    name: string;
    status: "pending" | "running" | "done" | "failed" | "waiting_approval";
    output?: any;
  }>;
  selectedStage?: number;
  onSelectStage?: (stage: number) => void;
  className?: string;
}

export default function PipelineDiagram({
  stages,
  selectedStage = 1,
  onSelectStage,
  className = "h-[450px]",
}: PipelineDiagramProps) {
  // Generate 8 nodes arranged in 2 rows of 4 (or 1 horizontal line)
  const nodes: Node[] = useMemo(() => {
    return STAGE_CONFIGS.map((cfg, idx) => {
      // 2 rows of 4 stages: Row 1 goes Left->Right, Row 2 goes Right->Left or Left->Right
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const stageData = stages.find((s) => s.stage === cfg.stage) || {
        stage: cfg.stage,
        name: cfg.name,
        status: "pending",
        output: null,
      };

      return {
        id: `stage-${cfg.stage}`,
        type: "stageNode",
        position: { x: col * 260 + 20, y: row * 150 + 30 },
        data: {
          ...stageData,
          selectedStage,
          onSelectStage,
        },
      };
    });
  }, [stages, selectedStage, onSelectStage]);

  // Generate 7 connecting edges with active glowing flow
  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];
    for (let i = 1; i < 8; i++) {
      const sourceStage = stages.find((s) => s.stage === i);
      const targetStage = stages.find((s) => s.stage === i + 1);
      const isFlowing =
        (sourceStage?.status === "done" && targetStage?.status === "running") ||
        (sourceStage?.status === "done" && targetStage?.status === "waiting_approval");
      const isCompleted = sourceStage?.status === "done" && targetStage?.status === "done";

      list.push({
        id: `e-${i}-${i + 1}`,
        source: `stage-${i}`,
        target: `stage-${i + 1}`,
        animated: isFlowing,
        className: isFlowing ? "pipeline-edge-active" : "",
        style: {
          stroke: isFlowing ? "#C9A24B" : isCompleted ? "#2FBF8F" : "rgba(255, 255, 255, 0.15)",
          strokeWidth: isFlowing ? 2.5 : 1.5,
        },
      });
    }
    return list;
  }, [stages]);

  return (
    <div className={`w-full rounded-2xl border border-surface-border bg-background/90 relative overflow-hidden ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.5}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#1A2230" gap={16} size={1} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
