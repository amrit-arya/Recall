interface GreetingProps {
  inboxCount?: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting({ inboxCount }: GreetingProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {getGreeting()}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your work
        </p>
      </div>
      {inboxCount !== undefined && inboxCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {inboxCount > 9 ? "9+" : inboxCount}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            in inbox
          </span>
        </div>
      )}
    </div>
  );
}
