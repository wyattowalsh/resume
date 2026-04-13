import { Project } from "@/lib/schema";
import { Section } from "./Section";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";
import { formatMonthYear } from "@/lib/date";

type ProjectsProps = {
  projects: Project[];
  featuredCount?: number;
};

type ProjectHeadingProps = {
  project: Project;
  className?: string;
};

function ProjectHeading({ project, className }: ProjectHeadingProps) {
  return (
    <h3 className={className}>
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-primary hover:underline"
        >
          {project.name}
          <LuExternalLink size={12} strokeWidth={2} />
        </a>
      ) : (
        <span>{project.name}</span>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub repository for ${project.name}`}
          className="inline-flex items-center gap-1 hover:text-primary"
        >
          <FaGithub size={16} />
        </a>
      )}
    </h3>
  );
}

export function Projects({
  projects,
  featuredCount = 2,
}: ProjectsProps) {
  const featuredProjects = projects.slice(0, featuredCount);
  const moreProjects = projects.slice(featuredCount);

  return (
    <Section title="Projects" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {featuredProjects.map((project) => (
          <article
            key={project.name}
            className="rounded-xl border border-primary/25 bg-primary/5 p-4 shadow-md"
          >
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Featured proof
                </p>
                <ProjectHeading
                  project={project}
                  className="flex flex-wrap items-center gap-2 text-[1.05rem] font-semibold leading-6"
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground sm:justify-end">
                <div>
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
              </div>
            </div>
            <p className="mt-2 text-sm font-medium italic leading-6 text-foreground/80">
              {project.description}
            </p>
            {Array.isArray(project.highlights) && project.highlights.length > 0 && (
              <ul className="mt-2.5 list-outside list-disc pl-4 text-sm leading-6 text-muted-foreground">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
            {Array.isArray(project.stack) && project.stack.length > 0 && (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                <span className="font-semibold text-foreground/80">Stack:</span>{" "}
                {project.stack.join(" · ")}
              </p>
            )}
          </article>
        ))}

        {moreProjects.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                More projects
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Additional product, infrastructure, and open-source work.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {moreProjects.map((project) => (
                <article
                  key={project.name}
                  className="rounded-xl border border-border/60 bg-card/70 p-3.5 shadow-sm"
                >
                  <ProjectHeading
                    project={project}
                    className="flex flex-wrap items-center gap-2 text-sm font-semibold leading-5"
                  />
                  {/* Compact cards stay summary-only so the featured tier carries the deeper proof points. */}
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {project.description}
                  </p>
                  {Array.isArray(project.stack) && project.stack.length > 0 && (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Stack:</span>{" "}
                      {project.stack.join(" · ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
