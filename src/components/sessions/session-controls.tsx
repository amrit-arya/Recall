"use client";

import { useState } from "react";
import { Play, Pause, CheckCircle } from "lucide-react";
import type { SessionStatus } from "@/types";

interface SessionControlsProps {
  initialStatus: SessionStatus;
}

export function SessionControls({ initialStatus }: SessionControlsProps) {
  const [status, setStatus] = useState<SessionStatus>(initialStatus);

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {status === "active" && (
        <button
          type="button"
          onClick={() => setStatus("paused")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          <Pause className="h-3.5 w-3.5 fill-current" />
          <span>Pause Session</span>
        </button>
      )}

      {status === "paused" && (
        <button
          type="button"
          onClick={() => setStatus("active")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Resume Session</span>
        </button>
      )}

      {status !== "completed" && (
        <button
          type="button"
          onClick={() => setStatus("completed")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Finish Session</span>
        </button>
      )}

      {status === "completed" && (
        <button
          type="button"
          onClick={() => setStatus("active")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Re-open Session</span>
        </button>
      )}
    </div>
  );
}
