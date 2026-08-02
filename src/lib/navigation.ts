import { Home, Brain, Clock, History, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Memories", href: "/memories", icon: Brain },
  { name: "Sessions", href: "/sessions", icon: Clock },
  { name: "Timeline", href: "/timeline", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== "/dashboard" && pathname.startsWith(href)) return true;
  return false;
}

export function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find((item) => isNavActive(pathname, item.href));
  if (match) return match.name;

  if (pathname.startsWith("/memories/")) return "Memory Detail";
  if (pathname.startsWith("/sessions/")) return "Session Detail";

  return "RECALL";
}
