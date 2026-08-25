import { prisma } from '@/lib/db/prisma';

// One conversation per user for MVP -- no conversation list/switcher UI.
// Keeps the coach a single ongoing check-in rather than a full chat-history
// product, which nothing in the spec actually asked for.
export async function getOrCreateConversation(userId: string) {
  const existing = await prisma.aIConversation.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  if (existing) return existing;

  return prisma.aIConversation.create({ data: { userId } });
}

// Scoped by userId via the conversation relation, not conversationId alone --
// the only current caller always passes an ID it just derived from that same
// user's own conversation, but this function returns message content, so it
// should never trust an ID without proving ownership itself.
export async function getConversationMessages(userId: string, conversationId: string) {
  return prisma.aIMessage.findMany({
    where: { conversationId, conversation: { userId } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function saveMessage(
  conversationId: string,
  role: 'USER' | 'ASSISTANT',
  content: string,
  toolCalls?: unknown
) {
  return prisma.aIMessage.create({
    data: {
      conversationId,
      role,
      content,
      toolCalls: toolCalls ? (toolCalls as object) : undefined,
    },
  });
}
