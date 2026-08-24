import { prisma } from '@/lib/db/prisma';
import { NotFoundError } from '@/lib/services/subject.service';
import type { CreateExamInput, UpdateExamInput } from '@/lib/validations/exam.schema';

export async function listUpcomingExams(userId: string, limit = 5) {
  return prisma.exam.findMany({
    where: { userId, examDate: { gte: new Date() } },
    include: { subject: true },
    orderBy: { examDate: 'asc' },
    take: limit,
  });
}

export async function createExam(userId: string, input: CreateExamInput) {
  const subject = await prisma.subject.findFirst({
    where: { id: input.subjectId, userId },
    select: { id: true },
  });
  if (!subject) throw new NotFoundError('Subject not found');

  return prisma.exam.create({
    data: {
      userId,
      subjectId: input.subjectId,
      title: input.title,
      examDate: new Date(input.examDate),
      priority: input.priority,
      topics: { create: input.topicIds.map((topicId) => ({ topicId })) },
    },
  });
}

export async function updateExam(userId: string, input: UpdateExamInput) {
  const exam = await prisma.exam.findFirst({
    where: { id: input.id, userId },
    select: { id: true },
  });
  if (!exam) throw new NotFoundError('Exam not found');

  await prisma.$transaction([
    prisma.examTopic.deleteMany({ where: { examId: input.id } }),
    prisma.exam.update({
      where: { id: input.id },
      data: {
        title: input.title,
        examDate: new Date(input.examDate),
        priority: input.priority,
        topics: { create: input.topicIds.map((topicId) => ({ topicId })) },
      },
    }),
  ]);
}

export async function deleteExam(userId: string, examId: string) {
  const result = await prisma.exam.deleteMany({ where: { id: examId, userId } });
  if (result.count === 0) throw new NotFoundError('Exam not found');
}
