import { formatMonthYear } from "@/lib/date";
import { formatThemeLabel } from "@/lib/format-theme-label";
import { Project } from "@/lib/schema";
import { FaFolderOpen, FaGithub } from "react-icons/fa";
import { LuCalendarDays, LuExternalLink } from "react-icons/lu";
import { Section } from "./Section";

type ProjectsProps = {
  projects: Project[];
};

function buildProjectSummary(project: Project) {
  if (!Array.isArray(project.stack) || project.stack.length === 0) {
    return project.description;
  }

  const description = project.description.endsWith(".")
    ? project.description
    : `${project.description}.`;

  return `${description} Stack: ${project.stack.join(", ")}.`;
}

type ProjectHeadingProps = {
  project: Project;
  className?: string;
};

type ProjectActionsProps = {
  project: Project;
};

function ProjectActions({ project }: ProjectActionsProps) {
  const actionClass =
    "interactive-chip inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-[family:var(--font-site-label)] font-semibold text-foreground/70 shadow-sm transition-colors duration-200 hover:border-primary/20 hover:text-foreground";
  const actions = [
    ...(project.links?.map((link) => ({ ...link, kind: "external" as const })) ?? []),
    ...(project.url ? [{ label: "Live site", url: project.url, kind: "external" as const }] : []),
    { label: "GitHub", url: project.githubUrl, kind: "github" as const },
  ].filter(
    (action, index, actions) =>
      actions.findIndex((candidate) => candidate.url === action.url) === index,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <a
          key={`${action.label}-${action.url}`}
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${action.label} for ${project.name}`}
          className={actionClass}
        >
          {action.label}
          {action.kind === "github" ? (
            <FaGithub size={12} />
          ) : (
            <LuExternalLink size={12} strokeWidth={2} />
          )}
        </a>
      ))}
    </div>
  );
}

function ProjectHeading({ project, className }: ProjectHeadingProps) {
  return <h3 className={className}>{project.name}</h3>;
}

function ProjectThemeBadges({ project }: { project: Project }) {
  const themes = project.selectionHints?.themes?.slice(0, 2) ?? [];

  if (themes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {themes.map((theme) => (
        <span
          key={theme}
          className="rounded-full border border-border bg-background px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] text-muted-foreground shadow-sm"
        >
          {formatThemeLabel(theme)}
        </span>
      ))}
    </div>
  );
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <Section title="Projects" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {projects.map((project, index) => (
          <article
            key={project.name}
            className="group/project card-hover interactive-surface flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:p-5"
          >
            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
              <FaFolderOpen className="text-primary" size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <ProjectHeading
                    project={project}
                    className="font-[family:var(--font-site-heading)] text-base font-semibold leading-6 text-foreground"
                  />
                  {index > 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <ProjectThemeBadges project={project} />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] text-muted-foreground shadow-sm tabular-nums">
                    <LuCalendarDays size={12} aria-hidden="true" />
                    <time dateTime={project.startDate}>
                      {formatMonthYear(project.startDate)}
                    </time>{" "}
                    -{" "}
                    {project.endDate ? (
                      <time dateTime={project.endDate}>
                        {formatMonthYear(project.endDate)}
                      </time>
                    ) : (
                      "Present"
                    )}
                  </div>
                  <ProjectActions project={project} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-pretty text-sm font-medium italic leading-6 text-foreground/72">
                  {buildProjectSummary(project)}
                </p>
                {Array.isArray(project.highlights) &&
                  project.highlights.length > 0 && (
                  <ul className="mt-2 list-outside list-disc pl-4 text-sm leading-6 text-muted-foreground marker:text-primary/45">
                    {project.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="transition-colors duration-200 group-hover/project:text-foreground/75"
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
