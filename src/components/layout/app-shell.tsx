import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-full min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col md:pl-60">
        <Header />

        {/* Page content — generous bottom padding on mobile for nav bar + safe-area insets */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
