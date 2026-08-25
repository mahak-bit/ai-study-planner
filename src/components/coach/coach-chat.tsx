'use client';

import { useState, type FormEvent } from 'react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { Send, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'What should I study today?',
  'Why am I behind?',
  'Which topic should I prioritize?',
  'I only have two hours today. What should I do?',
];

function MessageBubble({ message }: { message: UIMessage }) {
  const toolNames = message.parts
    .filter((p) => p.type.startsWith('tool-'))
    .map((p) => p.type.replace('tool-', ''));
  const text = message.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('');

  if (!text && toolNames.length === 0) return null;

  return (
    <div className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] space-y-1.5 rounded-2xl px-4 py-2.5 text-sm',
          message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {toolNames.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {toolNames.map((name, i) => (
              <Badge key={`${name}-${i}`} variant="outline" className="gap-1 text-[10px]">
                <Sparkles className="size-2.5" /> {name}
              </Badge>
            ))}
          </div>
        )}
        {text && <p className="whitespace-pre-wrap">{text}</p>}
      </div>
    </div>
  );
}

export function CoachChat({ initialMessages }: { initialMessages: UIMessage[] }) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: '/api/ai/coach' }),
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  function handleSend(text: string) {
    if (!text.trim() || isBusy) return;
    sendMessage({ text });
    setInput('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto py-2">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Ask me anything about your study progress, schedule, or what to focus on.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {status === 'submitted' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">Thinking…</span>
            </div>
          </div>
        )}
        {error && (
          <p className="text-destructive text-sm">{error.message || 'Something went wrong.'}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach…"
          disabled={isBusy}
        />
        <Button type="submit" size="icon" disabled={isBusy || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
