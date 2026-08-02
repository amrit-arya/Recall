# RECALL — Project Specification

## Product

RECALL is a cross-device personal digital memory and work-context recovery application.

It solves two problems:

1. "Where did I save that?"
2. "What was I doing?"

Users capture useful digital information as Memories and organize work as Sessions.

RECALL must work on desktop browsers and Android through a responsive Progressive Web App.

---

# Core Entity 1 — Memory

A Memory represents something the user wants to remember.

Supported memory types:

* URL
* Note
* Text
* Code snippet
* Screenshot
* Image
* PDF

A memory can contain:

* title
* content
* URL
* type
* description
* AI summary
* tags
* collection
* creation date
* attachment
* optional embedding

Users must be able to:

* create
* edit
* delete
* search
* filter
* tag
* attach memories to sessions

---

# Core Entity 2 — Session

A Session represents a period of work.

A session contains:

* name
* description
* start time
* end time
* progress
* next step
* status
* attached memories

Statuses:

* active
* paused
* completed

Users must be able to:

* create session
* start session
* pause session
* resume session
* finish session
* add progress notes
* define next step
* attach memories

The application should prominently show unfinished sessions so users can quickly continue previous work.

---

# Main Pages

## Dashboard

Contains:

* universal search
* quick capture
* continue working
* recent memories
* recent sessions
* inbox count
* basic activity information

## Memories

Contains:

* memory grid/list
* search
* filters
* collections
* tags
* memory creation

## Memory Detail

Contains:

* content
* metadata
* tags
* summary
* associated sessions

## Sessions

Contains:

* active sessions
* paused sessions
* completed sessions

## Session Detail

Contains:

* session name
* elapsed/work time
* progress
* next step
* attached memories
* notes
* session controls

## Search

Unified search across memories and sessions.

## Timeline

Chronological activity history.

## Settings

Contains:

* profile
* theme
* AI preferences
* data preferences

---

# Capture

Quick Capture must be available throughout the application.

Users can capture:

* URL
* note
* text
* code
* image
* screenshot
* PDF

New content can initially enter an Inbox.

---

# Search

V1 must support PostgreSQL text search.

Users should be able to search:

* memory titles
* memory content
* URLs
* summaries
* tags
* session names
* session progress
* next steps

Semantic search may be added later.

The application must remain useful without AI.

---

# AI

AI is an enhancement, not a dependency.

AI may provide:

* summaries
* suggested tags
* suggested collection/category

The application must gracefully work when AI is unavailable.

---

# Cross-Device

RECALL must work as a responsive PWA.

Targets:

* desktop Chrome/Edge
* Android Chrome
* installed desktop PWA
* installed Android PWA

One shared codebase should be maintained.

---

# Technology

Frontend:

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend:

* Next.js server functionality/API routes where appropriate

Database:

* Supabase PostgreSQL

Authentication:

* Supabase Auth

Storage:

* Supabase Storage

Deployment:

* Vercel

AI:

* Gemini API or another replaceable provider

---

# Engineering Principles

1. TypeScript strictness should be maintained.
2. Components should remain reasonably small.
3. Server/client boundaries must be intentional.
4. Secrets must never be exposed to the browser.
5. Database access must respect user ownership.
6. Supabase RLS must protect user data.
7. AI features must fail gracefully.
8. Mobile UX is a first-class requirement.
9. Accessibility should be considered.
10. Do not introduce unnecessary dependencies.
11. Do not prematurely introduce complex architecture.
12. Avoid placeholder implementations pretending to be complete.
13. Existing working functionality should not be rewritten without reason.

---

# Explicitly Out of Scope for V1

Do NOT implement:

* continuous screen recording
* automatic computer activity surveillance
* native Android application
* Electron application
* local LLM
* complex RAG pipeline
* automatic browser-history monitoring
* filesystem monitoring
* collaboration
* social features
* paid subscriptions
* organization/team accounts

Possible future additions:

* browser extension
* semantic/vector search
* Android share target
* desktop helper
* knowledge graph
* automatic metadata enrichment

---

# Product Goal

At the end of V1, a user should be able to:

1. Create an account.
2. Capture useful information.
3. Find previously saved information.
4. Create work sessions.
5. Attach relevant memories to sessions.
6. Record progress.
7. Record the next action.
8. Return later and recover the previous work context.
9. Access the same information from desktop and Android.
