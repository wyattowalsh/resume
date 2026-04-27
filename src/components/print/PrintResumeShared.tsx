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

function PrintSeparator() {
  return <span className="px-0.5 text-slate-400"> | </span>;
}

export function PrintResumeHeader({
  basics,
  showSummary,
  compact = false,
}: PrintResumeHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-slate-300",
        compact ? "space-y-1 pb-2.5" : "space-y-2 pb-3.5",
      )}
    >
      <div className={cn("space-y-1", compact && "space-y-0.5")}>
        <a
          href={basics.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <h1
            className={cn(
              "font-bold leading-none text-slate-950",
              compact ? "text-[25px]" : "text-[29px]",
            )}
          >
            {basics.name}
          </h1>
        </a>
        {basics.label && (
          <p
            className={cn(
              "font-bold uppercase text-slate-800",
              compact ? "text-[9.4px]" : "text-[9.8px]",
            )}
          >
            {basics.label}
          </p>
        )}
        <ul
          className={cn(
            "flex flex-wrap gap-x-2.5 gap-y-0.5 leading-snug text-slate-500",
            compact ? "text-[9.2px]" : "text-[9.6px]",
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
                {formatProfileDisplayUrl(profile.url)}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {showSummary && basics.summary && (
        <p
          className={cn(
            "border-l-[3px] border-slate-300 bg-slate-50 py-1 pl-2 pr-2 text-slate-700",
            compact
              ? "text-[9.6px] leading-[1.28]"
              : "text-[10.25px] leading-[1.38]",
          )}
        >
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
        className="resume-print-section-heading mb-2.5 flex items-center gap-2 border-b border-slate-300 pb-1 text-[9.4px] font-bold uppercase text-slate-800"
      >
        <span>{title}</span>
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
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {certificates.map((certificate) => (
        <article
          key={certificate.name}
          className="resume-print-entry break-inside-avoid"
        >
          <h3
            className={cn(
              "font-bold text-slate-950",
              compact ? "text-[10px] leading-[1.18]" : "text-[10.75px]",
            )}
          >
            {certificate.name}
          </h3>
          <p
            className={cn(
              "text-slate-600",
              compact
                ? "text-[9.1px] leading-[1.22]"
                : "text-[9.8px] leading-[1.3]",
            )}
          >
            {certificate.issuer}
            <PrintSeparator />
            <time dateTime={certificate.date}>
              {formatMonthYear(certificate.date)}
            </time>
          </p>
        </article>
      ))}
    </div>
  );
}

export function PrintWorkList({
  work,
  showSummaries,
  compact = false,
}: PrintWorkListProps) {
  return (
    <div className={cn("space-y-0", compact && "space-y-0")}>
      {work.map((job) => (
        <article
          key={job.name}
          className={cn(
            "resume-print-entry break-inside-avoid border-t border-slate-100 first:border-t-0 first:pt-0",
            compact ? "pt-1" : "pt-4",
          )}
        >
          <div className="min-w-0">
            <h3
              className={cn(
                "font-bold leading-snug text-slate-950",
                compact ? "text-[11px]" : "text-[12px]",
              )}
            >
              {job.position}
            </h3>
            <div className="mt-px text-[9.4px] leading-snug text-slate-500">
              <span className="font-semibold text-slate-700">
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
              {job.location ? (
                <>
                  <PrintSeparator />
                  {job.location}
                </>
              ) : null}
              <PrintSeparator />
              {renderDateRange(job.startDate, job.endDate)}
            </div>
          </div>

          {showSummaries && job.summary && (
            <p
              className={cn(
                "text-slate-700",
                compact
                  ? "mt-1 text-[9.9px] leading-[1.32]"
                  : "mt-1.5 text-[10.2px] leading-[1.38]",
              )}
            >
              {job.summary}
            </p>
          )}

          <ul
            className={cn(
              "list-disc pl-4 text-slate-800 marker:text-slate-400",
              compact
                ? "mt-1 space-y-0 text-[9.75px] leading-[1.25]"
                : "mt-2 space-y-0.5 text-[10.15px] leading-[1.36]",
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
      <div className={compact ? "space-y-1" : "space-y-1"}>
        {skills.map((skill) => (
          <p
            key={skill.name}
            className={cn(
              "text-slate-700",
              compact
                ? "text-[9.65px] leading-[1.33]"
                : "text-[10.15px] leading-[1.45]",
            )}
          >
            <span className="font-bold uppercase text-slate-900">
              {skill.name}:
            </span>{" "}
            {skill.keywords.join(", ")}
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
  const spaciousFullList = !summaryOnly && !compact && projects.length <= 6;
  const denseFullList = !summaryOnly && !compact && projects.length > 6;
  const includeStackText = showStacks;
  const spacingClass = summaryOnly
    ? compact
      ? "space-y-1.5"
      : "space-y-1.5"
    : compact
      ? "space-y-2"
      : spaciousFullList
        ? "space-y-5"
        : denseFullList
        ? "space-y-5"
        : "space-y-2";

  return (
    <div className={cn(spacingClass)}>
      {projects.map((project) => (
        <article
          key={project.name}
          className={cn(
            "resume-print-entry break-inside-avoid",
            !summaryOnly &&
              cn(
                "border-t border-slate-100 first:border-t-0 first:pt-0",
                spaciousFullList ? "pt-4" : denseFullList ? "pt-3" : "pt-1.5",
              ),
          )}
        >
          {summaryOnly ? (
            <p
              className={cn(
                "text-slate-700",
                compact
                  ? "text-[9.6px] leading-[1.32]"
                  : "text-[10.15px] leading-[1.35]",
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
              {includeStackText && project.stack?.length ? (
                <> Built with {project.stack.join(", ")}.</>
              ) : null}
            </p>
          ) : (
            <div className="min-w-0">
              <h3
                className={cn(
                  "flex flex-wrap items-baseline gap-x-1.5 font-bold text-slate-950",
                  compact ? "text-[11px]" : "text-[11.5px]",
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
                {project.githubUrl ? (
                  <>
                    <span className="font-normal text-slate-400">|</span>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9.25px] font-medium text-slate-500 hover:text-slate-900"
                    >
                      {formatProfileDisplayUrl(project.githubUrl)}
                    </a>
                  </>
                ) : null}
              </h3>
              {showDates && (
                <p className="mt-px text-[9.25px] leading-snug text-slate-500">
                  {renderDateRange(project.startDate, project.endDate)}
                </p>
              )}
              <p
                className={cn(
                  "mt-0.5 text-slate-700",
                  compact
                    ? "text-[9.9px] leading-[1.3]"
                    : "text-[10.15px] leading-[1.38]",
                )}
              >
                {project.description}
                {includeStackText && project.stack?.length ? (
                  <> Built with {project.stack.join(", ")}.</>
                ) : null}
              </p>
            </div>
          )}

          {showHighlights &&
          project.highlights.length > 0 &&
          (maxHighlights ?? project.highlights.length) > 0 ? (
            <ul
              className={cn(
                "list-disc pl-4 text-slate-800 marker:text-slate-400",
                summaryOnly
                  ? "mt-0.5 space-y-0.5 text-[9.3px] leading-[1.24]"
                  : compact
                  ? "space-y-0.5 text-[10px] leading-[1.35]"
                  : "mt-1.5 space-y-0.5 text-[10.15px] leading-[1.35]",
              )}
            >
              {project.highlights
                .slice(0, maxHighlights ?? project.highlights.length)
                .map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
            </ul>
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
    <div className={cn("space-y-2.5", compact && "space-y-2")}>
      {education.map((entry) => (
        <article
          key={entry.institution}
          className="resume-print-entry break-inside-avoid"
        >
          <h3
            className={cn(
              "font-bold text-slate-950",
              compact ? "text-[10.6px] leading-[1.2]" : "text-[11.5px]",
            )}
          >
            {entry.studyType}
          </h3>
          <p
            className={cn(
              "text-slate-700",
              compact
                ? "text-[9.6px] leading-[1.24]"
                : "text-[10.5px] leading-[1.35]",
            )}
          >
            {entry.institution}
            {entry.area ? `, ${entry.area}` : ""}
            {entry.score ? (
              <>
                <PrintSeparator />
                GPA {entry.score}
              </>
            ) : null}
          </p>
          <p
            className={cn(
              "text-slate-500",
              compact ? "text-[9.1px] leading-[1.2]" : "text-[9.5px] leading-snug",
            )}
          >
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
            {cert.issuer}
            <PrintSeparator />
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
            {publication.publisher}
            <PrintSeparator />
            <time dateTime={publication.releaseDate}>
              {formatMonthYear(publication.releaseDate)}
            </time>
          </p>
        </article>
      ))}
    </div>
  );
}
