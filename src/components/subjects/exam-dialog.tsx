'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createExam, updateExam } from '@/lib/actions/exam.actions';
import { priorities } from '@/lib/validations/onboarding.schema';
import { createExamSchema, type CreateExamInput } from '@/lib/validations/exam.schema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function ExamDialog({
  subjectId,
  topics,
  trigger,
  exam,
}: {
  subjectId: string;
  topics: { id: string; name: string }[];
  trigger: ReactElement;
  exam?: {
    id: string;
    title: string;
    examDate: Date;
    priority: string;
    topics: { topicId: string }[];
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const isEditing = !!exam;

  const form = useForm<CreateExamInput>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      subjectId,
      title: exam?.title ?? '',
      examDate: exam ? exam.examDate.toISOString().slice(0, 10) : '',
      priority: (exam?.priority as CreateExamInput['priority']) ?? 'MEDIUM',
      topicIds: exam?.topics.map((t) => t.topicId) ?? [],
    },
  });

  async function onSubmit(values: CreateExamInput) {
    setIsSubmitting(true);
    const result = isEditing
      ? await updateExam(subjectId, { id: exam.id, ...values })
      : await createExam(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'Exam updated' : 'Exam added');
    setOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit exam' : 'Add exam'}</DialogTitle>
          <DialogDescription>
            Exam dates are what let the plan prioritize what matters most.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Midterm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger
                        render={
                          <Button variant="outline" className="w-full justify-start font-normal">
                            <CalendarIcon className="size-4" />
                            {field.value ? format(new Date(field.value), 'PP') : 'Pick a date'}
                          </Button>
                        }
                      />
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            field.onChange(format(date, 'yyyy-MM-dd'));
                            setIsDatePickerOpen(false);
                          }}
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      items={PRIORITY_LABELS}
                      onValueChange={field.onChange}
                      value={field.value ?? 'MEDIUM'}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            {topics.length > 0 && (
              <FormField
                control={form.control}
                name="topicIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-normal">
                      Which topics does this exam cover?
                    </FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {topics.map((topic) => {
                        const checked = field.value?.includes(topic.id);
                        return (
                          <label key={topic.id} className="flex items-center gap-1.5 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                const current = field.value ?? [];
                                field.onChange(
                                  value
                                    ? [...current, topic.id]
                                    : current.filter((t) => t !== topic.id)
                                );
                              }}
                            />
                            {topic.name}
                          </label>
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add exam'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
