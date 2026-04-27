import { Certificate } from "@/lib/schema";
import { Section } from "./Section";
import { FaAward } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";
import { formatMonthYear } from "@/lib/date";

type CertificatesProps = {
  certificates: Certificate[];
};

export function Certificates({ certificates }: CertificatesProps) {
  return (
    <Section title="Certificates" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {certificates.map((cert) => (
          <article
            key={cert.name}
            className="card-hover interactive-surface flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:p-5"
          >
            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
              <FaAward className="text-primary" size={14} />
            </div>
            <div className="relative z-10 min-w-0 flex-1 space-y-0.5">
              <h3 className="font-[family:var(--font-site-heading)] text-base font-semibold leading-6 text-foreground">
                {cert.name}
              </h3>
              <p className="text-pretty text-sm leading-6 text-muted-foreground tabular-nums">
                Issued by {cert.issuer} in{" "}
                <time dateTime={cert.date}>{formatMonthYear(cert.date)}</time>
              </p>
            </div>
            {cert.url && (
              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View certificate: ${cert.name}`}
                className="relative z-10 shrink-0 self-start rounded-full border border-border bg-background p-2 text-foreground/65 shadow-sm transition-colors hover:border-primary/20 hover:text-primary"
              >
                <LuExternalLink size={12} strokeWidth={2} />
              </a>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
