"use client";
import { useMemo } from "react";
import dagre from "@dagrejs/dagre";
import ReactFlow, { Background, Controls, type Node } from "reactflow";
import "reactflow/dist/style.css";
import type { GraphData, GraphNode } from "@/app/graph/page";
export default function GraphCanvas({
  graph,
  selectedId,
  onSelect,
}: {
  graph: GraphData;
  selectedId?: string;
  onSelect: (node: GraphNode) => void;
}) {
  const nodes = useMemo<Node[]>(() => {
    const layout = new dagre.graphlib.Graph();
    layout.setGraph({ rankdir: "LR", nodesep: 35, ranksep: 80 });
    layout.setDefaultEdgeLabel(() => ({}));
    graph.nodes.forEach((node) => layout.setNode(node.id, { width: 200, height: 70 }));
    graph.edges.forEach((edge) => layout.setEdge(edge.source, edge.target));
    dagre.layout(layout);
    return graph.nodes.map((node) => {
      const position = layout.node(node.id);
      return {
        id: node.id,
        data: { label: node.label },
        position: { x: position.x - 100, y: position.y - 35 },
        style: {
          width: 200,
          padding: 15,
          borderRadius: 12,
          fontSize: 12,
          background: "rgb(var(--surface))",
          color: node.type === "PracticeArea" ? "rgb(var(--accent))" : "rgb(var(--text-primary))",
          border: `1px solid ${node.id === selectedId ? "rgb(var(--accent))" : "rgb(var(--border))"}`,
        },
      };
    });
  }, [graph, selectedId]);
  const edges = graph.edges.map((edge) => ({
    ...edge,
    style: { stroke: "rgb(var(--accent) / .5)" },
    labelStyle: { fill: "rgb(var(--text-muted))", fontSize: 9 },
    labelBgStyle: { fill: "rgb(var(--surface))" },
  }));
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      nodesConnectable={false}
      onNodeClick={(_, node) => {
        const selected = graph.nodes.find((item) => item.id === node.id);
        if (selected) onSelect(selected);
      }}
    >
      <Background color="rgb(var(--border))" gap={22} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
