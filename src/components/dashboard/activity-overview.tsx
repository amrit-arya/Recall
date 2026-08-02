import { Brain, Clock, TrendingUp, Layers } from "lucide-react";
import type { ActivityStats } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityOverviewProps {
  stats: ActivityStats;
  className?: string;
}

const statItems = [
  {
    key: "memoriesThisWeek" as const,
    label: "Memories this week",
    icon: Brain,
  },
  {
    key: "sessionsThisWeek" as const,
    label: "Sessions this week",
    icon: Clock,
  },
  {
    key: "totalMemories" as const,
    label: "Total memories",
    icon: Layers,
  },
  {
    key: "totalSessions" as const,
    label: "Total sessions",
    icon: TrendingUp,
  },
];

export function ActivityOverview({ stats, className }: ActivityOverviewProps) {
  return (
    <section aria-labelledby="activity-heading" className={className}>
      <h2
        id="activity-heading"
        className="mb-3 text-sm font-medium text-foreground"
      >
        Activity
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
        {statItems.map((item) => (
          <div
            key={item.key}
            className={cn(
              "rounded-xl border border-border bg-card p-3"
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                {item.label}
              </span>
            </div>
            <p className="text-lg font-semibold text-foreground tabular-nums">
              {stats[item.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
