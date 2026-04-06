import { FullResumeLayout } from "@/components/FullResumeLayout";
import { getResumeVariant } from "@/lib/resume-data";

export default function FullPage() {
  const { seo: _seo, ...resume } = getResumeVariant("full");

  return (
    <FullResumeLayout
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
