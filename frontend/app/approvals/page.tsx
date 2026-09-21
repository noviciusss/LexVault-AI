"use client";

import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function ApprovalsPage() {
  const { currentUser, setPendingCount } = useAppStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadApprovals = async () => {
    try {
      const data = await api.approvals.list();
      setItems(data || []);
      setPendingCount(data?.length || 0);
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAction = async (itemId: number, action: "approve" | "reject") => {
    setProcessingId(itemId);
    try {
      const textToSubmit = editingId === itemId ? editedText : undefined;
      await api.approvals.takeAction(itemId, action, textToSubmit);

      if (action === "approve") {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#C9A24B", "#2FBF8F", "#ffffff"],
        });
      }

      // Remove from list
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setPendingCount(items.length - 1);
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || "Failed to submit approval action");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-status-warning uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Stage 5: Human-In-The-Loop Approval Gate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
            Senior Partner Review Queue
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Review sanitized legal matter facts and abstracted strategy before firm-wide publication to Qdrant & Neo4j.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs">
          <span className="text-content-muted">Reviewer:</span>
          <span className="font-semibold text-accent">{currentUser.name}</span>
        </div>
      </div>

      {/* Approvals List */}
      {loading ? (
        <div className="p-12 text-center text-content-muted text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span>Loading pending submissions...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface border border-surface-border space-y-3">
          <div className="w-12 h-12 rounded-full bg-status-success/15 text-status-success mx-auto flex items-center justify-center border border-status-success/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-content-primary">Queue Clean — All Clear!</h3>
          <p className="text-xs text-content-secondary max-w-sm mx-auto">
            No items are currently awaiting partner sign-off. New submissions from the Capture Intake will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const isProcessing = processingId === item.id;

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-surface border border-surface-border hover:border-accent/30 transition-all space-y-5"
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
                        {item.practice_area || "General"}
                      </span>
                      <span className="text-xs text-content-muted">Item #{item.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-content-primary">{item.title}</h3>
                  </div>

                  <div className="text-[11px] text-status-warning bg-status-warning/10 px-3 py-1 rounded-full border border-status-warning/20 font-medium self-start">
                    Pending Partner Gatekeeper
                  </div>
                </div>

                {/* Side-by-Side: Sanitized Facts vs Abstracted Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Sanitized Facts + PII Diff */}
                  <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-content-secondary">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        <span>Sanitized Fact Record (PII Stripped)</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-content-primary font-mono leading-relaxed max-h-48 overflow-y-auto">
                      {item.sanitized_text}
                    </div>

                    {item.pii_entities_found && item.pii_entities_found.length > 0 && (
                      <div className="pt-2 border-t border-surface-border/50 text-[10px] text-content-muted">
                        <span className="font-semibold text-status-danger">Presidio Redacted: </span>
                        {item.pii_entities_found.map((e: any) => e.entity_type).join(", ") || "Client identifiers"}
                      </div>
                    )}
                  </div>

                  {/* Right: Abstracted Strategy */}
                  <div className="p-4 rounded-xl bg-surface-elevated border border-accent/30 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-accent">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Proposed Institutional Precedent</span>
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditedText(item.abstracted_insight);
                          }}
                          className="text-[11px] hover:underline flex items-center gap-1 text-content-secondary hover:text-accent"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <textarea
                        rows={6}
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full p-3 rounded-lg bg-surface border border-accent text-[11px] text-content-primary focus:outline-none leading-relaxed"
                      />
                    ) : (
                      <div className="text-[11px] text-content-primary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {item.abstracted_insight}
                      </div>
                    )}
                  </div>
                </div>

                {/* Partner Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-surface-border">
                  <div className="text-[11px] text-content-muted">
                    Sign-off logs actor #{currentUser.id} into permanent immutable audit trail.
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAction(item.id, "reject")}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-status-danger/15 hover:text-status-danger text-content-secondary text-xs font-medium border border-surface-border transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleAction(item.id, "approve")}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-status-success hover:bg-status-success/90 text-background text-xs font-bold transition-all shadow-sm disabled:opacity-50 active:scale-95"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing to Vector & Graph...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isEditing ? "Save Edits & Approve" : "Approve & Publish"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
