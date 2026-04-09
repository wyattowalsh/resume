import { Work } from '@/lib/schema';
import { Section } from './Section';
import { formatMonthYear } from '@/lib/date';
import { LuExternalLink } from 'react-icons/lu';

type WorkExperienceProps = {
  work: Work[];
};

export function WorkExperience({ work }: WorkExperienceProps) {
	return (
		<Section title="Work Experience" className="break-inside-avoid">
			<div className="flex flex-col gap-2">
				{work.map((job) => (
					<article
						key={job.name}
						className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
					>
						<div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
							<div className="space-y-0.5">
								<h3 className="text-sm font-bold leading-5">{job.position}</h3>
								<h4 className="text-xs font-semibold text-foreground/80">
									{job.url ? (
										<a
											href={job.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 hover:text-primary hover:underline"
										>
											{job.name}
											<LuExternalLink size={12} strokeWidth={2} />
										</a>
									) : (
										job.name
									)}
								</h4>
							</div>
							<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:justify-end">
								<div>
									<time dateTime={job.startDate}>{formatMonthYear(job.startDate)}</time> -{" "}
									{job.endDate ? (
										<time dateTime={job.endDate}>{formatMonthYear(job.endDate)}</time>
									) : (
										"Present"
									)}
								</div>
								{job.location && (
									<>
										<span className="hidden sm:inline">·</span>
										<span>{job.location}</span>
									</>
								)}
							</div>
						</div>
						<div className="mt-2">
							{job.summary && (
								<p className="text-xs font-medium italic leading-5 text-muted-foreground">
									{job.summary}
								</p>
							)}
							{Array.isArray(job.highlights) && job.highlights.length > 0 && (
								<ul className="mt-1 list-outside list-disc pl-4 text-xs leading-5 text-muted-foreground">
									{job.highlights.map((highlight) => (
										<li key={highlight}>{highlight}</li>
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
