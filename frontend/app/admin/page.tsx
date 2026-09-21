"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Download,
  Filter,
  Users,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  BotMessageSquare,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminCompliancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("ALL");

  const loadData = async (actionFilter?: string) => {
    setLoading(true);
    try {
      const [logsData, usersData] = await Promise.all([
        api.admin.getAuditLog(actionFilter === "ALL" ? undefined : actionFilter),
        api.admin.getUsers().catch(() => []),
      ]);
      setLogs(logsData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filterAction);
  }, [filterAction]);

  const exportCSV = () => {
    if (!logs.length) return;
    const headers = ["ID", "Timestamp", "Actor", "Action", "Target", "Details"];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.timestamp).toISOString(),
      `"${l.actor_name || l.actor_id || "System"}"`,
      l.action,
      `${l.target_type} #${l.target_id || ""}`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lexvault_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Compliance & Legal Malpractice Defense</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
            Institutional Audit & Privilege Trail
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Every PII redaction, lawyer approval, rejection, and AI query is permanently immutably logged for firm compliance.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-surface-border text-content-primary font-semibold text-xs transition-all self-start sm:self-auto hover:border-accent/40"
        >
          <Download className="w-4 h-4 text-accent" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-content-muted text-[11px]">Filter Action:</span>
        {["ALL", "PII_STRIPPED", "APPROVAL_GRANTED", "APPROVAL_REJECTED", "KNOWLEDGE_PUBLISHED", "AI_ASSISTANT_QUERY"].map(
          (act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-xs ${
                filterAction === act
                  ? "bg-accent/20 text-accent font-semibold border border-accent/40 shadow-sm"
                  : "bg-surface text-content-secondary hover:text-content-primary border border-surface-border"
              }`}
            >
              {act}
            </button>
          )
        )}
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-surface border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between text-xs">
          <span className="font-semibold text-content-primary">
            Immutable Audit Events ({logs.length})
          </span>
          <span className="text-content-muted text-[11px]">Sorted chronologically (latest first)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-content-muted text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span>Loading compliance logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-content-muted text-xs">
            No audit log entries recorded for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated text-content-muted uppercase text-[10px] tracking-wider border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Compliance Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border font-mono text-[11px]">
                {logs.map((log) => {
                  let badge = (
                    <span className="px-2 py-0.5 rounded bg-surface-elevated text-content-secondary border border-surface-border">
                      {log.action}
                    </span>
                  );

                  if (log.action === "PII_STRIPPED") {
                    badge = (
                      <span className="px-2 py-0.5 rounded bg-status-danger/15 text-status-danger border border-status-danger/30 font-semibold">
                        PII_STRIPPED
                      </span>
                    );
                  } else if (log.action === "APPROVAL_GRANTED") {
                    badge = (
                      <span className="px-2 py-0.5 rounded bg-status-success/15 text-status-success border border-status-success/30 font-semibold">
                        APPROVAL_GRANTED
                      </span>
                    );
                  } else if (log.action === "APPROVAL_REJECTED") {
                    badge = (
                      <span className="px-2 py-0.5 rounded bg-status-warning/15 text-status-warning border border-status-warning/30 font-semibold">
                        APPROVAL_REJECTED
                      </span>
                    );
                  } else if (log.action === "AI_ASSISTANT_QUERY") {
                    badge = (
                      <span className="px-2 py-0.5 rounded bg-status-info/15 text-status-info border border-status-info/30 font-semibold">
                        AI_ASSISTANT_QUERY
                      </span>
                    );
                  }

                  return (
                    <tr key={log.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-4 text-content-muted whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-content-primary whitespace-nowrap font-sans">
                        {log.actor_name || `User #${log.actor_id || "System"}`}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{badge}</td>
                      <td className="py-3 px-4 text-content-secondary whitespace-nowrap">
                        {log.target_type} #{log.target_id || "-"}
                      </td>
                      <td className="py-3 px-4 text-content-secondary font-sans leading-relaxed max-w-md truncate">
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Firm Users Overview */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
        <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          <span>Active Firm Access Roster</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {users.map((u) => (
            <div key={u.id} className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
              <div className="font-semibold text-content-primary">{u.name}</div>
              <div className="text-content-muted text-[11px]">{u.email}</div>
              <div className="text-[10px] font-bold text-accent uppercase tracking-wider mt-2">
                Role: {u.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
