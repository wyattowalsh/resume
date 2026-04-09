import { ReactNode } from 'react';
import { cn } from '../lib/utils';

type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Section({ title, children, className }: SectionProps) {
  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;

  return (
    <section aria-labelledby={headingId} className={cn("flex flex-col", className)}>
      <h2
        id={headingId}
        className="mb-1 mt-0 p-0 text-2xl font-semibold tracking-tight text-primary"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
