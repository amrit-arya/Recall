import type { Memory, Session, ActivityStats, TimelineEvent } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { STORAGE_BUCKET } from "@/lib/supabase/storage";
import {
  mockSessions,
  mockActivityStats,
  mockInboxCount,
  mockTimelineEvents,
} from "@/lib/mock-data";

interface SupabaseMemoryTagRelation {
  tags: { name: string } | null;
}

interface SupabaseSessionMemoryRelation {
  session_id: string;
}

interface SupabaseMemoryRow {
  id: string;
  user_id: string;
  title: string;
  type: Memory["type"];
  content: string | null;
  url: string | null;
  description: string | null;
  ai_summary: string | null;
  collection: string | null;
  attachment_path: string | null;
  created_at: string;
  updated_at: string;
  memory_tags?: SupabaseMemoryTagRelation[];
  session_memories?: SupabaseSessionMemoryRelation[];
}

/** Helper to map raw Supabase row + relations to application Memory model, resolving signed URLs for private storage */
async function mapRowToMemory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: SupabaseMemoryRow
): Promise<Memory> {
  const tags: string[] = Array.isArray(row.memory_tags)
    ? row.memory_tags
        .map((mt) => mt.tags?.name)
        .filter((name): name is string => typeof name === "string")
    : [];

  const sessionIds: string[] = Array.isArray(row.session_memories)
    ? row.session_memories
        .map((sm) => sm.session_id)
        .filter((id): id is string => typeof id === "string")
    : [];

  let attachmentUrl: string | undefined = undefined;

  // Resolve short-lived signed URL for private attachments
  if (row.attachment_path) {
    try {
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(row.attachment_path, 3600); // 1 hour expiry
      if (data?.signedUrl) {
        attachmentUrl = data.signedUrl;
      }
    } catch (err) {
      console.warn('Failed to resolve signed URL for attachment:', err);
    }
  }

  return {
    id: row.id,
    title: row.title,
    content: row.content || undefined,
    url: row.url || undefined,
    type: row.type,
    description: row.description || undefined,
    aiSummary: row.ai_summary || undefined,
    collection: row.collection || undefined,
    attachmentUrl,
    createdAt: row.created_at,
    tags,
    sessionIds,
  };
}

/**
 * Fetch all memories for the authenticated user from Supabase PostgreSQL.
 * Enforces user_id equality alongside RLS.
 */
export async function getMemories(): Promise<Memory[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(`
      *,
      memory_tags (
        tags ( name )
      ),
      session_memories (
        session_id
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getMemories query error:", error);
    return [];
  }

  const rows = data as unknown as SupabaseMemoryRow[];
  return Promise.all(rows.map((row) => mapRowToMemory(supabase, row)));
}

/**
 * Fetch a single memory by ID for the authenticated user.
 */
export async function getMemoryById(id: string): Promise<Memory | undefined> {
  const user = await getCurrentUser();
  if (!user || !id) return undefined;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(`
      *,
      memory_tags (
        tags ( name )
      ),
      session_memories (
        session_id
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getMemoryById query error:", error);
    return undefined;
  }

  return mapRowToMemory(supabase, data as unknown as SupabaseMemoryRow);
}

/**
 * Fetch N recent memories for the authenticated user.
 */
export async function getRecentMemories(limit = 6): Promise<Memory[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select(`
      *,
      memory_tags (
        tags ( name )
      ),
      session_memories (
        session_id
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("getRecentMemories query error:", error);
    return [];
  }

  const rows = data as unknown as SupabaseMemoryRow[];
  return Promise.all(rows.map((row) => mapRowToMemory(supabase, row)));
}

/**
 * Fetch distinct collections for the authenticated user.
 */
export async function getCollections(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .select("collection")
    .eq("user_id", user.id)
    .not("collection", "is", null);

  if (error || !data) {
    return [];
  }

  const collections: string[] = Array.from(
    new Set(
      data
        .map((row: { collection: string | null }) => row.collection)
        .filter((col: string | null): col is string => Boolean(col && col.trim()))
    )
  );

  return collections;
}

/**
 * Fetch distinct tags for the authenticated user.
 */
export async function getTags(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("name")
    .eq("user_id", user.id);

  if (error || !data) {
    return [];
  }

  return data.map((t: { name: string }) => t.name);
}

// -----------------------------------------------------------------------------
// Session & Activity DAL (Mock data retained until Session integration)
// -----------------------------------------------------------------------------

export async function getSessions(): Promise<Session[]> {
  return [...mockSessions];
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  return mockSessions.find((s) => s.id === id);
}

export async function getActiveSessions(): Promise<Session[]> {
  return mockSessions.filter(
    (s) => s.status === "active" || s.status === "paused"
  );
}

export async function getRecentSessions(limit = 5): Promise<Session[]> {
  return mockSessions.slice(0, limit);
}

export async function getActivityStats(): Promise<ActivityStats> {
  const user = await getCurrentUser();
  if (!user) return { ...mockActivityStats };

  // Calculate real total memories for the current user
  const memories = await getMemories();
  return {
    ...mockActivityStats,
    totalMemories: memories.length,
    memoriesThisWeek: memories.length,
  };
}

export async function getInboxCount(): Promise<number> {
  return mockInboxCount;
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  return [...mockTimelineEvents];
}
