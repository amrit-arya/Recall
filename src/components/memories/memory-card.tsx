import Link from "next/link";
import type { Memory } from "@/types";
import { cn, formatRelativeTime, extractDomain } from "@/lib/utils";
import {
  MemoryTypeIcon,
  MemoryTypeBadge,
} from "@/components/shared/memory-type-icon";

interface MemoryCardProps {
  memory: Memory;
  className?: string;
}

export function MemoryCard({ memory, className }: MemoryCardProps) {
  const snippet = getSnippet(memory);

  return (
    <Link
      href={`/memories/${memory.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/30",
        className
      )}
    >
      {/* Top row: type icon + title + badge */}
      <div className="flex items-start gap-3 mb-2">
        <MemoryTypeIcon type={memory.type} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {memory.title}
          </h3>
          {memory.type === "url" && memory.url && (
            <p className="text-[11px] text-muted-foreground truncate">
              {extractDomain(memory.url)}
            </p>
          )}
        </div>
        <MemoryTypeBadge type={memory.type} />
      </div>

      {/* Content snippet */}
      {snippet && (
        <p
          className={cn(
            "text-xs text-muted-foreground line-clamp-2 mb-3",
            memory.type === "code" && "font-mono bg-muted/50 rounded-md px-2 py-1.5 text-[11px]"
          )}
        >
          {snippet}
        </p>
      )}

      {/* Footer: tags + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {memory.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {memory.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{memory.tags.length - 2}
            </span>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {formatRelativeTime(memory.createdAt)}
        </span>
      </div>
    </Link>
  );
}

/** Extract the most useful snippet text for a memory */
function getSnippet(memory: Memory): string | undefined {
  if (memory.type === "code" && memory.content) {
    return memory.content;
  }
  if (memory.content) return memory.content;
  if (memory.description) return memory.description;
  return undefined;
}
