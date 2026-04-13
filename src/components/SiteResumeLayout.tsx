import type {
  Basics,
  Certificate,
  Education as EducationType,
  Project,
  Publication,
  Skill,
  Work,
} from "@/lib/schema";
import { siteArtifactSpec } from "@/lib/artifact-specs";
import { Certificates } from "./Certificates";
import { Education } from "./Education";
import { Header } from "./Header";
import { Projects } from "./Projects";
import { Publications } from "./Publications";
import { Skills } from "./Skills";
import { WorkExperience } from "./WorkExperience";
import { HR } from "./ui/HR";
import {
  FaBookOpen,
  FaBrain,
  FaCertificate,
  FaDiagramProject,
  FaGraduationCap,
} from "react-icons/fa6";

type SiteResumeLayoutProps = {
  basics: Basics;
  work: Work[];
  skills?: Skill[];
  education: EducationType[];
  projects?: Project[];
  certificates?: Certificate[];
  publications?: Publication[];
  className?: string;
};

export function SiteResumeLayout({
  basics,
  work,
  skills,
  education,
  projects,
  certificates,
  publications,
  className,
}: SiteResumeLayoutProps) {
  const jumpLinks = siteArtifactSpec.jumpLinks.filter(({ id }) => {
    if (id === "projects") return Boolean(projects?.length);
    if (id === "skills") return Boolean(skills?.length);
    if (id === "education") return education.length > 0;
    if (id === "credentials")
      return Boolean(certificates?.length || publications?.length);
    return true;
  });
  const linkedInProfile = basics.profiles.find(
    (profile) => profile.network === "LinkedIn",
  );
  const githubProfile = basics.profiles.find(
    (profile) => profile.network === "GitHub",
  );

  return (
    <main
      className={`container mx-auto my-5 max-w-6xl rounded-xl px-4 pb-10 print:my-0 print:max-w-full print:border-none print:px-0 print:pb-0 print:shadow-none sm:px-6 lg:px-8 ${className ?? ""}`}
    >
      <Header basics={basics} />
      <nav
        aria-label="Resume sections"
        className="sticky top-3 z-20 mt-5 rounded-2xl border bg-background/90 px-3 py-2 shadow-sm backdrop-blur print:hidden supports-[backdrop-filter]:bg-background/80"
      >
        <div className="flex flex-wrap justify-center gap-2">
          {jumpLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors duration-150 hover:bg-primary/10 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mt-8 space-y-10">
        <div id="work-experience" className="scroll-mt-24">
          <HR />
          <WorkExperience work={work} />
        </div>

        {projects && projects.length > 0 && (
          <div id="projects" className="scroll-mt-24">
            <HR icon={<FaDiagramProject />} />
            <Projects projects={projects} featuredCount={2} />
          </div>
        )}

        {skills && skills.length > 0 && (
          <div id="skills" className="scroll-mt-24">
            <HR icon={<FaBrain />} />
            <Skills skills={skills} />
          </div>
        )}

        <div id="education" className="scroll-mt-24">
          <HR icon={<FaGraduationCap />} />
          <Education education={education} />
        </div>

        {(Boolean(certificates?.length) || Boolean(publications?.length)) && (
          <div id="credentials" className="scroll-mt-24 space-y-5">
            {certificates && certificates.length > 0 && (
              <section>
                <HR icon={<FaCertificate />} />
                <Certificates certificates={certificates} />
              </section>
            )}
            {publications && publications.length > 0 && (
              <section>
                <HR icon={<FaBookOpen />} />
                <Publications publications={publications} />
              </section>
            )}
          </div>
        )}
      </div>

      <section className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Contact
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              If you&apos;re hiring for agentic AI, developer tooling, or data-platform work, email is the fastest next step.
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              I&apos;m especially well aligned with roles spanning production AI
              systems, regulated workflows, and product-minded engineering.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Prefer a PDF? Download the polished 2-page or 1-page versions
              directly without exposing the local-only print routes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${basics.email}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
            >
              Email Wyatt
            </a>
            {linkedInProfile && (
              <a
                href={linkedInProfile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-primary/40 hover:text-primary"
              >
                LinkedIn
              </a>
            )}
            {githubProfile && (
              <a
                href={githubProfile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-primary/40 hover:text-primary"
              >
                GitHub
              </a>
            )}
            <a
              href="/downloads/wyatt-walsh-resume-full.pdf"
              download="wyatt-walsh-resume-full.pdf"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-primary/40 hover:text-primary"
            >
              Download 2-page PDF
            </a>
            <a
              href="/downloads/wyatt-walsh-resume-single.pdf"
              download="wyatt-walsh-resume-single.pdf"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-primary/40 hover:text-primary"
            >
              Download 1-page PDF
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
