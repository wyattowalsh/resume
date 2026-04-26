import type {
  Basics,
  Certificate,
  Education,
  Project,
  Publication,
  Skill,
  Work,
} from "@/lib/schema";
import { Fragment, type ReactNode } from "react";
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
  layout?: "grid" | "inline";
  compact?: boolean;
};

type PrintProjectListProps = {
  projects: Project[];
  showHighlights: boolean;
  maxHighlights?: number;
  showStacks: boolean;
  showDates?: boolean;
  summaryOnly?: boolean;
  compact?: boolean;
};

type PrintEducationListProps = {
  education: Education[];
  compact?: boolean;
};

type PrintCertificateListProps = {
  certificates: Certificate[];
};

type PrintCertificateStripProps = {
  certificates: Certificate[];
  compact?: boolean;
};

type PrintPublicationListProps = {
  publications: Publication[];
};

function renderDateRange(startDate: string, endDate: string | null) {
  return (
    <>
      <time dateTime={startDate}>{formatMonthYear(startDate)}</time> -{" "}
      {endDate ? (
        <time dateTime={endDate}>{formatMonthYear(endDate)}</time>
      ) : (
        "Present"
      )}
    </>
  );
}

function formatProfileDisplayUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    const pathname = parsedUrl.pathname.replace(/\/$/, "");
    return `${hostname}${pathname}`;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

function skillsGridClass(columns: 1 | 2 | 3) {
  if (columns === 1) return "grid-cols-1";
  if (columns === 3) return "grid-cols-3";
  return "grid-cols-2";
}

function getPrintSectionHeadingId(title: string) {
  return `print-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-heading`;
}

