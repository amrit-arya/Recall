"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Filter, LayoutGrid, List } from "lucide-react";
import type { Memory, MemoryType } from "@/types";
import { MemoryCard } from "@/components/memories/memory-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemoriesViewProps {
  initialMemories: Memory[];
  collections: string[];
}

const memoryTypes: { label: string; value: MemoryType | "all" }[] = [
  { label: "All Types", value: "all" },
  { label: "URL", value: "url" },
  { label: "Note", value: "note" },
  { label: "Text", value: "text" },
  { label: "Code", value: "code" },
  { label: "Image", value: "image" },
  { label: "Screenshot", value: "screenshot" },
  { label: "PDF", value: "pdf" },
];

export function MemoriesView({ initialMemories, collections }: MemoriesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<MemoryType | "all">("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredMemories = useMemo(() => {
    return initialMemories.filter((mem) => {
      // Type filter
      if (selectedType !== "all" && mem.type !== selectedType) return false;
      // Collection filter
      if (selectedCollection !== "all" && mem.collection !== selectedCollection) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = mem.title.toLowerCase().includes(q);
        const descMatch = mem.description?.toLowerCase().includes(q);
        const contentMatch = mem.content?.toLowerCase().includes(q);
        const tagMatch = mem.tags.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !contentMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [initialMemories, searchQuery, selectedType, selectedCollection]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, content, or tags..."
            aria-label="Search memories by title, content, or tags"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={cn(
                "rounded p-1.5 text-muted-foreground hover:text-foreground transition-colors",
                viewMode === "grid" && "bg-accent text-foreground"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={cn(
                "rounded p-1.5 text-muted-foreground hover:text-foreground transition-colors",
                viewMode === "list" && "bg-accent text-foreground"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Memory</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {memoryTypes.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={selectedType === t.value}
              onClick={() => setSelectedType(t.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                selectedType === t.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-ring/40 hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Collection Dropdown */}
        {collections.length > 0 && (
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            aria-label="Filter memories by collection"
            className="ml-auto h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      {filteredMemories.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No memories match your filters"
          description="Try adjusting your search query, type filters, or collection selection."
          action={
            (searchQuery || selectedType !== "all" || selectedCollection !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setSelectedCollection("all");
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Reset all filters
              </button>
            )
          }
        />
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          )}
        >
          {filteredMemories.map((mem) => (
            <MemoryCard key={mem.id} memory={mem} />
          ))}
        </div>
      )}
    </div>
  );
}
