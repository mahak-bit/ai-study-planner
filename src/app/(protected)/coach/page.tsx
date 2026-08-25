import type { UIMessage } from 'ai';

import { requireUser } from '@/lib/auth/session';
import { getConversationMessages, getOrCreateConversation } from '@/lib/services/coach.service';
import { CoachChat } from '@/components/coach/coach-chat';

export const metadata = { title: 'AI Coach — AI Study Planner' };

const ROLE_MAP: Record<string, UIMessage['role']> = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
};

export default async function CoachPage() {
  const user = await requireUser();
  const conversation = await getOrCreateConversation(user.id);
  const messages = await getConversationMessages(user.id, conversation.id);

  const initialMessages: UIMessage[] = messages.map((m) => ({
    id: m.id,
    role: ROLE_MAP[m.role] ?? 'user',
    parts: [{ type: 'text', text: m.content }],
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Coach</h1>
        <p className="text-muted-foreground text-sm">
          A quick check-in on your progress, grounded in your real study data.
        </p>
      </div>
      <CoachChat initialMessages={initialMessages} />
    </div>
  );
}
