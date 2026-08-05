import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { getTimelineEvents } from "@/lib/data";
import { formatRelativeTime } from "@/lib/utils";
import { Brain, Play, Pause, CheckCircle2, FileText, Tag, Clock } from "lucide-react";
import type { TimelineEvent, TimelineEventType } from "@/types";

export const metadata: Metadata = {
  title: "Timeline",
};

export const dynamic = "force-dynamic";

function getEventIcon(type: TimelineEventType) {
  switch (type) {
    case "memory_created":
      return <Brain className="h-4 w-4 text-blue-500" />;
    case "session_started":
      return <Play className="h-4 w-4 text-emerald-500 fill-current" />;
    case "session_paused":
      return <Pause className="h-4 w-4 text-amber-500 fill-current" />;
    case "session_completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "progress_note":
      return <FileText className="h-4 w-4 text-purple-500" />;
    case "memory_tagged":
      return <Tag className="h-4 w-4 text-indigo-500" />;
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unhandled timeline event type: ${_exhaustive}`);
    }
  }
}

function getEntityLink(type: TimelineEventType, id: string) {
  switch (type) {
    case "memory_created":
    case "memory_tagged":
      return `/memories/${id}`;
    case "session_started":
    case "session_paused":
    case "session_completed":
    case "progress_note":
      return `/sessions/${id}`;
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unhandled timeline event type: ${_exhaustive}`);
    }
  }
}

function groupEventsByDate(events: TimelineEvent[]) {
  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const groups: { label: string; events: TimelineEvent[] }[] = [];
  const map = new Map<string, TimelineEvent[]>();

  events.forEach((event) => {
    const eventDate = new Date(event.createdAt);
    const dateStr = eventDate.toDateString();

    let label = "Earlier";
    if (dateStr === todayStr) {
      label = "Today";
    } else if (dateStr === yesterdayStr) {
      label = "Yesterday";
    } else {
      label = eventDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!map.has(label)) {
      map.set(label, []);
    }
    map.get(label)!.push(event);
  });

  map.forEach((eventsList, label) => {
    groups.push({ label, events: eventsList });
  });

  return groups;
}

export default async function TimelinePage() {
  const events = await getTimelineEvents();
  const groupedEvents = groupEventsByDate(events);

  return (
    <PageContainer
      title="Timeline"
      description="Chronological activity and context recovery log"
    >
      <div className="max-w-3xl space-y-8">
        {events.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No activity recorded yet"
            description="Capture memories or start work sessions to build your chronological activity log."
            action={
              <Link
                href="/memories"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span>Capture First Memory</span>
              </Link>
            }
          />
        ) : (
          groupedEvents.map((group) => (
            <div key={group.label} className="space-y-4">
              {/* Date Group Header */}
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xs py-1 border-b border-border/50">
                <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  {group.label} ({group.events.length})
                </h2>
              </div>

              {/* Group Events Line */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                {group.events.map((event) => (
                  <div key={event.id} className="relative flex items-start gap-4 group">
                    {/* Event Icon Node */}
                    <div className="absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-xs group-hover:border-primary transition-colors">
                      {getEventIcon(event.type)}
                    </div>

                    {/* Event Details Card */}
                    <div className="flex-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/30">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground">
                          {event.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(event.createdAt)}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <Link
                        href={getEntityLink(event.type, event.entityId)}
                        className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                      >
                        <span>View {event.entityName}</span>
                        <span className="ml-1">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}
