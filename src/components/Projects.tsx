import { Project } from "@/lib/schema";
import { Section } from "./Section";
import { formatMonthYear } from "@/lib/date";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";

type ProjectsProps = {
  projects: Project[];
};

function formatThemeLabel(theme: string) {
  return theme
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClass}
        >
          Live
          <LuExternalLink size={12} strokeWidth={2} />
        </a>
      )}
      <a
        href={project.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`GitHub repository for ${project.name}`}
        className={actionClass}
      >
        GitHub
        <FaGithub size={12} />
      </a>
    </div>
  );
}

function ProjectHeading({ project, className }: ProjectHeadingProps) {
  return (
    <h3 className={className}>
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1 transition-colors duration-200 hover:text-primary hover:underline"
        >
          {project.name}
          <LuExternalLink
            size={12}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
          />
        </a>
      ) : (
        <span>{project.name}</span>
      )}
    </h3>
  );
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
    <Section
      title="Projects"
      description={`${projects.length} selected AI, data, and product builds with shipped scope, proof points, and stack context.`}
      className="break-inside-avoid"
    >
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <article
            key={project.name}
            className="group/project card-hover interactive-surface rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <ProjectHeading
                  project={project}
                  className="font-[family:var(--font-site-heading)] text-base font-semibold leading-6 text-foreground"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <ProjectThemeBadges project={project} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <div className="rounded-full border border-border bg-background px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] text-muted-foreground shadow-sm tabular-nums">
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
              {Array.isArray(project.highlights) && project.highlights.length > 0 && (
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
          </article>
        ))}
      </div>
    </Section>
  );
}
