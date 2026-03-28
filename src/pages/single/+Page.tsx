import resumeData from "@assets/data/resume.json";
import { Education } from "@/components/Education";
import { Header } from "@/components/Header";
import { Skills } from "@/components/Skills";
import { WorkExperience } from "@/components/WorkExperience";
import { HR } from "@/components/ui/HR";
import { resumeSchema } from "@/lib/schema";

export default function SinglePage() {
  const resume = resumeSchema.parse(resumeData);

  // Remove summary for compact header
  const compactBasics = { ...resume.basics, summary: undefined };

  // Top 3 jobs, trimmed highlights
  const topWork = resume.work.slice(0, 3).map((job) => ({
    ...job,
    highlights: job.highlights.slice(0, 3),
  }));

  // Berkeley only
  const topEducation = resume.education.slice(0, 1);

  // All skill categories, trim keywords to top 8
  const compactSkills = resume.skills?.map((skill) => ({
    ...skill,
    keywords: skill.keywords.slice(0, 8),
  }));

  return (
    <main className="pdf-single container mx-auto my-4 max-w-4xl rounded-xl p-0 print:my-0 print:max-w-full print:border-none print:shadow-none">
      <Header basics={compactBasics} />
      <HR />
      <WorkExperience work={topWork} />
      {compactSkills && compactSkills.length > 0 && (
        <>
          <HR />
          <Skills skills={compactSkills} />
        </>
      )}
      <HR />
      <Education education={topEducation} />
    </main>
  );
}
