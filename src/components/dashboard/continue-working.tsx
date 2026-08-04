import type { Session } from "@/types";
import { ContinueWorkingCard } from "@/components/dashboard/continue-working-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Clock } from "lucide-react";

interface ContinueWorkingProps {
  sessions: Session[];
}

export function ContinueWorking({ sessions }: ContinueWorkingProps) {
  const unfinished = sessions.filter((s) => s.status !== "completed");

  return (
    <section aria-labelledby="continue-working-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="continue-working-heading"
          className="text-sm font-medium text-foreground"
        >
          Continue working
        </h2>
        {unfinished.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {unfinished.length} {unfinished.length === 1 ? "active session" : "unfinished sessions"}
          </span>
        )}
      </div>

      {unfinished.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No active sessions"
          description="Start a session to track your work, save next steps, and pick up right where you left off."
          className="py-8"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {unfinished.map((session) => (
            <ContinueWorkingCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}
