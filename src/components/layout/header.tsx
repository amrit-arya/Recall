"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/shared/logo";

const pageTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/memories": "Memories",
  "/sessions": "Sessions",
  "/timeline": "Timeline",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check prefix matches for detail pages
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title;
  }

  return "RECALL";
}

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-card/95 backdrop-blur-sm supports-backdrop-filter:bg-card/80 px-4">
      {/* Mobile: show logo */}
      <div className="md:hidden">
        <Logo />
      </div>

      {/* Desktop: show page title */}
      <h2 className="hidden md:block text-sm font-medium text-foreground">
        {title}
      </h2>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mobile theme toggle (desktop has it in sidebar) */}
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 dark:hidden" />
        <Moon className="h-4 w-4 hidden dark:block" />
      </button>
    </header>
  );
}
