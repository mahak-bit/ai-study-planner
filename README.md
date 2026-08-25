# AI Study Planner

A production-grade, AI-powered study planning platform. Students provide their subjects, topics, exams, and availability; an AI planning layer generates a personalized study schedule and continuously adapts it as tasks are completed or missed. An AI Coach answers context-aware questions grounded in the student's real data.

## The problem

Most study planners are static — you fill in a schedule once, and the moment you miss a session, the plan just sits there, wrong. Nothing reconsiders your exam dates, how confident you actually feel about each topic, or how much time you realistically have left. You end up either abandoning the plan or manually rebuilding it, which is exactly the kind of busywork a planner is supposed to remove.

## The solution

An AI planning layer builds the initial schedule from your real subjects, topics, exam dates, and weekly availability. When something gets missed, a deterministic rebalancing engine redistributes that time across your upcoming days automatically — weighted by exam urgency and how low-confidence the topic is — and an optional "Optimize with AI" pass can refine that further. An AI Coach answers questions like _"why am I behind?"_ or _"what should I study today?"_ by actually calling into your real schedule, exams, and progress data, not by guessing.

## Features

- **AI-generated study plans** — a planning agent builds a day-by-day schedule from your subjects, topics, exam dates, and real available hours, using structured, schema-validated output.
- **Adaptive rescheduling** — missing a task triggers a deterministic engine that redistributes the missed time across upcoming days, respecting each day's real capacity and never silently dropping minutes.
- **"Optimize with AI"** — an explicit, on-demand regeneration seeded with the deterministic result, so the model refines a real baseline instead of inventing a schedule from scratch.
- **AI Coach** — a genuine multi-turn, tool-calling agent (not a chatbot wrapper) that reads your real schedule, exams, weak topics, and streak before answering, and is structurally unable to read another user's data or modify your plan.
- **Progress analytics** — study time, completion rate, subject progress, and a consistency view, each answering a specific question rather than existing for decoration.
- **Full auth + onboarding** — email/password (Credentials) with optional Google OAuth, an onboarding wizard, and route protection that redirects based on both authentication and onboarding-completion state.
- **A planner that reflects reality** — complete, miss, delete, or reopen tasks freely; every change immediately updates your schedule, streak, and analytics.

