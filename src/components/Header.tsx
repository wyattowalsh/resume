import { Basics } from "@/lib/schema";
import { FaLinkedinIn, FaMapPin } from "react-icons/fa";
import { CiMail } from "react-icons/ci";
import { FiGithub } from "react-icons/fi";
import { SlScreenSmartphone } from "react-icons/sl";
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

  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 px-6 py-7 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)] ring-1 ring-white/40 sm:px-8 sm:py-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_28%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
      <div className="relative flex flex-col items-center justify-start gap-5 text-center">
        <div className="flex items-center gap-4">
          <Ornament />
          <a href={basics.url} target="_blank" rel="noopener noreferrer">
            <h1 className="m-0 shrink-0 p-0 text-4xl font-bold text-gradient-textured sm:text-5xl">
              {basics.name}
            </h1>
          </a>
          <Ornament reversed />
        </div>
        {basics.image && (
          <img
            src={basics.image}
            alt={`${basics.name} profile photo`}
            className="h-20 w-20 rounded-full border border-primary/20 object-cover shadow-[0_18px_40px_-24px_rgba(15,23,42,0.4)] ring-4 ring-background/80 sm:h-24 sm:w-24"
            width={96}
            height={96}
            loading="eager"
          />
        )}
        {basics.label && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70 sm:text-[0.95rem]">
            {basics.label}
          </p>
        )}
        {basics.summary && (
          <p className="max-w-3xl text-sm font-medium leading-7 text-foreground/80 sm:text-[1.02rem]">
            {basics.summary}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2.5 text-sm text-muted-foreground">
          <a
            href={`mailto:${basics.email}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3.5 py-2 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
          >
            <CiMail className="text-primary" size={18} strokeWidth={1.5} />
            {basics.email}
          </a>
          <a
            href={`tel:${basics.phone}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3.5 py-2 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
          >
            <SlScreenSmartphone
              className="text-primary"
              size={18}
              strokeWidth={2}
            />
            {basics.phone}
          </a>
          {basics.location && (
            <a
              href={gmapsQueryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3.5 py-2 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
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
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3.5 py-2 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
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
        <div className="flex flex-wrap justify-center gap-3 print:hidden">
          <a
            href="/downloads/wyatt-walsh-resume-full.pdf"
            download="wyatt-walsh-resume-full.pdf"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-primary/20 bg-primary/[0.07] px-4 py-2 text-sm font-semibold text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.12] hover:text-primary"
          >
            Download 2-page PDF
          </a>
          <a
            href="/downloads/wyatt-walsh-resume-single.pdf"
            download="wyatt-walsh-resume-single.pdf"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
          >
            Download 1-page PDF
          </a>
        </div>
      </div>
    </header>
  );
}
