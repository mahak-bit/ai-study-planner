'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { saveProfileStep } from '@/lib/actions/onboarding.actions';
import {
  profileStepSchema,
  studyTimePreferences,
  type ProfileStepInput,
} from '@/lib/validations/onboarding.schema';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  HIGH_SCHOOL: 'High school',
  UNDERGRADUATE: 'Undergraduate',
  GRADUATE: 'Graduate',
  POSTGRADUATE: 'Postgraduate',
  COMPETITIVE_EXAM: 'Competitive exam prep',
  OTHER: 'Other',
};

const STUDY_TIME_LABELS: Record<string, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
  NIGHT: 'Night',
};

const WEEKDAY_LABELS: { key: keyof ProfileStepInput['weeklyAvailabilityHours']; label: string }[] =
  [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
  ];

export function ProfileForm({ defaultValues }: { defaultValues: Partial<ProfileStepInput> }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileStepInput>({
    resolver: zodResolver(profileStepSchema),
    defaultValues: defaultValues as ProfileStepInput,
  });

  useEffect(() => {
    if (!form.getValues('timezone')) {
      form.setValue('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: ProfileStepInput) {
    setIsSubmitting(true);
    const result = await saveProfileStep(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.push('/onboarding/subjects');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="educationLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education level</FormLabel>
              <Select
                items={EDUCATION_LEVEL_LABELS}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
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
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What are you working toward? (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. Score 90%+ on my finals, clear a competitive exam..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredStudyTimes"
          render={() => (
            <FormItem>
              <FormLabel>When do you usually study best?</FormLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {studyTimePreferences.map((time) => (
                  <FormField
                    key={time}
                    control={form.control}
                    name="preferredStudyTimes"
                    render={({ field }) => {
                      const checked = field.value?.includes(time);
                      return (
                        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              const current = field.value ?? [];
                              field.onChange(
                                value ? [...current, time] : current.filter((t) => t !== time)
                              );
                            }}
                          />
                          {STUDY_TIME_LABELS[time]}
                        </label>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label className="mb-2 block">Hours available per day</Label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {WEEKDAY_LABELS.map(({ key, label }) => (
              <FormField
                key={key}
                control={form.control}
                name={`weeklyAvailabilityHours.${key}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-normal">
                      {label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={16}
                        step={0.5}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Continue'}
        </Button>
      </form>
    </Form>
  );
}
