import { GraduationCap } from 'lucide-react';

import { signOutAction } from '@/lib/actions/auth.actions';
import { requireUser } from '@/lib/auth/session';
import { MobileNav } from '@/components/shared/mobile-nav';
import { NavLinks } from '@/components/shared/nav-links';
import { Button } from '@/components/ui/button';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <MobileNav />
          <div className="flex shrink-0 items-center gap-2 font-semibold">
            <GraduationCap className="text-primary size-5" />
            <span className="hidden sm:inline">AI Study Planner</span>
          </div>
          <NavLinks />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <span className="text-muted-foreground hidden text-sm sm:inline">{user.email}</span>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main id="main-content" className="flex flex-1 flex-col p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
