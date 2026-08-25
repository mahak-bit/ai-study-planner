'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

import { dismissRecommendation } from '@/lib/actions/recommendation.actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type RecommendationItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  generatedBy: 'AI' | 'MANUAL';
};

const TYPE_LABELS: Record<string, string> = {
  WEAK_TOPIC: 'Weak topic',
  EXAM_RISK: 'Exam risk',
  CONSISTENCY: 'Consistency',
  SCHEDULE_SHORTFALL: 'Schedule',
  GENERAL: 'General',
};

function RecommendationRow({ recommendation }: { recommendation: RecommendationItem }) {
  const router = useRouter();
  const [isDismissing, setIsDismissing] = useState(false);

  async function handleDismiss() {
    setIsDismissing(true);
    const result = await dismissRecommendation(recommendation.id);
    setIsDismissing(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {TYPE_LABELS[recommendation.type] ?? recommendation.type}
          </Badge>
          {recommendation.generatedBy === 'AI' && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Sparkles className="size-2.5" /> AI
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium">{recommendation.title}</p>
        <p className="text-muted-foreground text-xs">{recommendation.description}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Dismiss"
        disabled={isDismissing}
        onClick={handleDismiss}
        className="shrink-0"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

export function RecommendationsCard({
  recommendations,
  hasSubjects,
}: {
  recommendations: RecommendationItem[];
  hasSubjects: boolean;
}) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/progress', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Couldn't generate insights right now.");
        return;
      }
      toast.success(`${data.insightCount} insight${data.insightCount === 1 ? '' : 's'} ready.`, {
        description: data.summary,
      });
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">AI insights & recommendations</CardTitle>
        {hasSubjects && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isGenerating}
            onClick={handleGenerate}
          >
            <Sparkles className="size-4" />
            {isGenerating ? 'Analyzing…' : 'Generate insights'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {hasSubjects
              ? 'No active recommendations. Generate insights to get personalized guidance.'
              : 'Add a subject to start getting recommendations.'}
          </p>
        ) : (
          recommendations.map((r) => <RecommendationRow key={r.id} recommendation={r} />)
        )}
      </CardContent>
    </Card>
  );
}
