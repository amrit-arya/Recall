import Link from "next/link";
import { ArrowRight, Paperclip } from "lucide-react";
import type { Session } from "@/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { StatusDot } from "@/components/shared/session-status-badge";

interface SessionCardProps {
  session: Session;
  className?: string;
}

export function SessionCard({ session, className }: SessionCardProps) {
  const lastWorked = session.endTime
    ? formatRelativeTime(session.endTime)
    : formatRelativeTime(session.startTime);

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot status={session.status} />
          <h3 className="text-sm font-medium text-foreground truncate">
            {session.name}
          </h3>
        </div>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {lastWorked}
        </span>
      </div>

      {/* Progress */}
      {session.progress && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {session.progress}
        </p>
      )}

      {/* Next step */}
      {session.nextStep && (
        <div className="mb-3 rounded-lg bg-muted/50 px-2.5 py-1.5">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Next:</span>{" "}
            {session.nextStep}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Paperclip className="h-3 w-3" />
          <span>
            {session.memoryCount}{" "}
            {session.memoryCount === 1 ? "memory" : "memories"}
          </span>
        </div>

        {session.status !== "completed" && (
          <Link
            href={`/sessions/${session.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            {session.status === "paused" ? "Resume" : "Open"}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
