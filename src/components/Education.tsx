import { Education as EducationType } from "@/lib/schema";
import { Section } from "./Section";
import { formatMonthYear } from "@/lib/date";
import { LuExternalLink } from "react-icons/lu";

type EducationProps = {
  education: EducationType[];
};

export function Education({ education }: EducationProps) {
  return (
    <Section title="Education" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {education.map((edu) => (
          <article
            key={edu.institution}
            className="rounded-xl border border-border/70 bg-card/85 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-semibold leading-6">
                  {edu.studyType}
                </h3>
                <h4 className="text-sm font-medium text-foreground/75">
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
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground sm:justify-end">
                <div>
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
                  <p className="mt-0 pt-0 text-sm italic leading-6 text-muted-foreground">
                    in {edu.area}
                  </p>
                )}
                {edu.score && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    GPA: {edu.score}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
