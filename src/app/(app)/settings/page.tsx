"use client";

import { useTheme } from "next-themes";
import { PageContainer } from "@/components/shared/page-container";
import { User, Moon, Sun, Sparkles, Database, Shield, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <PageContainer
      title="Settings"
      description="Manage your account profile, visual appearance, and data preferences"
    >
      <div className="max-w-3xl space-y-6">
        {/* Section 1: Profile */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">User Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-base font-bold">
              RA
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Recall User</p>
              <p className="text-xs text-muted-foreground">user@recall.app</p>
            </div>
          </div>
        </div>

        {/* Section 2: Appearance & Theme */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sun className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Customize how RECALL looks across your devices.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
                theme === "light"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun className="h-5 w-5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
                theme === "dark"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon className="h-5 w-5" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
                theme === "system"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="h-5 w-5" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Section 3: AI Preferences Placeholder */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">AI Enhancement</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-medium text-foreground cursor-pointer">
              <span>Automatic Memory Summarization</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
            </label>
            <label className="flex items-center justify-between text-xs font-medium text-foreground cursor-pointer">
              <span>Auto-suggest Tags & Categories</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
            </label>
            <p className="text-[11px] text-muted-foreground">
              AI features are designed as optional enhancements. RECALL remains fully functional without AI enabled.
            </p>
          </div>
        </div>

        {/* Section 4: Data & Storage */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Database className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Data & Local Storage</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">Export Memory Archive</p>
              <p className="text-[11px] text-muted-foreground">Download all captured memories and sessions as JSON</p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Section 5: Security & Privacy */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-foreground">Row Level Security Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Your memory database is isolated with PostgreSQL RLS policies matching your account ownership.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
