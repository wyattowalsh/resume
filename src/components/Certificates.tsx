import { Certificate } from '@/lib/schema';
import { Section } from './Section';
import { FaAward } from 'react-icons/fa';
import { LuExternalLink } from 'react-icons/lu';
import { formatMonthYear } from '@/lib/date';

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
						className="flex flex-col gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-md sm:flex-row sm:items-start"
					>
						<div className="shrink-0 text-primary">
							<FaAward className="text-primary" size={14} />
						</div>
						<div className="min-w-0 flex-1 space-y-0.5">
							<h4 className="text-xs font-semibold leading-5">{cert.name}</h4>
							<p className="text-xs leading-5 text-muted-foreground">
								Issued by {cert.issuer} in {formatMonthYear(cert.date)}
							</p>
						</div>
						{cert.url && (
							<a
								href={cert.url}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`View certificate: ${cert.name}`}
								className="shrink-0 self-start transition-colors hover:text-primary"
							>
								<LuExternalLink size={12} strokeWidth={2} />
							</a>
						)}
					</div>
				))}
			</div>
		</Section>
	);
}
