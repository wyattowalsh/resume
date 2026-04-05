import { ResumeLayout } from "@/components/ResumeLayout";
import { getResumeVariant } from "@/lib/resume-data";

export default function Page() {
  const { options: _options, seo: _seo, ...resume } = getResumeVariant("site");

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
