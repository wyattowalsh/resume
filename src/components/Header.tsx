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
    <header className="rounded-3xl border border-border/70 bg-card/80 px-6 py-7 shadow-sm sm:px-8 sm:py-9">
      <div className="flex flex-col items-center justify-start gap-5 text-center">
        <div className="flex items-center gap-4">
          <Ornament />
          <a href={basics.url} target="_blank" rel="noopener noreferrer">
            <h1 className="m-0 shrink-0 p-0 text-4xl font-bold text-gradient-textured sm:text-5xl">
              {basics.name}
            </h1>
          </a>
          <Ornament reversed />
        </div>
        {basics.label && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70 sm:text-[0.95rem]">
            {basics.label}
          </p>
        )}
        {basics.summary && (
          <p className="max-w-2xl text-sm font-medium leading-6 text-foreground/80 sm:text-[1.02rem]">
            {basics.summary}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-sm text-muted-foreground">
          <a
            href={`mailto:${basics.email}`}
            className="flex min-h-[44px] items-center gap-2 px-1 transition-colors hover:text-primary"
          >
            <CiMail className="text-primary" size={18} strokeWidth={1.5} />
            {basics.email}
          </a>
          <a
            href={`tel:${basics.phone}`}
            className="flex min-h-[44px] items-center gap-2 px-1 transition-colors hover:text-primary"
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
              className="flex min-h-[44px] items-center gap-2 px-1 transition-colors hover:text-primary"
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
                className="flex min-h-[44px] items-center gap-2 px-1 transition-colors hover:text-primary"
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
