"use client";

import React, { useState } from "react";
import {
  FolderKanban,
  Plus,
  Trash2,
  MessageSquare,
  Search,
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export interface MatterThread {
  id: string;
  title: string;
  practiceArea: string;
  updatedAt: string;
  messages: any[];
}

interface MatterSidebarProps {
  threads: MatterThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewThread: (title?: string, practiceArea?: string) => void;
  onDeleteThread: (id: string) => void;
}

export default function MatterSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
}: MatterSidebarProps) {
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newArea, setNewArea] = useState("Corporate Insolvency & IBC");

  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.practiceArea.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onNewThread(newTitle.trim(), newArea);
    setNewTitle("");
    setIsCreating(false);
  };

  return (
    <aside className="w-72 bg-surface border-r border-surface-border flex flex-col h-full shrink-0">
      {/* Sidebar Top: Matters Heading */}
      <div className="p-4 border-b border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-accent" />
            <h2 className="text-xs font-bold text-content-primary uppercase tracking-wider">
              Legal Matters
            </h2>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 text-[11px] font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Matter</span>
          </button>
        </div>

        {/* Search threads */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter matters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* New Matter Form Inline */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-3 bg-surface-elevated/70 border-b border-accent/30 space-y-2 animate-fade-in"
        >
          <div className="text-[10px] font-bold uppercase text-accent">Initiate Legal Thread</div>
          <input
            type="text"
            placeholder="Matter title (e.g., Tata Mistry S.9 IBC)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full px-2.5 py-1.5 rounded-md bg-surface border border-surface-border text-xs text-content-primary focus:outline-none focus:border-accent"
          />
          <select
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            className="w-full px-2 py-1 rounded-md bg-surface border border-surface-border text-[11px] text-content-secondary focus:outline-none focus:border-accent"
          >
            <option value="Corporate Insolvency & IBC">Corporate Insolvency & IBC</option>
            <option value="Criminal Law & BNS/IPC">Criminal Law & BNS/IPC</option>
            <option value="Arbitration & ADR">Arbitration & ADR</option>
            <option value="Indian Contract Act & Commercial">Indian Contract Act & Commercial</option>
            <option value="Constitutional Law & Fundamental Rights">Constitutional Law</option>
            <option value="SEBI & Securities Law">SEBI & Securities Law</option>
          </select>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-2.5 py-1 rounded text-[11px] text-content-muted hover:text-content-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1 rounded bg-accent hover:bg-accent-hover text-background text-[11px] font-bold disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredThreads.length === 0 ? (
          <div className="p-6 text-center text-content-muted text-xs space-y-1">
            <p>No active matters found.</p>
            <p className="text-[10px]">Start a new thread to organize your case queries.</p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`group relative p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isActive
                    ? "bg-accent/10 border-accent/40 text-content-primary shadow-sm"
                    : "bg-surface hover:bg-surface-elevated border-surface-border text-content-secondary hover:text-content-primary"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? "text-accent" : "text-content-muted group-hover:text-accent"
                      }`}
                    />
                    <span className="font-semibold truncate text-[11px] leading-tight">
                      {thread.title}
                    </span>
                  </div>
                  {threads.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-content-muted hover:text-status-danger transition-opacity rounded"
                      title="Delete thread"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-content-muted mt-2 pt-1 border-t border-surface-border/40">
                  <span className="truncate max-w-[150px]">{thread.practiceArea}</span>
                  <span>{thread.messages.length} msgs</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vault Privilege Tag */}
      <div className="p-3 border-t border-surface-border bg-surface-subtle text-[11px] text-content-muted flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-status-success shrink-0" />
        <span className="truncate">Client Confidentiality Enforced</span>
      </div>
    </aside>
  );
}
