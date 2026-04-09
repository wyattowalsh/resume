import { Project } from '@/lib/schema';
import { Section } from './Section';
import { FaGithub } from 'react-icons/fa';
import { LuExternalLink } from 'react-icons/lu';
import { formatMonthYear } from '@/lib/date';

type ProjectsProps = {
  projects: Project[];
};

export function Projects({ projects }: ProjectsProps) {
	return (
		<Section title="Projects" className="break-inside-avoid">
			<div className="flex flex-col gap-2">
				{projects.map((project) => (
					<div
						key={project.name}
						className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
					>
						<div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
							<div className="space-y-1">
								<h3 className="flex flex-wrap items-center gap-2 text-sm font-bold leading-5">
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
							<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:justify-end">
								<div>
									{formatMonthYear(project.startDate)} -{" "}
									{project.endDate
										? formatMonthYear(project.endDate)
										: "Present"}
								</div>
							</div>
						</div>
						<p className="mt-1 text-xs font-semibold italic leading-5 text-muted-foreground">
							{project.description}
						</p>
						{Array.isArray(project.highlights) && project.highlights.length > 0 && (
							<ul className="mt-1 list-outside list-disc pl-4 text-xs leading-5 text-muted-foreground">
								{project.highlights.map((highlight) => (
									<li key={highlight}>{highlight}</li>
								))}
							</ul>
						)}
						{Array.isArray(project.stack) && project.stack.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{project.stack.map((tech) => (
									<span
										key={tech}
										className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] leading-4"
									>
										{tech}
									</span>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</Section>
	);
}
