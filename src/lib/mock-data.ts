import type { Memory, Session, ActivityStats } from "@/types";

// =============================================================================
// Mock Data — Dashboard
//
// Realistic sample data for UI development. Separated from components so
// it can be replaced with real data fetching without touching presentation.
// =============================================================================

export const mockRecentMemories: Memory[] = [
  {
    id: "m1",
    title: "React Server Components Deep Dive",
    url: "https://react.dev/blog/2024/12/05/react-19",
    type: "url",
    description:
      "Official React blog post covering RSC architecture, streaming, and the new use() hook.",
    tags: ["react", "frontend", "rsc"],
    collection: "Learning",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "m2",
    title: "Database migration strategy notes",
    type: "note",
    content:
      "Need to handle backward-compatible schema changes. Use expand-contract pattern: add new column → backfill → migrate reads → drop old column.",
    tags: ["database", "architecture"],
    collection: "Work",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "m3",
    title: "Supabase RLS policy snippet",
    type: "code",
    content: `CREATE POLICY "Users can view own data"
  ON memories FOR SELECT
  USING (auth.uid() = user_id);`,
    tags: ["supabase", "sql", "security"],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
  {
    id: "m4",
    title: "Dashboard wireframe v2",
    type: "image",
    description: "Updated wireframe with the new card layout and mobile navigation pattern.",
    tags: ["design", "wireframe"],
    collection: "RECALL",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "m5",
    title: "API design guidelines PDF",
    type: "pdf",
    description:
      "Google's API design guide — resource-oriented design, standard methods, error handling patterns.",
    tags: ["api", "reference"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "m6",
    title: "Meeting notes — sprint planning",
    type: "text",
    content:
      "Agreed on scope for next sprint: auth flow, memory CRUD, and basic search. AI features deferred to sprint 3.",
    tags: ["meetings", "planning"],
    collection: "Work",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

export const mockActiveSessions: Session[] = [
  {
    id: "s1",
    name: "RECALL Frontend Implementation",
    description: "Building the Next.js application shell and core UI components",
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    progress:
      "Completed layout system, sidebar, and mobile nav. Working on dashboard components.",
    nextStep: "Build memory card component and search input",
    status: "active",
    memoryCount: 8,
  },
  {
    id: "s2",
    name: "API Research & Design",
    description: "Evaluating REST vs tRPC for the backend layer",
    startTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    progress: "Reviewed tRPC docs, compared with server actions approach.",
    nextStep: "Write decision doc comparing approaches",
    status: "paused",
    memoryCount: 4,
  },
];

export const mockRecentSessions: Session[] = [
  ...mockActiveSessions,
  {
    id: "s3",
    name: "Supabase Setup",
    description: "Configure project, tables, RLS policies, and auth",
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    progress: "All tables created with RLS. Auth configured with email/password and GitHub OAuth.",
    nextStep: undefined,
    status: "completed",
    memoryCount: 6,
  },
];

export const mockActivityStats: ActivityStats = {
  memoriesThisWeek: 12,
  sessionsThisWeek: 3,
  totalMemories: 47,
  totalSessions: 11,
};

export const mockInboxCount = 3;
