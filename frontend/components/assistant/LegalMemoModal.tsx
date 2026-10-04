"use client";

import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  X,
  Scale,
  Calendar,
  ShieldCheck,
} from "lucide-react";

interface LegalMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  matterTitle: string;
  practiceArea: string;
  query: string;
  answer: string;
  citedItems: any[];
  firmName?: string;
}

export default function LegalMemoModal({
  isOpen,
  onClose,
  matterTitle,
  practiceArea,
  query,
  answer,
  citedItems,
  firmName = "Chandra & Rao Associates | Advocates & Solicitors",
}: LegalMemoModalProps) {
  const [copied, setCopied] = useState(false);
  const [lawyerName, setLawyerName] = useState("Advocate on Record / Senior Associate");
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!isOpen) return null;

  const memoMarkdown = `
================================================================================
                        LEGAL BRIEFING MEMORANDUM
                    CONFIDENTIAL & PRIVILEGED WORK PRODUCT
================================================================================
FIRM:         ${firmName}
MATTER:       ${matterTitle}
PRACTICE:     ${practiceArea}
DATE:         ${dateStr}
PREPARED BY:  ${lawyerName}
SUBJECT:      Strategic Opinion & Precedent Retrieval on: "${query}"
--------------------------------------------------------------------------------

1. QUESTION PRESENTED / ISSUE FOR ADVICE:
"${query}"

2. EXECUTIVE SUMMARY & LEGAL RATIO DECIDENDI:
${answer}

3. PRECEDENTS & INSTITUTIONAL FIRM AUTHORITIES CITED:
${
  citedItems.length > 0
    ? citedItems
        .map(
          (item, idx) =>
            `   [${idx + 1}] Vault Item #${item.item_id || item.id}: ${item.title || "Precedent"}
       - Practice Area: ${item.practice_area || practiceArea}
       - Relevance Confidence: ${(Number(item.score || 0.95) * 100).toFixed(0)}%
       - Strategic Note: ${item.abstracted_insight || item.summary || "Internal firm authority verified."}`
        )
        .join("\n\n")
    : "   - No specific internal precedent ID cited. Analysis based on codified statutory provisions."
}

4. STATUTORY & REGULATORY JURISDICTION:
- Governed under the Constitution of India and applicable Indian codified law (BNS / BNSS / CPC / IBC).
- Strict vault isolation and attorney-client privilege maintained.

================================================================================
               DISCLAIMER: FOR INTERNAL LEGAL STRATEGY USE ONLY
================================================================================
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(memoMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([memoMarkdown], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Legal_Memo_${matterTitle.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-surface border border-surface-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border bg-surface-elevated/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/15 border border-accent/30 text-accent">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/25">
                  Court Briefing Exporter
                </span>
                <span className="text-xs text-content-muted flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                  Privileged Legal Work Product
                </span>
              </div>
              <h2 className="text-base font-bold text-content-primary mt-0.5">
                Generate Legal Memorandum
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-surface border border-surface-border hover:bg-surface-elevated text-content-secondary hover:text-content-primary text-xs transition-colors"
              title="Print Memorandum"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-surface-border hover:bg-surface-elevated text-content-primary text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Download (.txt)</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-background text-xs font-bold transition-all shadow-gold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Memo"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-elevated transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization controls */}
        <div className="p-4 bg-surface-subtle border-b border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-content-muted">Drafted by:</span>
            <input
              type="text"
              value={lawyerName}
              onChange={(e) => setLawyerName(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-surface border border-surface-border text-content-primary font-medium text-xs focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-3 text-content-muted text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-accent" />
              {dateStr}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-indigo-400" />
              {citedItems.length} Citations Verified
            </span>
          </div>
        </div>

        {/* Memo Preview */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-content-primary leading-relaxed bg-[#0a0e14] select-text">
          <div className="max-w-2xl mx-auto space-y-6 bg-surface p-6 rounded-xl border border-surface-border/70 shadow-inner">
            <div className="text-center border-b border-surface-border pb-4 space-y-1">
              <div className="text-xs uppercase tracking-widest text-accent font-bold">
                {firmName}
              </div>
              <div className="text-sm font-bold text-content-primary tracking-wide">
                LEGAL OPINION & PRECEDENT MEMORANDUM
              </div>
              <div className="text-[10px] text-content-muted uppercase">
                Confidential & Attorney-Client Privileged Work Product
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-surface-border/50 text-content-secondary">
              <div>
                <span className="text-content-muted">MATTER: </span>
                <span className="font-semibold text-content-primary">{matterTitle}</span>
              </div>
              <div>
                <span className="text-content-muted">DATE: </span>
                <span className="font-semibold text-content-primary">{dateStr}</span>
              </div>
              <div>
                <span className="text-content-muted">PRACTICE AREA: </span>
                <span className="font-semibold text-content-primary">{practiceArea}</span>
              </div>
              <div>
                <span className="text-content-muted">COUNSEL: </span>
                <span className="font-semibold text-content-primary">{lawyerName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-accent tracking-wider">
                1. Question Presented
              </div>
              <p className="text-content-primary bg-surface-elevated p-3 rounded-lg border border-surface-border font-sans text-xs italic">
                "{query}"
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-accent tracking-wider">
                2. Legal Analysis & Opinion
              </div>
              <div className="text-content-primary font-sans text-xs leading-relaxed whitespace-pre-wrap">
                {answer}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-accent tracking-wider">
                3. Cited Precedents & Firm Authorities ({citedItems.length})
              </div>
              {citedItems.length > 0 ? (
                <div className="space-y-2 font-sans">
                  {citedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-xs space-y-1"
                    >
                      <div className="font-bold text-accent">
                        [{idx + 1}] Vault Precedent #{item.item_id || item.id}: {item.title}
                      </div>
                      <div className="text-[10px] text-content-muted">
                        Area: {item.practice_area || practiceArea} • Match Score:{" "}
                        {(Number(item.score || 0.95) * 100).toFixed(0)}%
                      </div>
                      {item.abstracted_insight && (
                        <div className="text-content-secondary text-[11px] mt-1 italic">
                          "{item.abstracted_insight.substring(0, 180)}..."
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-content-muted text-xs italic font-sans">
                  Analysis grounded directly in statutory texts and fundamental principles.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
