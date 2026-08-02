"use client";

import { useState } from "react";
import { Plus, Clock, PlayCircle, PauseCircle, CheckCircle2 } from "lucide-react";
import type { Session, SessionStatus } from "@/types";
import { SessionCard } from "@/components/sessions/session-card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

interface SessionsViewProps {
  initialSessions: Session[];
}

export function SessionsView({ initialSessions }: SessionsViewProps) {
  const [activeTab, setActiveTab] = useState<SessionStatus | "all">("all");

  const activeSessions = initialSessions.filter((s) => s.status === "active");
  const pausedSessions = initialSessions.filter((s) => s.status === "paused");
  const completedSessions = initialSessions.filter((s) => s.status === "completed");

  const displayedSessions =
    activeTab === "all"
      ? initialSessions
      : initialSessions.filter((s) => s.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header Bar: Filter Tabs & New Session Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "all"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>All ({initialSessions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "active"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PlayCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Active ({activeSessions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paused")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "paused"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>Paused ({pausedSessions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "completed"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Finished ({completedSessions.length})</span>
          </button>
        </div>

        {/* New Session Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Content */}
      {displayedSessions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={`No ${activeTab !== "all" ? activeTab : ""} sessions`}
          description="Create a work session to track progress, record next steps, and attach memories."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {displayedSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
