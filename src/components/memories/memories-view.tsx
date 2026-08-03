"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Filter, LayoutGrid, List, Tag, Folder, X } from "lucide-react";
import type { Memory, MemoryType } from "@/types";
import { MemoryCard } from "@/components/memories/memory-card";
import { MemoryModal } from "@/components/memories/memory-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemoriesViewProps {
  initialMemories: Memory[];
  collections: string[];
  allTags?: string[];
}

const memoryTypes: { label: string; value: MemoryType | "all" }[] = [
  { label: "All Types", value: "all" },
  { label: "URL", value: "url" },
  { label: "Note", value: "note" },
  { label: "Text", value: "text" },
  { label: "Code", value: "code" },
  { label: "Image", value: "image" },
  { label: "PDF", value: "pdf" },
];

export function MemoriesView({
  initialMemories,
  collections,
  allTags = [],
}: MemoriesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<MemoryType | "all">("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive unique tags from initialMemories if allTags is empty
  const tagsList = useMemo(() => {
    if (allTags.length > 0) return allTags;
    const set = new Set<string>();
    initialMemories.forEach((m) => m.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [allTags, initialMemories]);

  const filteredMemories = useMemo(() => {
    return initialMemories.filter((mem) => {
      // Type filter
      if (selectedType !== "all" && mem.type !== selectedType) return false;

      // Collection filter
      if (selectedCollection === "uncategorized") {
        if (mem.collection && mem.collection.trim() !== "") return false;
      } else if (selectedCollection !== "all") {
        if (mem.collection !== selectedCollection) return false;
      }

      // Tag filter
      if (selectedTag !== "all") {
        if (!mem.tags.includes(selectedTag)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = mem.title.toLowerCase().includes(q);
        const descMatch = mem.description?.toLowerCase().includes(q);
        const contentMatch = mem.content?.toLowerCase().includes(q);
        const colMatch = mem.collection?.toLowerCase().includes(q);
        const tagMatch = mem.tags.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !contentMatch && !colMatch && !tagMatch)
          return false;
      }
      return true;
    });
  }, [initialMemories, searchQuery, selectedType, selectedCollection, selectedTag]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedType !== "all" ||
    selectedCollection !== "all" ||
    selectedTag !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedCollection("all");
    setSelectedTag("all");
  };

  const hasNoMemoriesAtAll = initialMemories.length === 0;

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, content, collections, or tags..."
            aria-label="Search memories by title, content, collection, or tags"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Layout toggle & New Memory button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={cn(
                "rounded p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
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
                "rounded p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                viewMode === "list" && "bg-accent text-foreground"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Memory</span>
          </button>
        </div>
      </div>

      {/* Responsive Filters Bar */}
      <div className="rounded-xl border border-border/70 bg-card p-3 space-y-3">
        {/* Row 1: Type Pills (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Types:</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {memoryTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={selectedType === t.value}
                onClick={() => setSelectedType(t.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors border cursor-pointer shrink-0 whitespace-nowrap",
                  selectedType === t.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-ring/40 hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Collection Selector & Tag Filter Pills */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-border/40">
          {/* Collection Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              aria-label="Filter memories by collection"
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[200px]"
            >
              <option value="all">All Collections</option>
              <option value="uncategorized">Uncategorized (No Collection)</option>
              {collections.map((col) => (
                <option key={col} value={col}>
                  📁 {col}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter Bar (Horizontally scrollable on mobile) */}
          {tagsList.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <button
                type="button"
                onClick={() => setSelectedTag("all")}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors shrink-0 cursor-pointer",
                  selectedTag === "all"
                    ? "bg-primary/15 text-primary font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                All Tags
              </button>
              {tagsList.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors shrink-0 cursor-pointer",
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline self-end sm:self-auto cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {hasNoMemoriesAtAll ? (
        <EmptyState
          icon={Brain}
          title="No memories captured yet"
          description="Start building your digital memory repository by capturing URLs, notes, snippets, code, images, or PDFs."
          action={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Capture Your First Memory</span>
            </button>
          }
        />
      ) : filteredMemories.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No memories match your filters"
          description="Try adjusting your search query, collection selection, tag selection, or type filters."
          action={
            hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
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
            <MemoryCard
              key={mem.id}
              memory={mem}
              onTagClick={(tag) => setSelectedTag(tag)}
            />
          ))}
        </div>
      )}

      {/* New Memory Modal */}
      <MemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
