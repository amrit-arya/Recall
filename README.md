# RECALL

### Cross-Device Personal Digital Memory & Work-Context Recovery

RECALL is a personal productivity application designed to answer two simple questions:

> **“Where did I save that?”**
> **“What was I working on?”**

It provides a unified space for saving useful digital information as **Memories** and preserving ongoing work as **Sessions**, allowing users to quickly recover both information and context across devices.

RECALL is built as a responsive Progressive Web App (PWA), with a single codebase supporting desktop browsers and Android devices.

---

## The Problem

Useful information gets scattered across browser tabs, bookmarks, screenshots, PDFs, notes, code snippets, and messaging apps.

At the same time, returning to an unfinished project often means reconstructing context:

* What was completed?
* Which resources were being used?
* What problem was being solved?
* What should happen next?

Traditional bookmark managers preserve links but not work context, while task managers track tasks without preserving the resources associated with them.

RECALL connects both.

---

## The Solution

RECALL models personal digital context using two primary entities.

### Memories

Reusable pieces of information such as:

* URLs
* notes and text
* code snippets
* screenshots and images
* PDFs

Memories can be categorized, tagged, searched, and connected to work sessions.

### Sessions

Sessions represent periods of focused work and preserve:

* current progress
* next action
* session status
* associated memories
* start and completion information

The **Continue Working** workflow surfaces unfinished sessions so previous context can be recovered without reconstructing it manually.

---

## Screenshots

> Add screenshots after deploying the production application.

| Dashboard                        | Memories                        |
| -------------------------------- | ------------------------------- |
| `docs/screenshots/dashboard.png` | `docs/screenshots/memories.png` |

| Session Recovery               | Mobile                        |
| ------------------------------ | ----------------------------- |
| `docs/screenshots/session.png` | `docs/screenshots/mobile.png` |

---

## Key Features

### Memory Management

* Create, edit and delete memories
* Save URLs, notes, text and code snippets
* Upload images and PDFs
* Automatic URL metadata extraction
* Tags and collections
* Type and category filtering

### Work Sessions

* Create and manage work sessions
* Active, paused and completed states
* Record progress and next actions
* Attach existing memories to sessions
* Recover unfinished work through **Continue Working**

### Search

Unified search across personal memories and work sessions, including relevant titles, content, progress and next-step information.

### AI-Assisted Organization

Optional AI enrichment can assist with:

* memory summaries
* tag suggestions
* category suggestions

AI is treated as an enhancement rather than a dependency; core memory and session functionality remains usable without it.

### Personal Timeline

A chronological view helps users understand recently saved information and work activity.

---

## Architecture

```text
                     ┌──────────────────────┐
                     │       RECALL         │
                     │   Next.js App Router │
                     └──────────┬───────────┘
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
             UI / PWA                  Server Logic
                  │                           │
                  │                ┌──────────┴─────────┐
                  │                │                    │
                  ▼                ▼                    ▼
              Supabase         PostgreSQL          Gemini API
                  │
       ┌──────────┼──────────┐
       │          │          │
      Auth     Database    Storage
```

The application uses a single responsive codebase rather than maintaining separate desktop and mobile applications.

---

## Technology Stack

**Frontend**

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

**Backend & Data**

* Next.js server functionality
* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage

**AI**

* Google Gemini API

**Deployment**

* Vercel
* Progressive Web App

---

## Database Design

The core relational model is intentionally small.

```text
auth.users
    │
    └── profiles

profiles
    │
    ├── memories
    │      │
    │      └── memory_tags ─── tags
    │
    └── sessions
           │
           └── session_memories ─── memories
```

Primary tables:

* `profiles`
* `memories`
* `tags`
* `memory_tags`
* `sessions`
* `session_memories`

UUID primary keys are used throughout the application.

The `session_memories` relationship allows the same memory to participate in multiple work sessions without duplicating the underlying information.

---

## Authentication & Security

Authentication and user ownership are handled through Supabase.

Security considerations include:

