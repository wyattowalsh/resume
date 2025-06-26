import { Certificate } from '@/lib/schema';
import { Section } from './Section';
import { FaAward, FaExternalLinkAlt } from 'react-icons/fa';

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
						className="flex items-start rounded-lg border bg-card p-2.5 transition-shadow hover:shadow-md"
					>
						<div className="mt-0.5">
							<FaAward className="text-primary" size={14} />
						</div>
						<div className="ml-3">
							<h4 className="font-semibold text-xs">
								{cert.url ? (
									<a
										href={cert.url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 hover:underline"
									>
										{cert.name}
										<FaExternalLinkAlt size={10} />
									</a>
								) : (
									cert.name
								)}
							</h4>
							<p className="text-xs text-muted-foreground">
								Issued by {cert.issuer} on {cert.date}
							</p>
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}
