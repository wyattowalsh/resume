import { formatMonthYear } from "@/lib/date";
import { Work } from "@/lib/schema";
import { FaBriefcase } from "react-icons/fa";
import {
  LuCalendarDays,
  LuExternalLink,
  LuLaptop,
  LuMapPin,
} from "react-icons/lu";
import { Section } from "./Section";

type WorkExperienceProps = {
  work: Work[];
};

export function WorkExperience({ work }: WorkExperienceProps) {
  const metaChipClass =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] text-muted-foreground shadow-sm tabular-nums";

  return (
    <Section title="Experience" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {work.map((job) => (
          <article
            key={job.name}
            className="card-hover interactive-surface flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:p-5"
          >
            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
              <FaBriefcase className="text-primary" size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h3 className="font-[family:var(--font-site-heading)] text-base font-semibold leading-6 text-foreground">
                    {job.position}
                  </h3>
                  <h4 className="font-[family:var(--font-site-label)] text-sm font-medium text-foreground/75">
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
                    <LuCalendarDays size={12} aria-hidden="true" />
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
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                      {job.location.toLowerCase() === "remote" ? (
                        <LuLaptop size={12} aria-hidden="true" />
                      ) : (
                        <LuMapPin size={12} aria-hidden="true" />
                      )}
                      {job.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2">
                {job.summary && (
                  <p className="text-pretty text-sm font-medium italic leading-6 text-foreground/72">
                    {job.summary}
                  </p>
                )}
                {Array.isArray(job.highlights) && job.highlights.length > 0 && (
                  <ul className="mt-2 list-outside list-disc pl-4 text-sm leading-6 text-muted-foreground marker:text-primary/45">
                    {job.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="transition-colors duration-200 group-hover:text-foreground/75"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
