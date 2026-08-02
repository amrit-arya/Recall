// =============================================================================
// RECALL — Core Entity Types
// =============================================================================

/** Supported memory content types */
export type MemoryType =
  | "url"
  | "note"
  | "text"
  | "code"
  | "screenshot"
  | "image"
  | "pdf";

/** Supported session statuses */
export type SessionStatus = "active" | "paused" | "completed";

/** A Memory represents something the user wants to remember */
export interface Memory {
  id: string;
  title: string;
  content?: string;
  url?: string;
  type: MemoryType;
  description?: string;
  aiSummary?: string;
  tags: string[];
  collection?: string;
  createdAt: string; // ISO 8601
  attachmentUrl?: string;
  sessionIds?: string[]; // sessions this memory is attached to
}

/** A Session represents a period of work */
export interface Session {
  id: string;
  name: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  progress?: string;
  nextStep?: string;
  status: SessionStatus;
  memoryCount: number;
  progressNotes?: ProgressNote[];
}

/** A progress note within a session */
export interface ProgressNote {
  id: string;
  content: string;
  createdAt: string; // ISO 8601
}

/** Dashboard activity stats */
export interface ActivityStats {
  memoriesThisWeek: number;
  sessionsThisWeek: number;
  totalMemories: number;
  totalSessions: number;
}

/** Timeline event types */
export type TimelineEventType =
  | "memory_created"
  | "session_started"
  | "session_paused"
  | "session_completed"
  | "progress_note"
  | "memory_tagged";

/** A timeline event */
export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  entityId: string; // memory or session id
  entityName: string;
  createdAt: string; // ISO 8601
}
