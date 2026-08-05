'use client'

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <WifiOff className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">You are offline</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            RECALL requires an internet connection to sync your encrypted memories and work sessions securely.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Reconnecting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
