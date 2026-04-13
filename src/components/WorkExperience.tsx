import { Work } from "@/lib/schema";
import { Section } from "./Section";
import { formatMonthYear } from "@/lib/date";
import { LuExternalLink } from "react-icons/lu";

type WorkExperienceProps = {
  work: Work[];
};

export function WorkExperience({ work }: WorkExperienceProps) {
  return (
    <Section title="Experience" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {work.map((job) => (
          <article
            key={job.name}
            className="card-hover rounded-[1.35rem] border border-border/65 bg-card/85 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ring-1 ring-white/35"
          >
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-0.5">
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
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground sm:justify-end">
                <div className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 shadow-sm">
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
                  <span className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 shadow-sm">
                    {job.location}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2">
              {job.summary && (
                <p className="text-sm font-medium italic leading-6 text-muted-foreground">
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
