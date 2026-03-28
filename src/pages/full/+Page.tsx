import resumeData from "@assets/data/resume.json";
import { Certificates } from "@/components/Certificates";
import { Education } from "@/components/Education";
import { Header } from "@/components/Header";
import { Projects } from "@/components/Projects";
import { Publications } from "@/components/Publications";
import { Skills } from "@/components/Skills";
import { WorkExperience } from "@/components/WorkExperience";
import { HR } from "@/components/ui/HR";
import { resumeSchema } from "@/lib/schema";
import {
  FaGraduationCap,
  FaBrain,
  FaDiagramProject,
  FaCertificate,
  FaBookOpen,
} from "react-icons/fa6";

export default function FullPage() {
  const resume = resumeSchema.parse(resumeData);

  // Trim project highlights to 2 per project to fit 2 pages
  const trimmedProjects = resume.projects?.map((project) => ({
    ...project,
    highlights: project.highlights.slice(0, 2),
  }));

  return (
    <main className="pdf-full container mx-auto my-4 max-w-4xl rounded-xl p-0 print:my-0 print:max-w-full print:border-none print:shadow-none">
      <Header basics={resume.basics} />
      <HR />
      <WorkExperience work={resume.work} />
      {resume.skills && resume.skills.length > 0 && (
        <div className="print-page-break-after">
          <HR icon={<FaBrain />} />
          <Skills skills={resume.skills} />
        </div>
      )}
      <HR icon={<FaGraduationCap />} />
      <Education education={resume.education} />
      {trimmedProjects && trimmedProjects.length > 0 && (
        <>
          <HR icon={<FaDiagramProject />} />
          <Projects projects={trimmedProjects} />
        </>
      )}
      {((resume.certificates && resume.certificates.length > 0) ||
        (resume.publications && resume.publications.length > 0)) && (
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
          {resume.certificates && resume.certificates.length > 0 && (
            <section>
              <HR icon={<FaCertificate />} />
              <Certificates certificates={resume.certificates} />
            </section>
          )}
          {resume.publications && resume.publications.length > 0 && (
            <section>
              <HR icon={<FaBookOpen />} />
              <Publications publications={resume.publications} />
            </section>
          )}
        </div>
      )}
    </main>
  );
}
