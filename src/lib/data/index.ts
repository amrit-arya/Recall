import type { Memory, Session, ActivityStats, TimelineEvent } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { STORAGE_BUCKET } from "@/lib/supabase/storage";

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

interface SupabaseSessionRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  progress: string | null;
  next_step: string | null;
  status: Session["status"];
  created_at: string;
  updated_at: string;
  session_memories?: { memory_id: string }[];
}

/** Helper to resolve signed URLs in a single batch call */
export async function resolveSignedUrlMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paths: string[]
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const uniquePaths = Array.from(new Set(paths.filter((p): p is string => Boolean(p))));
  if (uniquePaths.length === 0) return urlMap;

  try {
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(uniquePaths, 3600); // 1 hour expiry

    if (data) {
      data.forEach((item) => {
        if (item.path && item.signedUrl) {
          urlMap.set(item.path, item.signedUrl);
        }
      });
    }
  } catch (err) {
    console.warn("Batch createSignedUrls error:", err);
  }

  return urlMap;
}

/** Helper to map raw Supabase row + relations to application Memory model synchronously */
function mapRowToMemorySync(
  row: SupabaseMemoryRow,
  attachmentUrl?: string
): Memory {
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

/** Helper to map raw Supabase session row to application Session model */
function mapRowToSession(row: SupabaseSessionRow): Session {
  const memoryCount = Array.isArray(row.session_memories)
    ? row.session_memories.length
    : 0;

  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    startTime: row.start_time || row.created_at,
    endTime: row.end_time || undefined,
    progress: row.progress || undefined,
    nextStep: row.next_step || undefined,
    status: row.status,
    memoryCount,
  };
}

