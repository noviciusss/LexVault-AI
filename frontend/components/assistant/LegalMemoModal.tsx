"use client";
import { useState } from "react";
import { Copy, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import type { KnowledgeItem } from "@/types/domain";
import { Button, Dialog, Input } from "@/components/ui/primitives";
import LegalMarkdownRenderer from "./LegalMarkdownRenderer";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  matterTitle: string;
  practiceArea: string;
  query: string;
  answer: string;
  citedItems: KnowledgeItem[];
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
  firmName = "LexVault research workspace",
}: Props) {
  const [author, setAuthor] = useState("");
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const text = `# Research Memorandum\n\n${firmName}\nMatter: ${matterTitle}\nPractice: ${practiceArea}\nDate: ${date}\nPrepared by: ${author || "Research team"}\n\n## Question\n${query}\n\n## Research analysis\n${answer}\n\n## Firm references\n${citedItems.map((item) => `- Knowledge Item #${item.item_id || item.id}: ${item.title}`).join("\n") || "Article references are included in the analysis above."}`;
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Research_Memo_${matterTitle.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Export research memorandum"
      description="Keep the research question, supporting references, and analysis together."
      className="max-w-3xl"
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              toast.success("Memorandum copied");
            } catch {
              toast.error("Clipboard is unavailable");
            }
          }}
        >
          <Copy className="h-4 w-4" />
          Copy memo
        </Button>
        <Button variant="secondary" onClick={download}>
          <Download className="h-4 w-4" />
          Download Markdown
        </Button>
        <Button variant="ghost" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
      <label htmlFor="memo-author" className="mt-5 block text-xs text-content-muted">
        Prepared by
      </label>
      <Input
        id="memo-author"
        className="mt-2"
        value={author}
        onChange={(event) => setAuthor(event.target.value)}
        placeholder="Advocate / researcher name"
      />
      <article data-memo className="mt-6 rounded-xl border border-surface-border p-5">
        <p className="mb-2 text-xs uppercase tracking-wider text-accent">{firmName}</p>
        <h2 className="font-serif text-xl font-semibold">{matterTitle}</h2>
        <p className="my-3 text-xs text-content-muted">
          {date} · {practiceArea}
        </p>
        <h3 className="mt-6 text-sm font-semibold">Question presented</h3>
        <p className="my-3 text-sm text-content-secondary">{query}</p>
        <LegalMarkdownRenderer content={answer} />
      </article>
    </Dialog>
  );
}
