import { SingleResumeLayout } from "@/components/SingleResumeLayout";
import { getResumeVariant } from "@/lib/resume-data";

export default function SinglePage() {
  const { seo: _seo, ...resume } = getResumeVariant("single");

  return (
    <SingleResumeLayout
      basics={resume.basics}
      work={resume.work}
      skills={resume.skills}
      education={resume.education}
      projects={resume.projects}
    />
  );
}