/**
 * Fetch all memories for the authenticated user from Supabase PostgreSQL.
 * Uses batched URL signing for attachments.
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
    console.error("Error fetching memories from Supabase:", error);
    return [];
  }

  const rows = data as unknown as SupabaseMemoryRow[];
  const attachmentPaths = rows.map((r) => r.attachment_path).filter((p): p is string => Boolean(p));
  const signedUrlMap = await resolveSignedUrlMap(supabase, attachmentPaths);

  return rows.map((row) => {
    const attachmentUrl = row.attachment_path ? signedUrlMap.get(row.attachment_path) : undefined;
    return mapRowToMemorySync(row, attachmentUrl);
  });
}

export async function getMemoryById(id: string): Promise<Memory | undefined> {
  const user = await getCurrentUser();
  if (!user) return undefined;

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
    .single();

  if (error || !data) {
    return undefined;
  }

  const row = data as unknown as SupabaseMemoryRow;
  const attachmentPaths = row.attachment_path ? [row.attachment_path] : [];
  const signedUrlMap = await resolveSignedUrlMap(supabase, attachmentPaths);
  const attachmentUrl = row.attachment_path ? signedUrlMap.get(row.attachment_path) : undefined;

  return mapRowToMemorySync(row, attachmentUrl);
}

export async function getSessions(): Promise<Session[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      session_memories (
        memory_id
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching sessions from Supabase:", error);
    return [];
  }

  const rows = data as unknown as SupabaseSessionRow[];
  return rows.map(mapRowToSession);
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  const user = await getCurrentUser();
  if (!user) return undefined;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      session_memories (
        memory_id
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return undefined;
  }

  const row = data as unknown as SupabaseSessionRow;
  return mapRowToSession(row);
}

export async function getMemoriesBySessionId(sessionId: string): Promise<Memory[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_memories")
    .select(`
      memory_id,
      memories!inner (
        *,
        memory_tags (
          tags ( name )
        ),
        session_memories (
          session_id
        )
      )
    `)
    .eq("session_id", sessionId)
    .eq("memories.user_id", user.id);

  if (error || !data) {
    return [];
  }

  interface SessionMemoryJoinRow {
    memory_id: string;
    memories: SupabaseMemoryRow;
  }

  const rows = (data as unknown as SessionMemoryJoinRow[]).map((r) => r.memories);
  const attachmentPaths = rows.map((r) => r.attachment_path).filter((p): p is string => Boolean(p));
  const signedUrlMap = await resolveSignedUrlMap(supabase, attachmentPaths);

  return rows.map((row) => {
    const attachmentUrl = row.attachment_path ? signedUrlMap.get(row.attachment_path) : undefined;
    return mapRowToMemorySync(row, attachmentUrl);
  });
}

export const getMemoriesForSession = getMemoriesBySessionId;

export async function getSessionsByMemoryId(memoryId: string): Promise<Session[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_memories")
    .select(`
      session_id,
      sessions!inner (
        *,
        session_memories (
          memory_id
        )
      )
    `)
    .eq("memory_id", memoryId)
    .eq("sessions.user_id", user.id);

  if (error || !data) {
    return [];
  }

  interface MemorySessionJoinRow {
    session_id: string;
    sessions: SupabaseSessionRow;
  }

  const rows = (data as unknown as MemorySessionJoinRow[]).map((r) => r.sessions);
  return rows.map(mapRowToSession);
}

export const getSessionsForMemory = getSessionsByMemoryId;

export async function getCollections(): Promise<string[]> {
  const memories = await getMemories();
  const collections = memories
    .map((m) => m.collection)
    .filter((c): c is string => typeof c === "string" && c.trim().length > 0);
  return Array.from(new Set(collections));
}

export async function getTags(): Promise<string[]> {
  const memories = await getMemories();
  const tags = memories.flatMap((m) => m.tags);
  return Array.from(new Set(tags));
}

export async function getRecentMemories(limit = 5): Promise<Memory[]> {
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
    return [];
  }

  const rows = data as unknown as SupabaseMemoryRow[];
  const attachmentPaths = rows.map((r) => r.attachment_path).filter((p): p is string => Boolean(p));
  const signedUrlMap = await resolveSignedUrlMap(supabase, attachmentPaths);

  return rows.map((row) => {
    const attachmentUrl = row.attachment_path ? signedUrlMap.get(row.attachment_path) : undefined;
    return mapRowToMemorySync(row, attachmentUrl);
  });
}

export async function getUnfinishedSessions(limit = 5): Promise<Session[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      session_memories (
        memory_id
      )
    `)
    .eq("user_id", user.id)
    .in("status", ["active", "paused"])
    .order("updated_at", { ascending: false })
    .limit(limit * 2);

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as SupabaseSessionRow[];
  const sessions = rows.map(mapRowToSession);

  // Sort active sessions first, then paused sessions
  const sorted = sessions.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;
    return 0;
  });

  return sorted.slice(0, limit);
}

export async function getRecentSessions(limit = 5): Promise<Session[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      session_memories (
        memory_id
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as SupabaseSessionRow[];
  return rows.map(mapRowToSession);
}

export async function getActivityStats(): Promise<ActivityStats> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      memoriesThisWeek: 0,
      sessionsThisWeek: 0,
      totalMemories: 0,
      totalSessions: 0,
    };
  }

  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    memoriesThisWeekRes,
    sessionsThisWeekRes,
    totalMemoriesRes,
    totalSessionsRes,
  ] = await Promise.all([
    supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return {
    memoriesThisWeek: memoriesThisWeekRes.count || 0,
    sessionsThisWeek: sessionsThisWeekRes.count || 0,
    totalMemories: totalMemoriesRes.count || 0,
    totalSessions: totalSessionsRes.count || 0,
  };
}

/** Real query for uncategorized memories (Inbox count) */
export async function getInboxCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("memories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("collection", null);

  if (error || count === null) return 0;
  return count;
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const [memories, sessions] = await Promise.all([
    getMemories(),
    getSessions(),
  ]);

  const events: TimelineEvent[] = [];

  // Synthesize events from user memories
  memories.forEach((mem) => {
    events.push({
      id: `mem-${mem.id}`,
      type: "memory_created",
      title: "Captured memory",
      description: mem.description || (mem.content ? mem.content.slice(0, 120) : undefined),
      entityId: mem.id,
      entityName: mem.title,
      createdAt: mem.createdAt,
    });
  });

  // Synthesize events from user sessions
  sessions.forEach((sess) => {
    // Session Started event
    if (sess.startTime) {
      events.push({
        id: `sess-start-${sess.id}`,
        type: "session_started",
        title: "Started session",
        description: sess.description || undefined,
        entityId: sess.id,
        entityName: sess.name,
        createdAt: sess.startTime,
      });
    }

    // Session Paused event
    if (sess.status === "paused") {
      events.push({
        id: `sess-pause-${sess.id}`,
        type: "session_paused",
        title: "Paused session",
        description: sess.progress ? `Progress: ${sess.progress}` : undefined,
        entityId: sess.id,
        entityName: sess.name,
        createdAt: sess.startTime,
      });
    }

    // Session Completed event
    if (sess.status === "completed") {
      events.push({
        id: `sess-completed-${sess.id}`,
        type: "session_completed",
        title: "Completed session",
        description: sess.progress ? `Final progress: ${sess.progress}` : undefined,
        entityId: sess.id,
        entityName: sess.name,
        createdAt: sess.endTime || sess.startTime,
      });
    }
  });

  // Sort events chronologically descending (newest first)
  events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return events;
}
