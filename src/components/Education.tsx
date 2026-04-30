import { Education as EducationType } from "@/lib/schema";
import { Section } from "./Section";
import { formatMonthYear } from "@/lib/date";
import { FaGraduationCap } from "react-icons/fa";
import { LuCalendarDays, LuExternalLink } from "react-icons/lu";

type EducationProps = {
  education: EducationType[];
};

export function Education({ education }: EducationProps) {
  const metaChipClass =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] text-muted-foreground shadow-sm tabular-nums";

  return (
    <Section title="Education" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {education.map((edu) => (
          <article
            key={edu.institution}
            className="card-hover interactive-surface flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:p-5"
          >
            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
              <FaGraduationCap className="text-primary" size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h3 className="font-[family:var(--font-site-heading)] text-base font-semibold leading-6 text-foreground">
                    {edu.studyType}
                  </h3>
                  <h4 className="font-[family:var(--font-site-label)] text-sm font-medium text-foreground/75">
                    {edu.url ? (
                      <a
                        href={edu.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-primary hover:underline"
                      >
                        {edu.institution}
                        <LuExternalLink size={12} strokeWidth={2} />
                      </a>
                    ) : (
                      edu.institution
                    )}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className={metaChipClass}>
                    <LuCalendarDays size={12} aria-hidden="true" />
                    <time dateTime={edu.startDate}>
                      {formatMonthYear(edu.startDate)}
                    </time>{" "}
                    -{" "}
                    {edu.endDate ? (
                      <time dateTime={edu.endDate}>
                        {formatMonthYear(edu.endDate)}
                      </time>
                    ) : (
                      "Present"
                    )}
                  </div>
                </div>
              </div>
              {(edu.area || edu.score) && (
                <div className="mt-2 space-y-1">
                  {edu.area && (
                    <p className="text-pretty text-sm italic leading-6 text-foreground/72">
                      in {edu.area}
                    </p>
                  )}
                  {edu.score && (
                    <p className="text-sm leading-6 text-muted-foreground tabular-nums">
                      GPA: {edu.score}
                    </p>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
