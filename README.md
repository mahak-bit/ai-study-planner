# AI Study Planner

A production-grade, AI-powered study planning platform. Students provide their subjects, topics, exams, and availability; an AI planning layer generates a personalized study schedule and continuously adapts it as tasks are completed or missed. An AI Coach answers context-aware questions grounded in the student's real data.

> **Status:** In active development. This README will be completed with screenshots, architecture diagrams, and full setup docs as the project progresses (see the phase plan below).

## Tech Stack

| Layer      | Choice                                                                       |
| ---------- | ---------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router), TypeScript (strict)                                 |
| UI         | Tailwind CSS v4, shadcn/ui (Base UI primitives), lucide-react, Framer Motion |
| Database   | PostgreSQL (Neon), Prisma ORM                                                |
| Auth       | Auth.js v5, Credentials + optional Google OAuth                              |
| Validation | Zod                                                                          |
| AI         | Vercel AI SDK + OpenAI, structured outputs, streaming, tool calling          |
| Testing    | Vitest (unit/API), Playwright (critical E2E flows)                           |
| Deployment | Vercel + Neon                                                                |

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) _(added in Phase 10)_ for the full architecture writeup, database schema, and AI design.

## Local Development

```bash
npm install
cp .env.example .env    # fill in real values — see comments in the file
npm run db:migrate      # applies prisma/migrations to your database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Database URLs point at [Neon](https://neon.tech) (serverless Postgres). `DATABASE_URL` is the pooled connection (used by the app via `@prisma/adapter-neon`); `DIRECT_URL` is the unpooled connection (used by the Prisma CLI for migrations) — same host, just without `-pooler` in the hostname.

## Scripts

```bash
npm run dev           # start dev server (Turbopack)
npm run build         # production build
npm run start          # run production build
npm run lint            # ESLint
npm run typecheck       # TypeScript, no emit
npm run format         # Prettier write
npm run format:check  # Prettier check
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright E2E tests
npm run db:migrate    # create/apply a migration (dev)
npm run db:generate   # regenerate the Prisma client
npm run db:studio     # browse the database
```

## Development Phases

1. ~~Architecture + setup~~ ✅
2. ~~Authentication + database~~ ✅
3. ~~Onboarding~~ ✅
4. Study planning (core, non-AI)
5. AI integration
6. Adaptive planning
7. Dashboard + analytics
8. AI Coach
9. Testing + security
10. Polish + deployment

## Roadmap (deferred, not forgotten)

- Revision / Performance / Schedule-Optimization agents (the agent interface is designed for this)
- Coach-triggered replanning with explicit user confirmation
- Full notification/email delivery system
- Syllabus-PDF upload via RAG/embeddings
- Proactive Vercel Cron-based rescheduling

## License

Personal portfolio project.
