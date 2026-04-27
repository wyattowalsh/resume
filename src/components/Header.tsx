import { Basics } from "@/lib/schema";
import { FaLinkedinIn, FaMapPin } from "react-icons/fa";
import { CiMail } from "react-icons/ci";
import { FiGithub } from "react-icons/fi";
import { SlScreenSmartphone } from "react-icons/sl";

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
    "interactive-chip inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 font-[family:var(--font-site-label)] text-sm text-foreground shadow-sm sm:min-h-10 sm:w-auto";

  return (
    <header className="interactive-surface rounded-[1.75rem] border border-border bg-card px-4 py-6 shadow-sm sm:px-6 sm:py-7">
      <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
        <a href={basics.url} target="_blank" rel="noopener noreferrer">
          <h1 className="font-[family:var(--font-site-display)] text-balance text-3xl font-bold text-foreground sm:text-5xl">
            {basics.name}
          </h1>
        </a>
        {basics.label && (
          <p className="font-[family:var(--font-site-label)] text-sm font-semibold text-primary sm:text-base">
            {basics.label}
          </p>
        )}
        {basics.summary && (
          <p className="max-w-[66ch] text-pretty text-sm leading-7 text-foreground/80 sm:text-base">
            {basics.summary}
          </p>
        )}
        <div className="flex w-full flex-col gap-2 text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-center">
          <a
            href={`mailto:${basics.email}`}
            className={chipClass}
          >
            <CiMail className="text-primary" size={18} strokeWidth={1.5} />
            {basics.email}
          </a>
          <a
            href={`tel:${basics.phone}`}
            className={chipClass}
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
