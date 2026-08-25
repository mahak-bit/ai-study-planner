'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { NAV_LINKS } from '@/components/shared/nav-links';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="ghost" size="icon" className="sm:hidden" aria-label="Menu">
            <Menu className="size-5" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-48">
        {NAV_LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <DropdownMenuItem
              key={link.href}
              render={
                <Link href={link.href} className={cn(isActive && 'font-medium')}>
                  {link.label}
                </Link>
              }
            />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
