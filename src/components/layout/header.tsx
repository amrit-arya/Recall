"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { getPageTitle } from "@/lib/navigation";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-card/95 backdrop-blur-sm supports-backdrop-filter:bg-card/80 px-4">
      {/* Mobile: show logo */}
      <div className="md:hidden">
        <Logo />
      </div>

      {/* Desktop: show page title derived from nav config */}
      <h2 className="hidden md:block text-sm font-medium text-foreground">
        {title}
      </h2>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mobile controls */}
      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle variant="icon" />
        <SignOutButton showText={false} />
      </div>
    </header>
  );
}
