import type { SessionStatus } from "@/types";
import { Play, Pause, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionStatusConfig {
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  icon: LucideIcon;
}

export const sessionStatusConfig: Record<SessionStatus, SessionStatusConfig> = {
  active: {
    label: "Active",
    dotColor: "bg-emerald-500 animate-pulse",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    icon: Play,
  },
  paused: {
    label: "Paused",
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    dotColor: "bg-muted-foreground",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
    icon: Check,
  },
};

interface StatusDotProps {
  status: SessionStatus;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const config = sessionStatusConfig[status];
  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={cn("inline-block h-2 w-2 rounded-full shrink-0", config.dotColor, className)}
    />
  );
}

interface StatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = sessionStatusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        config.badgeBg,
        config.badgeText,
        className
      )}
    >
      <Icon className="h-3 w-3 fill-current" />
      <span>{config.label}</span>
    </span>
  );
}
