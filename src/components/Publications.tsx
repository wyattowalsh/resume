import { Publication } from '@/lib/schema';
import { Section } from './Section';
import { FaBook } from 'react-icons/fa';
import { LuExternalLink } from 'react-icons/lu';
import { formatMonthYear } from '@/lib/date';

type PublicationsProps = {
  publications: Publication[];
};

export function Publications({ publications }: PublicationsProps) {
	return (
		<Section title="Publications" className="break-inside-avoid">
			<div className="flex flex-col gap-2">
				{publications.map((pub) => (
					<div
						key={pub.name}
						className="flex flex-col gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-md sm:flex-row sm:items-start"
					>
						<div className="shrink-0 text-primary">
							<FaBook className="text-primary" size={14} />
						</div>
						<div className="min-w-0 flex-1 space-y-0.5">
							<h4 className="text-xs font-semibold leading-5">{pub.name}</h4>
							<p className="text-xs leading-5 text-muted-foreground">
								Published in <span className="font-semibold">{pub.publisher}</span> in{" "}
								{formatMonthYear(pub.releaseDate)}
							</p>
						</div>
						<a
							href={pub.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`View publication: ${pub.name}`}
							className="shrink-0 self-start transition-colors hover:text-primary"
						>
							<LuExternalLink size={12} strokeWidth={2} />
						</a>
					</div>
				))}
			</div>
		</Section>
	);
}
