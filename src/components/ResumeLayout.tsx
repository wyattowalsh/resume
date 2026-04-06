import type {
  Basics,
  Work,
  Education as EducationType,
  Certificate,
  Publication,
  Skill,
  Project,
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
  FaGraduationCap,
  FaBrain,
  FaDiagramProject,
  FaCertificate,
  FaBookOpen,
} from "react-icons/fa6";

type ResumeLayoutProps = {
  basics: Basics;
  work: Work[];
  skills?: Skill[];
  education: EducationType[];
  projects?: Project[];
  certificates?: Certificate[];
  publications?: Publication[];
  className?: string;
  skillsPageBreak?: boolean;
  projectsPageBreak?: boolean;
};

export function ResumeLayout({
  basics,
  work,
  skills,
  education,
  projects,
  certificates,
  publications,
  className,
  skillsPageBreak,
  projectsPageBreak,
}: ResumeLayoutProps) {
  const skillsContent = skills && skills.length > 0 && (
    <>
      <HR icon={<FaBrain />} />
      <Skills skills={skills} />
    </>
  );

  return (
    <main
      className={`container mx-auto my-4 max-w-4xl rounded-xl p-0 print:my-0 print:max-w-full print:border-none print:shadow-none ${className ?? ""}`}
    >
      <Header basics={basics} />
      <HR />
      <WorkExperience work={work} />
      {skillsPageBreak ? (
        <div className="print-page-break-after">{skillsContent}</div>
      ) : (
        skillsContent
      )}
      <HR icon={<FaGraduationCap />} />
      <Education education={education} />
      {projects && projects.length > 0 && (
        <>
          {projectsPageBreak && <div className="print-page-break-after" />}
          <HR icon={<FaDiagramProject />} />
          <Projects projects={projects} />
        </>
      )}
      {((certificates && certificates.length > 0) ||
        (publications && publications.length > 0)) && (
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
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
    </main>
  );
}
