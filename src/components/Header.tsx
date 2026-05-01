import { Basics } from "@/lib/schema";
import { FaLinkedinIn, FaMapPin } from "react-icons/fa";
import { CiMail } from "react-icons/ci";
import { FiGithub } from "react-icons/fi";
import { cn } from "@/lib/utils";

function Ornament({ reversed }: { reversed?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "hidden items-center gap-2 md:flex",
        reversed && "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "h-px w-12 from-transparent to-muted-foreground/30",
          reversed ? "bg-gradient-to-l" : "bg-gradient-to-r",
        )}
      />
      <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
      <div className="h-px w-6 bg-muted-foreground/30" />
      <div className="h-px w-px rounded-full bg-muted-foreground/30" />
    </div>
  );
}

type HeaderProps = {
  basics: Basics;
};

export function Header({ basics }: HeaderProps) {
  const { city, region } = basics.location;
  const locationString = `${city}, ${region}`;
  const gmapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    locationString,
  )}`;
  const chipClass =
    "interactive-chip inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1.5 font-[family:var(--font-site-label)] shadow-sm sm:min-h-[44px] sm:px-3.5 sm:py-2";
  return (
    <header className="group/header interactive-surface relative overflow-hidden rounded-[1.75rem] border border-border bg-card/85 px-4 py-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)] ring-1 ring-black/5 dark:ring-white/40 sm:rounded-[2rem] sm:px-8 sm:py-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_28%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
      <div className="relative z-10 flex flex-col items-center justify-start gap-3 text-center sm:gap-4">
        <div className="flex items-center gap-4">
          <Ornament />
          <a href={basics.url} target="_blank" rel="noopener noreferrer">
            <h1 className="m-0 shrink-0 p-0 font-[family:var(--font-site-display)] text-[2.35rem] font-bold tracking-[-0.05em] text-gradient-textured sm:text-5xl">
              {basics.name}
            </h1>
          </a>
          <Ornament reversed />
        </div>
        {basics.label && (
          <p className="font-[family:var(--font-site-label)] text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-foreground/70 transition-colors duration-300 group-hover/header:text-foreground/80 sm:text-[0.95rem] sm:tracking-[0.18em]">
            {basics.label}
          </p>
        )}
        {basics.summary && (
          <p className="max-w-[64ch] text-[0.92rem] font-medium leading-6 text-foreground/80 transition-colors duration-300 group-hover/header:text-foreground/90 sm:text-[1.02rem] sm:leading-7">
            {basics.summary}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground sm:gap-2.5">
          <a
            href={`mailto:${basics.email}`}
            className={chipClass}
          >
            <CiMail className="text-primary" size={18} strokeWidth={1.5} />
            {basics.email}
          </a>
          {basics.location && (
            <a
              href={gmapsQueryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={chipClass}
            >
              <FaMapPin className="text-primary" size={18} />
              {locationString}
            </a>
          )}
          {Array.isArray(basics.profiles) &&
            basics.profiles.map((profile) => (
              <a
                key={profile.network}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.network} profile: ${profile.username}`}
                className={chipClass}
              >
                {profile.network === "LinkedIn" && (
                  <FaLinkedinIn className="text-primary" size={18} />
                )}
                {profile.network === "GitHub" && (
                  <FiGithub className="text-primary" size={18} />
                )}
                {profile.username}
              </a>
            ))}
        </div>
      </div>
    </header>
  );
}
