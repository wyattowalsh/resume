import { Publication } from '@/lib/schema';
import { Section } from './Section';
import { FaBook } from 'react-icons/fa';
import { LuExternalLink } from 'react-icons/lu';

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
						className="flex items-start rounded-lg border bg-card p-2.5 transition-shadow hover:shadow-md"
					>
						<div className="shrink-0">
							<FaBook className="text-primary" size={14} />
						</div>
						<div className="ml-3 min-w-0 flex-1">
							<h4 className="font-semibold text-xs">{pub.name}</h4>
							<p className="text-xs text-muted-foreground">
								Published in <span className="font-semibold">{pub.publisher}</span> on {pub.releaseDate}
							</p>
						</div>
						<a
							href={pub.url}
							target="_blank"
							rel="noopener noreferrer"
							className="ml-3 shrink-0 transition-colors hover:text-primary"
						>
							<LuExternalLink size={12} strokeWidth={2} />
						</a>
					</div>
				))}
			</div>
		</Section>
	);
}
