"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Shield, Sparkles, UserCheck, Plus, Building2, ChevronDown } from "lucide-react";
import { useAppStore, DEMO_INDIAN_USERS } from "@/store/useAppStore";
import { api } from "@/lib/api";
import Logo from "@/components/Logo";

export default function Navbar() {
  const { currentUser, switchDemoRole, switchDemoFirm, setCurrentUser } = useAppStore();

  // Keep API auth token in sync with active user
  useEffect(() => {
    const syncToken = async () => {
      try {
        const res = await api.auth.login({
          email: currentUser.email,
          password: "password123",
        });
        if (res && res.access_token) {
          localStorage.setItem("lexvault_token", res.access_token);
        }
      } catch (e) {
        console.error("Auth sync error:", e);
      }
    };
    syncToken();
  }, [currentUser.email]);

  const activeFirmName =
    currentUser.firm_id === 1
      ? "Chandra & Rao Associates (Mumbai)"
      : "NyayaVault India Platform (New Delhi)";

  return (
    <header className="h-16 border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-2">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Logo size="md" />
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Capture Button */}
        <Link
          href="/capture"
          className="flex items-center gap-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-background px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Capture</span>
        </Link>

        {/* Firm Switcher (Multi-Tenancy Demo) */}
        <div className="flex items-center bg-surface-elevated border border-surface-border rounded-lg p-0.5 text-xs">
          <button
            onClick={() => switchDemoFirm(1)}
            title="Switch to Chandra & Rao Associates (Mumbai)"
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 text-[11px] ${
              currentUser.firm_id === 1
                ? "bg-accent/20 text-accent font-semibold shadow-sm"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span className="hidden md:inline">Firm 1:</span>
            <span>Chandra & Rao</span>
          </button>
          <button
            onClick={() => switchDemoFirm(2)}
            title="Switch to NyayaVault India Platform (New Delhi)"
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 text-[11px] ${
              currentUser.firm_id === 2
                ? "bg-status-success/20 text-status-success font-semibold shadow-sm"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span className="hidden md:inline">Firm 2:</span>
            <span>NyayaVault</span>
          </button>
        </div>

        {/* Role Switcher */}
        <div className="hidden sm:flex items-center bg-surface-elevated border border-surface-border rounded-lg p-0.5 text-xs">
          <button
            onClick={() => switchDemoRole("lawyer")}
            className={`px-2 py-1 rounded transition-all text-[11px] ${
              currentUser.role === "lawyer"
                ? "bg-accent/20 text-accent font-medium shadow-sm"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            <span>Lawyer</span>
          </button>
          <button
            onClick={() => switchDemoRole("admin")}
            className={`px-2 py-1 rounded transition-all text-[11px] flex items-center gap-1 ${
              currentUser.role === "admin"
                ? "bg-accent/20 text-accent font-medium shadow-sm"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Senior Partner</span>
          </button>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-border text-xs">
          <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium border border-accent/30 text-xs">
            {currentUser.name.charAt(currentUser.name.indexOf(" ") + 1) || "A"}
          </div>
          <div className="hidden lg:block text-left">
            <div className="font-medium text-content-primary leading-tight text-xs truncate max-w-[140px]">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-accent truncate max-w-[140px] font-medium">
              {activeFirmName}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
