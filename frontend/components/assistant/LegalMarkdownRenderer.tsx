"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Landmark, BookOpen } from "lucide-react";

interface Props {
  content: string;
  onCiteClick?: (id: string | number) => void;
  onArticleClick?: (number: string) => void;
  isStreaming?: boolean;
}
export default function LegalMarkdownRenderer({
  content,
  onCiteClick,
  onArticleClick,
  isStreaming,
}: Props) {
  const markdown = content
    .replace(/\[Knowledge Item #(\d+)\]/g, "[KI #$1](#knowledge-$1)")
    .replace(/\[Article ([\w]+)\]/g, "[Article $1](#article-$1)");
  return (
    <div className="legal-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const knowledge = href?.match(/^#knowledge-(\d+)$/);
            const article = href?.match(/^#article-(\w+)$/);
            if (knowledge || article)
              return (
                <button
                  type="button"
                  className="mx-1 inline-flex items-center gap-1 rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 align-baseline text-xs font-medium text-accent hover:bg-accent/20"
                  onClick={() => {
                    if (knowledge) onCiteClick?.(knowledge[1]);
                    if (article) onArticleClick?.(article[1]);
                  }}
                >
                  {article ? <Landmark className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                  {children}
                </button>
              );
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-4"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
      {isStreaming && (
        <span
          aria-label="Generating response"
          className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-accent"
        />
      )}
    </div>
  );
}
