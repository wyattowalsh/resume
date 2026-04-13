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
      <div className="mb-3 space-y-1.5">
        <div className="flex items-center gap-3">
          <h2
            id={headingId}
            className="m-0 border-l-[3px] border-primary/40 pl-3 pr-1 font-[family:var(--font-site-heading)] text-[1.65rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[1.8rem]"
          >
            {title}
          </h2>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-primary/20 via-border to-transparent sm:block" />
        </div>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
