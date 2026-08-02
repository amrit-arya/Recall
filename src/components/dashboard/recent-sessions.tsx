import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Session } from "@/types";
import { SessionCard } from "@/components/sessions/session-card";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentSessionsProps {
  sessions: Session[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <section aria-labelledby="recent-sessions-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="recent-sessions-heading"
          className="text-sm font-medium text-foreground"
        >
          Recent sessions
        </h2>
        {sessions.length > 0 && (
          <Link
            href="/sessions"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No sessions yet"
          description="Create a session to start tracking your work."
          className="py-8"
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}
