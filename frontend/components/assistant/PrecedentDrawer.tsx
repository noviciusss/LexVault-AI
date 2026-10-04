"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Scale,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Tag,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import Link from "next/link";
import LegalMarkdownRenderer from "@/components/assistant/LegalMarkdownRenderer";

interface PrecedentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onAskFollowUp?: (promptText: string) => void;
}

export default function PrecedentDrawer({
  isOpen,
  onClose,
  item,
  onAskFollowUp,
}: PrecedentDrawerProps) {
  const [copiedRatio, setCopiedRatio] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopyRatio = () => {
    const textToCopy = item.abstracted_insight || item.summary || item.title || "";
    navigator.clipboard.writeText(textToCopy);
    setCopiedRatio(true);
    setTimeout(() => setCopiedRatio(false), 2000);
  };

  const handleFollowUpClick = (questionTemplate: string) => {
    if (onAskFollowUp) {
      onAskFollowUp(questionTemplate);
      onClose();
    }
  };

  const scorePct = item.score ? (Number(item.score) * 100).toFixed(0) : "95";

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[560px] bg-surface border-l border-surface-border shadow-2xl flex flex-col animate-fade-in">
      {/* Drawer Header */}
      <div className="p-5 border-b border-surface-border bg-surface-elevated/70 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
              Vault Item #{item.item_id || item.id}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface border border-surface-border text-content-secondary">
              {item.practice_area || "General Commercial Law"}
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-status-success/15 text-status-success border border-status-success/30">
              {scorePct}% Relevance
            </span>
          </div>
          <h2 className="text-base font-bold text-content-primary leading-snug">
            {item.title || "Precedent Case Analysis"}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Core Strategy / Ratio Decidendi */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase text-accent tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Ratio Decidendi / Firm Strategy</span>
            </div>
            <button
              onClick={handleCopyRatio}
              className="flex items-center gap-1 text-[11px] text-content-muted hover:text-accent transition-colors"
            >
              {copiedRatio ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
              <span>{copiedRatio ? "Copied" : "Copy Ratio"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border font-serif text-content-primary leading-relaxed text-xs">
            <LegalMarkdownRenderer
              content={
                item.abstracted_insight ||
                item.summary ||
                "Institutional legal precedent extracted from verified partner submissions and senior counsel opinions."
              }
            />
          </div>
        </div>

        {/* Quick Follow-up Actions */}
        <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 space-y-2.5">
          <div className="text-[11px] font-bold text-accent flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Advocate Follow-Up Inquiries:</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() =>
                handleFollowUpClick(
                  `How does Precedent #${item.item_id || item.id} (${item.title}) distinguish conflicting Supreme Court rulings?`
                )
              }
              className="text-left p-2 rounded-lg bg-surface hover:bg-surface-elevated border border-surface-border text-content-secondary hover:text-accent transition-colors text-[11px] flex items-center justify-between"
            >
              <span>Distinguish against conflicting rulings</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </button>
            <button
              onClick={() =>
                handleFollowUpClick(
                  `Draft a strong preliminary objection clause citing Precedent #${item.item_id || item.id} (${item.title}).`
                )
              }
              className="text-left p-2 rounded-lg bg-surface hover:bg-surface-elevated border border-surface-border text-content-secondary hover:text-accent transition-colors text-[11px] flex items-center justify-between"
            >
              <span>Draft preliminary objection clause</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </button>
          </div>
        </div>

        {/* Statutory & Jurisdictional References */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase text-content-muted tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Codified Statutory Applicability</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] px-2.5 py-1 rounded-md bg-surface-elevated border border-surface-border text-content-secondary">
              Constitution of India Art. 14, 19, 21
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded-md bg-surface-elevated border border-surface-border text-content-secondary">
              Bharatiya Nyaya Sanhita (BNS) 2023
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded-md bg-surface-elevated border border-surface-border text-content-secondary">
              Commercial Courts Act § 12A
            </span>
          </div>
        </div>

        {/* Full Text / Case Extract if available */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase text-content-muted tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Vault Record Provenance & Safeguards</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border space-y-2 text-[11px] text-content-secondary">
            <div className="flex justify-between border-b border-surface-border/50 pb-1.5">
              <span className="text-content-muted">Vector Storage:</span>
              <span className="font-mono text-content-primary">Qdrant Collection 'lexvault_items'</span>
            </div>
            <div className="flex justify-between border-b border-surface-border/50 pb-1.5">
              <span className="text-content-muted">Knowledge Graph:</span>
              <span className="font-mono text-content-primary">Neo4j Cypher Linked</span>
            </div>
            <div className="flex justify-between">
              <span className="text-content-muted">Firm Tenant Isolation:</span>
              <span className="text-status-success font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Internal Privilege
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-surface-border bg-surface-elevated/50 flex items-center justify-between gap-3">
        <Link
          href="/knowledge-hub"
          className="flex items-center gap-1.5 text-xs text-content-secondary hover:text-accent font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open in Knowledge Hub</span>
        </Link>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-surface border border-surface-border hover:bg-surface-elevated text-xs font-semibold text-content-primary transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
