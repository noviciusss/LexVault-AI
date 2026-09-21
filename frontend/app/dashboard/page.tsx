"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Mic,
  UploadCloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Database,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardPage() {
  const { currentUser, setPendingCount } = useAppStore();
  const [stats, setStats] = useState({
    total_captured: 7,
    total_published: 5,
    pending_approval: 2,
    avg_time_to_publish: "4.2 min",
    pii_entities_sanitized: 18,
  });
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, itemsData] = await Promise.all([
          api.admin.getStats().catch(() => null),
          api.knowledge.list().catch(() => []),
        ]);
        if (statsData) {
          setStats(statsData);
          if (statsData.pending_approval !== undefined) {
            setPendingCount(statsData.pending_approval);
          }
        }
        if (itemsData && itemsData.length > 0) {
          setRecentItems(itemsData.slice(0, 6));
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [setPendingCount]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-surface-elevated via-surface to-surface-elevated border border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentUser.firm_name || (currentUser.firm_id === 1 ? "Chandra & Rao Associates (Mumbai)" : "NyayaVault India Platform (New Delhi)")} — Institutional Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            {currentUser.role === "admin"
              ? "You have reviewer authorization. 2 items are currently pending your approval."
              : "Capture your matters, review auto-sanitization, and search firm-wide legal precedents."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/capture"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-background font-semibold text-xs transition-all shadow-gold active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Capture New Insight</span>
          </Link>
          {currentUser.role === "admin" && (
            <Link
              href="/approvals"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-status-warning/15 hover:bg-status-warning/25 text-status-warning border border-status-warning/30 font-semibold text-xs transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Review Approvals ({stats.pending_approval})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span>Captured Matters</span>
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-content-primary">
            {stats.total_captured}
          </div>
          <div className="text-[11px] text-content-secondary flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-status-success" />
            <span>Across 4 practice groups</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span>Published Insights</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-status-success">
            {stats.total_published}
          </div>
          <div className="text-[11px] text-content-secondary">
            <span>Indexed in Qdrant & Neo4j</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span>Pending Gatekeeper</span>
            <Clock className="w-4 h-4 text-status-warning" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-status-warning">
            {stats.pending_approval}
          </div>
          <div className="text-[11px] text-content-secondary">
            <span>Awaiting senior partner review</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span>PII Redacted</span>
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-content-primary">
            {stats.pii_entities_sanitized}
          </div>
          <div className="text-[11px] text-content-secondary">
            <span>Client entities protected</span>
          </div>
        </div>
      </div>

      {/* Quick Intake Modes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-content-primary uppercase tracking-wider text-xs text-accent">
          Instant Knowledge Capture Modes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/capture?mode=text"
            className="p-5 rounded-xl bg-surface border border-surface-border hover:border-accent/40 transition-all flex items-start gap-4 group"
          >
            <div className="p-3 rounded-lg bg-accent/10 text-accent border border-accent/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-content-primary group-hover:text-accent transition-colors">
                Dictated Attorney Notes
              </h4>
              <p className="text-xs text-content-secondary mt-1">
                Paste raw meeting thoughts or settlement negotiations for local AI structuring.
              </p>
            </div>
          </Link>

          <Link
            href="/capture?mode=voice"
            className="p-5 rounded-xl bg-surface border border-surface-border hover:border-accent/40 transition-all flex items-start gap-4 group"
          >
            <div className="p-3 rounded-lg bg-status-warning/10 text-status-warning border border-status-warning/20 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-content-primary group-hover:text-status-warning transition-colors">
                Voice Audio Memo
              </h4>
              <p className="text-xs text-content-secondary mt-1">
                Record on your browser. Transcribed with local faster-whisper on-device.
              </p>
            </div>
          </Link>

          <Link
            href="/capture?mode=ocr"
            className="p-5 rounded-xl bg-surface border border-surface-border hover:border-accent/40 transition-all flex items-start gap-4 group"
          >
            <div className="p-3 rounded-lg bg-status-info/10 text-status-info border border-status-info/20 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-content-primary group-hover:text-status-info transition-colors">
                Document / Contract OCR
              </h4>
              <p className="text-xs text-content-secondary mt-1">
                Upload redacted filings or contract scan PDFs for automated clause ingestion.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Published Precedents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-content-primary">Recently Published Institutional Insights</h3>
          <Link href="/knowledge-hub" className="text-xs text-accent hover:underline flex items-center gap-1">
            <span>Explore Knowledge Hub</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated text-content-muted uppercase text-[10px] tracking-wider border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Title & Matter</th>
                  <th className="py-3 px-4">Practice Area</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-content-primary max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 text-content-secondary">
                      {item.practice_area}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-success/15 text-status-success border border-status-success/25">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-content-muted">
                      Stage 6 (Vector+Graph)
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/knowledge-hub?id=${item.id}`}
                        className="text-accent hover:underline text-xs"
                      >
                        Inspect Precedent
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-content-muted">
                      No items loaded yet. Seed data is populating...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