* Supabase Auth for user authentication
* PostgreSQL Row Level Security
* user-owned memory and session records
* private file storage
* server-side handling of sensitive operations
* environment-based secret management
* server-side AI API access

Authorization is enforced at the data layer rather than relying only on frontend filtering.

---

## AI Integration

RECALL uses Gemini as an optional enrichment layer.

```text
Memory
   │
   ▼
Server-side AI service
   │
   ├── Summary
   ├── Suggested tags
   └── Suggested category
```

Provider-specific functionality is kept separate from the core application logic so AI services can be changed without redesigning the primary data model.

AI failure does not prevent users from creating or retrieving memories.

---

## PWA & Cross-Device Support

RECALL is designed as a Progressive Web App.

The same application supports:

* desktop browsers
* Android browsers
* desktop PWA installation
* Android PWA installation

This keeps the project within a single maintainable codebase while allowing users to access the same synchronized data across devices.

---

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd recall
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env.local
```

using the required variables from `.env.example`.

### 4. Start development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Before committing changes:

```bash
npm run lint
npm run build
```

---

## Environment Variables

Example configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

GEMINI_API_KEY=
```

Depending on the final Supabase integration, variable names may differ slightly. Refer to `.env.example` for the authoritative list.

Never commit `.env.local` or production credentials.

---

## Usage

A typical RECALL workflow looks like:

```text
Capture useful resource
        ↓
Create Memory
        ↓
Categorize / Tag
        ↓
Attach to Work Session
        ↓
Record Progress
        ↓
Define Next Step
        ↓
Pause Session
        ↓
Return Later
        ↓
Continue Working
```

Users can also search their stored memories independently of sessions.

---

## Project Structure

```text
recall/
├── docs/
│   ├── PROJECT_SPEC.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT_LOG.md
│
├── public/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
│
├── .env.example
├── package.json
└── README.md
```

The exact structure may evolve as implementation progresses.

---

## Engineering Decisions

### AI is optional

Core search, memories and sessions do not depend on an LLM. This reduces external API dependency and keeps the application useful when AI services are unavailable.

### Database-level authorization

User isolation is enforced using PostgreSQL Row Level Security rather than relying solely on application queries.

### One cross-device codebase

A PWA was chosen over separate native desktop and Android applications to reduce duplication and keep the project maintainable.

### Sessions reference Memories

Resources are linked through relational associations instead of being duplicated inside sessions.

### Explicit context recovery

Instead of automatically monitoring user activity, RECALL stores intentional progress and next-step information. This keeps the system simpler and avoids unnecessary privacy concerns.

---

## Current Limitations

The initial version intentionally avoids:

* native Android functionality
* automatic browser-history monitoring
* automatic desktop activity tracking
* offline database synchronization
* local AI models
* complex RAG pipelines
* collaboration features

The project prioritizes reliable capture, retrieval and work-context recovery over feature quantity.

---

## Future Roadmap

Potential future improvements include:

* semantic search using vector embeddings
* browser extension for one-click capture
* richer Android sharing integration
* OCR for screenshots
* related-memory recommendations
* improved offline capabilities
* personal knowledge graph
* enhanced metadata extraction

These are roadmap items and are not considered part of the current implementation.

---

## Lessons Learned

Building RECALL explores practical engineering problems beyond basic CRUD:

* designing relational models around real user workflows
* implementing secure user isolation with Row Level Security
* handling authenticated file storage
* designing server/client boundaries in Next.js
* integrating external AI without making it a critical dependency
* building responsive interfaces for multiple device classes
* designing around failure states and unreliable external services
* balancing useful functionality against unnecessary complexity

The project reinforced an important design principle:

> **A useful system does not need to remember everything — it needs to preserve the right context at the right time.**

---

## Author

**Amrit Arya**

B.Tech Computer Science & Engineering
ITER, Siksha 'O' Anusandhan University

---

## License

This project is intended for personal and educational use. Add an explicit open-source license before redistributing or accepting external contributions.
