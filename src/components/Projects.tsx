import { Project } from "@/lib/schema";
import { Section } from "./Section";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";
import { formatMonthYear } from "@/lib/date";
import { cn } from "@/lib/utils";

type ProjectsProps = {
  projects: Project[];
};

export function Projects({ projects }: ProjectsProps) {
  return (
    <Section title="Projects" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {projects.map((project, index) => {
          const isFeatured = index < 2;

          return (
            <article
              key={project.name}
              className={cn(
                "rounded-xl border border-border/70 bg-card/85 p-4 shadow-sm",
                isFeatured && "border-primary/25 bg-primary/5 shadow-md",
              )}
            >
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                {isFeatured && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Featured proof
                  </p>
                )}
                <h3
                  className={cn(
                    "flex flex-wrap items-center gap-2 text-base font-semibold leading-6",
                    isFeatured && "text-[1.05rem]",
                  )}
                >
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
            <p
              className={cn(
                "mt-2 text-sm font-medium italic leading-6",
                isFeatured ? "text-foreground/80" : "text-muted-foreground",
              )}
            >
              {project.description}
            </p>
            {Array.isArray(project.highlights) &&
              project.highlights.length > 0 && (
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
          );
        })}
      </div>
    </Section>
  );
}
