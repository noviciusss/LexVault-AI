"use client";

import React from "react";
import { Scale, BookOpen, ExternalLink } from "lucide-react";

interface LegalMarkdownRendererProps {
  content: string;
  onCiteClick?: (itemId: string | number) => void;
  isStreaming?: boolean;
}

/**
 * Parses inline formatting: **bold**, *italic*, and [Knowledge Item #<id>]
 */
function renderInline(text: string, onCiteClick?: (id: string | number) => void): React.ReactNode[] {
  // Regex to split on [Knowledge Item #\d+], **bold**, and *italic*
  const pattern = /(\[Knowledge Item #\d+\]|\*\*[^*]+?\*\*|\*[^*]+?\*|__[^_]+?__)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Knowledge Item Citation Chip: [Knowledge Item #12]
    const kiMatch = part.match(/\[Knowledge Item #(\d+)\]/);
    if (kiMatch) {
      const id = kiMatch[1];
      return (
        <span
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            if (onCiteClick) onCiteClick(id);
          }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 rounded bg-accent/15 text-accent border border-accent/30 text-[11px] font-mono font-semibold cursor-pointer hover:bg-accent/25 hover:border-accent transition-all select-none align-baseline shadow-xs"
          title={`Click to inspect Knowledge Item #${id} in side drawer`}
        >
          <Scale className="w-3 h-3 text-accent" />
          <span>KI #{id}</span>
        </span>
      );
    }

    // 2. Bold text: **text** or __text__
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-content-primary">
          {renderInline(inner, onCiteClick)}
        </strong>
      );
    }

    // 3. Italic text: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-content-secondary">
          {renderInline(inner, onCiteClick)}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export default function LegalMarkdownRenderer({
  content,
  onCiteClick,
  isStreaming = false,
}: LegalMarkdownRendererProps) {
  if (!content) {
    return isStreaming ? (
      <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle" />
    ) : null;
  }

  // Split into lines and group into structured blocks
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let currentBlockquote: string[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushBlockquote = (key: number) => {
    if (currentBlockquote.length > 0) {
      elements.push(
        <div
          key={`bq-${key}`}
          className="my-3 pl-3.5 pr-2 py-2 rounded-r-lg bg-surface-elevated/70 border-l-2 border-accent text-xs italic text-content-secondary font-serif leading-relaxed"
        >
          {currentBlockquote.map((line, bqIdx) => (
            <div key={bqIdx}>{renderInline(line, onCiteClick)}</div>
          ))}
        </div>
      );
      currentBlockquote = [];
    }
  };

  const flushList = (key: number) => {
    if (currentList) {
      if (currentList.type === "ul") {
        elements.push(
          <ul key={`ul-${key}`} className="my-2.5 space-y-1.5 pl-4 text-xs font-sans list-none">
            {currentList.items.map((item, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2">
                <span className="text-accent font-bold mt-1 text-[10px] select-none">•</span>
                <span className="flex-1 leading-relaxed text-content-secondary">
                  {renderInline(item, onCiteClick)}
                </span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${key}`} className="my-2.5 space-y-1.5 pl-2 text-xs font-sans list-none">
            {currentList.items.map((item, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2">
                <span className="text-accent font-mono font-bold text-[11px] min-w-[20px] select-none">
                  {lIdx + 1}.
                </span>
                <span className="flex-1 leading-relaxed text-content-secondary">
                  {renderInline(item, onCiteClick)}
                </span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Empty line
    if (!trimmed) {
      flushBlockquote(i);
      flushList(i);
      continue;
    }

    // 2. Horizontal divider
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushBlockquote(i);
      flushList(i);
      elements.push(<hr key={`hr-${i}`} className="my-3.5 border-t border-surface-border/60" />);
      continue;
    }

    // 3. Blockquote
    if (rawLine.startsWith(">") || trimmed.startsWith(">")) {
      flushList(i);
      const bqText = rawLine.replace(/^\s*>\s?/, "");
      currentBlockquote.push(bqText);
      continue;
    } else {
      flushBlockquote(i);
    }

    // 4. Bullet list (- or *)
    const bulletMatch = rawLine.match(/^\s*[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList(i);
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // 5. Numbered list (1. or 1) )
    const numberedMatch = rawLine.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList(i);
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numberedMatch[2]);
      continue;
    }

    flushList(i);

    // 6. Major Court / Pleading Caps Centerpiece (e.g. IN THE NATIONAL COMPANY LAW TRIBUNAL, VERSUS)
    const isCourtCaps =
      (trimmed.startsWith("**IN THE") && trimmed.endsWith("**")) ||
      trimmed === "VERSUS" ||
      trimmed === "**VERSUS**" ||
      trimmed === "**(Operational Creditor – “Petitioner”)**" ||
      trimmed === "**Versus**";

    if (isCourtCaps) {
      const cleanText = trimmed.replace(/\*\*/g, "");
      elements.push(
        <div
          key={`court-header-${i}`}
          className="my-2.5 text-center font-serif text-xs font-bold text-accent uppercase tracking-widest bg-accent/5 py-1 px-3 rounded border border-accent/20"
        >
          {cleanText}
        </div>
      );
      continue;
    }

    // 7. Headings (#, ##, ###)
    if (trimmed.startsWith("### ")) {
      const headingText = trimmed.slice(4).replace(/\*\*/g, "");
      elements.push(
        <h4
          key={`h3-${i}`}
          className="mt-4 mb-2 text-xs font-bold text-accent uppercase tracking-wider font-serif border-b border-surface-border/40 pb-1 flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{renderInline(headingText, onCiteClick)}</span>
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const headingText = trimmed.slice(3).replace(/\*\*/g, "");
      elements.push(
        <h3
          key={`h2-${i}`}
          className="mt-4 mb-2 text-sm font-bold text-content-primary font-serif tracking-tight flex items-center gap-2"
        >
          <span>{renderInline(headingText, onCiteClick)}</span>
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      const headingText = trimmed.slice(2).replace(/\*\*/g, "");
      elements.push(
        <h2
          key={`h1-${i}`}
          className="mt-4 mb-2.5 text-base font-bold text-content-primary font-serif tracking-tight border-b border-accent/30 pb-1"
        >
          {renderInline(headingText, onCiteClick)}
        </h2>
      );
      continue;
    }

    // 8. Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-xs text-content-primary font-serif leading-relaxed">
        {renderInline(rawLine, onCiteClick)}
      </p>
    );
  }

  // Flush remaining
  flushBlockquote(lines.length);
  flushList(lines.length);

  return (
    <div className="space-y-1">
      {elements}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse align-middle" />
      )}
    </div>
  );
}
