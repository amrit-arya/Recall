import type { Memory, Session, ActivityStats, TimelineEvent } from "@/types";

// =============================================================================
// Mock Data — RECALL Application
// =============================================================================

export const mockMemories: Memory[] = [
  {
    id: "m1",
    title: "React Server Components Deep Dive",
    url: "https://react.dev/blog/2024/12/05/react-19",
    type: "url",
    description:
      "Official React blog post covering RSC architecture, streaming, and the new use() hook.",
    aiSummary:
      "An in-depth guide on React 19 server components, async actions, and server-client boundary management.",
    tags: ["react", "frontend", "rsc"],
    collection: "Learning",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sessionIds: ["s1"],
  },
  {
    id: "m2",
    title: "Database migration strategy notes",
    type: "note",
    content:
      "Need to handle backward-compatible schema changes. Use expand-contract pattern: add new column → backfill → migrate reads → drop old column.",
    aiSummary: "Summary of expand-contract pattern for zero-downtime PostgreSQL migrations.",
    tags: ["database", "architecture"],
    collection: "Work",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    sessionIds: ["s1", "s3"],
  },
  {
    id: "m3",
    title: "Supabase RLS policy snippet",
    type: "code",
    content: `CREATE POLICY "Users can view own data"
  ON memories FOR SELECT
  USING (auth.uid() = user_id);`,
    aiSummary: "PostgreSQL Row Level Security policy for user isolation in Supabase.",
    tags: ["supabase", "sql", "security"],
    collection: "Work",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sessionIds: ["s3"],
  },
  {
    id: "m4",
    title: "Dashboard wireframe v2",
    type: "image",
    description: "Updated wireframe with the new card layout and mobile navigation pattern.",
    attachmentUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    tags: ["design", "wireframe"],
    collection: "RECALL",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sessionIds: ["s1"],
  },
  {
    id: "m5",
    title: "API design guidelines PDF",
    type: "pdf",
    description:
      "Google's API design guide — resource-oriented design, standard methods, error handling patterns.",
    attachmentUrl: "/docs/api-design-guide.pdf",
    tags: ["api", "reference"],
    collection: "Learning",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "m6",
    title: "Meeting notes — sprint planning",
    type: "text",
    content:
      "Agreed on scope for next sprint: auth flow, memory CRUD, and basic search. AI features deferred to sprint 3.",
    tags: ["meetings", "planning"],
    collection: "Work",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sessionIds: ["s1"],
  },
  {
    id: "m7",
    title: "Tailwind v4 theme setup snippet",
    type: "code",
    content: `@import "tailwindcss";

@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
}`,
    tags: ["tailwind", "css", "frontend"],
    collection: "RECALL",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    sessionIds: ["s1"],
  },
  {
    id: "m8",
    title: "Mobile navigation usability study screenshot",
    type: "screenshot",
    description: "Screenshot showing bottom bar tab targets on 390px mobile screens.",
    attachmentUrl: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800&auto=format&fit=crop&q=60",
    tags: ["ux", "mobile", "research"],
    collection: "RECALL",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockRecentMemories: Memory[] = mockMemories.slice(0, 6);

export const mockSessions: Session[] = [
  {
    id: "s1",
    name: "RECALL Frontend Implementation",
    description: "Building the Next.js application shell, memories UI, and session management views.",
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    progress:
      "Completed layout system, dashboard, memories grid, and session cards.",
    nextStep: "Wire up memory detail & session detail views with interactive state controls",
    status: "active",
    memoryCount: 5,
    progressNotes: [
      {
        id: "pn1",
        content: "Implemented mobile-responsive App Shell with persistent sidebar on desktop.",
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "pn2",
        content: "Added memory card visual indicators per content type (code, image, pdf, url).",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "s2",
    name: "API Research & Architecture Design",
    description: "Evaluating REST vs GraphQL vs Server Actions for cross-device synchronization.",
    startTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    progress: "Reviewed Next.js Server Actions with Supabase client-side vs server-side boundaries.",
    nextStep: "Write architecture decision record (ADR-002)",
    status: "paused",
    memoryCount: 2,
    progressNotes: [
      {
        id: "pn3",
        content: "Benchmarked latency between REST routes and direct client queries.",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "s3",
    name: "Supabase PostgreSQL Schema Setup",
    description: "Configure Database schemas, RLS policies, indexes, and Auth integration.",
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    progress: "All core tables created with user_id based RLS policies and full-text search indexes.",
    nextStep: undefined,
    status: "completed",
    memoryCount: 3,
    progressNotes: [
      {
        id: "pn4",
        content: "Applied RLS security migration scripts and verified user data isolation.",
        createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const mockActiveSessions: Session[] = mockSessions.filter((s) => s.status === "active" || s.status === "paused");
export const mockRecentSessions: Session[] = mockSessions;

export const mockActivityStats: ActivityStats = {
  memoriesThisWeek: 12,
  sessionsThisWeek: 3,
  totalMemories: 47,
  totalSessions: 11,
};

export const mockInboxCount = 3;

export const mockCollections = ["Learning", "Work", "RECALL"];
export const mockTags = ["react", "frontend", "database", "architecture", "supabase", "sql", "design", "api", "tailwind"];

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "t1",
    type: "memory_created",
    title: "Captured URL Memory",
    description: "Saved 'React Server Components Deep Dive'",
    entityId: "m1",
    entityName: "React Server Components Deep Dive",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t2",
    type: "progress_note",
    title: "Added Session Progress Note",
    description: "Added note: 'Added memory card visual indicators...'",
    entityId: "s1",
    entityName: "RECALL Frontend Implementation",
    createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t3",
    type: "session_started",
    title: "Started Work Session",
    description: "Started 'RECALL Frontend Implementation'",
    entityId: "s1",
    entityName: "RECALL Frontend Implementation",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t4",
    type: "memory_created",
    title: "Created Note Memory",
    description: "Saved 'Database migration strategy notes'",
    entityId: "m2",
    entityName: "Database migration strategy notes",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t5",
    type: "session_paused",
    title: "Paused Work Session",
    description: "Paused 'API Research & Architecture Design'",
    entityId: "s2",
    entityName: "API Research & Architecture Design",
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t6",
    type: "memory_created",
    title: "Uploaded Image Memory",
    description: "Uploaded 'Dashboard wireframe v2'",
    entityId: "m4",
    entityName: "Dashboard wireframe v2",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t7",
    type: "session_completed",
    title: "Finished Work Session",
    description: "Completed 'Supabase PostgreSQL Schema Setup'",
    entityId: "s3",
    entityName: "Supabase PostgreSQL Schema Setup",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
