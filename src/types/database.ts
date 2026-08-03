export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MemoryType =
  | 'url'
  | 'note'
  | 'text'
  | 'code'
  | 'screenshot'
  | 'image'
  | 'pdf'

export type SessionStatus = 'active' | 'paused' | 'completed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          url: string | null
          type: MemoryType
          description: string | null
          ai_summary: string | null
          collection: string | null
          attachment_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          url?: string | null
          type: MemoryType
          description?: string | null
          ai_summary?: string | null
          collection?: string | null
          attachment_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          url?: string | null
          type?: MemoryType
          description?: string | null
          ai_summary?: string | null
          collection?: string | null
          attachment_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      memory_tags: {
        Row: {
          memory_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          memory_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          memory_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_tags_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_time: string | null
          end_time: string | null
          progress: string | null
          next_step: string | null
          status: SessionStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          progress?: string | null
          next_step?: string | null
          status?: SessionStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          progress?: string | null
          next_step?: string | null
          status?: SessionStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_memories: {
        Row: {
          session_id: string
          memory_id: string
          created_at: string
        }
        Insert: {
          session_id: string
          memory_id: string
          created_at?: string
        }
        Update: {
          session_id?: string
          memory_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_memories_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_memories_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
