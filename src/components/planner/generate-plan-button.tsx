'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export function GeneratePlanButton() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/plan', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Couldn't generate a plan right now.");
        return;
      }

      toast.success(`Plan ready — ${data.taskCount} tasks scheduled.`, {
        description: data.summary,
      });
      router.refresh();
    } catch {
      toast.error("Couldn't reach the planner. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button type="button" variant="secondary" disabled={isGenerating} onClick={handleGenerate}>
      <Sparkles className="size-4" />
      {isGenerating ? 'Generating…' : 'Generate plan'}
    </Button>
  );
}
