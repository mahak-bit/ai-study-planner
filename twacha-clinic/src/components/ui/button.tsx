import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'light' | 'text';

const base =
  'group/btn inline-flex items-center justify-center gap-2.5 whitespace-nowrap text-[0.8rem] font-semibold tracking-[0.08em] uppercase transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-luxe)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

type Size = 'md' | 'sm';

const variants: Record<Variant, string> = {
  primary: 'bg-charcoal text-ivory hover:bg-clay',
  outline: 'border border-charcoal/25 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-ivory',
  light: 'bg-ivory text-charcoal hover:bg-sand',
  text: 'text-charcoal hover:text-clay',
};

const sizes: Record<Size, string> = {
  md: 'h-12 px-7',
  sm: 'h-10 px-5',
};

const sizeFor = (variant: Variant, size: Size) => (variant === 'text' ? '' : sizes[size]);

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  icon?: ReactNode | false;
  external?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<'a'>, 'href' | 'className' | 'children'>;

export function ButtonLink({ href, variant = 'primary', icon, external, className, children, ...rest }: ButtonLinkProps) {
  const content = (
    <>
      <span>{children}</span>
      {icon === false
        ? null
        : (icon ?? (
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-300 ease-[var(--ease-luxe)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
            />
          ))}
    </>
  );
  const classes = cn(base, variants[variant], sizeFor(variant, 'md'), className);
  const isExternal = external ?? /^(https?:|tel:|mailto:)/.test(href);

  if (isExternal) {
    const newTab = href.startsWith('http');
    return (
      <a href={href} className={classes} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}

export const buttonClasses = (variant: Variant = 'primary', className?: string, size: Size = 'md') =>
  cn(base, variants[variant], sizeFor(variant, size), className);
