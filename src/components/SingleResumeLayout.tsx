import type {
  Basics,
  Certificate,
  Education as EducationType,
  Project,
  Skill,
  Work,
} from "@/lib/schema";
import { singleArtifactSpec } from "@/lib/artifact-specs";
import {
  PrintEducationList,
  PrintCertificateStrip,
  PrintProjectList,
  PrintResumeHeader,
  PrintSection,
  PrintSkillList,
  PrintWorkList,
} from "./print/PrintResumeShared";

type SingleResumeLayoutProps = {
  basics: Basics;
  work: Work[];
  skills?: Skill[];
  education: EducationType[];
  certificates?: Certificate[];
  projects?: Project[];
  className?: string;
};

export function SingleResumeLayout({
  basics,
  work,
  skills,
  education,
  certificates,
  projects,
  className,
}: SingleResumeLayoutProps) {
  return (
    <main
      className={`resume-print pdf-single mx-auto w-full max-w-[7.65in] p-0 ${className ?? ""}`}
    >
      <PrintResumeHeader
        basics={basics}
        showSummary={singleArtifactSpec.showSummary}
        compact
      />

      <div className="mt-2.5 space-y-2.5">
        <PrintSection title="Experience">
          <PrintWorkList
            work={work}
            showSummaries={singleArtifactSpec.showWorkSummaries}
            compact
          />
        </PrintSection>

        {skills && skills.length > 0 && (
          <PrintSection title="Skills">
            <PrintSkillList
              skills={skills}
              columns={singleArtifactSpec.skillsColumns}
              layout={singleArtifactSpec.skillsLayout}
              compact
            />
          </PrintSection>
        )}

        {projects && projects.length > 0 && (
          <PrintSection title="Projects">
            <PrintProjectList
              projects={projects}
              showHighlights={singleArtifactSpec.showProjectHighlights}
              maxHighlights={singleArtifactSpec.maxProjectHighlights}
              showStacks={singleArtifactSpec.showProjectStacks}
              showDates={singleArtifactSpec.showProjectDates}
              summaryOnly={singleArtifactSpec.projectSummaryOnly}
              compact
            />
          </PrintSection>
        )}

        <PrintSection title="Education & Certifications">
          <div className="space-y-1.5">
            <PrintEducationList education={education} compact />
            {certificates && certificates.length > 0 && (
              <PrintCertificateStrip certificates={certificates} compact />
            )}
          </div>
        </PrintSection>
      </div>
    </main>
  );
}
