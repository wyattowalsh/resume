import { Publication } from "@/lib/schema";
import { Section } from "./Section";
import { FaBook } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";
import { formatMonthYear } from "@/lib/date";

type PublicationsProps = {
  publications: Publication[];
};

export function Publications({ publications }: PublicationsProps) {
  return (
    <Section title="Publications" className="break-inside-avoid">
      <div className="flex flex-col gap-3">
        {publications.map((pub) => (
          <article
            key={pub.name}
            className="card-hover interactive-surface flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:p-5"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
              <FaBook className="text-primary" size={14} />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <h3 className="text-sm font-semibold leading-6">{pub.name}</h3>
              <p className="text-pretty text-sm leading-6 text-muted-foreground tabular-nums">
                Published in{" "}
                <span className="font-semibold">{pub.publisher}</span> in{" "}
                <time dateTime={pub.releaseDate}>
                  {formatMonthYear(pub.releaseDate)}
                </time>
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
          </article>
        ))}
      </div>
    </Section>
  );
}
