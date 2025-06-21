import { ReactNode } from 'react';
import { cn } from '../lib/utils';

type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Section({ title, children, className }: SectionProps) {
  return (
    <section className={cn("flex flex-col", className)}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
