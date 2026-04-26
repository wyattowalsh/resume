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
    <main
      className={`resume-print pdf-full mx-auto w-full max-w-[7.65in] p-0 ${className ?? ""}`}
    >
      <PrintResumeHeader
        basics={basics}
        showSummary={fullArtifactSpec.showSummary}
      />

      <div className="mt-3.5">
        <PrintSection title="Experience">
          <PrintWorkList
            work={work}
            showSummaries={fullArtifactSpec.showWorkSummaries}
          />
        </PrintSection>
      </div>

      {projects && projects.length > 0 && (
        <div className="print-page-break-after" aria-hidden="true" />
      )}

      <div className="mt-3.5 space-y-3">
        {projects && projects.length > 0 && (
          <PrintSection title="Projects">
            <PrintProjectList
              projects={projects}
              showHighlights={fullArtifactSpec.showProjectHighlights}
              maxHighlights={fullArtifactSpec.maxProjectHighlights}
              showStacks={fullArtifactSpec.showProjectStacks}
              showDates={fullArtifactSpec.showProjectDates}
              summaryOnly={fullArtifactSpec.projectSummaryOnly}
            />
          </PrintSection>
        )}

        {skills && skills.length > 0 && (
          <PrintSection title="Skills">
            <PrintSkillList
              skills={skills}
              layout={fullArtifactSpec.skillsLayout}
              columns={fullArtifactSpec.skillsColumns}
            />
          </PrintSection>
        )}

        <PrintSection title="Education">
          <PrintEducationList education={education} />
        </PrintSection>

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
    </main>
  );
}
