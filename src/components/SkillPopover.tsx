import type { SkillDetail } from "@/lib/skill-details";
import { useId, useState, type ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import { LuBookOpen, LuFileText, LuGlobe } from "react-icons/lu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type SkillPopoverProps = {
  category: string;
  detail?: SkillDetail;
  iconPath?: string;
  skillName: string;
  children: ReactNode;
};

export function SkillPopover({
  category,
  detail,
  iconPath,
  skillName,
  children,
}: SkillPopoverProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const resolvedIconPath = detail?.icon?.path ?? iconPath;
  const resolvedSkillName = detail?.name ?? skillName;
  const contextText = detail
    ? detail.desc
    : `${skillName} is part of Wyatt's ${category.toLowerCase()} toolkit across the roles and projects represented on this page.`;

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
            category={category}
            iconPath={resolvedIconPath}
            skillName={skillName}
            size="trigger"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="max-h-[min(82dvh,28rem)] w-[min(calc(100vw-2rem),27rem)] overflow-y-auto rounded-2xl border-border bg-card p-0 shadow-lg"
      >
        <div className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <SkillIcon
              category={category}
              iconPath={resolvedIconPath}
              skillName={skillName}
              size="card"
            />
            <div className="min-w-0 flex-1">
              <h4
                id={titleId}
                className="text-balance font-[family:var(--font-site-heading)] text-base font-semibold leading-6 text-foreground"
              >
                {resolvedSkillName}
              </h4>
            </div>
            <button
              type="button"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground/60 transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Close ${skillName} details`}
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <p
            id={descriptionId}
            className="text-pretty text-sm leading-6 text-foreground/75"
          >
            {contextText}
          </p>
          {detail && detail.links.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              {detail.links.map((link) => (
                <SkillLink key={link.href} href={link.href}>
                  {link.label || getSkillLinkLabel(link.href, "Reference")}
                </SkillLink>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getSkillLinkLabel(url: string, fallback: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");

  if (hostname.includes("wikipedia.org")) return "Overview";
  if (hostname.includes("arxiv.org")) return "Research paper";
  if (hostname.includes("github.com")) return "Source";
  if (hostname.includes("docs") || hostname.includes("readthedocs"))
    return "Docs";
  if (url.includes("/docs") || url.includes("/documentation")) return "Docs";

  return fallback;
}

function SkillLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] font-medium leading-4 text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <SkillLinkIcon href={href} />
      {children}
      <ExternalLinkIcon />
    </a>
  );
}

function SkillLinkIcon({ href }: { href: string }) {
  const hostname = getHostname(href);

  if (hostname === "github.com") {
    return <FaGithub size={12} aria-hidden="true" />;
  }

  if (href.includes("/docs") || hostname.includes("docs")) {
    return <LuBookOpen size={12} strokeWidth={2} aria-hidden="true" />;
  }

  if (hostname.includes("arxiv.org")) {
    return <LuFileText size={12} strokeWidth={2} aria-hidden="true" />;
  }

  return <LuGlobe size={12} strokeWidth={2} aria-hidden="true" />;
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
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

export function SkillIcon({
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
  const fallbackLabel =
    skillName.match(/[A-Za-z0-9]/)?.[0]?.toUpperCase() ??
    category[0]?.toUpperCase() ??
    "?";
  const wrapperClassName = isCard
    ? "grid size-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary"
    : "grid size-4 shrink-0 place-items-center rounded-full text-primary/70";

  if (iconPath && !imageFailed) {
    return (
      <span className={wrapperClassName} aria-hidden="true">
        <img
          src={iconPath}
          alt=""
          loading="lazy"
          decoding="async"
          className={
            isCard
              ? "size-5 rounded-[0.25rem] object-contain"
              : "size-3 rounded-[0.125rem] object-contain"
          }
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={wrapperClassName} aria-hidden="true">
      <span
        className={
          isCard
            ? "text-sm font-semibold"
            : "text-[9px] font-semibold leading-none"
        }
      >
        {fallbackLabel}
      </span>
      <span className="sr-only">{skillName} icon</span>
    </span>
  );
}