export function PrintResumeHeader({
  basics,
  showSummary,
  compact = false,
}: PrintResumeHeaderProps) {
  return (
    <header
      className={cn(
        "border-b-[1.5px] border-slate-400",
        compact ? "space-y-1.5 pb-2.5" : "space-y-2.5 pb-3",
      )}
    >
      <div className="space-y-1">
        <a
          href={basics.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <h1
            className={cn(
              "font-bold text-slate-950",
              compact ? "text-[27px]" : "text-[32px]",
            )}
          >
            {basics.name}
          </h1>
        </a>
        {basics.label && (
          <p
            className={cn(
              "font-semibold uppercase text-slate-600",
              compact ? "text-[9.8px]" : "text-[10.5px]",
            )}
          >
            {basics.label}
          </p>
        )}
        <ul
          className={cn(
            "flex flex-wrap gap-y-1 text-slate-600",
            compact ? "gap-x-2.5 text-[10px]" : "gap-x-3 text-[10.5px]",
          )}
        >
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
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900"
              >
                {profile.network}: {formatProfileDisplayUrl(profile.url)}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {showSummary && basics.summary && (
        <p
          className={cn(
            "text-slate-700",
            compact
              ? "text-[9.9px] leading-[1.3]"
              : "text-[11px] leading-[1.45]",
          )}
        >
          <span className="font-bold text-slate-800">Summary:</span>{" "}
          {basics.summary}
        </p>
      )}
    </header>
  );
}

export function PrintSection({
  title,
  children,
  className,
}: PrintSectionProps) {
  const headingId = getPrintSectionHeadingId(title);

  return (
    <section
      aria-labelledby={headingId}
      className={cn("resume-print-section", className)}
    >
      <h2
        id={headingId}
        className="resume-print-section-heading mb-2 flex items-center gap-2 border-t-[1.5px] border-slate-400 pt-2 text-[10px] font-bold uppercase text-slate-700"
      >
        <span>{title}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-slate-400" />
      </h2>
      {children}
    </section>
  );
}

export function PrintCertificateStrip({
  certificates,
  compact = false,
}: PrintCertificateStripProps) {
  return (
    <p
      className={cn(
        "text-slate-700",
        compact ? "text-[9.8px] leading-[1.25]" : "text-[10.5px] leading-[1.35]",
      )}
    >
      <span className="font-bold uppercase text-slate-600">
        Certifications:
      </span>{" "}
      {certificates.map((certificate, index) => (
        <Fragment key={certificate.name}>
          {index > 0 ? " | " : null}
          {certificate.url ? (
            <a
              href={certificate.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900"
            >
              {certificate.name}
            </a>
          ) : (
            certificate.name
          )}
        </Fragment>
      ))}
    </p>
  );
}

export function PrintWorkList({
  work,
  showSummaries,
  compact = false,
}: PrintWorkListProps) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {work.map((job) => (
        <article
          key={job.name}
          className="resume-print-entry break-inside-avoid"
        >
          <div className="min-w-0">
            <h3
              className={cn(
                "font-bold text-slate-950",
                compact ? "text-[11px]" : "text-[12px]",
              )}
            >
              {job.position}
            </h3>
            <div className="text-[10px] uppercase text-slate-500">
              <span className="font-medium text-slate-700">
                {job.url ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900"
                  >
                    {job.name}
                  </a>
                ) : (
                  job.name
                )}
              </span>
              {job.location ? ` | ${job.location}` : ""}
              {" | "}
              {renderDateRange(job.startDate, job.endDate)}
            </div>
          </div>

          {showSummaries && job.summary && (
            <p
              className={cn(
                "mt-1 text-slate-700",
                compact
                  ? "text-[10px] leading-[1.35]"
                  : "text-[10.5px] leading-[1.45]",
              )}
            >
              {job.summary}
            </p>
          )}

          <ul
            className={cn(
              "mt-1.5 list-disc pl-4 text-slate-800 marker:text-slate-400",
              compact
                ? "space-y-0.5 text-[10px] leading-[1.35]"
                : "space-y-0.5 text-[10.5px] leading-[1.4]",
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

export function PrintSkillList({
  skills,
  columns = 2,
  layout = "grid",
  compact = false,
}: PrintSkillListProps) {
  if (layout === "inline") {
    return (
      <div className={cn("space-y-1.5", compact && "space-y-1")}>
        {skills.map((skill) => (
          <p
            key={skill.name}
            className={cn(
              "text-slate-700",
              compact
                ? "text-[9.8px] leading-[1.35]"
                : "text-[10.25px] leading-[1.45]",
            )}
          >
            <span className="font-bold uppercase text-slate-900">
              {skill.name}:
            </span>{" "}
            {skill.keywords.join(" | ")}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-x-4",
        compact ? "gap-y-1.5" : "gap-y-2",
        skillsGridClass(columns),
      )}
    >
      {skills.map((skill) => (
        <div key={skill.name} className="break-inside-avoid">
          <h3
            className={cn(
              "font-semibold uppercase text-slate-600",
              compact ? "text-[9.8px]" : "text-[10px]",
            )}
          >
            {skill.name}
          </h3>
          <p
            className={cn(
              "mt-0.5 text-slate-800",
              compact
                ? "text-[9.8px] leading-[1.35]"
                : "text-[10.25px] leading-[1.4]",
            )}
          >
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
  maxHighlights,
  showStacks,
  showDates = true,
  summaryOnly = false,
  compact = false,
}: PrintProjectListProps) {
  const spacingClass = summaryOnly
    ? compact
      ? "space-y-1.25"
      : "space-y-1.5"
    : compact
      ? "space-y-2"
      : "space-y-2";

  return (
    <div className={cn(spacingClass)}>
      {projects.map((project) => (
        <article
          key={project.name}
          className="resume-print-entry break-inside-avoid"
        >
          {summaryOnly ? (
            <p
              className={cn(
                "text-slate-700",
                compact
                  ? "text-[9.8px] leading-[1.28]"
                  : "text-[10.25px] leading-[1.35]",
              )}
            >
              <span className="font-bold text-slate-950">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-700"
                  >
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}
              </span>
              {" - "}
              {project.description}
            </p>
          ) : (
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-bold text-slate-950",
                  compact ? "text-[11px]" : "text-[12px]",
                )}
              >
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-700"
                  >
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}
              </h3>
              {(showDates || project.githubUrl) && (
                <p className="text-[10px] uppercase text-slate-500">
                  {showDates
                    ? renderDateRange(project.startDate, project.endDate)
                    : null}
                  {project.githubUrl ? (
                    <>
                      {showDates ? " | " : null}
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-900"
                      >
                        GitHub: {formatProfileDisplayUrl(project.githubUrl)}
                      </a>
                    </>
                  ) : null}
                </p>
              )}
              <p
                className={cn(
                  "mt-0.5 text-slate-700",
                  compact
                    ? "text-[9.9px] leading-[1.3]"
                    : "text-[10.5px] leading-[1.45]",
                )}
              >
                {project.description}
              </p>
            </div>
          )}

          {showHighlights &&
          !summaryOnly &&
          project.highlights.length > 0 &&
          (maxHighlights ?? project.highlights.length) > 0 ? (
            <ul
              className={cn(
                "mt-1.5 list-disc pl-4 text-slate-800 marker:text-slate-400",
                compact
                  ? "space-y-0.5 text-[10px] leading-[1.35]"
                  : "space-y-0.5 text-[10.5px] leading-[1.4]",
              )}
            >
              {project.highlights
                .slice(0, maxHighlights ?? project.highlights.length)
                .map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
            </ul>
          ) : null}

          {showStacks && !summaryOnly && project.stack?.length ? (
            <p className="mt-1 text-[10px] leading-[1.35] text-slate-600">
              <span className="font-bold text-slate-800">Stack:</span>{" "}
              {project.stack.join(" | ")}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function PrintEducationList({
  education,
  compact = false,
}: PrintEducationListProps) {
  return (
    <div className={cn("space-y-2.5", compact && "space-y-1.5")}>
      {education.map((entry) => (
        <article
          key={entry.institution}
          className="resume-print-entry break-inside-avoid"
        >
          <h3
            className={cn(
              "font-bold text-slate-950",
              compact ? "text-[11px]" : "text-[11.5px]",
            )}
          >
            {entry.studyType}
          </h3>
          <p
            className={cn(
              "text-slate-700",
              compact
                ? "text-[9.9px] leading-[1.25]"
                : "text-[10.5px] leading-[1.35]",
            )}
          >
            {entry.url ? (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900"
              >
                {entry.institution}
              </a>
            ) : (
              entry.institution
            )}
            {entry.area ? `, ${entry.area}` : ""}
            {entry.score ? ` | GPA ${entry.score}` : ""}
          </p>
          <p className="text-[10px] uppercase text-slate-500">
            {renderDateRange(entry.startDate, entry.endDate)}
          </p>
        </article>
      ))}
    </div>
  );
}

export function PrintCertificateList({
  certificates,
}: PrintCertificateListProps) {
  return (
    <div className="space-y-2">
      {certificates.map((cert) => (
        <article
          key={cert.name}
          className="resume-print-entry break-inside-avoid"
        >
          <h3 className="text-[11px] font-bold text-slate-950">
            {cert.url ? (
              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-700"
              >
                {cert.name}
              </a>
            ) : (
              cert.name
            )}
          </h3>
          <p className="text-[10px] leading-[1.35] text-slate-600">
            {cert.issuer} |{" "}
            <time dateTime={cert.date}>{formatMonthYear(cert.date)}</time>
          </p>
        </article>
      ))}
    </div>
  );
}

export function PrintPublicationList({
  publications,
}: PrintPublicationListProps) {
  return (
    <div className="space-y-2">
      {publications.map((publication) => (
        <article
          key={publication.name}
          className="resume-print-entry break-inside-avoid"
        >
          <h3 className="text-[11px] font-bold text-slate-950">
            <a
              href={publication.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700"
            >
              {publication.name}
            </a>
          </h3>
          <p className="text-[10px] leading-[1.35] text-slate-600">
            {publication.publisher} |{" "}
            <time dateTime={publication.releaseDate}>
              {formatMonthYear(publication.releaseDate)}
            </time>
          </p>
        </article>
      ))}
    </div>
  );
}
