import { SiteResumeLayout } from "@/components/SiteResumeLayout";
import { getResumeVariant } from "@/lib/resume-data";

export default function Page() {
  const { seo: _seo, ...resume } = getResumeVariant("site");

  return (
    <SiteResumeLayout
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
