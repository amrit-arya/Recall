-- ============================================================
-- RECALL — PostgreSQL Universal Text Search Migration
-- Adds trigram GIN indexes for fast, scalable pattern matching
-- ============================================================

-- 1. Enable pg_trgm extension for trigram similarity & GIN index support
create extension if not exists pg_trgm;

-- 2. Create GIN Trigram Index on Memories (title, description, content, url)
create index if not exists memories_trgm_search_idx
on public.memories
using gin (
    (
        title || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(content, '') || ' ' ||
        coalesce(url, '')
    ) gin_trgm_ops
);

-- 3. Create GIN Trigram Index on Sessions (name, description, progress, next_step)
create index if not exists sessions_trgm_search_idx
on public.sessions
using gin (
    (
        name || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(progress, '') || ' ' ||
        coalesce(next_step, '')
    ) gin_trgm_ops
);
