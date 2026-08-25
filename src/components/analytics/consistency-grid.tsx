import { format } from 'date-fns';

import { cn } from '@/lib/utils';

export function ConsistencyGrid({ data }: { data: { date: string; minutes: number }[] }) {
  const studiedCount = data.filter((d) => d.minutes > 0).length;

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="text-2xl font-semibold tabular-nums">{studiedCount}</span>{' '}
        <span className="text-muted-foreground">of {data.length} days studied</span>
      </p>
      <div className="flex flex-wrap gap-1" role="img" aria-label="Study consistency over time">
        {data.map((d) => (
          <div
            key={d.date}
            title={`${format(new Date(`${d.date}T00:00:00`), 'MMM d')}: ${d.minutes > 0 ? `${d.minutes} min` : 'no study'}`}
            className={cn(
              'size-3.5 rounded-sm',
              d.minutes === 0
                ? 'bg-muted'
                : d.minutes < 30
                  ? 'bg-primary/30'
                  : d.minutes < 60
                    ? 'bg-primary/60'
                    : 'bg-primary'
            )}
          />
        ))}
      </div>
    </div>
  );
}
