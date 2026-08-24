'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createSubject, updateSubject } from '@/lib/actions/subject.actions';
import { SUBJECT_COLORS } from '@/lib/validations/onboarding.schema';
import { createSubjectSchema, type CreateSubjectInput } from '@/lib/validations/subject.schema';
import { cn } from '@/lib/utils';
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

export function SubjectDialog({
  trigger,
  subject,
}: {
  trigger: ReactElement;
  subject?: { id: string; name: string; color: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!subject;

  const form = useForm<CreateSubjectInput>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: subject?.name ?? '',
      color: (subject?.color as CreateSubjectInput['color']) ?? SUBJECT_COLORS[0],
    },
  });

  async function onSubmit(values: CreateSubjectInput) {
    setIsSubmitting(true);
    const result = isEditing
      ? await updateSubject({ id: subject.id, ...values })
      : await createSubject(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'Subject updated' : 'Subject added');
    setOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit subject' : 'Add subject'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this subject's name and color."
              : 'Give it a name and pick a color.'}
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
                    <Input placeholder="e.g. Mathematics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex flex-wrap gap-1.5">
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
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add subject'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
