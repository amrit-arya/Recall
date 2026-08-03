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
  onTagClick?: (tag: string) => void;
}

export function MemoryCard({ memory, className, onTagClick }: MemoryCardProps) {
  const snippet = getSnippet(memory);

  return (
    <Link
      href={`/memories/${memory.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-4 transition-all hover:border-ring/30 hover:shadow-sm",
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

      {/* Footer: collection + tags + time */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {memory.collection && (
            <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              📁 {memory.collection}
            </span>
          )}

          {memory.tags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                if (onTagClick) {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick(tag);
                }
              }}
              className={cn(
                "inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors",
                onTagClick && "hover:bg-accent hover:text-foreground cursor-pointer"
              )}
            >
              #{tag}
            </button>
          ))}
          {memory.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{memory.tags.length - 3}
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
