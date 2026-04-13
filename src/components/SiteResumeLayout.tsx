import type {
  Basics,
  Certificate,
  Education as EducationType,
  Project,
  Publication,
  Skill,
  Work,
} from "@/lib/schema";
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
  const footerDownloadLinkClass =
    "interactive-chip inline-flex min-h-[36px] items-center rounded-full border border-border/70 bg-background/75 px-3 py-1.5 text-xs font-medium tracking-[0.08em] text-muted-foreground shadow-sm";

  return (
    <main
      className={`container mx-auto my-5 max-w-6xl px-4 pb-14 font-[family:var(--font-site-body)] tracking-[-0.01em] print:my-0 print:max-w-full print:border-none print:px-0 print:pb-0 print:shadow-none sm:px-6 lg:px-8 ${className ?? ""}`}
    >
      <Header basics={basics} />
      <div className="mt-8 space-y-12">
        <div
          id="work-experience"
          className="section-reveal scroll-mt-10 sm:scroll-mt-12"
        >
          <HR />
          <WorkExperience work={work} />
        </div>

        {projects && projects.length > 0 && (
          <div id="projects" className="section-reveal scroll-mt-10 sm:scroll-mt-12">
            <HR icon={<FaDiagramProject />} />
            <Projects projects={projects} />
          </div>
        )}

        {skills && skills.length > 0 && (
          <div id="skills" className="section-reveal scroll-mt-10 sm:scroll-mt-12">
            <HR icon={<FaBrain />} />
            <Skills skills={skills} />
          </div>
        )}

        <div
          id="education"
          className="section-reveal scroll-mt-10 sm:scroll-mt-12"
        >
          <HR icon={<FaGraduationCap />} />
          <Education education={education} />
        </div>

        {(Boolean(certificates?.length) || Boolean(publications?.length)) && (
          <div
            id="credentials"
            className="section-reveal scroll-mt-10 space-y-5 sm:scroll-mt-12"
          >
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
      <footer className="mt-10 print:hidden">
        <div className="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground shadow-sm">
          <span className="px-1 font-[family:var(--font-site-label)] uppercase tracking-[0.18em] text-foreground/45">
            PDFs
          </span>
          <a
            href="/downloads/wyatt-walsh-resume-full.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the 2-page resume PDF in a new tab"
            className={footerDownloadLinkClass}
          >
            2-page PDF
          </a>
          <a
            href="/downloads/wyatt-walsh-resume-single.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the 1-page resume PDF in a new tab"
            className={footerDownloadLinkClass}
          >
            1-page PDF
          </a>
        </div>
      </footer>
    </main>
  );
}
