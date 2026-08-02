import {
  Globe,
  FileText,
  AlignLeft,
  Code,
  Camera,
  ImageIcon,
  FileDown,
} from "lucide-react";
import type { MemoryType } from "@/types";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemoryTypeConfig {
  icon: LucideIcon;
  label: string;
  color: string; // text color class
  bg: string; // background color class
}

const typeConfig: Record<MemoryType, MemoryTypeConfig> = {
  url: {
    icon: Globe,
    label: "URL",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  note: {
    icon: FileText,
    label: "Note",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  text: {
    icon: AlignLeft,
    label: "Text",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/40",
  },
  code: {
    icon: Code,
    label: "Code",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  screenshot: {
    icon: Camera,
    label: "Screenshot",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  image: {
    icon: ImageIcon,
    label: "Image",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/40",
  },
  pdf: {
    icon: FileDown,
    label: "PDF",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
};

export function getMemoryTypeConfig(type: MemoryType): MemoryTypeConfig {
  return typeConfig[type];
}

interface MemoryTypeIconProps {
  type: MemoryType;
  size?: "sm" | "md";
  className?: string;
}

/** Colored icon with background for a memory type */
export function MemoryTypeIcon({
  type,
  size = "md",
  className,
}: MemoryTypeIconProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        config.bg,
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        className
      )}
    >
      <Icon
        className={cn(
          config.color,
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
        )}
      />
    </div>
  );
}

interface MemoryTypeBadgeProps {
  type: MemoryType;
  className?: string;
}

/** Small inline badge showing memory type */
export function MemoryTypeBadge({ type, className }: MemoryTypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
