import resumeData from "@assets/data/resume.json";
import { ResumeLayout } from "@/components/ResumeLayout";
import { resumeSchema } from "@/lib/schema";

export default function Page() {
  const resume = resumeSchema.parse(resumeData);

  return (
    <ResumeLayout
      basics={resume.basics}
      work={resume.work}
      skills={resume.skills}
      education={resume.education}
      projects={resume.projects}
      certificates={resume.certificates}
      publications={resume.publications}
    />
  );
}
