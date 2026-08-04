import type { Metadata } from "next";
import { Greeting } from "@/components/dashboard/greeting";
import { SearchInput } from "@/components/dashboard/search-input";
import { QuickCaptureButton } from "@/components/dashboard/quick-capture-button";
import { ContinueWorking } from "@/components/dashboard/continue-working";
import { RecentMemories } from "@/components/dashboard/recent-memories";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { ActivityOverview } from "@/components/dashboard/activity-overview";
import {
  getRecentMemories,
  getUnfinishedSessions,
  getRecentSessions,
  getActivityStats,
  getInboxCount,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Home",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    recentMemories,
    unfinishedSessions,
    recentSessions,
    activityStats,
    inboxCount,
  ] = await Promise.all([
    getRecentMemories(6),
    getUnfinishedSessions(4),
    getRecentSessions(5),
    getActivityStats(),
    getInboxCount(),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Greeting + Quick Capture */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <Greeting inboxCount={inboxCount} />
          <QuickCaptureButton />
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchInput />
        </div>

        {/* Main content: two-column on large screens */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* Left column: main content */}
          <div className="space-y-8">
            {/* Continue Working */}
            <ContinueWorking sessions={unfinishedSessions} />

            {/* Recent Memories */}
            <RecentMemories memories={recentMemories} />
          </div>

          {/* Right column: sidebar content (desktop) / stacked below (mobile) */}
          <div className="space-y-8">
            {/* Activity Overview */}
            <ActivityOverview stats={activityStats} />

            {/* Recent Sessions */}
            <RecentSessions sessions={recentSessions} />
          </div>
        </div>
      </div>
    </div>
  );
}
