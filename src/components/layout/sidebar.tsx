"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { NAV_ITEMS, isNavActive } from "@/lib/navigation";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex flex-1 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-14 items-center px-4 border-b border-border">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls: Theme toggle & Sign out */}
        <div className="border-t border-border p-3 space-y-1">
          <ThemeToggle variant="menu" />
          <SignOutButton variant="menu" />
        </div>
      </div>
    </aside>
  );
}
