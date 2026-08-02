import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";
import type { Memory } from "@/types";
import { MemoryCard } from "@/components/memories/memory-card";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentMemoriesProps {
  memories: Memory[];
}

export function RecentMemories({ memories }: RecentMemoriesProps) {
  return (
    <section aria-labelledby="recent-memories-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="recent-memories-heading"
          className="text-sm font-medium text-foreground"
        >
          Recent memories
        </h2>
        {memories.length > 0 && (
          <Link
            href="/memories"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {memories.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No memories yet"
          description="Capture a URL, note, or snippet to get started."
          className="py-8"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      )}
    </section>
  );
}
