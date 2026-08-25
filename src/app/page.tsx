'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BrainCircuit,
  CalendarClock,
  GraduationCap,
  MessageCircleQuestion,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';

import { DashboardPreview } from '@/components/landing/dashboard-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-generated study plans',
    description:
      'Tell it your subjects, topics, and exam dates. A planning agent builds a day-by-day schedule that respects your real available hours.',
  },
  {
    icon: RefreshCw,
    title: 'Adaptive rescheduling',
    description:
      "Miss a session and it doesn't just sit there marked incomplete — a deterministic engine redistributes that time across your upcoming days, weighted by exam urgency and confidence.",
  },
  {
    icon: MessageCircleQuestion,
    title: 'AI Coach',
    description:
      'Ask "why am I behind?" or "what should I study today?" and get an answer grounded in your real schedule, exams, and progress — not a generic chatbot reply.',
  },
  {
    icon: BarChart3,
    title: 'Real progress analytics',
    description:
      'Study time, completion rate, subject progress, and consistency — charts that answer a specific question, not decoration.',
  },
  {
    icon: Target,
    title: 'Exam-aware prioritization',
    description:
      'Topics tied to a nearer exam and topics you rated low-confidence both get more time automatically, without you having to manage it.',
  },
  {
    icon: CalendarClock,
    title: 'A planner that stays honest',
    description:
      'Complete, miss, or reopen tasks freely. Every change is reflected immediately in your schedule, your streak, and your analytics.',
  },
];

const STEPS = [
  {
    title: 'Add your subjects and exams',
    description:
      'A short onboarding: subjects, topics, difficulty, how confident you feel, and your real weekly availability.',
  },
  {
    title: 'Let the planner build your schedule',
    description:
      'An AI planning agent generates a schedule that balances exam urgency, topic difficulty, and low-confidence areas within your available hours.',
  },
  {
    title: 'Study, and mark what happened',
    description:
      'Complete tasks as you go. Life happens — mark something missed instead of just letting it sit there.',
  },
  {
    title: 'Watch it adapt',
    description:
      'Missed time gets redistributed automatically. Ask the AI Coach for a gut check any time you want to know where you stand.',
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="supports-backdrop-filter:bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="text-primary size-5" />
            AI Study Planner
          </div>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/login">Sign in</Link>}
            />
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/register">Get started</Link>}
            />
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <Badge variant="secondary" className="mb-5 gap-1.5">
                <BrainCircuit className="size-3.5" />
                Agentic AI, not a chatbot wrapper
              </Badge>
              <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
                A study plan that adapts when your week doesn&apos;t go to plan
              </h1>
              <p className="text-muted-foreground mt-5 max-w-lg text-lg text-balance">
                Most planners break the moment you miss a session. This one is built to expect it —
                an AI planning layer schedules your studying, and a rebalancing engine keeps it
                realistic when life gets in the way.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/register">Start planning — it&apos;s free</Link>}
                />
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/login">Sign in</Link>}
                />
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                No credit card. Free Google Gemini tier under the hood.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <DashboardPreview />
            </FadeIn>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t px-6 py-20 sm:py-28" aria-labelledby="how-it-works-heading">
          <div className="mx-auto max-w-6xl">
            <FadeIn>
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                How it works
              </p>
              <h2 id="how-it-works-heading" className="mt-2 text-3xl font-semibold tracking-tight">
                From a blank slate to a working plan in minutes
              </h2>
            </FadeIn>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <FadeIn key={step.title} delay={i * 0.08}>
                  <span className="border-border flex size-8 items-center justify-center rounded-full border text-sm font-semibold">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t px-6 py-20 sm:py-28" aria-labelledby="features-heading">
          <div className="mx-auto max-w-6xl">
            <FadeIn>
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Everything, actually working
              </p>
              <h2 id="features-heading" className="mt-2 text-3xl font-semibold tracking-tight">
                Built for how studying actually goes
              </h2>
            </FadeIn>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <FadeIn key={feature.title} delay={i * 0.06}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                        <feature.icon className="size-4.5" />
                      </div>
                      <CardTitle className="mt-3 text-base">{feature.title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* AI architecture callout */}
        <section className="border-t px-6 py-20 sm:py-28" aria-labelledby="ai-heading">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Under the hood
              </p>
              <h2 id="ai-heading" className="mt-2 text-3xl font-semibold tracking-tight">
                Real agents with real guardrails
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                A Planning Agent generates and regenerates your schedule from structured,
                schema-validated output. A Progress Agent turns your real completion history and
                confidence ratings into specific, non-generic insights. The AI Coach calls read-only
                tools scoped to your own data — it can tell you what&apos;s on your plate today, but
                it can&apos;t touch your schedule; every AI-generated ID is checked against your
                account before anything is written to your plan.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t px-6 py-20 sm:py-28">
          <FadeIn>
            <div className="bg-foreground text-background mx-auto max-w-6xl rounded-3xl px-8 py-14 text-center sm:px-16">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Stop rebuilding your plan by hand
              </h2>
              <p className="mx-auto mt-3 max-w-md opacity-80">
                Set up your subjects and exams once. Let the plan adapt from there.
              </p>
              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  nativeButton={false}
                  render={<Link href="/register">Create your free account</Link>}
                />
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t px-6 py-10">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <div className="flex items-center gap-2 font-medium">
            <GraduationCap className="size-4" />
            AI Study Planner
          </div>
          <p>Next.js · Prisma · Neon Postgres · Auth.js · Vercel AI SDK · Google Gemini</p>
        </div>
      </footer>
    </div>
  );
}
