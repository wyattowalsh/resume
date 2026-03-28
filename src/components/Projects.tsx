import { Project } from '@/lib/schema';
import { Section } from './Section';
import { FaGithub } from 'react-icons/fa';
import { LuArrowUpRight } from 'react-icons/lu';
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
						className="rounded-lg border bg-card p-2.5 transition-shadow hover:shadow-md"
					>
						<div className="flex items-baseline justify-between">
							<h3 className="flex items-baseline gap-2 text-sm font-bold">
								{project.url ? (
									<a
										href={project.url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 hover:text-primary hover:underline"
									>
										{project.name}
										<LuArrowUpRight size={14} strokeWidth={2} />
									</a>
								) : (
									<span>{project.name}</span>
								)}
								{project.githubUrl && (
									<a
										href={project.githubUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 hover:text-primary"
									>
										<FaGithub size={16} />
									</a>
								)}
							</h3>
							<div className="flex items-baseline gap-2">
								<div className="text-xs text-muted-foreground">
									{formatMonthYear(project.startDate)} -{" "}
									{project.endDate
										? formatMonthYear(project.endDate)
										: "Present"}
								</div>
							</div>
						</div>
						<p className="font-semibold text-muted-foreground italic">
							{project.description}
						</p>
						{Array.isArray(project.highlights) && (
							<ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
								{project.highlights.map((highlight) => (
									<li key={highlight}>{highlight}</li>
								))}
							</ul>
						)}
						<div className="mt-2 flex flex-wrap gap-1">
							{Array.isArray(project.stack) &&
								project.stack.map((tech) => (
									<span
										key={tech}
										className="px-1.5 py-0.5 text-xs bg-secondary rounded-md"
									>
										{tech}
									</span>
								))}
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}
