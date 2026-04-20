import { Project } from "@/lib/schema";
import { Section } from "./Section";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";

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
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub repository for ${project.name}`}
          className="interactive-chip inline-flex items-center gap-1 rounded-full border border-transparent p-1 hover:text-primary"
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
            className="group/project interactive-surface card-hover rounded-[1.35rem] border border-border/60 bg-card/78 p-4 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.36)] ring-1 ring-white/30"
          >
            <div className="relative z-10">
              <div>
                <ProjectHeading
                  project={project}
                  className="flex flex-wrap items-center gap-2 font-[family:var(--font-site-heading)] text-[1.02rem] font-semibold leading-6 tracking-[-0.02em]"
                />
              </div>
            </div>
            <p className="relative z-10 mt-2 text-sm leading-6 text-foreground/80 transition-colors duration-200 group-hover/project:text-foreground/90">
              {project.description}
            </p>
            {Array.isArray(project.highlights) && project.highlights.length > 0 && (
              <ul className="relative z-10 mt-2.5 list-outside list-disc pl-4 text-sm leading-6 text-muted-foreground marker:text-primary/45">
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
            {Array.isArray(project.stack) && project.stack.length > 0 && (
              <div className="relative z-10 mt-2 flex flex-wrap items-center gap-1.5 text-xs leading-5 text-muted-foreground">
                <span className="mr-1 font-[family:var(--font-site-label)] font-semibold uppercase tracking-[0.08em] text-foreground/60">
                  Stack
                </span>
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="interactive-pill rounded-full border border-border/60 bg-background/80 px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] leading-4 text-muted-foreground group-hover/project:border-primary/15 group-hover/project:bg-primary/[0.06] group-hover/project:text-foreground/75"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
