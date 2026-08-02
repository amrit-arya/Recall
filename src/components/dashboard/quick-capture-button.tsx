"use client";

import { Plus } from "lucide-react";

export function QuickCaptureButton() {
  return (
    <button
      type="button"
      id="quick-capture"
      onClick={() => {
        // TODO: open quick capture modal
      }}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
    >
      <Plus className="h-4 w-4" />
      <span>Capture</span>
    </button>
  );
}
