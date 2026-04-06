import type {
  Basics,
  Certificate,
  Education,
  Project,
  Publication,
  Skill,
  Work,
} from "@/lib/schema";
import type { ReactNode } from "react";
import { formatMonthYear } from "@/lib/date";
import { cn } from "@/lib/utils";

type PrintResumeHeaderProps = {
  basics: Basics;
  showSummary: boolean;
  compact?: boolean;
};

type PrintSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

type PrintWorkListProps = {
  work: Work[];
  showSummaries: boolean;
  compact?: boolean;
};

type PrintSkillListProps = {
  skills: Skill[];
  columns?: 1 | 2 | 3;
};

type PrintProjectListProps = {
  projects: Project[];
  showHighlights: boolean;
  showStacks: boolean;
  compact?: boolean;
};

type PrintEducationListProps = {
  education: Education[];
  compact?: boolean;
};

type PrintCertificateListProps = {
  certificates: Certificate[];
};

type PrintPublicationListProps = {
  publications: Publication[];
};

function formatDateRange(startDate: string, endDate: string | null) {
  return `${formatMonthYear(startDate)} - ${endDate ? formatMonthYear(endDate) : "Present"}`;
}

function skillsGridClass(columns: 1 | 2 | 3) {
  if (columns === 1) return "grid-cols-1";
  if (columns === 3) return "grid-cols-3";
  return "grid-cols-2";
}

