import { Project } from "@/lib/schema";
import { Section } from "./Section";
import { formatMonthYear } from "@/lib/date";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";

type ProjectsProps = {
  projects: Project[];
};

const FEATURED_PROJECT_COUNT = 3;

function renderProjectDateRange(startDate: string, endDate: string | null) {
  return `${formatMonthYear(startDate)} - ${
    endDate ? formatMonthYear(endDate) : "Present"
  }`;
}

function formatThemeLabel(theme: string) {
  return theme
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function buildProjectMeta(project: Project) {
  const metadata = [renderProjectDateRange(project.startDate, project.endDate)];

  if (Array.isArray(project.stack) && project.stack.length > 0) {
    metadata.push(project.stack.slice(0, 4).join(" / "));
  }

  return metadata.join(" • ");
}

function buildDisclosureLabel(project: Project) {
  const parts: string[] = [];

  if (project.highlights.length > 0) {
    parts.push(
      `${project.highlights.length} proof point${
        project.highlights.length === 1 ? "" : "s"
      }`,
    );
  }

  if (Array.isArray(project.stack) && project.stack.length > 0) {
    parts.push(
      `${project.stack.length} stack item${project.stack.length === 1 ? "" : "s"}`,
    );
  }

  return parts.length > 0 ? `View ${parts.join(" + ")}` : "View details";
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
          className="rounded-full border border-primary/15 bg-primary/[0.08] px-2 py-1 font-[family:var(--font-site-label)] text-[10px] font-semibold text-primary/85"
        >
          {formatThemeLabel(theme)}
        </span>
      ))}
    </div>
  );
}

function ProjectStackPills({ stack }: { stack: string[] | undefined }) {
  if (!Array.isArray(stack) || stack.length === 0) {
    return null;
  }

  return (
    <div className="relative z-10 mt-2 flex flex-wrap items-center gap-1.5 text-xs leading-5 text-muted-foreground">
      <span className="mr-1 font-[family:var(--font-site-label)] font-semibold text-foreground/60">
        Stack
      </span>
      {stack.map((item) => (
        <span
          key={item}
          className="interactive-pill rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] leading-4 text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function Projects({ projects }: ProjectsProps) {
  const featuredProjects = projects.slice(0, FEATURED_PROJECT_COUNT);
  const additionalProjects = projects.slice(FEATURED_PROJECT_COUNT);

  return (
    <Section
      title="Projects"
      description={
        additionalProjects.length > 0
          ? `${projects.length} selected AI, data, and product builds. ${featuredProjects.length} featured projects stay fully expanded; ${additionalProjects.length} more remain compact while still exposing dates, links, themes, and on-demand implementation detail.`
          : "Selected AI, data, and product builds with shipped scope, proof points, and stack context."
      }
      className="break-inside-avoid"
    >
      <div className="space-y-5">
        <div className="space-y-3">
          {additionalProjects.length > 0 && (
            <p className="px-1 font-[family:var(--font-site-label)] text-[11px] font-semibold text-foreground/50">
              Featured Projects
            </p>
          )}
          {featuredProjects.map((project) => (
            <article
              key={project.name}
              className="group/project interactive-surface card-hover rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <ProjectHeading
                      project={project}
                      className="flex flex-wrap items-center gap-2 font-[family:var(--font-site-heading)] text-[1.02rem] font-semibold leading-6"
                    />
                    <p className="text-xs leading-5 text-muted-foreground tabular-nums">
                      {buildProjectMeta(project)}
                    </p>
                    <ProjectThemeBadges project={project} />
                  </div>
                  <ProjectActions project={project} />
                </div>
                <p className="text-sm leading-6 text-foreground/80 transition-colors duration-200 group-hover/project:text-foreground/90">
                  {project.description}
                </p>
                {Array.isArray(project.highlights) && project.highlights.length > 0 && (
                  <ul className="list-outside list-disc pl-4 text-sm leading-6 text-muted-foreground marker:text-primary/45">
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
                <ProjectStackPills stack={project.stack} />
              </div>
            </article>
          ))}
        </div>

        {additionalProjects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <p className="font-[family:var(--font-site-label)] text-[11px] font-semibold text-foreground/50">
                More Selected Builds
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>
            {additionalProjects.map((project) => (
              <article
                key={project.name}
                className="group/project rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <ProjectHeading
                      project={project}
                      className="flex flex-wrap items-center gap-2 font-[family:var(--font-site-heading)] text-base font-semibold leading-6"
                    />
                    <p className="text-xs leading-5 text-muted-foreground tabular-nums">
                      {buildProjectMeta(project)}
                    </p>
                    <ProjectThemeBadges project={project} />
                  </div>
                  <ProjectActions project={project} />
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/80">
                  {project.description}
                </p>
                {(project.highlights.length > 0 ||
                  (Array.isArray(project.stack) && project.stack.length > 0)) && (
                  <details className="mt-3 rounded-2xl border border-border bg-card px-3 py-2">
                    <summary className="cursor-pointer list-none font-[family:var(--font-site-label)] text-[11px] font-semibold text-foreground/60 transition-colors hover:text-foreground/80">
                      {buildDisclosureLabel(project)}
                    </summary>
                    <div className="mt-3">
                      {Array.isArray(project.highlights) &&
                        project.highlights.length > 0 && (
                          <ul className="list-outside list-disc pl-4 text-sm leading-6 text-muted-foreground marker:text-primary/45">
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
                      <ProjectStackPills stack={project.stack} />
                    </div>
                  </details>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
