import type {
  Basics,
  Certificate,
  Education as EducationType,
  Project,
  Publication,
  Skill,
  Work,
} from "@/lib/schema";
import { resumeDownloadGroups } from "@/lib/resume-downloads";
import { Certificates } from "./Certificates";
import { Education } from "./Education";
import { Header } from "./Header";
import { Projects } from "./Projects";
import { Publications } from "./Publications";
import { Skills } from "./Skills";
import { SectionProgressNav, type SectionProgressItem } from "./SectionProgressNav";
import { WorkExperience } from "./WorkExperience";
import { HR } from "./ui/HR";
import {
  FaBookOpen,
  FaBrain,
  FaCertificate,
  FaDiagramProject,
  FaGraduationCap,
  FaTimeline,
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
    "interactive-chip inline-flex min-h-9 items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm";
  const sectionNavItems: SectionProgressItem[] = [
    {
      id: "work-experience",
      label: "Experience",
      kicker: "Evidence-first roles",
    },
    ...(projects && projects.length > 0
      ? [
          {
            id: "projects",
            label: "Projects",
            kicker: "Selected builds",
          },
        ]
      : []),
    ...(skills && skills.length > 0
      ? [
          {
            id: "skills",
            label: "Skills",
            kicker: "ATS taxonomy",
          },
        ]
      : []),
    {
      id: "education",
      label: "Education",
      kicker: "Foundation",
    },
    ...(Boolean(certificates?.length) || Boolean(publications?.length)
      ? [
          {
            id: "credentials",
            label: "Credentials",
            kicker: "Signals",
          },
        ]
      : []),
  ];
  return (
    <main
      className={`container mx-auto my-4 max-w-5xl px-4 pb-12 font-[family:var(--font-site-body)] print:my-0 print:max-w-full print:border-none print:px-0 print:pb-0 print:shadow-none sm:my-6 sm:px-6 lg:px-8 ${className ?? ""}`}
    >
      <Header basics={basics} />
      <div data-scroll-progress-sentinel aria-hidden="true" className="h-px" />
      <SectionProgressNav items={sectionNavItems} />
      <div className="mt-8 space-y-10 sm:space-y-12">
        <div
          id="work-experience"
          className="section-reveal scroll-mt-10 sm:scroll-mt-12"
        >
          <HR icon={<FaTimeline />} />
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
        <div className="mx-auto flex w-fit max-w-full flex-col items-center justify-center gap-2 rounded-[1.5rem] border border-border bg-card px-3 py-3 text-center text-xs text-muted-foreground shadow-sm sm:flex-row sm:flex-wrap sm:text-left">
          <span className="rounded-full bg-muted/60 px-3 py-1 font-[family:var(--font-site-label)] font-semibold text-foreground/55">
            Downloads
          </span>
          {resumeDownloadGroups.map((group) => (
            <div
              key={group.label}
              className="flex flex-wrap items-center justify-center gap-1 rounded-full bg-muted/60 px-1 py-1"
            >
              <span className="px-2 font-[family:var(--font-site-label)] font-medium text-foreground/55">
                {group.label}
              </span>
              {group.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  className={footerDownloadLinkClass}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
