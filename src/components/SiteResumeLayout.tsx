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
  return (
    <main
      className={`container mx-auto my-5 max-w-6xl px-4 pb-14 print:my-0 print:max-w-full print:border-none print:px-0 print:pb-0 print:shadow-none sm:px-6 lg:px-8 ${className ?? ""}`}
    >
      <Header basics={basics} />
      <div className="mt-8 space-y-12">
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
    </main>
  );
}
