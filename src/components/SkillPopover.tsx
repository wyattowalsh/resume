import type { SkillDetail } from "@/lib/skill-details";
import { useId, useState, type ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

type SkillPopoverProps = {
  detail: SkillDetail;
  skillName: string;
  children: ReactNode;
};

export function SkillPopover({
  detail,
  skillName,
  children,
}: SkillPopoverProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="interactive-pill skill-pill inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-left font-[family:var(--font-site-label)] text-[11px] leading-4 text-secondary-foreground transition-colors duration-200 hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-0 sm:px-2.5 sm:py-1"
          aria-expanded={open}
          aria-label={`View details for ${skillName}`}
        >
          <span>{children}</span>
          <SkillIcon
            category={detail.category}
            iconPath={detail.icon?.path}
            skillName={skillName}
            size="trigger"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="max-h-[min(76dvh,34rem)] w-[min(94vw,25rem)] overflow-y-auto rounded-[1.75rem] border-primary/15 bg-card/98 p-0 shadow-2xl shadow-primary/10 backdrop-blur"
      >
        <div className="space-y-3.5 p-3.5 sm:p-4">
          <div className="flex items-start gap-3 border-b border-border/70 pb-3.5">
            <SkillIcon
              category={detail.category}
              iconPath={detail.icon?.path}
              skillName={skillName}
              size="card"
            />
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="font-[family:var(--font-site-label)] text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                {detail.category}
              </p>
              <h4 id={titleId} className="font-[family:var(--font-site-heading)] text-base font-semibold text-foreground">
                {skillName}
              </h4>
            </div>
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground/60 transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Close ${skillName} details`}
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <div id={descriptionId} className="grid gap-3">
            <ContextSection title="Professional use">
              <p>{detail.summary}</p>
            </ContextSection>
            <ContextSection title="Resume context">
              <p>{detail.resumeContext}</p>
            </ContextSection>
          </div>
          <ContextSection title="Evidence">
            <div className="flex flex-wrap gap-1.5">
              {detail.evidence.map((evidence) => (
                <span
                  key={`${evidence.kind}:${evidence.label}`}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-[11px] leading-4 text-foreground/74"
                >
                  <span className="font-[family:var(--font-site-label)] text-[9px] font-semibold uppercase tracking-[0.14em] text-primary/75">
                    {getEvidenceKindLabel(evidence.kind)}
                  </span>
                  <span>{evidence.label}</span>
                </span>
              ))}
            </div>
          </ContextSection>
          {detail.links.length ? (
            <ContextSection title="References">
              <div className="flex flex-wrap gap-2">
                {detail.links.map((link) => (
                  <SkillLink key={link.href} href={link.href}>
                    {link.label || getSkillLinkLabel(link.href, "Reference")}
                  </SkillLink>
                ))}
              </div>
            </ContextSection>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ContextSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-border/75 bg-background/70 p-3 text-xs leading-5 text-foreground/72 shadow-sm shadow-background/40">
      <h5 className="mb-1.5 font-[family:var(--font-site-label)] text-[9px] font-semibold uppercase tracking-[0.18em] text-primary/80">
        {title}
      </h5>
      {children}
    </section>
  );
}

function getEvidenceKindLabel(kind: SkillDetail["evidence"][number]["kind"]) {
  const labels: Record<SkillDetail["evidence"][number]["kind"], string> = {
    credential: "Credential",
    "first-party": "First-party",
    project: "Project",
    publication: "Publication",
    work: "Work",
  };

  return labels[kind];
}

function getSkillLinkLabel(url: string, fallback: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");

  if (hostname.includes("wikipedia.org")) return "Overview";
  if (hostname.includes("arxiv.org")) return "Research paper";
  if (hostname.includes("github.com")) return "Source";
  if (hostname.includes("docs") || hostname.includes("readthedocs")) return "Docs";
  if (url.includes("/docs") || url.includes("/documentation")) return "Docs";

  return fallback;
}

function SkillLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1.5 font-[family:var(--font-site-label)] text-[11px] font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
      <ExternalLinkIcon />
    </a>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3"
      fill="none"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m3 3 6 6M9 3 3 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-2.5"
      fill="none"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 2H2.75A1.75 1.75 0 0 0 1 3.75v5.5C1 10.216 1.784 11 2.75 11h5.5A1.75 1.75 0 0 0 10 9.25V8M6.5 1H11v4.5M5.5 6.5 10.75 1.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkillIcon({
  category,
  iconPath,
  skillName,
  size,
}: {
  category: string;
  iconPath: string | undefined;
  skillName: string;
  size: "trigger" | "card";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const isCard = size === "card";
  const fallbackLabel = skillName.match(/[A-Za-z0-9]/)?.[0]?.toUpperCase() ?? category[0]?.toUpperCase() ?? "?";
  const wrapperClassName = isCard
    ? "grid size-11 shrink-0 place-items-center rounded-2xl border border-primary/15 bg-primary/8 text-primary shadow-sm"
    : "grid size-4 shrink-0 place-items-center rounded-full text-primary/70";

  if (iconPath && !imageFailed) {
    return (
      <span className={wrapperClassName} aria-hidden="true">
        <img
          src={iconPath}
          alt=""
          loading="lazy"
          decoding="async"
          className={isCard ? "size-5 rounded-sm" : "size-3 rounded-[2px]"}
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={wrapperClassName} aria-hidden="true">
      <span className={isCard ? "text-sm font-semibold" : "text-[9px] font-semibold leading-none"}>
        {fallbackLabel}
      </span>
      <span className="sr-only">{skillName} icon</span>
    </span>
  );
}
