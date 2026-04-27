import { Work } from "@/lib/schema";
import { Section } from "./Section";
import { formatMonthYear } from "@/lib/date";
import { LuExternalLink } from "react-icons/lu";

type WorkExperienceProps = {
  work: Work[];
};

export function WorkExperience({ work }: WorkExperienceProps) {
  const metaChipClass =
    "rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground shadow-sm tabular-nums";

  return (
    <Section title="Experience" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {work.map((job) => (
          <article
            key={job.name}
            className="card-hover interactive-surface rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-semibold leading-6">
                  {job.position}
                </h3>
                <h4 className="text-sm font-medium text-foreground/75">
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary hover:underline"
                    >
                      {job.name}
                      <LuExternalLink size={12} strokeWidth={2} />
                    </a>
                  ) : (
                    job.name
                    )}
                   </h4>
                 </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <div className={metaChipClass}>
                  <time dateTime={job.startDate}>
                    {formatMonthYear(job.startDate)}
                  </time>{" "}
                  -{" "}
                  {job.endDate ? (
                    <time dateTime={job.endDate}>
                      {formatMonthYear(job.endDate)}
                    </time>
                  ) : (
                    "Present"
                  )}
                </div>
                {job.location && (
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                    {job.location}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2">
              {job.summary && (
                <p className="text-pretty text-sm font-medium italic leading-6 text-muted-foreground">
                  {job.summary}
                </p>
              )}
              {Array.isArray(job.highlights) && job.highlights.length > 0 && (
                <ul className="mt-2 list-outside list-disc pl-4 text-sm leading-6 text-muted-foreground">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
