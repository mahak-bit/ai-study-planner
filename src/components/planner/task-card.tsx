'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

import { completeTask, deleteTask, markTaskMissed, reopenTask } from '@/lib/actions/task.actions';
import { missedReasons } from '@/lib/validations/task.schema';
import { DeleteConfirmButton } from '@/components/shared/delete-confirm-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type PlannerTask = {
  id: string;
  title: string;
  status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED';
  durationMinutes: number;
  priority: string;
  missedReason: string | null;
  subject: { name: string; color: string } | null;
  topic: { name: string } | null;
};

const MISSED_REASON_LABELS: Record<string, string> = {
  NO_TIME: 'Ran out of time',
  TOO_HARD: 'Too hard',
  FORGOT: 'Forgot',
  LOW_PRIORITY: 'Deprioritized',
  OTHER: 'Other',
};

const PRIORITY_VARIANT: Record<string, 'secondary' | 'default' | 'destructive'> = {
  LOW: 'secondary',
  MEDIUM: 'secondary',
  HIGH: 'default',
  CRITICAL: 'destructive',
};

function MarkMissedDialog({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    const result = await markTaskMissed({ taskId, missedReason: reason || undefined });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon" aria-label="Mark missed">
            <X className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What happened?</DialogTitle>
          <DialogDescription>
            This helps future plans account for why tasks get missed.
          </DialogDescription>
        </DialogHeader>
        <Select
          items={MISSED_REASON_LABELS}
          onValueChange={(v) => setReason(v ?? '')}
          value={reason}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a reason (optional)" />
          </SelectTrigger>
          <SelectContent>
            {missedReasons.map((r) => (
              <SelectItem key={r} value={r}>
                {MISSED_REASON_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Mark missed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TaskCard({ task }: { task: PlannerTask }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleComplete() {
    setIsUpdating(true);
    const result = await completeTask(task.id);
    setIsUpdating(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleReopen() {
    setIsUpdating(true);
    const result = await reopenTask(task.id);
    setIsUpdating(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3" data-status={task.status}>
      <span
        className="mt-1 size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: task.subject?.color ?? 'var(--muted-foreground)' }}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p
          className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'text-muted-foreground line-through' : ''}`}
        >
          {task.title}
        </p>
        <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
          {task.subject && <span>{task.subject.name}</span>}
          {task.topic && <span>· {task.topic.name}</span>}
          <span>· {task.durationMinutes} min</span>
          <Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[10px]">
            {task.priority.toLowerCase()}
          </Badge>
          {task.status === 'MISSED' && (
            <Badge variant="destructive" className="text-[10px]">
              missed{task.missedReason ? ` · ${MISSED_REASON_LABELS[task.missedReason]}` : ''}
            </Badge>
          )}
        </div>
      </div>

      {task.status === 'PENDING' && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mark complete"
            disabled={isUpdating}
            onClick={handleComplete}
          >
            <Check className="size-4" />
          </Button>
          <MarkMissedDialog taskId={task.id} />
          <DeleteConfirmButton
            title="Delete this task?"
            description="This can't be undone."
            onConfirm={() => deleteTask(task.id)}
          />
        </div>
      )}

      {task.status !== 'PENDING' && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Reopen task"
            disabled={isUpdating}
            onClick={handleReopen}
          >
            <RotateCcw className="size-4" />
          </Button>
          <DeleteConfirmButton
            title="Delete this task?"
            description="This can't be undone."
            onConfirm={() => deleteTask(task.id)}
          />
        </div>
      )}
    </div>
  );
}
