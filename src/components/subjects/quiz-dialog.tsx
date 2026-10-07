'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createQuizAttempt } from '@/lib/actions/quiz.actions';
import {
  createQuizAttemptSchema,
  type CreateQuizAttemptInput,
} from '@/lib/validations/quiz.schema';
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

function toOptionalNumber(value: string): number | undefined {
  return value === '' ? undefined : Number(value);
}

export function QuizDialog({
  topics,
  trigger,
  defaultTopicId,
}: {
  topics: { id: string; name: string }[];
  trigger: ReactElement;
  defaultTopicId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const topicLabels = Object.fromEntries(topics.map((t) => [t.id, t.name]));

  const form = useForm<CreateQuizAttemptInput>({
    resolver: zodResolver(createQuizAttemptSchema),
    defaultValues: {
      topicId: defaultTopicId ?? topics[0]?.id ?? '',
      title: '',
      score: undefined,
      totalQuestions: undefined,
      timeTakenMinutes: undefined,
    },
  });

  async function onSubmit(values: CreateQuizAttemptInput) {
    setIsSubmitting(true);
    const result = await createQuizAttempt(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Quiz score logged');
    setOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a quiz score</DialogTitle>
          <DialogDescription>
            Record a practice test or quiz you took, so you can see whether a topic is actually
            sticking — not just how confident it feels.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select items={topicLabels} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Chapter 4 practice set" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(toOptionalNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Out of</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(toOptionalNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeTakenMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        placeholder="Optional"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(toOptionalNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Log score'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
