"use client";

import { Play, Pause, CheckCircle } from "lucide-react";
import type { SessionStatus } from "@/types";

interface SessionControlsProps {
  currentStatus: SessionStatus;
  onStatusChange?: (newStatus: SessionStatus) => void;
}

export function SessionControls({
  currentStatus,
  onStatusChange,
}: SessionControlsProps) {
  const handleStatusChange = (newStatus: SessionStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {currentStatus === "active" && (
        <button
          type="button"
          onClick={() => handleStatusChange("paused")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          <Pause className="h-3.5 w-3.5 fill-current" />
          <span>Pause Session</span>
        </button>
      )}

      {currentStatus === "paused" && (
        <button
          type="button"
          onClick={() => handleStatusChange("active")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Resume Session</span>
        </button>
      )}

      {currentStatus !== "completed" && (
        <button
          type="button"
          onClick={() => handleStatusChange("completed")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Finish Session</span>
        </button>
      )}

      {currentStatus === "completed" && (
        <button
          type="button"
          onClick={() => handleStatusChange("active")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Re-open Session</span>
        </button>
      )}
    </div>
  );
}
