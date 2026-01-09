import { Education as EducationType } from '@/lib/schema';
import { Section } from './Section';
import { formatMonthYear } from '@/lib/date';
import { FaExternalLinkAlt } from 'react-icons/fa';

type EducationProps = {
  education: EducationType[];
};

export function Education({ education }: EducationProps) {
  return (
		<Section title="Education" className="break-inside-avoid">
			<div className="flex flex-col gap-2">
				{education.map((edu) => (
					<div
						key={edu.institution}
						className="rounded-lg border bg-card p-2.5 transition-shadow hover:shadow-md"
					>
						<div className="flex items-baseline justify-between">
							<h3 className="text-sm font-bold">{edu.studyType}</h3>
							<div className="flex items-baseline gap-2">
								<div className="text-xs text-muted-foreground">
									{formatMonthYear(edu.startDate)} -{" "}
									{edu.endDate ? formatMonthYear(edu.endDate) : "Present"}
								</div>
								<span className="text-xs text-muted-foreground">·</span>
								<h4 className="text-xs font-semibold">
									{edu.url ? (
										<a
											href={edu.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 hover:underline"
										>
											{edu.institution}
											<FaExternalLinkAlt size={10} />
										</a>
									) : (
										edu.institution
									)}
								</h4>
							</div>
						</div>
						{(edu.area || edu.score) && (
							<div className="space-y-0.5">
								{edu.area && (
									<p className="text-xs text-muted-foreground mt-0 pt-0 italic">
										in {edu.area}
									</p>
								)}
								{edu.score && (
									<p className="text-xs text-muted-foreground">
										GPA: {edu.score}
									</p>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</Section>
	);
}
