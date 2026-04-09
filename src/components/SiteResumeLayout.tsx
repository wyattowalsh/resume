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
    if (id === "credentials") return Boolean(certificates?.length || publications?.length);
    return true;
  });

  return (
    <main
      className={`container mx-auto my-4 max-w-6xl rounded-xl px-4 pb-8 print:my-0 print:max-w-full print:border-none print:px-0 print:pb-0 print:shadow-none sm:px-6 lg:px-8 ${className ?? ""}`}
    >
      <Header basics={basics} />
      <nav
        aria-label="Resume sections"
        className="sticky top-4 z-20 mt-4 rounded-full border bg-background/90 px-3 py-2 shadow-sm backdrop-blur print:hidden"
      >
        <div className="flex flex-wrap justify-center gap-2">
          {jumpLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mt-6 grid gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,1fr)]">
        <div className="space-y-6">
          <div id="work-experience" className="scroll-mt-24">
            <HR />
            <WorkExperience work={work} />
          </div>

          {projects && projects.length > 0 && (
            <div id="projects" className="scroll-mt-24">
              <HR icon={<FaDiagramProject />} />
              <Projects projects={projects} />
            </div>
          )}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
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
            <div id="credentials" className="scroll-mt-24 space-y-6">
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
        </aside>
      </div>
    </main>
  );
}
