import { formatMonthYear } from "@/lib/date";
import type { SiteResumeVariant } from "@/lib/resume-data";
import { Button } from "@/components/ui/button";
import {
  LuArrowUpRight,
  LuAward,
  LuBookOpenText,
  LuGraduationCap,
  LuMail,
  LuMapPin,
  LuPhone,
} from "react-icons/lu";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import type { ReactNode } from "react";

type PublicResumeSiteProps = {
  variant: SiteResumeVariant;
};

type SectionBlockProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

function SectionBlock({
  eyebrow,
  title,
  description,
  children,
}: SectionBlockProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h2 className="text-left text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function formatDateRange(startDate: string, endDate: string | null) {
  return `${formatMonthYear(startDate)} - ${
    endDate ? formatMonthYear(endDate) : "Present"
  }`;
}

export function PublicResumeSite({ variant }: PublicResumeSiteProps) {
  const {
    basics,
    certificates,
    education,
    projects,
    publications,
    site,
    skills,
    work,
  } = variant;

  const locationName = [basics.location.city, basics.location.region]
    .filter(Boolean)
    .join(", ");
  const linkedInProfile = basics.profiles.find(
    (profile) => profile.network === "LinkedIn",
  );
  const githubProfile = basics.profiles.find(
    (profile) => profile.network === "GitHub",
  );
  const currentRole = work[0];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:items-start">
        <div className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 shadow-sm sm:p-10">
          <div className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-primary/90">
              {site.eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="text-left text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {site.headline}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                {site.subheadline}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={`mailto:${basics.email}`}>
                  Email me
                  <LuArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              {linkedInProfile ? (
                <Button asChild variant="outline">
                  <a
                    href={linkedInProfile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                    <FaLinkedinIn className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : null}
              {githubProfile ? (
                <Button asChild variant="outline">
                  <a
                    href={githubProfile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                    <FaGithub className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : null}
              <Button asChild variant="ghost">
                <a href={basics.url} target="_blank" rel="noopener noreferrer">
                  Website
                  <LuArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <ul className="grid gap-3 pt-2 md:grid-cols-3">
              {site.focusAreas.map((area) => (
                <li
                  key={area}
                  className="rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-sm leading-6 text-foreground/90"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="rounded-[2rem] border bg-card/80 p-8 shadow-sm">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Current focus
              </p>
              {currentRole ? (
                <>
                  <h2 className="text-left text-2xl font-semibold tracking-tight text-foreground">
                    {currentRole.position}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {currentRole.name}
                  </p>
                </>
              ) : null}
            </div>

            <dl className="space-y-4">
              <div className="flex items-start gap-3">
                <LuMapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Location
                  </dt>
                  <dd className="text-sm leading-6 text-foreground">{locationName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LuMail className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Email
                  </dt>
                  <dd className="text-sm leading-6 text-foreground">{basics.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LuPhone className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="text-sm leading-6 text-foreground">{basics.phone}</dd>
                </div>
              </div>
            </dl>

            {site.availability ? (
              <p className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
                {site.availability}
              </p>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {site.proofPoints.map((proofPoint) => (
          <article
            key={`${proofPoint.value}-${proofPoint.label}`}
            className="rounded-[1.75rem] border bg-card/80 p-6 shadow-sm"
          >
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {proofPoint.value}
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-foreground">
              {proofPoint.label}
            </p>
            {proofPoint.detail ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {proofPoint.detail}
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <SectionBlock
        eyebrow="Career story"
        title="Experience anchored in applied AI, analytics infrastructure, and delivery."
        description="I gravitate toward roles where shipping the customer-facing AI layer still depends on disciplined data pipelines, reliable tooling, and strong judgment around risk."
      >
        <div className="space-y-4">
          {work.map((job) => (
            <article
              key={`${job.name}-${job.position}`}
              className="rounded-[2rem] border bg-card/70 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
                    {job.name}
                  </p>
                  <h3 className="text-left text-2xl font-semibold tracking-tight text-foreground">
                    {job.position}
                  </h3>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                    {job.summary}
                  </p>
                </div>
                <div className="min-w-48 text-sm leading-6 text-muted-foreground md:text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatDateRange(job.startDate, job.endDate)}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {job.location}
                  </p>
                </div>
              </div>

              {job.highlights.length > 0 ? (
                <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted-foreground lg:grid-cols-2">
                  {job.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </SectionBlock>

      {projects && projects.length > 0 ? (
        <SectionBlock
          eyebrow="Selected buildout"
          title="Projects that prove range outside the day job."
          description="Open-source work matters here because it shows the systems I choose to build without organizational scaffolding."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.name}
                className="rounded-[2rem] border bg-card/70 p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h3 className="text-left text-xl font-semibold tracking-tight text-foreground">
                      {project.name}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {formatDateRange(project.startDate, project.endDate)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {project.url ? (
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live
                          <LuArrowUpRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    ) : null}
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                        <FaGithub className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {project.description}
                </p>

                {project.highlights.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
                    {project.highlights.map((highlight) => (
                      <li key={highlight} className="rounded-xl bg-secondary px-4 py-3">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {project.stack?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium tracking-wide text-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </SectionBlock>
      ) : null}

      {skills && skills.length > 0 ? (
        <SectionBlock
          eyebrow="Capabilities"
          title="Strength across agentic AI, data, cloud, and frontend delivery."
          description="I am most valuable at the seams: when product, model behavior, developer ergonomics, and operational constraints all have to work together."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {skills.map((skill) => (
              <article
                key={skill.name}
                className="rounded-[2rem] border bg-card/70 p-6 shadow-sm"
              >
                <h3 className="text-left text-xl font-semibold tracking-tight text-foreground">
                  {skill.name}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skill.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium tracking-wide text-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </SectionBlock>
      ) : null}

      <SectionBlock
        eyebrow="Writing and credentials"
        title="Signals that travel well across hiring loops."
        description="The writing side shows communication and technical depth; the education and credentials side keeps the factual background easy to scan."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="rounded-[2rem] border bg-card/70 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <LuBookOpenText className="h-5 w-5 text-primary" />
              <h3 className="text-left text-xl font-semibold tracking-tight text-foreground">
                Writing
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              {publications?.map((publication) => (
                <a
                  key={publication.name}
                  href={publication.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-border/70 bg-background/80 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-background"
                >
                  <p className="text-sm font-medium leading-6 text-foreground">
                    {publication.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {publication.publisher} · {publication.releaseDate}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border bg-card/70 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <LuGraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-left text-xl font-semibold tracking-tight text-foreground">
                  Education
                </h3>
              </div>
              <div className="mt-5 space-y-3">
                {education.map((school) => (
                  <div
                    key={school.institution}
                    className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4"
                  >
                    <p className="text-sm font-medium leading-6 text-foreground">
                      {school.institution}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {school.studyType}
                      {school.area ? `, ${school.area}` : ""} ·{" "}
                      {formatDateRange(school.startDate, school.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {certificates?.length ? (
              <div className="rounded-[2rem] border bg-card/70 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <LuAward className="h-5 w-5 text-primary" />
                  <h3 className="text-left text-xl font-semibold tracking-tight text-foreground">
                    Credentials
                  </h3>
                </div>
                <div className="mt-5 space-y-3">
                  {certificates.map((certificate) => (
                    certificate.url ? (
                      <a
                        key={certificate.name}
                        href={certificate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl border border-border/70 bg-background/80 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-background"
                      >
                        <p className="text-sm font-medium leading-6 text-foreground">
                          {certificate.name}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {certificate.issuer} · {certificate.date}
                        </p>
                      </a>
                    ) : (
                      <div
                        key={certificate.name}
                        className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4"
                      >
                        <p className="text-sm font-medium leading-6 text-foreground">
                          {certificate.name}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {certificate.issuer} · {certificate.date}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </SectionBlock>

      <section className="rounded-[2rem] border border-primary/20 bg-primary/5 p-8 shadow-sm sm:p-10">
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
            Contact
          </p>
          <h2 className="max-w-3xl text-left text-3xl font-semibold tracking-tight text-foreground">
            If you need someone who can ship AI product surface area without losing
            the data and platform fundamentals, let&apos;s talk.
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            I&apos;m especially interested in roles where applied AI has to earn trust:
            regulated workflows, operational tooling, research-heavy products, and
            systems that have to work for both end users and internal operators.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`mailto:${basics.email}`}>
              Start a conversation
              <LuArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          {linkedInProfile ? (
            <Button asChild variant="outline">
              <a
                href={linkedInProfile.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on LinkedIn
                <FaLinkedinIn className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