export function PrintResumeHeader({
  basics,
  showSummary,
  compact = false,
}: PrintResumeHeaderProps) {
  return (
    <header className={cn("border-b border-slate-300 pb-3", compact ? "space-y-2" : "space-y-2.5")}>
      <div className="space-y-1">
        <a href={basics.url} target="_blank" rel="noopener noreferrer" className="inline-block">
          <h1 className={cn("font-bold tracking-tight text-slate-950", compact ? "text-[28px]" : "text-[32px]")}>
            {basics.name}
          </h1>
        </a>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-slate-600">
          <li>
            <a href={`mailto:${basics.email}`} className="hover:text-slate-900">
              {basics.email}
            </a>
          </li>
          <li>
            <a href={`tel:${basics.phone}`} className="hover:text-slate-900">
              {basics.phone}
            </a>
          </li>
          <li>{`${basics.location.city}, ${basics.location.region}`}</li>
          {basics.profiles.map((profile) => (
            <li key={profile.network}>
              <a href={profile.url} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                {profile.network}: {profile.username}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {showSummary && basics.summary && (
        <p
          className={cn(
            "max-w-4xl text-slate-700",
            compact ? "text-[10.5px] leading-[1.35]" : "text-[11px] leading-[1.45]",
          )}
        >
          {basics.summary}
        </p>
      )}
    </header>
  );
}

export function PrintSection({ title, children, className }: PrintSectionProps) {
  return (
    <section className={cn("resume-print-section", className)}>
      <div className="mb-2 border-t border-slate-300 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </div>
      {children}
    </section>
  );
}

export function PrintWorkList({
  work,
  showSummaries,
  compact = false,
}: PrintWorkListProps) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2.5")}>
      {work.map((job) => (
        <article key={job.name} className="resume-print-entry break-inside-avoid">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={cn("font-semibold text-slate-950", compact ? "text-[11px]" : "text-[12px]")}>
                {job.position}
              </h3>
              <div className="text-[10px] uppercase tracking-[0.08em] text-slate-500">
                {job.url ? (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                    {job.name}
                  </a>
                ) : (
                  job.name
                )}
                {job.location ? ` · ${job.location}` : ""}
              </div>
            </div>
            <div className="shrink-0 text-right text-[10px] uppercase tracking-[0.08em] text-slate-500">
              {formatDateRange(job.startDate, job.endDate)}
            </div>
          </div>

          {showSummaries && (
            <p className={cn("mt-1 text-slate-700", compact ? "text-[10px] leading-[1.35]" : "text-[10.5px] leading-[1.45]")}>
              {job.summary}
            </p>
          )}

          <ul
            className={cn(
              "mt-1.5 list-disc pl-4 text-slate-800 marker:text-slate-400",
              compact ? "space-y-0.5 text-[10px] leading-[1.35]" : "space-y-0.5 text-[10.5px] leading-[1.4]",
            )}
          >
            {job.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function PrintSkillList({ skills, columns = 2 }: PrintSkillListProps) {
  return (
    <div className={cn("grid gap-x-4 gap-y-2", skillsGridClass(columns))}>
      {skills.map((skill) => (
        <div key={skill.name} className="break-inside-avoid">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
            {skill.name}
          </h3>
          <p className="mt-0.5 text-[10.25px] leading-[1.4] text-slate-800">
            {skill.keywords.join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
}

export function PrintProjectList({
  projects,
  showHighlights,
  showStacks,
  compact = false,
}: PrintProjectListProps) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2.5")}>
      {projects.map((project) => (
        <article key={project.name} className="resume-print-entry break-inside-avoid">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "font-semibold text-slate-950 hover:text-slate-700",
                      compact ? "text-[11px]" : "text-[12px]",
                    )}
                  >
                    {project.name}
                  </a>
                ) : (
                  <h3 className={cn("font-semibold text-slate-950", compact ? "text-[11px]" : "text-[12px]")}>
                    {project.name}
                  </h3>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-[0.08em] text-slate-500 hover:text-slate-900"
                  >
                    GitHub
                  </a>
                )}
              </div>
              <p className={cn("mt-0.5 text-slate-700", compact ? "text-[10px] leading-[1.35]" : "text-[10.5px] leading-[1.45]")}>
                {project.description}
              </p>
            </div>
            <div className="shrink-0 text-right text-[10px] uppercase tracking-[0.08em] text-slate-500">
              {formatDateRange(project.startDate, project.endDate)}
            </div>
          </div>

          {showHighlights && project.highlights.length > 0 && (
            <ul
              className={cn(
                "mt-1.5 list-disc pl-4 text-slate-800 marker:text-slate-400",
                compact ? "space-y-0.5 text-[10px] leading-[1.35]" : "space-y-0.5 text-[10.5px] leading-[1.4]",
              )}
            >
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}

          {showStacks && project.stack?.length ? (
            <p className="mt-1 text-[10px] leading-[1.35] text-slate-600">
              <span className="font-semibold text-slate-800">Stack:</span> {project.stack.join(" · ")}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function PrintEducationList({ education, compact = false }: PrintEducationListProps) {
  return (
    <div className={cn("space-y-2.5", compact && "space-y-2")}>
      {education.map((entry) => (
        <article key={entry.institution} className="resume-print-entry break-inside-avoid">
          <h3 className={cn("font-semibold text-slate-950", compact ? "text-[11px]" : "text-[11.5px]")}>
            {entry.studyType}
          </h3>
          <p className={cn("text-slate-700", compact ? "text-[10px] leading-[1.3]" : "text-[10.5px] leading-[1.35]")}>
            {entry.url ? (
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                {entry.institution}
              </a>
            ) : (
              entry.institution
            )}
            {entry.area ? `, ${entry.area}` : ""}
            {entry.score ? ` · GPA ${entry.score}` : ""}
          </p>
          <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">
            {formatDateRange(entry.startDate, entry.endDate)}
          </p>
        </article>
      ))}
    </div>
  );
}

export function PrintCertificateList({ certificates }: PrintCertificateListProps) {
  return (
    <div className="space-y-2">
      {certificates.map((cert) => (
        <article key={cert.name} className="resume-print-entry break-inside-avoid">
          <h3 className="text-[11px] font-semibold text-slate-950">
            {cert.url ? (
              <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
                {cert.name}
              </a>
            ) : (
              cert.name
            )}
          </h3>
          <p className="text-[10px] leading-[1.35] text-slate-600">
            {cert.issuer} · {formatMonthYear(cert.date)}
          </p>
        </article>
      ))}
    </div>
  );
}

export function PrintPublicationList({ publications }: PrintPublicationListProps) {
  return (
    <div className="space-y-2">
      {publications.map((publication) => (
        <article key={publication.name} className="resume-print-entry break-inside-avoid">
          <h3 className="text-[11px] font-semibold text-slate-950">
            <a href={publication.url} target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
              {publication.name}
            </a>
          </h3>
          <p className="text-[10px] leading-[1.35] text-slate-600">
            {publication.publisher} · {formatMonthYear(publication.releaseDate)}
          </p>
        </article>
      ))}
    </div>
  );
}
