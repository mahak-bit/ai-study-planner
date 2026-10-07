import { addDays, format, subDays } from 'date-fns';

import { Prisma } from '@/generated/prisma/client';
import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db/prisma';

// Populates one demo account with realistic subjects, topics, exams, and a
// mix of completed/missed/pending tasks -- so a freshly deployed link (or a
// reviewer's first look) shows a working, populated app instead of an empty
// signup screen. Safe to re-run: wipes and recreates only this one account.
const DEMO_EMAIL = 'demo@studyplanner.app';
const DEMO_PASSWORD = 'DemoPass123!';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const user = await prisma.user.create({
    data: {
      name: 'Demo Student',
      email: DEMO_EMAIL,
      passwordHash: await hashPassword(DEMO_PASSWORD),
      profile: {
        create: {
          educationLevel: 'UNDERGRADUATE',
          timezone: 'UTC',
          goals: 'Score 90%+ on my finals and stay ahead of my problem sets.',
          weeklyAvailabilityHours: { mon: 2, tue: 3, wed: 2, thu: 3, fri: 2, sat: 4, sun: 1 },
          preferredStudyTimes: ['EVENING', 'MORNING'],
          onboardingCompleted: true,
        },
      },
    },
  });

  const mathematics = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Mathematics',
      color: '#6366f1',
      topics: {
        create: [
          { name: 'Integration', difficulty: 'HARD', confidenceLevel: 2, estimatedHours: 12 },
          { name: 'Differentiation', difficulty: 'MEDIUM', confidenceLevel: 4, estimatedHours: 8 },
          {
            name: 'Linear Algebra',
            difficulty: 'MEDIUM',
            confidenceLevel: 3,
            estimatedHours: 10,
            status: 'IN_PROGRESS',
          },
        ],
      },
    },
    include: { topics: true },
  });

  const physics = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Physics',
      color: '#06b6d4',
      topics: {
        create: [
          { name: 'Mechanics', difficulty: 'MEDIUM', confidenceLevel: 4, estimatedHours: 10 },
          {
            name: 'Thermodynamics',
            difficulty: 'HARD',
            confidenceLevel: 2,
            estimatedHours: 9,
          },
        ],
      },
    },
    include: { topics: true },
  });

  const computerScience = await prisma.subject.create({
    data: {
      userId: user.id,
      name: 'Computer Science',
      color: '#f59e0b',
      topics: {
        create: [
          {
            name: 'Data Structures',
            difficulty: 'MEDIUM',
            confidenceLevel: 5,
            estimatedHours: 6,
            status: 'MASTERED',
          },
          { name: 'Algorithms', difficulty: 'HARD', confidenceLevel: 3, estimatedHours: 14 },
        ],
      },
    },
    include: { topics: true },
  });

  const integration = mathematics.topics.find((t) => t.name === 'Integration')!;
  const linearAlgebra = mathematics.topics.find((t) => t.name === 'Linear Algebra')!;
  const thermodynamics = physics.topics.find((t) => t.name === 'Thermodynamics')!;
  const algorithms = computerScience.topics.find((t) => t.name === 'Algorithms')!;

  await prisma.exam.create({
    data: {
      userId: user.id,
      subjectId: mathematics.id,
      title: 'Calculus Midterm',
      examDate: addDays(new Date(), 9),
      priority: 'HIGH',
      topics: { create: [{ topicId: integration.id }, { topicId: linearAlgebra.id }] },
    },
  });

  await prisma.exam.create({
    data: {
      userId: user.id,
      subjectId: computerScience.id,
      title: 'Algorithms Final',
      examDate: addDays(new Date(), 21),
      priority: 'MEDIUM',
      topics: { create: [{ topicId: algorithms.id }] },
    },
  });

  const plan = await prisma.studyPlan.create({
    data: {
      userId: user.id,
      periodStart: subDays(new Date(), 7),
      periodEnd: addDays(new Date(), 7),
      status: 'ACTIVE',
      generatedBy: 'MANUAL',
    },
  });

  type TaskFields = Omit<
    Prisma.StudyTaskUncheckedCreateInput,
    'planId' | 'userId' | 'scheduledDate'
  >;

  function task(daysFromToday: number, data: TaskFields) {
    return prisma.studyTask.create({
      data: {
        ...data,
        planId: plan.id,
        userId: user.id,
        scheduledDate: addDays(
          new Date(`${format(new Date(), 'yyyy-MM-dd')}T00:00:00.000Z`),
          daysFromToday
        ),
      },
    });
  }

  // Past week: a mix of completed and missed sessions, feeding the streak
  // and analytics charts with something worth looking at.
  await task(-1, {
    subjectId: mathematics.id,
    topicId: integration.id,
    title: 'Practice integration by parts',
    durationMinutes: 60,
    priority: 'HIGH',
    status: 'COMPLETED',
    completedAt: subDays(new Date(), 1),
  });
  await task(-2, {
    subjectId: physics.id,
    topicId: thermodynamics.id,
    title: 'Review the laws of thermodynamics',
    durationMinutes: 45,
    priority: 'MEDIUM',
    status: 'COMPLETED',
    completedAt: subDays(new Date(), 2),
  });
  await task(-3, {
    subjectId: computerScience.id,
    topicId: algorithms.id,
    title: 'Implement a sorting algorithm from scratch',
    durationMinutes: 90,
    priority: 'HIGH',
    status: 'MISSED',
    missedReason: 'NO_TIME',
  });
  await task(-4, {
    subjectId: mathematics.id,
    topicId: linearAlgebra.id,
    title: 'Practice matrix transformations',
    durationMinutes: 45,
    priority: 'MEDIUM',
    status: 'COMPLETED',
    completedAt: subDays(new Date(), 4),
  });

  // Today and the coming week: pending work for the dashboard/planner.
  await task(0, {
    subjectId: mathematics.id,
    topicId: integration.id,
    title: 'Practice integration by substitution',
    durationMinutes: 60,
    priority: 'HIGH',
    status: 'PENDING',
  });
  await task(0, {
    subjectId: physics.id,
    topicId: thermodynamics.id,
    title: 'Solve thermodynamics problem set',
    durationMinutes: 45,
    priority: 'MEDIUM',
    status: 'PENDING',
  });
  await task(2, {
    subjectId: computerScience.id,
    topicId: algorithms.id,
    title: 'Study dynamic programming patterns',
    durationMinutes: 75,
    priority: 'HIGH',
    status: 'PENDING',
  });
  await task(4, {
    subjectId: mathematics.id,
    topicId: linearAlgebra.id,
    title: 'Review eigenvalues and eigenvectors',
    durationMinutes: 50,
    priority: 'MEDIUM',
    status: 'PENDING',
  });

  await prisma.recommendation.create({
    data: {
      userId: user.id,
      type: 'WEAK_TOPIC',
      title: 'Low confidence in Integration',
      description:
        'Integration is rated 2/5 confidence with the Calculus Midterm 9 days away -- worth extra focused sessions this week.',
      status: 'ACTIVE',
      generatedBy: 'AI',
      metadata: { subjectId: mathematics.id, topicId: integration.id },
    },
  });

  // Logged quiz scores. Differentiation is the interesting one: rated 4/5
  // confidence but scoring 45% — the kind of blind spot the AI Coach's
  // getWeakTopics tool is meant to surface.
  const differentiation = mathematics.topics.find((t) => t.name === 'Differentiation')!;
  const dataStructures = computerScience.topics.find((t) => t.name === 'Data Structures')!;
  await prisma.quizAttempt.createMany({
    data: [
      {
        topicId: integration.id,
        title: 'Integration by parts drill',
        score: 4,
        totalQuestions: 10,
        timeTakenSeconds: 1500,
        createdAt: subDays(new Date(), 6),
      },
      {
        topicId: integration.id,
        title: 'Substitution practice set',
        score: 6,
        totalQuestions: 10,
        timeTakenSeconds: 1320,
        createdAt: subDays(new Date(), 2),
      },
      {
        topicId: differentiation.id,
        title: 'Chain rule quiz',
        score: 9,
        totalQuestions: 20,
        timeTakenSeconds: 1800,
        createdAt: subDays(new Date(), 3),
      },
      {
        topicId: thermodynamics.id,
        title: 'Laws of thermodynamics check',
        score: 5,
        totalQuestions: 12,
        createdAt: subDays(new Date(), 4),
      },
      {
        topicId: dataStructures.id,
        title: 'Trees and heaps',
        score: 14,
        totalQuestions: 15,
        timeTakenSeconds: 900,
        createdAt: subDays(new Date(), 5),
      },
    ].map((attempt) => ({ ...attempt, userId: user.id })),
  });

  console.log(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
