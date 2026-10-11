"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import dagre from "@dagrejs/dagre";
import { Search, BookOpen, ArrowUpRight, Network } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import {
  Card,
  Badge,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { errorMessage } from "@/lib/utils";
const GraphCanvas = dynamic(() => import("@/components/graph/GraphCanvas"), {
  ssr: false,
  loading: () => <Skeleton className="h-[560px]" />,
});
export interface GraphNode {
  id: string;
  label: string;
  type: string;
  data?: { itemId?: number; practiceArea?: string };
}
export interface GraphData {
  nodes: GraphNode[];
  edges: { id: string; source: string; target: string; label: string }[];
}
export default function GraphExplorerPage() {
  const user = useAppStore((state) => state.currentUser);
  const query = useQuery<GraphData>({
    queryKey: ["graph", user.firm_id],
    queryFn: () => api.graph.getGraph(),
  });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const filtered = useMemo(() => {
    if (!query.data) return { nodes: [], edges: [] };
    const matches = query.data.nodes.filter((node) =>
      node.label.toLowerCase().includes(search.toLowerCase()),
    );
    const ids = new Set(matches.map((node) => node.id));
    const edges = query.data.edges.filter((edge) => ids.has(edge.source) || ids.has(edge.target));
    edges.forEach((edge) => {
      ids.add(edge.source);
      ids.add(edge.target);
    });
    return { nodes: query.data.nodes.filter((node) => ids.has(node.id)), edges };
  }, [query.data, search]);
  return (
    <Reveal className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Knowledge relationships"
        title="See how your firm’s reasoning connects."
        description="Explore published insights and their practice areas. Select a node to inspect its connections and open the source record."
      />
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-content-muted" />
        <Input
          className="pl-9"
          aria-label="Search graph nodes"
          placeholder="Find a precedent or practice area…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {query.isError ? (
        <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />
      ) : query.isPending ? (
        <Skeleton className="h-[560px]" />
      ) : !filtered.nodes.length ? (
        <EmptyState
          title="No matching relationships"
          description="Publish a reviewed insight or try another search term."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="h-[560px] overflow-hidden">
            <GraphCanvas graph={filtered} selectedId={selected?.id} onSelect={setSelected} />
          </Card>
          <Card className="p-5">
            <Badge>
              <Network className="h-3 w-3" />
              Node inspector
            </Badge>
            <h2 className="mt-5 text-lg font-semibold">
              {selected?.label || "Choose a graph node"}
            </h2>
            <p className="mt-3 text-xs text-content-muted">
              {selected
                ? selected.type
                : "Connections reveal how institutional knowledge is organized."}
            </p>
            {selected && (
              <div className="mt-6 space-y-3">
                {query.data?.edges
                  .filter((edge) => edge.source === selected.id || edge.target === selected.id)
                  .map((edge) => {
                    const neighbor = query.data?.nodes.find(
                      (node) =>
                        node.id === (edge.source === selected.id ? edge.target : edge.source),
                    );
                    return (
                      <button
                        key={edge.id}
                        className="block w-full rounded-xl border border-surface-border p-3 text-left text-sm text-content-secondary hover:border-accent/40"
                        onClick={() => neighbor && setSelected(neighbor)}
                      >
                        {neighbor?.label}
                        <span className="mt-1 block text-[10px] text-content-muted">
                          {edge.label}
                        </span>
                      </button>
                    );
                  })}
                {selected.data?.itemId && (
                  <Link
                    href={`/knowledge-hub?id=${selected.data.itemId}`}
                    className="inline-flex items-center gap-2 text-sm text-accent"
                  >
                    <BookOpen className="h-4 w-4" />
                    Open source <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </Reveal>
  );
}
