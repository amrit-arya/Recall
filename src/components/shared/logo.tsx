import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
        <span className="text-sm font-bold text-white tracking-tight">R</span>
      </div>
      {!collapsed && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          RECALL
        </span>
      )}
    </div>
  );
}
