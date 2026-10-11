"use client";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, ArrowUpRight, Sparkles } from "lucide-react";
import { Badge, Button, Drawer } from "@/components/ui/primitives";
import type { KnowledgeItem } from "@/types/domain";
import LegalMarkdownRenderer from "./LegalMarkdownRenderer";
interface Source extends KnowledgeItem {
  insight?: string;
  summary?: string;
}
export default function PrecedentDrawer({
  isOpen,
  onClose,
  item,
  onAskFollowUp,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: Source | null;
  onAskFollowUp?: (prompt: string) => void;
}) {
  const text =
    item?.abstracted_insight || item?.insight || item?.summary || "No source text is available.";
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={item?.title || "Source record"}
    >
      {item && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge>Firm source #{item.item_id || item.id}</Badge>
            <Badge>{item.practice_area}</Badge>
            {typeof item.score === "number" && <Badge>Similarity {item.score.toFixed(2)}</Badge>}
          </div>
          <LegalMarkdownRenderer content={text} />
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                toast.success("Source text copied");
              } catch {
                toast.error("Clipboard is unavailable");
              }
            }}
          >
            <Copy className="h-4 w-4" />
            Copy source
          </Button>
          {onAskFollowUp && (
            <Button
              variant="ghost"
              onClick={() => {
                onAskFollowUp(
                  `Explain the reasoning in Knowledge Item #${item.item_id || item.id}: ${item.title}`,
                );
                onClose();
              }}
            >
              <Sparkles className="h-4 w-4" />
              Ask a follow-up
            </Button>
          )}
          <Link
            href={`/knowledge-hub?id=${item.item_id || item.id}`}
            className="inline-flex items-center gap-2 text-sm text-accent"
          >
            Open in firm knowledge <ArrowUpRight className="h-4 w-4" />
          </Link>
          <p className="border-t border-surface-border pt-4 text-xs text-content-muted">
            Similarity measures retrieval closeness, not legal accuracy.
          </p>
        </div>
      )}
    </Drawer>
  );
}
