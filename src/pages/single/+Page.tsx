import resumeData from "@assets/data/resume.json";
import { ResumeLayout } from "@/components/ResumeLayout";
import { resumeSchema } from "@/lib/schema";

const JOBS_SHOWN = 3;
const HIGHLIGHTS_PER_JOB = 2;
const EDUCATION_SHOWN = 1;
const KEYWORDS_PER_SKILL = 8;
const PROJECTS_SHOWN = 2;

export default function SinglePage() {
  const resume = resumeSchema.parse(resumeData);

  const topWork = resume.work.slice(0, JOBS_SHOWN).map((job) => ({
    ...job,
    highlights: job.highlights.slice(0, HIGHLIGHTS_PER_JOB),
  }));

  const compactSkills = resume.skills?.map((skill) => ({
    ...skill,
    keywords: skill.keywords.slice(0, KEYWORDS_PER_SKILL),
  }));

  const topProjects = resume.projects
    ?.slice(0, PROJECTS_SHOWN)
    .map((project) => ({
      ...project,
      highlights: [] as string[],
    }));

  return (
    <ResumeLayout
      className="pdf-single"
      basics={{ ...resume.basics, summary: undefined }}
      work={topWork}
      skills={compactSkills}
      education={resume.education.slice(0, EDUCATION_SHOWN)}
      projects={topProjects}
      certificates={resume.certificates}
      publications={resume.publications}
    />
  );
}
