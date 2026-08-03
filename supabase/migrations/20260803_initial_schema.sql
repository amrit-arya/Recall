-- ============================================================
-- RECALL
-- Initial application schema
-- ============================================================

-- ============================================================
-- 1. Utility function: updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- ============================================================
-- 2. Profiles
-- ============================================================

create table public.profiles (
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    display_name text,
    avatar_url text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 3. Memories
-- ============================================================

create table public.memories (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    title text not null,

    content text,
    url text,

    type text not null
        check (
            type in (
                'url',
                'note',
                'text',
                'code',
                'screenshot',
                'image',
                'pdf'
            )
        ),

    description text,

    -- Reserved for optional AI-generated summaries.
    -- The application must never depend on this field.
    ai_summary text,

    -- V1 collection/category label.
    -- Can become a normalized entity later if required.
    collection text,

    -- Path/key of the object in Supabase Storage.
    -- Do not store file bytes in PostgreSQL.
    attachment_path text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- 4. Tags
-- ============================================================

create table public.tags (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    name text not null,

    created_at timestamptz not null default now(),

    constraint tags_user_name_unique
        unique (user_id, name)
);


-- ============================================================
-- 5. Memory <-> Tag relationship
-- ============================================================

create table public.memory_tags (
    memory_id uuid not null
        references public.memories(id)
        on delete cascade,

    tag_id uuid not null
        references public.tags(id)
        on delete cascade,

    created_at timestamptz not null default now(),

    primary key (memory_id, tag_id)
);


-- ============================================================
-- 6. Sessions
-- ============================================================

create table public.sessions (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    name text not null,
    description text,

    start_time timestamptz,
    end_time timestamptz,

    progress text,
    next_step text,

    status text not null default 'active'
        check (
            status in (
                'active',
                'paused',
                'completed'
            )
        ),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint sessions_valid_time_range
        check (
            end_time is null
            or start_time is null
            or end_time >= start_time
        )
);


-- ============================================================
-- 7. Session <-> Memory relationship
-- ============================================================

create table public.session_memories (
    session_id uuid not null
        references public.sessions(id)
        on delete cascade,

    memory_id uuid not null
        references public.memories(id)
        on delete cascade,

    created_at timestamptz not null default now(),

    primary key (session_id, memory_id)
);


-- ============================================================
-- 8. updated_at triggers
-- ============================================================

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


create trigger memories_set_updated_at
before update on public.memories
for each row
execute function public.set_updated_at();


create trigger sessions_set_updated_at
before update on public.sessions
for each row
execute function public.set_updated_at();


-- ============================================================
-- 9. Indexes
-- ============================================================

-- Memories

create index memories_user_created_idx
    on public.memories (user_id, created_at desc);

create index memories_user_type_idx
    on public.memories (user_id, type);

create index memories_user_collection_idx
    on public.memories (user_id, collection)
    where collection is not null;


-- Tags

-- The UNIQUE(user_id, name) constraint already creates an index
-- suitable for user/tag lookup.


-- memory_tags

-- PK already indexes (memory_id, tag_id).
-- Reverse lookup is also required.

create index memory_tags_tag_id_idx
    on public.memory_tags (tag_id);


-- Sessions

create index sessions_user_status_idx
    on public.sessions (user_id, status);

create index sessions_user_created_idx
    on public.sessions (user_id, created_at desc);

create index sessions_user_status_updated_idx
    on public.sessions (user_id, status, updated_at desc);


-- session_memories

-- PK already indexes (session_id, memory_id).
-- Reverse lookup supports "which sessions contain this memory?"

create index session_memories_memory_id_idx
    on public.session_memories (memory_id);


-- ============================================================
-- 10. Enable Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.memories enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;
alter table public.sessions enable row level security;
alter table public.session_memories enable row level security;


-- ============================================================
-- 11. Profiles RLS
-- ============================================================

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
    (select auth.uid()) = id
);


create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (
    (select auth.uid()) = id
);


create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
    (select auth.uid()) = id
)
with check (
    (select auth.uid()) = id
);


create policy "Users can delete own profile"
on public.profiles
for delete
to authenticated
using (
    (select auth.uid()) = id
);


-- ============================================================
-- 12. Memories RLS
-- ============================================================

create policy "Users can view own memories"
on public.memories
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


create policy "Users can create own memories"
on public.memories
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


create policy "Users can update own memories"
on public.memories
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


create policy "Users can delete own memories"
on public.memories
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- ============================================================
-- 13. Tags RLS
-- ============================================================

create policy "Users can view own tags"
on public.tags
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


create policy "Users can create own tags"
on public.tags
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


create policy "Users can update own tags"
on public.tags
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


create policy "Users can delete own tags"
on public.tags
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- ============================================================
-- 14. memory_tags RLS
-- ============================================================

create policy "Users can view own memory tags"
on public.memory_tags
for select
to authenticated
using (
    exists (
        select 1
        from public.memories m
        where m.id = memory_tags.memory_id
          and m.user_id = (select auth.uid())
    )
    and exists (
        select 1
        from public.tags t
        where t.id = memory_tags.tag_id
          and t.user_id = (select auth.uid())
    )
);


create policy "Users can create own memory tags"
on public.memory_tags
for insert
to authenticated
with check (
    exists (
        select 1
        from public.memories m
        where m.id = memory_tags.memory_id
          and m.user_id = (select auth.uid())
    )
    and exists (
        select 1
        from public.tags t
        where t.id = memory_tags.tag_id
          and t.user_id = (select auth.uid())
    )
);


create policy "Users can delete own memory tags"
on public.memory_tags
for delete
to authenticated
using (
    exists (
        select 1
        from public.memories m
        where m.id = memory_tags.memory_id
          and m.user_id = (select auth.uid())
    )
    and exists (
        select 1
        from public.tags t
        where t.id = memory_tags.tag_id
          and t.user_id = (select auth.uid())
    )
);


-- ============================================================
-- 15. Sessions RLS
-- ============================================================

create policy "Users can view own sessions"
on public.sessions
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


create policy "Users can create own sessions"
on public.sessions
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);


create policy "Users can update own sessions"
on public.sessions
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);


create policy "Users can delete own sessions"
on public.sessions
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);


-- ============================================================
-- 16. session_memories RLS
-- ============================================================

create policy "Users can view own session memories"
on public.session_memories
for select
to authenticated
using (
    exists (
        select 1
        from public.sessions s
        where s.id = session_memories.session_id
          and s.user_id = (select auth.uid())
    )
    and exists (
        select 1
        from public.memories m
        where m.id = session_memories.memory_id
          and m.user_id = (select auth.uid())
    )
);


create policy "Users can create own session memories"
on public.session_memories
for insert
to authenticated
with check (
    exists (
        select 1
        from public.sessions s
        where s.id = session_memories.session_id
          and s.user_id = (select auth.uid())
    )
    and exists (
        select 1
        from public.memories m
        where m.id = session_memories.memory_id
          and m.user_id = (select auth.uid())
    )
);


create policy "Users can delete own session memories"
on public.session_memories
for delete
to authenticated
using (
    exists (
        select 1
        from public.sessions s
        where s.id = session_memories.session_id
          and s.user_id = (select auth.uid())
    )
    and exists (
        select 1
        from public.memories m
        where m.id = session_memories.memory_id
          and m.user_id = (select auth.uid())
    )
);