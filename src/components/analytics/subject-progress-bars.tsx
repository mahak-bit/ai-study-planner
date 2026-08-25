import { Progress } from '@/components/ui/progress';

export type SubjectProgressItem = {
  id: string;
  name: string;
  color: string;
  topicCount: number;
  masteredCount: number;
  avgConfidence: number;
};

export function SubjectProgressBars({ subjects }: { subjects: SubjectProgressItem[] }) {
  if (subjects.length === 0) {
    return <p className="text-muted-foreground text-sm">Add a subject to see progress here.</p>;
  }

  return (
    <div className="space-y-4">
      {subjects.map((s) => {
        const pct = s.topicCount > 0 ? Math.round((s.masteredCount / s.topicCount) * 100) : 0;
        return (
          <div key={s.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {s.masteredCount}/{s.topicCount} mastered · confidence {s.avgConfidence.toFixed(1)}
                /5
              </span>
            </div>
            <Progress value={pct} />
          </div>
        );
      })}
    </div>
  );
}
