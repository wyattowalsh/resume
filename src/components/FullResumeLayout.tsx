import type {
  Basics,
  Certificate,
  Education as EducationType,
  Project,
  Publication,
  Skill,
  Work,
} from "@/lib/schema";
import { fullArtifactSpec } from "@/lib/artifact-specs";
import {
  PrintCertificateList,
  PrintEducationList,
  PrintProjectList,
  PrintPublicationList,
  PrintResumeHeader,
  PrintSection,
  PrintSkillList,
  PrintWorkList,
} from "./print/PrintResumeShared";

type FullResumeLayoutProps = {
  basics: Basics;
  work: Work[];
  skills?: Skill[];
  education: EducationType[];
  projects?: Project[];
  certificates?: Certificate[];
  publications?: Publication[];
  className?: string;
};

export function FullResumeLayout({
  basics,
  work,
  skills,
  education,
  projects,
  certificates,
  publications,
  className,
}: FullResumeLayoutProps) {
  return (
    <main className={`resume-print pdf-full mx-auto w-full max-w-[7.65in] p-0 ${className ?? ""}`}>
      <PrintResumeHeader basics={basics} showSummary={fullArtifactSpec.showSummary} />

      <div className="mt-4">
        <PrintSection title="Experience">
          <PrintWorkList work={work} showSummaries={fullArtifactSpec.showWorkSummaries} />
        </PrintSection>
      </div>

      {projects && projects.length > 0 && <div className="print-page-break-after" />}

      <div className="mt-4 space-y-4">
        {projects && projects.length > 0 && (
          <PrintSection title="Projects">
            <PrintProjectList
              projects={projects}
              showHighlights={fullArtifactSpec.showProjectHighlights}
              showStacks={fullArtifactSpec.showProjectStacks}
            />
          </PrintSection>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-5">
          <div className="space-y-4">
            {skills && skills.length > 0 && (
              <PrintSection title="Skills">
                <PrintSkillList skills={skills} columns={fullArtifactSpec.skillsColumns} />
              </PrintSection>
            )}

            <PrintSection title="Education">
              <PrintEducationList education={education} />
            </PrintSection>
          </div>

          <div className="space-y-4">
            {certificates && certificates.length > 0 && (
              <PrintSection title="Certifications">
                <PrintCertificateList certificates={certificates} />
              </PrintSection>
            )}

            {publications && publications.length > 0 && (
              <PrintSection title="Publications">
                <PrintPublicationList publications={publications} />
              </PrintSection>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
