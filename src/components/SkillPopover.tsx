import { getSkillDetail } from "@/lib/skill-details";
import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

type SkillPopoverProps = {
  category: string;
  skillName: string;
  children: ReactNode;
};

const HOVER_OPEN_DELAY_MS = 120;
const HOVER_CLOSE_DELAY_MS = 180;

export function SkillPopover({
  category,
  skillName,
  children,
}: SkillPopoverProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const skipNextFocusOpenRef = useRef(false);
  const timeoutRef = useRef<number | undefined>(undefined);
  const detail = getSkillDetail(skillName, category);
  const description = detail?.description ??
    `${skillName} is part of this resume's ${category} skill group.`;

  function clearScheduledChange() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }

  function scheduleOpen() {
    clearScheduledChange();
    if (skipNextFocusOpenRef.current) {
      skipNextFocusOpenRef.current = false;
      return;
    }

    timeoutRef.current = window.setTimeout(
      () => setOpen(true),
      HOVER_OPEN_DELAY_MS,
    );
  }

  function scheduleClose() {
    clearScheduledChange();
    timeoutRef.current = window.setTimeout(
      () => setOpen(false),
      HOVER_CLOSE_DELAY_MS,
    );
  }

  function keepOpen() {
    clearScheduledChange();
    setOpen(true);
  }

  function closeForKeyboard({ skipNextFocusOpen = false } = {}) {
    skipNextFocusOpenRef.current = skipNextFocusOpen;
    clearScheduledChange();
    setOpen(false);
  }

  function schedulePointerOpen(event: PointerEvent) {
    if (event.pointerType === "touch") {
      return;
    }

    scheduleOpen();
  }

  function schedulePointerClose(event: PointerEvent) {
    if (event.pointerType === "touch") {
      return;
    }

    scheduleClose();
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="interactive-pill skill-pill inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-left font-[family:var(--font-site-label)] text-[11px] leading-4 text-secondary-foreground transition-colors duration-200 hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-0"
          aria-label={`View details for ${skillName}`}
          onBlur={scheduleClose}
          onFocus={scheduleOpen}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeForKeyboard();
            }
          }}
          onPointerEnter={schedulePointerOpen}
          onPointerLeave={schedulePointerClose}
        >
          <span>{children}</span>
          <FaInfoCircle aria-hidden="true" className="text-primary/65" size={10} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="max-w-[calc(100vw-2rem)] bg-card/98 backdrop-blur"
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          closeForKeyboard({ skipNextFocusOpen: true });
        }}
        onBlur={scheduleClose}
        onFocus={keepOpen}
        onPointerEnter={schedulePointerOpen}
        onPointerLeave={schedulePointerClose}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="font-[family:var(--font-site-label)] text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              {detail?.category ?? category}
            </p>
            <h4 id={titleId} className="font-[family:var(--font-site-heading)] text-sm font-semibold text-foreground">
              {skillName}
            </h4>
          </div>
          <p id={descriptionId} className="text-sm leading-6 text-foreground/75">
            {description}
          </p>
          {(detail?.officialUrl || detail?.referenceUrl) && (
            <div className="flex flex-wrap gap-2">
              {detail.officialUrl && (
                <SkillLink href={detail.officialUrl}>Official</SkillLink>
              )}
              {detail.referenceUrl && (
                <SkillLink href={detail.referenceUrl}>Reference</SkillLink>
              )}
            </div>
          )}
          {detail?.evidence?.length ? (
            <div className="space-y-1.5">
              <p className="font-[family:var(--font-site-label)] text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/60">
                Used in
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detail.evidence.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-primary/15 bg-primary/5 px-2 py-1 text-[11px] text-foreground/75"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
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
      <FaExternalLinkAlt aria-hidden="true" size={9} />
    </a>
  );
}
