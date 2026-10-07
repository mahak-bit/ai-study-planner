# Architecture

This document covers the system design behind the AI Study Planner: how requests flow through the app, the database schema and the reasoning behind it, the AI/agent architecture, and the security model. See the [README](./README.md) for setup and the phase-by-phase build log.

## System overview

```
Browser
  │
  ├─ Server Components (data reads)         ──┐
  ├─ Server Actions (owned-entity CRUD)        │
  └─ Route Handlers (/api/**)                  ├─► lib/services/*  ──► Prisma ──► Postgres (Neon)
       - streaming (AI Coach)                  │
       - AI generation (plan/regenerate/       │
         progress)                             │
                                                └─► lib/ai/* (agents, tools, provider)
                                                        │
                                                        └─► Google Gemini (Vercel AI SDK)
```

- **Server Actions** handle simple owned-entity CRUD (subjects, topics, exams, tasks, recommendations, onboarding) — colocated with the forms that call them, minimal boilerplate.
- **Route Handlers** (`app/api/**`) handle anything that needs streaming or reads like a real API: AI plan generation/regeneration, AI insight generation, and the streaming AI Coach chat.
- **Business logic lives in `lib/services/*`**, called by both entry points — logic is never trapped inside a UI component or duplicated between a Server Action and a Route Handler.
- **Every service function takes a server-verified `userId`** (from `requireUser()`/`getCurrentUser()`, never from client input) and scopes every Prisma query by it. This is the single mechanism that prevents cross-user data access — see [Security](#security).

## Database schema

PostgreSQL via [Neon](https://neon.tech) (serverless, generous free tier, connection pooling built in), Prisma ORM. Two connection strings: `DATABASE_URL` (pooled, `-pooler` in the hostname, used by the app at runtime via `@prisma/adapter-neon`) and `DIRECT_URL` (unpooled, used only by the Prisma CLI for migrations) — mixing these up is a well-known way to exhaust connections on serverless.

Core entities, and the reasoning that survived review:

| Entity                                               | Why it exists / notable decisions                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User` / `Account` / `Session` / `VerificationToken` | Auth.js's own Prisma-adapter tables.                                                                                                                                                                                                                                                                                                                                                                                              |
| `Profile`                                            | 1:1 with `User`. `weeklyAvailabilityHours` is a JSON blob (per-weekday hours) rather than a 7-row table — real availability is uneven and a full relation is overkill for this shape.                                                                                                                                                                                                                                             |
| `Subject` / `Topic`                                  | No stored confidence/progress aggregate on `Subject` — always derived at read time from its `Topic`s, so it can't drift out of sync.                                                                                                                                                                                                                                                                                              |
| `Exam`                                               | `examDate` is `@db.Date` (a calendar-day concept, not a timestamp — no timezone ambiguity).                                                                                                                                                                                                                                                                                                                                       |
| `ExamTopic`                                          | Join table (not in every naive schema sketch) — without it, neither the planner nor the rescheduler can tell which topics a given exam actually covers, which is the single strongest prioritization signal both of them use.                                                                                                                                                                                                     |
| `StudyPlan` / `StudyTask`                            | `StudyTask.userId` is denormalized (duplicated from the plan) because "all of this user's tasks" is the hot-path query for the dashboard, planner, and every AI tool — avoids joining through `StudyPlan` every time. `rescheduledFromId` is a self-relation giving traceable lineage for redistributed work.                                                                                                                     |
| `StudySession`                                       | Actual logged study time (vs. `StudyTask`, which is the _plan_) — feeds consistency analytics.                                                                                                                                                                                                                                                                                                                                    |
| `QuizAttempt`                                        | Lightweight manual score logging — the student records a quiz or practice test taken elsewhere against one of their topics, from the subject page. `userId` is stored directly (like `StudyTask`), and creation verifies the topic belongs to the user through its subject. The latest attempt per topic feeds the AI Coach's `getWeakTopics` tool, which flags topics scoring under 60% even when self-rated confidence is high. |
| `AIConversation` / `AIMessage`                       | AI Coach chat history. One conversation per user in the current UI (see below).                                                                                                                                                                                                                                                                                                                                                   |
| `Recommendation`                                     | Replaces a full notification/delivery system. Fed by two sources: the deterministic rebalance engine (`SCHEDULE_SHORTFALL`, when a missed task's time can't fully fit) and the Progress Agent (`WEAK_TOPIC` / `EXAM_RISK` / `CONSISTENCY` / `GENERAL`).                                                                                                                                                                           |
| `AIGenerationLog`                                    | Minimal LLMOps observability — every agent call (Planning, Progress, Coach) is logged with input/output, model, token counts, latency, and success/error, so generation history isn't lost and failures are diagnosable. Also backs the per-agent rate limiter.                                                                                                                                                                   |

Cascade behavior: deleting a `User` cascades everything; deleting a `Subject` cascades its `Topic`s; deleting a `StudyPlan` cascades its `StudyTask`s; but deleting a `Topic` or `Subject` sets `StudyTask.topicId`/`subjectId` to `NULL` rather than deleting the task — a completed task's history shouldn't vanish because someone tidied up their subject list later.

## AI architecture

Three distinct AI surfaces, each shaped for what it actually does rather than forced into one interface:

**PlanningAgent** and **ProgressAgent** share a single-shot, structured-output pattern: `generateText({ model, system, prompt, output: Output.object({ schema }) })` against a Zod schema, with a retry-once-on-validation-failure contract. If the model's output still doesn't validate on the second attempt (or the provider returns a 429), the agent throws a typed `AgentError { retryable }` rather than crashing — callers map that to a user-facing error or a deterministic fallback. This contract is unit-tested by mocking `generateText` directly (see `tests/unit/planningAgent.test.ts`), not just by testing the Zod schema in isolation.

- `PlanningAgent` generates and regenerates the day-by-day schedule. "Optimize with AI" (triggered from a missed task) seeds the prompt with a note describing what the deterministic rebalance already did, so the model refines an existing baseline instead of inventing a schedule from scratch.
- `ProgressAgent` turns real aggregates (streak, completion rate, weak topics, subject progress, upcoming exams) into a small set of grounded insights, persisted as `Recommendation` rows.

**The AI Coach** is a genuine multi-turn tool-calling agent (`streamText` + `tools` + `stopWhen: stepCountIs(5)`), not a plain chatbot wrapper. It has four read-only tools — `getStudentContext`, `getUpcomingExams`, `getWeakTopics`, `getTodayTasks` — and each one binds `userId` via closure rather than accepting it as a model-supplied argument, so the coach cannot be prompted into reading another user's data; there's no parameter through which it could even ask. It has no write tools at all: it's explicitly instructed that it can't modify plans, tasks, or subjects, and points the student at the Planner's existing "Mark missed" / "Optimize with AI" actions instead. Coach-triggered replanning is deliberately out of scope, so a chat answer can never silently trigger a write.

**Provider abstraction**: every agent imports `planningModel` / `chatModel` from `lib/ai/provider.ts`, never a provider SDK directly. The app actually exercised this swap once — it started on the OpenAI API, then moved to Google Gemini (free tier, no billing required) after hitting a real quota wall, and the change touched only `provider.ts` and `env.ts`.

**AI output is never trusted for a write without a second check.** A model can only be handed real subject/topic IDs in its prompt context, but a hallucinated or cross-tenant ID would still pass Zod schema validation — every service that persists AI output (`plan.service.ts`, `progress.service.ts`) filters the model's response against the requesting user's actual subject/topic IDs before any database write.

## Adaptive rescheduling (the core differentiator)

Two tiers, matching the spec's requirement that a missed task trigger real reconsideration, not just a status flip:

1. **Deterministic rebalance** (`lib/services/scheduling/rebalance.ts`) — a pure function, unit-tested with no DB access inside it, that runs synchronously and immediately whenever a task is marked missed. It pools the missed task's minutes, scores candidate pending tasks by same-topic bonus + exam proximity + low-confidence weighting, and allocates against each day's real capacity (`Profile.weeklyAvailabilityHours`). If the pool can't fully fit within the horizon, it does a partial allocation and surfaces the shortfall as a `Recommendation` — it never silently overloads a day or drops minutes on the floor.
2. **AI-enhanced regeneration** ("Optimize with AI") — an explicit user action, not automatic on every miss, seeded with the deterministic result as a baseline.

## Security

- **Authorization**: every service function scopes its Prisma queries by a server-derived `userId` (`where: { id, userId }`, or a nested relation filter like `where: { subject: { userId } }`). This is unit-tested directly (`tests/unit/authorization.test.ts`) by mocking Prisma with a two-user fixture whose mocked queries actually honor the `userId` filter, so the test fails if a service ever drops its scope — not just because the mock returns `null` regardless of input.
- **Route protection**: `proxy.ts` (Next.js 16's replacement for `middleware.ts`) gates every protected/onboarding route. The redirect decision itself is extracted into a pure function (`lib/auth/routeGuard.ts`) so it's unit-testable without mocking Auth.js internals, and separately covered by an E2E test against a real request.
- **Secrets** live only in `.env` (never committed) and are Zod-validated at boot (`lib/env.ts`) so a missing var fails fast and loudly instead of failing confusingly mid-request. No API key is ever sent to the client.
- **Rate limiting** on every AI-invoking route, via a DB count against `AIGenerationLog` rather than a Redis dependency the project doesn't otherwise need. Each agent gets its own bucket (5/hour for plan generation and progress insights, 20/hour for the Coach, since a chat naturally needs more turns per session than a full regeneration).
- A **real, latent production bug** was found and fixed during this project by testing against an actual `next build && next start` rather than only `next dev`: Auth.js only trusts the request's Host header by default when `NODE_ENV !== "production"` or a `VERCEL`/`CF_PAGES` env var is present. Outside Vercel, a production build was throwing `UntrustedHost` on every sign-in. Fixed with an explicit `trustHost: true` in `auth.ts`.

## Cut from this MVP

Called out explicitly rather than silently dropped, per the project's own anti-overengineering directive:

- **Multi-conversation Coach history** — one `AIConversation` per user, no switcher UI. Nothing in the spec asked for chat-history management as a product surface.
- **A separate dashboard "schedule overview" widget** — the Planner page already serves that purpose; a static duplicate would add no value.
- **Revision / Performance / Schedule-Optimization agents, coach-triggered replanning, a full notification system, syllabus-PDF/RAG upload, and proactive cron-based rescheduling** — see the README roadmap. The `Agent<TInput,TOutput>`-shaped agents (Planning, Progress) are designed so adding another one is a new file, not a rearchitecture.
