import { format } from 'date-fns';

export function StudyTimeChart({ data }: { data: { date: string; minutes: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.minutes));
  const totalHours = (data.reduce((sum, d) => sum + d.minutes, 0) / 60).toFixed(1);

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="text-2xl font-semibold tabular-nums">{totalHours}h</span>{' '}
        <span className="text-muted-foreground">studied in the last {data.length} days</span>
      </p>
      <div className="flex h-32 gap-[3px]" role="img" aria-label="Daily study time bar chart">
        {data.map((d) => (
          <div
            key={d.date}
            className="group/bar flex h-full flex-1 flex-col justify-end"
            title={`${format(new Date(`${d.date}T00:00:00`), 'MMM d')}: ${d.minutes} min`}
          >
            <div
              className="bg-primary/70 group-hover/bar:bg-primary w-full rounded-t-sm transition-colors"
              style={{ height: `${Math.max(2, (d.minutes / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{format(new Date(`${data[0]?.date}T00:00:00`), 'MMM d')}</span>
        <span>{format(new Date(`${data[data.length - 1]?.date}T00:00:00`), 'MMM d')}</span>
      </div>
    </div>
  );
}
