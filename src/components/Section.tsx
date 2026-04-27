import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
            className="m-0 text-2xl sm:text-[1.85rem] font-semibold text-foreground font-[family:var(--font-site-heading)]"
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
