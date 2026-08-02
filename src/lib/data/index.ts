import type { Memory, Session, ActivityStats, TimelineEvent } from "@/types";
import {
  mockMemories,
  mockSessions,
  mockActivityStats,
  mockInboxCount,
  mockCollections,
  mockTags,
  mockTimelineEvents,
} from "@/lib/mock-data";

// Data Access Layer (DAL)
// Currently backed by dynamic mock getters to ensure fresh timestamps and
// single-module query abstraction. When Supabase DB integration lands, only
// these functions will be updated to fetch from Supabase tables.

export async function getMemories(): Promise<Memory[]> {
  return [...mockMemories];
}

export async function getMemoryById(id: string): Promise<Memory | undefined> {
  return mockMemories.find((m) => m.id === id);
}

export async function getRecentMemories(limit = 6): Promise<Memory[]> {
  return mockMemories.slice(0, limit);
}

export async function getSessions(): Promise<Session[]> {
  return [...mockSessions];
}

export async function getSessionById(id: string): Promise<Session | undefined> {
  return mockSessions.find((s) => s.id === id);
}

export async function getActiveSessions(): Promise<Session[]> {
  return mockSessions.filter((s) => s.status === "active" || s.status === "paused");
}

export async function getRecentSessions(limit = 5): Promise<Session[]> {
  return mockSessions.slice(0, limit);
}

export async function getActivityStats(): Promise<ActivityStats> {
  return { ...mockActivityStats };
}

export async function getInboxCount(): Promise<number> {
  return mockInboxCount;
}

export async function getCollections(): Promise<string[]> {
  return [...mockCollections];
}

export async function getTags(): Promise<string[]> {
  return [...mockTags];
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  return [...mockTimelineEvents];
}
