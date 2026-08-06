import { cn } from "@/lib/utils";

interface PageContainerProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  title,
  description,
  action,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto min-w-0", className)}>
      <div className="mx-auto w-full max-w-6xl px-3.5 py-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
