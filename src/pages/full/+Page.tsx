import resumeData from "@assets/data/resume.json";
import { ResumeLayout } from "@/components/ResumeLayout";
import { resumeSchema } from "@/lib/schema";

const PROJECTS_SHOWN = 6;

export default function FullPage() {
  const resume = resumeSchema.parse(resumeData);

  return (
    <ResumeLayout
      className="pdf-full"
      basics={resume.basics}
      work={resume.work}
      skills={resume.skills}
      education={resume.education}
      projects={resume.projects?.slice(0, PROJECTS_SHOWN)}
      certificates={resume.certificates}
      publications={resume.publications}
      skillsPageBreak
    />
  );
}
