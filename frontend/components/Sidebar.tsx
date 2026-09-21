"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  GitFork,
  CheckSquare,
  BookOpen,
  Share2,
  BotMessageSquare,
  ShieldCheck,
  Presentation,
  Calculator,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function Sidebar() {
  const pathname = usePathname();
  const { pendingCount, currentUser, activeJobId } = useAppStore();

  const pipelineHref = activeJobId ? `/pipeline/${activeJobId}` : "/pipeline/1";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Capture Intake", href: "/capture", icon: Mic },
    { name: "Live Pipeline", href: pipelineHref, icon: GitFork, highlight: !!activeJobId },
    {
      name: "Approvals Queue",
      href: "/approvals",
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { name: "Knowledge Hub", href: "/knowledge-hub", icon: BookOpen },
    { name: "Graph Explorer", href: "/graph", icon: Share2 },
    { name: "Safe AI Assistant", href: "/assistant", icon: BotMessageSquare },
    { name: "Litigation & Tools", href: "/tools", icon: Calculator },
    { name: "Compliance & Audit", href: "/admin", icon: ShieldCheck },
  ];


  return (
    <aside className="w-64 border-r border-surface-border bg-surface flex flex-col justify-between py-5 shrink-0 hidden lg:flex">
      <div className="px-3 space-y-1">
        <div className="px-3 pb-3 text-[11px] font-semibold text-content-muted uppercase tracking-wider">
          Vault Workspace
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href.startsWith("/pipeline") && pathname.startsWith("/pipeline"));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? "bg-accent/15 text-accent border border-accent/25 shadow-sm"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-elevated"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-accent" : "text-content-muted group-hover:text-content-secondary"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-warning/20 text-status-warning border border-status-warning/30">
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom info card */}
      <div className="px-4">
        <Link
          href="/"
          className="block p-3 rounded-lg border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-1">
            <Presentation className="w-4 h-4" />
            <span>Capstone Pitch Deck</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            View the 10-slide interactive product deck and pipeline overview.
          </p>
        </Link>
      </div>
    </aside>
  );
}
