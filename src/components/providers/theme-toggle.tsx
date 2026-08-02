"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "menu" | "segmented";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground",
          className
        )}
        aria-label="Toggle dark mode"
      >
        <Sun className="h-4 w-4 shrink-0 dark:hidden" />
        <Moon className="h-4 w-4 shrink-0 hidden dark:block" />
        <span className="dark:hidden">Dark mode</span>
        <span className="hidden dark:inline">Light mode</span>
      </button>
    );
  }

  if (variant === "segmented") {
    return (
      <div className={cn("grid grid-cols-3 gap-3 max-w-md", className)}>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
            theme === "light"
              ? "border-primary bg-primary/5 text-primary font-semibold"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={theme === "light"}
        >
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
            theme === "dark"
              ? "border-primary bg-primary/5 text-primary font-semibold"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={theme === "dark"}
        >
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
            theme === "system"
              ? "border-primary bg-primary/5 text-primary font-semibold"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={theme === "system"}
        >
          <Monitor className="h-5 w-5" />
          <span>System</span>
        </button>
      </div>
    );
  }

  // Icon-only variant
  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
    </button>
  );
}
