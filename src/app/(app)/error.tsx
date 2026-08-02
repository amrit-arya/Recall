"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to error monitoring service
    console.error("App boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        Something went wrong
      </h2>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">
        An error occurred while rendering this page. You can try refreshing the context.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Try again</span>
      </button>
    </div>
  );
}
