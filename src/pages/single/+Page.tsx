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

export default function SinglePage() {
  const resume = resumeSchema.parse(resumeData);

  // Remove summary for compact header
  const compactBasics = { ...resume.basics, summary: undefined };

  // Top 3 jobs, 2 highlights each
  const topWork = resume.work.slice(0, 3).map((job) => ({
    ...job,
    highlights: job.highlights.slice(0, 2),
  }));

  // Berkeley only
  const topEducation = resume.education.slice(0, 1);

  // All skill categories, trim keywords to top 8
  const compactSkills = resume.skills?.map((skill) => ({
    ...skill,
    keywords: skill.keywords.slice(0, 8),
  }));

  // Top 2 projects, no highlights — just description
  const topProjects = resume.projects?.slice(0, 2).map((project) => ({
    ...project,
    highlights: [] as string[],
  }));

  return (
    <main className="pdf-single container mx-auto my-4 max-w-4xl rounded-xl p-0 print:my-0 print:max-w-full print:border-none print:shadow-none">
      <Header basics={compactBasics} />
      <HR />
      <WorkExperience work={topWork} />
      {compactSkills && compactSkills.length > 0 && (
        <>
          <HR icon={<FaBrain />} />
          <Skills skills={compactSkills} />
        </>
      )}
      <HR icon={<FaGraduationCap />} />
      <Education education={topEducation} />
      {topProjects && topProjects.length > 0 && (
        <>
          <HR icon={<FaDiagramProject />} />
          <Projects projects={topProjects} />
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
