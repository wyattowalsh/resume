import { Project } from "@/lib/schema";
import { Section } from "./Section";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";
import { formatMonthYear } from "@/lib/date";

type ProjectsProps = {
  projects: Project[];
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

export function Projects({ projects }: ProjectsProps) {
  return (
    <Section title="Projects" className="break-inside-avoid">
      <div className="space-y-3">
        {projects.map((project) => (
          <article
            key={project.name}
            className="group card-hover rounded-[1.35rem] border border-border/60 bg-card/78 p-4 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.36)] ring-1 ring-white/30"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <ProjectHeading
                  project={project}
                  className="flex flex-wrap items-center gap-2 text-[1.02rem] font-semibold leading-6"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground sm:justify-end">
                <div className="rounded-full border border-border/70 bg-background/85 px-2.5 py-1 shadow-sm transition-colors duration-200 group-hover:border-primary/20 group-hover:text-foreground/75">
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
      </div>
    </Section>
  );
}
