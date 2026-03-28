import { Certificate } from '@/lib/schema';
import { Section } from './Section';
import { FaAward } from 'react-icons/fa';
import { LuArrowUpRight } from 'react-icons/lu';

type CertificatesProps = {
  certificates: Certificate[];
};

export function Certificates({ certificates }: CertificatesProps) {
  return (
		<Section title="Certificates" className="break-inside-avoid">
			<div className="flex flex-col gap-2">
				{certificates.map((cert) => (
					<div
						key={cert.name}
						className="flex items-center rounded-lg border bg-card p-2.5 transition-shadow hover:shadow-md"
					>
						<div className="shrink-0">
							<FaAward className="text-primary" size={14} />
						</div>
						<div className="ml-3 min-w-0 flex-1">
							<h4 className="font-semibold text-xs truncate">{cert.name}</h4>
							<p className="text-xs text-muted-foreground">
								Issued by {cert.issuer} on {cert.date}
							</p>
						</div>
						{cert.url && (
							<a
								href={cert.url}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-3 shrink-0 text-muted-foreground/50 transition-colors hover:text-primary"
							>
								<LuArrowUpRight size={14} strokeWidth={2} />
							</a>
						)}
					</div>
				))}
			</div>
		</Section>
	);
}