## Architecture, database schema & AI design

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full write-up: request flow, the database schema and the reasoning behind each entity, the AI/agent architecture (PlanningAgent, ProgressAgent, and the AI Coach's tool-calling loop), the adaptive rescheduling design, and the security model — including a real production bug this project's own testing caught and fixed.

## Tech stack

| Layer      | Choice                                                                       | Why                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router), TypeScript (strict)                                 | Server Components/Actions cut client JS and boilerplate API layers.                                                                 |
| UI         | Tailwind CSS v4, shadcn/ui (Base UI primitives), lucide-react, Framer Motion | Owned, composable components rather than a black-box UI kit — accessible-by-default, fully stylable.                                |
| Database   | PostgreSQL via [Neon](https://neon.tech), Prisma ORM                         | Serverless Postgres with a generous free tier and no local Docker/Postgres install friction.                                        |
| Auth       | Auth.js v5, Credentials + optional Google OAuth                              | Self-owned session/authorization logic rather than a black-box provider — the exact skill this project is meant to demonstrate.     |
| Validation | Zod                                                                          | One validation library for form input, API bodies, and AI structured output.                                                        |
| AI         | Vercel AI SDK + Google Gemini (free tier), structured outputs, tool calling  | Streaming, schema-validated structured output, and tool calling out of the box, with the underlying model provider fully swappable. |
| Testing    | Vitest (unit + mocked-integration), Playwright (critical E2E flows)          | Fast unit coverage plus a small, deliberately non-exhaustive E2E suite for the one critical happy path.                             |
| Deployment | Vercel + Neon                                                                | First-party Next.js hosting; environment variables managed in the Vercel dashboard.                                                 |

## Screenshots

Not yet embedded in this README — run the app locally (below) and seed the demo account to see the Dashboard, Planner, Analytics, and AI Coach pages populated with realistic data.

## Local development

```bash
npm install
cp .env.example .env    # fill in real values — see comments in the file
npm run db:migrate      # applies prisma/migrations to your database
npm run db:seed         # optional — populates a demo account with realistic data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

All required variables are documented with comments in [`.env.example`](./.env.example) — copy it to `.env` and fill in real values. In short:

- `DATABASE_URL` / `DIRECT_URL` — [Neon](https://neon.tech) Postgres. `DATABASE_URL` is the pooled connection (used by the app via `@prisma/adapter-neon`); `DIRECT_URL` is the unpooled connection (used only by the Prisma CLI for migrations) — same host, just without `-pooler` in the hostname.
- `AUTH_SECRET` — generate with `npx auth secret`.
- `AUTH_URL` — `http://localhost:3000` locally; your real deployed URL in production.
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — optional. The app works fully on email/password alone without these.
- `GOOGLE_GENERATIVE_AI_API_KEY` — a free key from [Google AI Studio](https://aistudio.google.com/apikey). Server-side only, never sent to the client.

`env.ts` Zod-validates these at boot, so a missing variable fails immediately with a clear message instead of failing confusingly mid-request.

### Demo account

`npm run db:seed` creates one demo account (`demo@studyplanner.app` / `DemoPass123!`) with realistic subjects, topics, exams, and a mix of completed/missed/pending tasks — so a fresh checkout (or a deployed link) shows a working, populated app instead of an empty signup screen. Safe to re-run; it only wipes and recreates that one account.

## Testing

```bash
npm run test          # Vitest — unit tests + mocked-integration tests
npm run test:e2e      # Playwright — critical E2E flows
```

Unit tests cover the deterministic rebalance algorithm (including infeasibility/partial-redistribution edge cases), cross-tenant authorization (mocked Prisma, so a dropped `userId` filter actually fails the test), the AI structured-output schemas against deliberately malformed input, and the agent retry/fallback contract (mocked `generateText`, verifying the actual retry-once-then-`AgentError` behavior — not just that a schema rejects bad JSON).

`test:e2e` builds and runs the production server against your real `.env` database, so it needs valid credentials configured first. It deliberately covers only the deterministic, secrets-cheap critical path (auth guard redirects + signup → onboarding → dashboard) rather than AI-dependent flows, which are exercised manually each phase and would make CI slow/flaky/costly — this is also why CI runs `npm run test` (Vitest) but not `test:e2e`.

## Deployment

Target: [Vercel](https://vercel.com) (Next.js) + [Neon](https://neon.tech) (already used for local dev).

1. Push this repository to GitHub.
2. In Vercel, "Add New Project" → import the repo. Vercel auto-detects Next.js.
3. Add the environment variables from `.env.example` in the Vercel project settings (**Production** — and **Preview** too, if you want preview deployments to work). Set `AUTH_URL` to your real deployed URL (e.g. `https://your-app.vercel.app`).
4. Either point `DATABASE_URL`/`DIRECT_URL` at the same Neon project you used locally, or create a separate Neon branch/project for production — Neon's branching makes a free, isolated preview database straightforward if you want one per PR.
5. Deploy. Vercel runs `npm run build` automatically; `postinstall` already runs `prisma generate`.
6. Run `npx prisma migrate deploy` against the production database (from your machine, with production `DATABASE_URL`/`DIRECT_URL` set, or as a one-off Vercel deploy step) — `migrate dev` is for local development only.
7. Optionally run `npm run db:seed` against production once, so the deployed link isn't an empty signup screen.

Vercel automatically sets a `VERCEL` environment variable, which Auth.js uses to trust the request host in production — see `ARCHITECTURE.md`'s [Security](./ARCHITECTURE.md#security) section for why this project sets `trustHost: true` explicitly rather than relying on that alone.

## Scripts

```bash
npm run dev           # start dev server (Turbopack)
npm run build         # production build
npm run start         # run production build
npm run lint           # ESLint
npm run typecheck      # TypeScript, no emit
npm run format         # Prettier write
npm run format:check   # Prettier check
npm run test           # Vitest unit tests
npm run test:e2e       # Playwright E2E tests
npm run db:migrate     # create/apply a migration (dev)
npm run db:generate    # regenerate the Prisma client
npm run db:studio      # browse the database
npm run db:seed        # populate the demo account
```

## Development phases

1. ~~Architecture + setup~~ ✅
2. ~~Authentication + database~~ ✅
3. ~~Onboarding~~ ✅
4. ~~Study planning (core, non-AI)~~ ✅
5. ~~AI integration~~ ✅
6. ~~Adaptive planning~~ ✅
7. ~~Dashboard + analytics~~ ✅
8. ~~AI Coach~~ ✅
9. ~~Testing + security~~ ✅
10. ~~Polish + deployment~~ ✅ (landing page, responsive/accessibility pass, demo seed, docs — the actual deployment is a manual step, see above)

## Roadmap (deferred, not forgotten)

- `QuizAttempt` manual score-entry UI — the model exists in the schema (scoped from the start as "lightweight manual score logging"), but no UI was built for it in this MVP.
- Revision / Performance / Schedule-Optimization agents — the `Agent<TInput,TOutput>` interface is designed for this; adding one is a new file, not a rearchitecture.
- Coach-triggered replanning with explicit user confirmation.
- Full notification/email delivery system.
- Syllabus-PDF upload via RAG/embeddings.
- Proactive Vercel Cron-based rescheduling (current adaptive rescheduling is triggered by user action, not a background job).
- Multi-conversation history for the AI Coach (currently one ongoing conversation per user).

## License

Personal portfolio project.
