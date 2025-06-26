import { Publication } from '@/lib/schema';
import { Section } from './Section';
import { FaBook, FaExternalLinkAlt } from 'react-icons/fa';

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
						<div className="mt-0.5">
							<FaBook className="text-primary" size={14} />
						</div>
						<div className="ml-3">
							<h4 className="font-semibold text-xs">
								<a
									href={pub.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 hover:underline"
								>
									{pub.name}
									<FaExternalLinkAlt size={10} />
								</a>
							</h4>
							<p className="text-xs text-muted-foreground">
								Published in <span className="font-semibold">{pub.publisher}</span> on {pub.releaseDate}
							</p>
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}
