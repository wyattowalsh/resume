import { ResumeLayout } from "@/components/ResumeLayout";
import { getResumeVariant } from "@/lib/resume-data";

export default function FullPage() {
  const { options, seo: _seo, site: _site, ...resume } = getResumeVariant("full");

  return (
    <ResumeLayout
      className="pdf-full"
      basics={resume.basics}
      work={resume.work}
      skills={resume.skills}
      education={resume.education}
      projects={resume.projects}
      certificates={resume.certificates}
      publications={resume.publications}
      skillsPageBreak={options.skillsPageBreak}
      projectsPageBreak={options.projectsPageBreak}
    />
  );
}
