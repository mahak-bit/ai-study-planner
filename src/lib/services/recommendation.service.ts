import { prisma } from '@/lib/db/prisma';
import { NotFoundError } from '@/lib/services/subject.service';

export async function dismissRecommendation(userId: string, id: string) {
  const result = await prisma.recommendation.updateMany({
    where: { id, userId },
    data: { status: 'DISMISSED' },
  });
  if (result.count === 0) throw new NotFoundError('Recommendation not found');
}
