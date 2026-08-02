"use client";

import { useState } from "react";
import type { Session, SessionStatus } from "@/types";
import { StatusBadge } from "@/components/shared/session-status-badge";
import { SessionControls } from "@/components/sessions/session-controls";
import { formatRelativeTime } from "@/lib/utils";

interface SessionDetailHeaderProps {
  session: Session;
}

export function SessionDetailHeader({ session }: SessionDetailHeaderProps) {
  const [status, setStatus] = useState<SessionStatus>(session.status);

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-xs text-muted-foreground">
              Started {formatRelativeTime(session.startTime)}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {session.name}
          </h1>
          {session.description && (
            <p className="text-sm text-muted-foreground">{session.description}</p>
          )}
        </div>

        {/* Synchronized Session Controls */}
        <SessionControls currentStatus={status} onStatusChange={setStatus} />
      </div>
    </div>
  );
}
