import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { User as UserIcon, Sun, Sparkles, Database, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  const email = user?.email ?? "Not authenticated";
  const displayName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    (email.includes("@") ? email.split("@")[0] : "User");

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <PageContainer
      title="Settings"
      description="Manage your account profile, visual appearance, and data preferences"
    >
      <div className="max-w-3xl space-y-6">
        {/* Section 1: Profile */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">User Profile</h2>
            </div>
            <SignOutButton showText={true} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-base font-bold">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
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
          <ThemeToggle variant="segmented" />
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
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
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
            Authenticated session is bound to your user ID with Supabase Row Level Security.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
