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
            className="card-hover rounded-[1.45rem] border border-primary/20 bg-primary/[0.06] p-4 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.4)] ring-1 ring-primary/10"
          >
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <ProjectHeading
                  project={project}
                  className="flex flex-wrap items-center gap-2 text-[1.05rem] font-semibold leading-6"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground sm:justify-end">
                <div className="rounded-full border border-primary/15 bg-background/80 px-2.5 py-1 shadow-sm">
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
            <p className="mt-2 text-sm leading-6 text-foreground/80">
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
          <div className="grid gap-3 pt-1 sm:grid-cols-2 xl:grid-cols-3">
            {moreProjects.map((project) => (
              <article
                key={project.name}
                className="card-hover rounded-[1.25rem] border border-border/60 bg-card/78 p-3.5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] ring-1 ring-white/30"
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
        )}
      </div>
    </Section>
  );
}
