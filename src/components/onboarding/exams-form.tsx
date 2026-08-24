'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm, useWatch, type Control } from 'react-hook-form';
import { toast } from 'sonner';

import { saveExamsStep } from '@/lib/actions/onboarding.actions';
import {
  examsStepSchema,
  priorities,
  type ExamsStepInput,
} from '@/lib/validations/onboarding.schema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';

type SubjectOption = { id: string; name: string; topics: { id: string; name: string }[] };

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

function ExamRow({
  control,
  index,
  subjects,
  onRemove,
}: {
  control: Control<ExamsStepInput>;
  index: number;
  subjects: SubjectOption[];
  onRemove: () => void;
}) {
  const selectedSubjectId = useWatch({ control, name: `exams.${index}.subjectId` });
  const availableTopics = subjects.find((s) => s.id === selectedSubjectId)?.topics ?? [];
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex items-start gap-2">
        <FormField
          control={control}
          name={`exams.${index}.title`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Exam title (e.g. Midterm)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove exam"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <FormField
          control={control}
          name={`exams.${index}.subjectId`}
          render={({ field }) => (
            <FormItem>
              <Select
                items={Object.fromEntries(subjects.map((s) => [s.id, s.name]))}
                onValueChange={field.onChange}
                value={field.value ?? ''}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`exams.${index}.examDate`}
          render={({ field }) => (
            <FormItem>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start font-normal">
                      <CalendarIcon className="size-4" />
                      {field.value ? format(new Date(field.value), 'PPP') : 'Exam date'}
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
          control={control}
          name={`exams.${index}.priority`}
          render={({ field }) => (
            <Select
              items={PRIORITY_LABELS}
              onValueChange={field.onChange}
              value={field.value ?? 'MEDIUM'}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {availableTopics.length > 0 && (
        <FormField
          control={control}
          name={`exams.${index}.topicIds`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground text-xs font-normal">
                Which topics does this exam cover?
              </FormLabel>
              <div className="flex flex-wrap gap-3">
                {availableTopics.map((topic) => {
                  const checked = field.value?.includes(topic.id);
                  return (
                    <label key={topic.id} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const current = field.value ?? [];
                          field.onChange(
                            value ? [...current, topic.id] : current.filter((t) => t !== topic.id)
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
    </div>
  );
}

export function ExamsForm({
  subjects,
  defaultValues,
}: {
  subjects: SubjectOption[];
  defaultValues: ExamsStepInput;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExamsStepInput>({
    resolver: zodResolver(examsStepSchema),
    defaultValues,
  });

  const examsArray = useFieldArray({ control: form.control, name: 'exams' });

  async function onSubmit(values: ExamsStepInput) {
    setIsSubmitting(true);
    const result = await saveExamsStep(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.push('/onboarding/review');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {examsArray.fields.map((field, index) => (
          <ExamRow
            key={field.id}
            control={form.control}
            index={index}
            subjects={subjects}
            onRemove={() => examsArray.remove(index)}
          />
        ))}

        {examsArray.fields.length > 0 && <Separator />}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            examsArray.append({
              title: '',
              subjectId: subjects[0]?.id ?? '',
              examDate: '',
              priority: 'MEDIUM',
              topicIds: [],
            })
          }
        >
          <Plus className="size-4" /> Add exam
        </Button>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : examsArray.fields.length > 0 ? 'Continue' : 'Skip for now'}
        </Button>
      </form>
    </Form>
  );
}
