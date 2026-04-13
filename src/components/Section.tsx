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
      <div className="mb-2.5 space-y-1">
        <h2
          id={headingId}
          className="m-0 p-0 text-[1.65rem] font-semibold tracking-tight text-foreground sm:text-[1.8rem]"
        >
          {title}
        </h2>
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
