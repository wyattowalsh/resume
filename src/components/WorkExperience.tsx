import { Work } from '@/lib/schema';
import { Section } from './Section';
import { format } from 'date-fns';
import { FaExternalLinkAlt } from 'react-icons/fa';

type WorkExperienceProps = {
  work: Work[];
};

export function WorkExperience({ work }: WorkExperienceProps) {
  return (
		<Section title="Work Experience" className="break-inside-avoid">
			<div className="flex flex-col gap-2">
				{work.map((job) => (
					<div
						key={job.name}
						className="rounded-lg border bg-card p-2.5 transition-shadow hover:shadow-md"
					>
						<div className="flex items-baseline justify-between">
							<h3 className="font-bold text-sm">{job.position}</h3>
							<div className="flex items-baseline gap-2">
								<div className="text-xs text-muted-foreground">
									{format(new Date(job.startDate), "MMM yyyy")} -{" "}
									{job.endDate
										? format(new Date(job.endDate), "MMM yyyy")
										: "Present"}
								</div>
								<span className="text-xs text-muted-foreground">·</span>
								<h4 className="text-xs font-semibold">
									{job.url ? (
										<a
											href={job.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 hover:underline"
										>
											{job.name}
											<FaExternalLinkAlt size={10} />
										</a>
									) : (
										job.name
									)}
								</h4>
							</div>
						</div>
						<div className="">
							{job.summary && (
								<p className="font-semibold text-muted-foreground">
									{job.summary}
								</p>
							)}
							{Array.isArray(job.highlights) && job.highlights.length > 0 && (
								<ul className="mt-0.5 list-disc list-inside text-xs text-muted-foreground">
									{job.highlights.map((highlight) => (
										<li key={highlight}>{highlight}</li>
									))}
								</ul>
							)}
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}
