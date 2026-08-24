import { prisma } from '@/lib/db/prisma';
import type {
  CreateSubjectInput,
  CreateTopicInput,
  UpdateSubjectInput,
  UpdateTopicInput,
} from '@/lib/validations/subject.schema';

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function listSubjectsWithProgress(userId: string) {
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: { topics: true, exams: { orderBy: { examDate: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'asc' },
  });

  return subjects.map((subject) => {
    const topicCount = subject.topics.length;
    const masteredCount = subject.topics.filter((t) => t.status === 'MASTERED').length;
    const avgConfidence = topicCount
      ? subject.topics.reduce((sum, t) => sum + t.confidenceLevel, 0) / topicCount
      : 0;

    return {
      ...subject,
      topicCount,
      masteredCount,
      avgConfidence,
      nextExam: subject.exams[0] ?? null,
    };
  });
}

export async function getSubjectDetail(userId: string, subjectId: string) {
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
    include: {
      topics: { orderBy: { createdAt: 'asc' } },
      exams: { orderBy: { examDate: 'asc' }, include: { topics: true } },
    },
  });
  if (!subject) throw new NotFoundError('Subject not found');
  return subject;
}

export async function createSubject(userId: string, input: CreateSubjectInput) {
  return prisma.subject.create({ data: { userId, name: input.name, color: input.color } });
}

export async function updateSubject(userId: string, input: UpdateSubjectInput) {
  const result = await prisma.subject.updateMany({
    where: { id: input.id, userId },
    data: { name: input.name, color: input.color },
  });
  if (result.count === 0) throw new NotFoundError('Subject not found');
}

export async function deleteSubject(userId: string, subjectId: string) {
  const result = await prisma.subject.deleteMany({ where: { id: subjectId, userId } });
  if (result.count === 0) throw new NotFoundError('Subject not found');
}

export async function createTopic(userId: string, input: CreateTopicInput) {
  const subject = await prisma.subject.findFirst({
    where: { id: input.subjectId, userId },
    select: { id: true },
  });
  if (!subject) throw new NotFoundError('Subject not found');

  return prisma.topic.create({
    data: {
      subjectId: input.subjectId,
      name: input.name,
      difficulty: input.difficulty,
      confidenceLevel: input.confidenceLevel,
      estimatedHours: input.estimatedHours,
    },
  });
}

export async function updateTopic(userId: string, input: UpdateTopicInput) {
  const topic = await prisma.topic.findFirst({
    where: { id: input.id, subject: { userId } },
    select: { id: true },
  });
  if (!topic) throw new NotFoundError('Topic not found');

  await prisma.topic.update({
    where: { id: input.id },
    data: {
      name: input.name,
      difficulty: input.difficulty,
      confidenceLevel: input.confidenceLevel,
      estimatedHours: input.estimatedHours,
    },
  });
}

export async function deleteTopic(userId: string, topicId: string) {
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, subject: { userId } },
    select: { id: true },
  });
  if (!topic) throw new NotFoundError('Topic not found');

  await prisma.topic.delete({ where: { id: topicId } });
}
