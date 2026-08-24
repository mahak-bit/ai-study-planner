'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm, type Control } from 'react-hook-form';
import { toast } from 'sonner';

import { saveSubjectsStep } from '@/lib/actions/onboarding.actions';
import {
  SUBJECT_COLORS,
  difficulties,
  subjectsStepSchema,
  type SubjectsStepInput,
} from '@/lib/validations/onboarding.schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const DIFFICULTY_LABELS: Record<string, string> = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' };
const CONFIDENCE_LABELS: Record<number, string> = {
  1: '1 — Not confident',
  2: '2 — Shaky',
  3: '3 — Okay',
  4: '4 — Confident',
  5: '5 — Very confident',
};
const CONFIDENCE_LABELS_BY_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(CONFIDENCE_LABELS)
);

function TopicRow({
  control,
  subjectIndex,
  topicIndex,
  onRemove,
  canRemove,
}: {
  control: Control<SubjectsStepInput>;
  subjectIndex: number;
  topicIndex: number;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
      <FormField
        control={control}
        name={`subjects.${subjectIndex}.topics.${topicIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="Topic name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`subjects.${subjectIndex}.topics.${topicIndex}.difficulty`}
        render={({ field }) => (
          <Select
            items={DIFFICULTY_LABELS}
            onValueChange={field.onChange}
            value={field.value ?? 'MEDIUM'}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((d) => (
                <SelectItem key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FormField
        control={control}
        name={`subjects.${subjectIndex}.topics.${topicIndex}.confidenceLevel`}
        render={({ field }) => (
          <Select
            items={CONFIDENCE_LABELS_BY_KEY}
            onValueChange={(v) => field.onChange(Number(v))}
            value={String(field.value ?? 3)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {CONFIDENCE_LABELS[n]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canRemove}
        onClick={onRemove}
        aria-label="Remove topic"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function SubjectCard({
  control,
  subjectIndex,
  onRemoveSubject,
  canRemoveSubject,
}: {
  control: Control<SubjectsStepInput>;
  subjectIndex: number;
  onRemoveSubject: () => void;
  canRemoveSubject: boolean;
}) {
  const topicsArray = useFieldArray({
    control,
    name: `subjects.${subjectIndex}.topics`,
  });

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <FormField
          control={control}
          name={`subjects.${subjectIndex}.color`}
          render={({ field }) => (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {SUBJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use color ${color}`}
                  onClick={() => field.onChange(color)}
                  className={cn(
                    'size-6 rounded-full ring-offset-2',
                    field.value === color && 'ring-ring ring-2'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        />
        <FormField
          control={control}
          name={`subjects.${subjectIndex}.name`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Subject name (e.g. Mathematics)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canRemoveSubject}
          onClick={onRemoveSubject}
          aria-label="Remove subject"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        {topicsArray.fields.map((field, topicIndex) => (
          <TopicRow
            key={field.id}
            control={control}
            subjectIndex={subjectIndex}
            topicIndex={topicIndex}
            canRemove={topicsArray.fields.length > 1}
            onRemove={() => topicsArray.remove(topicIndex)}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => topicsArray.append({ name: '', difficulty: 'MEDIUM', confidenceLevel: 3 })}
        >
          <Plus className="size-3.5" /> Add topic
        </Button>
      </div>
    </div>
  );
}

export function SubjectsForm({ defaultValues }: { defaultValues: SubjectsStepInput }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubjectsStepInput>({
    resolver: zodResolver(subjectsStepSchema),
    defaultValues,
  });

  const subjectsArray = useFieldArray({ control: form.control, name: 'subjects' });

  async function onSubmit(values: SubjectsStepInput) {
    setIsSubmitting(true);
    const result = await saveSubjectsStep(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.push('/onboarding/exams');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.subjects?.root?.message && (
          <p className="text-destructive text-sm">{form.formState.errors.subjects.root.message}</p>
        )}
        {subjectsArray.fields.map((field, index) => (
          <SubjectCard
            key={field.id}
            control={form.control}
            subjectIndex={index}
            canRemoveSubject={subjectsArray.fields.length > 1}
            onRemoveSubject={() => subjectsArray.remove(index)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            subjectsArray.append({
              name: '',
              color: SUBJECT_COLORS[subjectsArray.fields.length % SUBJECT_COLORS.length],
              topics: [{ name: '', difficulty: 'MEDIUM', confidenceLevel: 3 }],
            })
          }
        >
          <Plus className="size-4" /> Add subject
        </Button>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Continue'}
        </Button>
      </form>
    </Form>
  );
}
