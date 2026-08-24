'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type ActionResult = { success: true } | { success: false; error: string };

export function DeleteConfirmButton({
  title,
  description,
  onConfirm,
  trigger,
  redirectTo,
}: {
  title: string;
  description: string;
  onConfirm: () => Promise<ActionResult>;
  trigger?: ReactElement;
  /** Navigate here after a successful delete (e.g. when the current page's own record was removed). */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const defaultTrigger = (
    <Button type="button" variant="ghost" size="icon" aria-label="Delete">
      <Trash2 className="size-4" />
    </Button>
  );

  async function handleConfirm() {
    setIsDeleting(true);
    const result = await onConfirm();
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger ?? defaultTrigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
