import type { Basics, Education as EducationType, Project, Skill, Work } from "@/lib/schema";
import { singleArtifactSpec } from "@/lib/artifact-specs";
import {
  PrintEducationList,
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
  projects?: Project[];
  className?: string;
};

export function SingleResumeLayout({
  basics,
  work,
  skills,
  education,
  projects,
  className,
}: SingleResumeLayoutProps) {
  return (
    <main className={`resume-print pdf-single mx-auto w-full max-w-[7.65in] p-0 ${className ?? ""}`}>
      <PrintResumeHeader basics={basics} showSummary={singleArtifactSpec.showSummary} compact />

      <div className="mt-3 space-y-3">
        <PrintSection title="Experience">
          <PrintWorkList work={work} showSummaries={singleArtifactSpec.showWorkSummaries} compact />
        </PrintSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-5">
          {skills && skills.length > 0 && (
            <PrintSection title="Skills">
              <PrintSkillList skills={skills} columns={singleArtifactSpec.skillsColumns} />
            </PrintSection>
          )}

          <div className="space-y-3">
            {projects && projects.length > 0 && (
              <PrintSection title="Projects">
                <PrintProjectList
                  projects={projects}
                  showHighlights={singleArtifactSpec.showProjectHighlights}
                  showStacks={singleArtifactSpec.showProjectStacks}
                  compact
                />
              </PrintSection>
            )}

            <PrintSection title="Education">
              <PrintEducationList education={education} compact />
            </PrintSection>
          </div>
        </div>
      </div>
    </main>
  );
}
