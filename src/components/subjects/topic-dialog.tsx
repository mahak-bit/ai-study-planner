'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createTopic, updateTopic } from '@/lib/actions/subject.actions';
import { difficulties } from '@/lib/validations/onboarding.schema';
import { createTopicSchema, type CreateTopicInput } from '@/lib/validations/subject.schema';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DIFFICULTY_LABELS: Record<string, string> = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' };
const CONFIDENCE_LABELS: Record<string, string> = {
  '1': '1 — Not confident',
  '2': '2 — Shaky',
  '3': '3 — Okay',
  '4': '4 — Confident',
  '5': '5 — Very confident',
};

export function TopicDialog({
  subjectId,
  trigger,
  topic,
}: {
  subjectId: string;
  trigger: ReactElement;
  topic?: {
    id: string;
    name: string;
    difficulty: string;
    confidenceLevel: number;
    estimatedHours: number | null;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!topic;

  const form = useForm<CreateTopicInput>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      subjectId,
      name: topic?.name ?? '',
      difficulty: (topic?.difficulty as CreateTopicInput['difficulty']) ?? 'MEDIUM',
      confidenceLevel: topic?.confidenceLevel ?? 3,
      estimatedHours: topic?.estimatedHours ?? undefined,
    },
  });

  async function onSubmit(values: CreateTopicInput) {
    setIsSubmitting(true);
    const result = isEditing
      ? await updateTopic(subjectId, { id: topic.id, ...values })
      : await createTopic(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'Topic updated' : 'Topic added');
    setOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit topic' : 'Add topic'}</DialogTitle>
          <DialogDescription>
            Rate your confidence honestly — it drives how the plan prioritizes your time.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Integration" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      items={DIFFICULTY_LABELS}
                      onValueChange={field.onChange}
                      value={field.value ?? 'MEDIUM'}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficulties.map((d) => (
                          <SelectItem key={d} value={d}>
                            {DIFFICULTY_LABELS[d]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confidenceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidence</FormLabel>
                    <Select
                      items={CONFIDENCE_LABELS}
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={String(field.value ?? 3)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {CONFIDENCE_LABELS[String(n)]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated hours needed (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add topic'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
