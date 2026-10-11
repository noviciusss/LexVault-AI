"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  Landmark,
  ArrowRight,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BookOpen,
  Mic,
  UploadCloud,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { Card, Badge, ErrorState, PageHeader, Skeleton } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import type { DashboardStats, KnowledgeItem } from "@/types/domain";
import { errorMessage } from "@/lib/utils";
const KnowledgeChart = dynamic(() => import("@/components/dashboard/KnowledgeChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-60" />,
});

export default function DashboardPage() {
  const user = useAppStore((state) => state.currentUser);
  const stats = useQuery<DashboardStats>({
    queryKey: ["stats", user.firm_id],
    queryFn: () => api.admin.getStats(),
  });
  const items = useQuery<KnowledgeItem[]>({
    queryKey: ["knowledge", user.firm_id],
    queryFn: () => api.knowledge.list(),
  });
  const metrics = [
    { label: "Captured insights", value: stats.data?.total_captured, icon: FileText },
    { label: "Published knowledge", value: stats.data?.total_published, icon: CheckCircle2 },
    { label: "Awaiting review", value: stats.data?.pending_approval, icon: Clock },
    {
      label: "Identifiers sanitized",
      value: stats.data?.pii_entities_sanitized,
      icon: ShieldCheck,
    },
  ];
  return (
    <Reveal className="mx-auto max-w-7xl space-y-7">
      <PageHeader
        eyebrow={user.firm_name || "Firm workspace"}
        title="Your firm’s knowledge, connected."
        description="Continue constitutional research, capture working insights, and track their path to reviewed institutional knowledge."
      />
      <Card className="relative overflow-hidden border-accent/25 p-6 sm:p-8">
        <div className="absolute right-8 top-8 hidden text-accent/10 sm:block">
          <Landmark className="h-32 w-32" strokeWidth={0.75} />
        </div>
        <div className="relative max-w-2xl">
          <Badge>
            <Landmark className="h-3.5 w-3.5" />
            Constitution of India
          </Badge>
          <h2 className="mt-4 font-serif text-2xl font-semibold sm:text-3xl">
            Begin with the constitutional foundation.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-content-secondary">
            Read articles in English or Hindi, explore landmark cases, compare provisions, and
            research with source-linked references.
          </p>
          <Link
            href="/constitution"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-background hover:bg-accent-hover"
          >
            Open research workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
      {stats.isError && (
        <ErrorState message={errorMessage(stats.error)} retry={() => stats.refetch()} />
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-5">
            <div className="flex items-center justify-between gap-2 text-xs text-content-secondary">
              {metric.label}
              <metric.icon className="h-4 w-4 shrink-0 text-accent" />
            </div>
            {stats.isPending ? (
              <Skeleton className="mt-4 h-9 w-20" />
            ) : (
              <div className="mt-3 text-3xl font-semibold tabular-nums">{metric.value ?? "—"}</div>
            )}
            <p className="mt-2 text-[11px] text-content-muted">Current firm workspace</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Knowledge pipeline snapshot</h2>
          <p className="mt-1 text-xs text-content-muted">
            Current captured, published, and pending totals
          </p>
          <KnowledgeChart stats={stats.data} />
          <div className="flex items-center justify-between border-t border-surface-border pt-4 text-xs text-content-secondary">
            <span>Average review-to-publish time</span>
            <span className="font-medium text-accent">
              {stats.data?.avg_time_to_publish || "—"}
            </span>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recently published</h2>
            <Link href="/knowledge-hub" className="text-xs text-accent">
              View all ↗
            </Link>
          </div>
          {items.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : items.isError ? (
            <ErrorState message={errorMessage(items.error)} retry={() => items.refetch()} />
          ) : !items.data?.length ? (
            <p className="py-10 text-center text-sm text-content-muted">
              Approved insights will appear here once published.
            </p>
          ) : (
            <div className="divide-y divide-surface-border">
              {items.data.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/knowledge-hub?id=${item.id}`}
                  className="group flex items-center gap-3 py-4"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium group-hover:text-accent">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-content-muted">{item.practice_area}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-content-muted" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            mode: "text",
            title: "Capture a working note",
            icon: FileText,
            description: "Turn matter insights into reusable knowledge.",
          },
          {
            mode: "voice",
            title: "Record a voice memo",
            icon: Mic,
            description: "Capture your reasoning while it is fresh.",
          },
          {
            mode: "ocr",
            title: "Extract document text",
            icon: UploadCloud,
            description: "Process legal documents through the review pipeline.",
          },
        ].map((item) => (
          <Link
            key={item.mode}
            href={`/capture?mode=${item.mode}`}
            className="flex gap-4 rounded-2xl border border-surface-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <item.icon className="mt-1 h-5 w-5 shrink-0 text-accent" />
            <div>
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-content-muted">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}
