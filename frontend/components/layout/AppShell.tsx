"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  BookOpen,
  Landmark,
  LayoutDashboard,
  Mic,
  GitFork,
  CheckSquare,
  Share2,
  MessageSquare,
  Calculator,
  ShieldCheck,
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  Plus,
  Bell,
  Command,
  PanelLeftClose,
  PanelLeft,
  ArrowUpRight,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { Button, Dialog, Drawer, Input, Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const routes = [
  { href: "/constitution", label: "Constitution of India", icon: Landmark, group: "Research" },
  { href: "/assistant", label: "Research assistant", icon: MessageSquare, group: "Research" },
  { href: "/knowledge-hub", label: "Firm knowledge", icon: BookOpen, group: "Research" },
  { href: "/graph", label: "Knowledge graph", icon: Share2, group: "Research" },
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, group: "Workspace" },
  { href: "/capture", label: "Capture insight", icon: Mic, group: "Workspace" },
  { href: "/pipeline", label: "Live pipeline", icon: GitFork, group: "Workspace" },
  { href: "/approvals", label: "Partner review", icon: CheckSquare, group: "Workspace" },
  { href: "/tools", label: "Litigation tools", icon: Calculator, group: "Practice" },
  { href: "/admin", label: "Audit & access", icon: ShieldCheck, group: "Practice", admin: true },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    currentUser,
    activeJobId,
    pendingCount,
    setPendingCount,
    switchDemoFirm,
    switchDemoRole,
  } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(false);
  const stats = useQuery({
    queryKey: ["stats", currentUser.firm_id],
    queryFn: () => api.admin.getStats(),
    enabled: pathname !== "/",
  });
  useEffect(() => {
    if (stats.data) setPendingCount(stats.data.pending_approval);
  }, [stats.data, setPendingCount]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  const navigation = routes.filter((route) => !route.admin || currentUser.role === "admin");
  const href = (route: (typeof routes)[number]) =>
    route.href === "/pipeline"
      ? activeJobId
        ? `/pipeline/${activeJobId}`
        : "/capture"
      : route.href;
  const currentRoute = routes.find((route) => pathname.startsWith(route.href));
  const nav = (compact = false) => (
    <nav aria-label="Workspace navigation" className="space-y-5">
      {["Research", "Workspace", "Practice"].map((group) => (
        <div key={group} className="space-y-1">
          {!compact && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[.16em] text-content-muted">
              {group}
            </p>
          )}
          {navigation
            .filter((route) => route.group === group)
            .map((route) => (
              <Link
                key={route.href}
                href={href(route)}
                title={compact ? route.label : undefined}
                aria-current={pathname.startsWith(route.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  pathname.startsWith(route.href)
                    ? "bg-accent/10 text-accent"
                    : "text-content-secondary hover:bg-surface-elevated hover:text-content-primary",
                  compact && "justify-center",
                )}
              >
                <route.icon className="h-[18px] w-[18px] shrink-0" />
                {!compact && <span className="flex-1">{route.label}</span>}
                {!compact && route.href === "/approvals" && pendingCount > 0 && (
                  <span className="rounded-md bg-accent/15 px-1.5 text-xs">{pendingCount}</span>
                )}
              </Link>
            ))}
        </div>
      ))}
    </nav>
  );
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-lg bg-accent p-3 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-surface-border bg-surface/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Logo href="/constitution" size="sm" showSubtitle={false} />
          <span className="hidden border-l border-surface-border pl-4 text-xs text-content-muted xl:block">
            Indian constitutional intelligence
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => setSearchOpen(true)}
            aria-label="Search pages"
            className="hidden px-2 sm:inline-flex sm:px-3"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline text-xs">Quick navigation</span>
            <kbd className="hidden rounded border border-surface-border px-1.5 text-[10px] text-content-muted md:inline">
              ⌘ K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={() => setNotifications(true)}
            className="relative hidden sm:inline-flex"
          >
            <Bell className="h-4 w-4" />
            {pendingCount > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle light and dark theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="h-4 w-4 dark:hidden" />
          </Button>
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <Button variant="secondary" className="gap-2 px-2 sm:px-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-xs text-accent">
                  {currentUser.name.split(" ")[1]?.charAt(0)}
                </span>
                <span className="hidden text-xs sm:block">
                  {currentUser.firm_id === 1 ? "Chandra & Rao" : "NyayaVault"}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content
                align="end"
                sideOffset={10}
                className="z-50 w-72 rounded-xl border border-surface-border bg-surface p-2 shadow-2xl"
              >
                <div className="p-3">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="mt-1 text-xs text-content-muted">{currentUser.email}</p>
                  <Badge className="mt-3">Demo workspace · {currentUser.role}</Badge>
                </div>
                <Dropdown.Separator className="my-1 h-px bg-surface-border" />
                {[
                  { label: "Chandra & Rao · Mumbai", action: () => switchDemoFirm(1) },
                  { label: "NyayaVault · New Delhi", action: () => switchDemoFirm(2) },
                  { label: "Use lawyer role", action: () => switchDemoRole("lawyer") },
                  { label: "Use senior partner role", action: () => switchDemoRole("admin") },
                ].map((item) => (
                  <Dropdown.Item
                    key={item.label}
                    onSelect={item.action}
                    className="cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-surface-elevated"
                  >
                    {item.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        </div>
      </header>
      <div className="flex flex-1">
        {pathname !== "/" && (
          <aside
            className={cn(
              "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col border-r border-surface-border bg-surface px-3 py-5 lg:flex",
              collapsed ? "w-20" : "w-60",
            )}
          >
            <div className="mb-5 flex items-center justify-between px-2">
              {!collapsed && (
                <span className="text-xs font-medium text-content-secondary">
                  Research workspace
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </div>
            {nav(collapsed)}
            {!collapsed && (
              <div className="mt-auto rounded-xl border border-surface-border p-3">
                <div className="flex items-center gap-2 text-xs text-accent">
                  <Landmark className="h-4 w-4" />
                  Constitution-first research
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-content-muted">
                  Article references, landmark cases, and your firm’s reviewed knowledge.
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-content-secondary"
                >
                  Product overview <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </aside>
        )}
        <main
          id="main-content"
          className={cn(
            "min-w-0 flex-1",
            pathname === "/assistant" ? "p-2 sm:p-4" : "p-4 sm:p-6 lg:p-8",
          )}
        >
          <div className="mx-auto max-w-[1440px]">
            {pathname !== "/" && pathname !== "/assistant" && (
              <div className="mb-6 flex items-center justify-between text-xs text-content-muted">
                <span>
                  Workspace <span className="mx-2">/</span>
                  <span className="text-content-secondary">
                    {currentRoute?.label || "Research"}
                  </span>
                </span>
                <Link href="/capture" className="flex items-center gap-1.5 text-accent">
                  <Plus className="h-3.5 w-3.5" />
                  New insight
                </Link>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} title="Research workspace">
        {nav()}
      </Drawer>
      <Dialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Jump to your workspace"
        description="Find a research page or practice tool."
      >
        <Input
          autoFocus
          aria-label="Search navigation"
          placeholder="Constitution, assistant, approvals…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="mt-3 space-y-1">
          {navigation
            .filter((route) => route.label.toLowerCase().includes(search.toLowerCase()))
            .map((route) => (
              <Link
                onClick={() => setSearchOpen(false)}
                key={route.href}
                href={href(route)}
                className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-surface-elevated"
              >
                <route.icon className="h-4 w-4 text-accent" />
                {route.label}
              </Link>
            ))}
        </div>
      </Dialog>
      <Drawer open={notifications} onOpenChange={setNotifications} title="Workspace activity">
        <div className="space-y-4">
          <Link
            href="/approvals"
            onClick={() => setNotifications(false)}
            className="block rounded-xl border border-surface-border p-4"
          >
            <p className="text-sm font-medium">
              {pendingCount} insight{pendingCount !== 1 ? "s" : ""} awaiting review
            </p>
            <p className="mt-1 text-xs text-content-muted">
              Review sanitized submissions before publication.
            </p>
          </Link>
          {activeJobId && (
            <Link
              href={`/pipeline/${activeJobId}`}
              onClick={() => setNotifications(false)}
              className="block rounded-xl border border-surface-border p-4 text-sm"
            >
              Continue pipeline #{activeJobId}
            </Link>
          )}
          <p className="text-xs text-content-muted">
            Activity reflects the connected firm workspace.
          </p>
        </div>
      </Drawer>
    </div>
  );
}
