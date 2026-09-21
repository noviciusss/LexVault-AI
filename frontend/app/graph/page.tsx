"use client";

import React, { useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Share2, BookOpen, Layers, Users, Loader2, Sparkles, Filter } from "lucide-react";
import { api } from "@/lib/api";

function ConceptNode({ data }: NodeProps) {
  const isKnowledge = data.type === "KnowledgeItem";
  const isPractice = data.type === "PracticeArea";
  const isLawyer = data.type === "Lawyer";

  let bgClass = "bg-accent/20 border-accent/60 text-accent";
  let labelIcon = <Sparkles className="w-3 h-3" />;

  if (isKnowledge) {
    bgClass = "bg-surface-elevated border-white/20 text-content-primary";
    labelIcon = <BookOpen className="w-3 h-3 text-status-info" />;
  } else if (isPractice) {
    bgClass = "bg-status-success/20 border-status-success/50 text-status-success";
    labelIcon = <Layers className="w-3 h-3" />;
  } else if (isLawyer) {
    bgClass = "bg-surface border-content-muted text-content-secondary";
    labelIcon = <Users className="w-3 h-3" />;
  }

  return (
    <div
      onClick={() => data.onSelect && data.onSelect(data)}
      className={`px-3 py-2 rounded-xl border backdrop-blur-md text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 transition-all ${bgClass}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent !w-1.5 !h-1.5" />
      {labelIcon}
      <span className="truncate max-w-[160px]">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-accent !w-1.5 !h-1.5" />
    </div>
  );
}

const nodeTypes = {
  conceptNode: ConceptNode,
};

export default function GraphExplorerPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  useEffect(() => {
    async function loadGraph() {
      try {
        const data = await api.graph.getGraph();
        setGraphData(data);
      } catch (err) {
        console.error("Failed to load graph data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, []);

  // Compute layout positions for React Flow
  const flowNodes: Node[] = useMemo(() => {
    return graphData.nodes.map((n, idx) => {
      // Circular layout arrangement
      const angle = (idx / Math.max(graphData.nodes.length, 1)) * 2 * Math.PI;
      const radius = n.type === "KnowledgeItem" ? 220 : n.type === "Concept" ? 340 : 130;
      const x = 400 + radius * Math.cos(angle);
      const y = 300 + radius * Math.sin(angle);

      return {
        id: n.id,
        type: "conceptNode",
        position: { x, y },
        data: {
          ...n,
          onSelect: setSelectedNode,
        },
      };
    });
  }, [graphData.nodes]);

  const flowEdges: Edge[] = useMemo(() => {
    return graphData.edges.map((e, idx) => ({
      id: e.id || `edge-${idx}`,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: "rgba(201, 162, 75, 0.4)", strokeWidth: 1.5 },
    }));
  }, [graphData.edges]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
            <Share2 className="w-4 h-4" />
            <span>Stage 6 Graph: Neo4j Knowledge Graph</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-content-primary">
            Institutional Knowledge Graph Explorer
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Visualize relationships across practice groups, precedent doctrines, and senior attorney insights.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-content-primary">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-elevated border border-white/40" />
            <span>Knowledge Item</span>
          </span>
          <span className="flex items-center gap-1 text-accent">
            <span className="w-2.5 h-2.5 rounded-full bg-accent/40 border border-accent" />
            <span>Legal Concept</span>
          </span>
          <span className="flex items-center gap-1 text-status-success">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success/40 border border-status-success" />
            <span>Practice Area</span>
          </span>
        </div>
      </div>

      {/* Main Split: Graph Canvas & Node Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl border border-surface-border bg-background/90 h-[560px] overflow-hidden relative">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-content-muted gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Querying Neo4j relational graph...</span>
            </div>
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
            >
              <Background color="#1A2230" gap={18} size={1} />
              <Controls position="bottom-right" />
            </ReactFlow>
          )}
        </div>

        {/* Side Detail Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-surface-border pb-3">
              <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
                Graph Node Inspector
              </span>
              <h3 className="text-base font-bold text-content-primary mt-1">
                {selectedNode ? selectedNode.label : "Click a graph node to inspect"}
              </h3>
              {selectedNode && (
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border space-y-2">
                  <div className="text-content-secondary">Graph Element ID:</div>
                  <div className="font-mono text-content-primary text-[11px]">{selectedNode.id}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border space-y-2">
                  <div className="text-content-secondary">Relational Connections:</div>
                  <div className="text-[11px] text-content-primary">
                    Traversed via Neo4j Cypher MATCH query. Integrated into Stage 7 RAG context expansion.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-content-muted text-xs">
                Select any node in the canvas to see connected doctrines and knowledge items.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-surface-border text-[11px] text-content-muted">
            Neo4j 5 Community • Cypher Graph Engine
          </div>
        </div>
      </div>
    </div>
  );
}
