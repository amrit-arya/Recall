import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { mockTimelineEvents } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";
import { Brain, Play, Pause, CheckCircle2, FileText, Tag, Clock } from "lucide-react";
import type { TimelineEventType } from "@/types";

export const metadata: Metadata = {
  title: "Timeline",
};

function getEventIcon(type: TimelineEventType) {
  switch (type) {
    case "memory_created":
      return <Brain className="h-4 w-4 text-blue-500" />;
    case "session_started":
      return <Play className="h-4 w-4 text-emerald-500 fill-current" />;
    case "session_paused":
      return <Pause className="h-4 w-4 text-amber-500 fill-current" />;
    case "session_completed":
      return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
    case "progress_note":
      return <FileText className="h-4 w-4 text-purple-500" />;
    case "memory_tagged":
      return <Tag className="h-4 w-4 text-indigo-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getEntityLink(type: TimelineEventType, id: string) {
  if (type.startsWith("memory")) return `/memories/${id}`;
  if (type.startsWith("session") || type === "progress_note") return `/sessions/${id}`;
  return "#";
}

export default function TimelinePage() {
  return (
    <PageContainer
      title="Timeline"
      description="Chronological activity and context recovery log"
    >
      <div className="max-w-3xl space-y-6">
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {mockTimelineEvents.map((event) => (
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
                  <p className="text-xs text-muted-foreground mb-2">
                    {event.description}
                  </p>
                )}

                <Link
                  href={getEntityLink(event.type, event.entityId)}
                  className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                >
                  View {event.entityName} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
