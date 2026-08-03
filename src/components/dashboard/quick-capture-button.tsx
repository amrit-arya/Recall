"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MemoryModal } from "@/components/memories/memory-modal";

export function QuickCaptureButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        id="quick-capture"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        <span>Capture</span>
      </button>

      <MemoryModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
