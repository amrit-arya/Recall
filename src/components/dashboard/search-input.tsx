"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { UniversalSearchDialog } from "@/components/search/universal-search-dialog";

export function SearchInput() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(true)}>
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="dashboard-search"
          type="search"
          readOnly
          onFocus={() => setIsOpen(true)}
          placeholder="Search memories, sessions, tags, or topics..."
          aria-label="Search memories and sessions"
          className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="hidden sm:inline-block rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <UniversalSearchDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
