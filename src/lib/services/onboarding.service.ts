import { prisma } from '@/lib/db/prisma';
import type {
  ExamsStepInput,
  ProfileStepInput,
  SubjectsStepInput,
} from '@/lib/validations/onboarding.schema';

export async function getOnboardingData(userId: string) {
  const [profile, subjects, exams] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.subject.findMany({
      where: { userId },
      include: { topics: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.exam.findMany({
      where: { userId },
      include: { topics: true },
      orderBy: { examDate: 'asc' },
    }),
  ]);

  return { profile, subjects, exams };
}

export async function saveProfileStep(userId: string, input: ProfileStepInput) {
  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      educationLevel: input.educationLevel,
      goals: input.goals || null,
      weeklyAvailabilityHours: input.weeklyAvailabilityHours,
      preferredStudyTimes: input.preferredStudyTimes,
      timezone: input.timezone,
    },
    update: {
      educationLevel: input.educationLevel,
      goals: input.goals || null,
      weeklyAvailabilityHours: input.weeklyAvailabilityHours,
      preferredStudyTimes: input.preferredStudyTimes,
      timezone: input.timezone,
    },
  });
}

// Onboarding-only: replaces the user's full subject/topic set in one
// transaction. Safe here because nothing else references these rows yet
// (no plans/tasks exist before onboarding completes) — post-onboarding
// edits go through targeted subject/topic CRUD instead (Phase 4).
export async function saveSubjectsStep(userId: string, input: SubjectsStepInput) {
  await prisma.$transaction(async (tx) => {
    await tx.subject.deleteMany({ where: { userId } });
    for (const subject of input.subjects) {
      await tx.subject.create({
        data: {
          userId,
          name: subject.name,
          color: subject.color,
          topics: {
            create: subject.topics.map((topic) => ({
              name: topic.name,
              difficulty: topic.difficulty,
              confidenceLevel: topic.confidenceLevel,
              estimatedHours: topic.estimatedHours,
            })),
          },
        },
      });
    }
  });
}

export async function saveExamsStep(userId: string, input: ExamsStepInput) {
  await prisma.$transaction(async (tx) => {
    await tx.exam.deleteMany({ where: { userId } });
    for (const exam of input.exams) {
      await tx.exam.create({
        data: {
          userId,
          subjectId: exam.subjectId,
          title: exam.title,
          examDate: new Date(exam.examDate),
          priority: exam.priority,
          topics: {
            create: exam.topicIds.map((topicId) => ({ topicId })),
          },
        },
      });
    }
  });
}

export class OnboardingIncompleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OnboardingIncompleteError';
  }
}

export async function completeOnboarding(userId: string) {
  const subjectCount = await prisma.subject.count({
    where: { userId, topics: { some: {} } },
  });
  if (subjectCount === 0) {
    throw new OnboardingIncompleteError(
      'Add at least one subject with a topic before finishing setup'
    );
  }

  await prisma.profile.update({
    where: { userId },
    data: { onboardingCompleted: true },
  });
}
