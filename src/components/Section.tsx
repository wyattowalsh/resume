import { ReactNode } from "react";
import { cn } from "../lib/utils";

type SectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Section({
  title,
  description,
  children,
  className,
}: SectionProps) {
  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col", className)}
    >
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-3">
          <h2
            id={headingId}
            className="m-0 font-[family:var(--font-site-heading)] text-2xl font-semibold text-foreground sm:text-[1.85rem]"
          >
            {title}
          </h2>
          <div className="hidden h-px flex-1 bg-border sm:block" />
        </div>
        {description ? (
          <p className="max-w-3xl text-pretty text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
