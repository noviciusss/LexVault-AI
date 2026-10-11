"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, ShieldCheck, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore, type UserProfile } from "@/store/useAppStore";
import { errorMessage } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
interface AuditEvent {
  id: number;
  actor_id: number;
  actor_name: string;
  action: string;
  timestamp: string;
  target_type: string;
  target_id: number;
  details: string;
}
export default function AdminCompliancePage() {
  const user = useAppStore((state) => state.currentUser);
  const [action, setAction] = useState("");
  const [offset, setOffset] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const logs = useQuery<AuditEvent[]>({
    queryKey: ["audit", user.firm_id, action, offset, start, end],
    queryFn: () => api.admin.getAuditLog(action, offset, start, end),
    enabled: user.role === "admin",
  });
  const users = useQuery<UserProfile[]>({
    queryKey: ["users", user.firm_id],
    queryFn: () => api.admin.getUsers(),
    enabled: user.role === "admin",
  });
  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["ID", "Timestamp", "Actor", "Action", "Target", "Details"],
      ...(logs.data || []).map((log) => [
        log.id,
        log.timestamp,
        log.actor_name || log.actor_id,
        log.action,
        `${log.target_type} #${log.target_id || ""}`,
        log.details,
      ]),
    ];
    const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(escape).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lexvault_firm_${user.firm_id}_audit_page_${offset / 50 + 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  if (user.role !== "admin")
    return (
      <EmptyState
        title="Partner workspace"
        description="Use the senior partner demo role to inspect your firm’s audit trail and access roster."
      />
    );
  return (
    <Reveal className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Firm audit & access"
        title="A clear record of every knowledge decision."
        description="Inspect capture, sanitization, review, and research events for the active firm workspace."
        action={
          <Button variant="secondary" disabled={!logs.data?.length} onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export current page
          </Button>
        }
      />
      <Card className="flex flex-wrap items-end gap-4 p-5">
        <label className="text-xs text-content-secondary">
          Event type
          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setOffset(0);
            }}
            className="mt-2 block min-h-11 rounded-xl border border-surface-border bg-surface-elevated px-3 text-xs"
          >
            <option value="">All events</option>
            {[
              "CAPTURE",
              "PII_STRIPPED",
              "APPROVAL_GRANTED",
              "APPROVAL_REJECTED",
              "KNOWLEDGE_PUBLISHED",
              "AI_ASSISTANT_QUERY",
              "CONSTITUTION_RESEARCH",
            ].map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-content-secondary">
          From
          <Input
            className="mt-2"
            type="date"
            value={start}
            onChange={(event) => {
              setStart(event.target.value);
              setOffset(0);
            }}
          />
        </label>
        <label className="text-xs text-content-secondary">
          Through
          <Input
            className="mt-2"
            type="date"
            value={end}
            onChange={(event) => {
              setEnd(event.target.value);
              setOffset(0);
            }}
          />
        </label>
        <p className="ml-auto flex items-center gap-2 text-xs text-content-muted">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Firm-scoped audit records
        </p>
      </Card>
      {logs.isError ? (
        <ErrorState message={errorMessage(logs.error)} retry={() => logs.refetch()} />
      ) : logs.isPending ? (
        <Skeleton className="h-96" />
      ) : !logs.data?.length ? (
        <EmptyState
          title="No matching audit events"
          description="Change the filters or complete a capture, review, or research action."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Audit events for {user.firm_name}</caption>
              <thead className="border-b border-surface-border bg-surface-elevated text-content-muted">
                <tr>
                  {["Timestamp", "Actor", "Event", "Target", "Details"].map((title) => (
                    <th key={title} scope="col" className="px-4 py-4 font-medium">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {logs.data.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-elevated/50">
                    <td className="whitespace-nowrap px-4 py-4 text-content-muted">
                      {new Date(
                        `${log.timestamp}${log.timestamp.endsWith("Z") ? "" : "Z"}`,
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {log.actor_name === "System" && log.actor_id
                        ? `User #${log.actor_id}`
                        : log.actor_name || "System"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className="whitespace-nowrap text-[10px]">
                        {log.action.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-content-secondary">
                      {log.target_type} #{log.target_id || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelected(log)}
                        className="max-w-xs truncate text-left text-accent"
                      >
                        {log.details || "Inspect event"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-content-muted">Page {offset / 50 + 1} · up to 50 events</span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={offset === 0}
            onClick={() => setOffset((value) => Math.max(0, value - 50))}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={(logs.data?.length || 0) < 50}
            onClick={() => setOffset((value) => value + 50)}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Card className="p-6">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-accent" />
          Firm access roster
        </h2>
        {users.isError ? (
          <ErrorState message={errorMessage(users.error)} retry={() => users.refetch()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.data?.map((person) => (
              <div key={person.id} className="rounded-xl border border-surface-border p-4">
                <h3 className="text-sm font-medium">{person.name}</h3>
                <p className="mb-3 mt-2 break-all text-xs text-content-muted">{person.email}</p>
                <Badge>{person.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Drawer
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={`Audit event #${selected?.id || ""}`}
      >
        <div className="space-y-5">
          <Badge>{selected?.action}</Badge>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected?.details}</p>
          <p className="text-xs text-content-muted">
            Actor #{selected?.actor_id || "System"} · {selected?.target_type} #
            {selected?.target_id || "—"}
          </p>
        </div>
      </Drawer>
    </Reveal>
  );
}
