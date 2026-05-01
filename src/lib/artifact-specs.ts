export interface DocxArtifactPolicy {
  showSummary: boolean;
  showWorkSummaries: boolean;
  showProjectHighlights: boolean;
  showProjectStacks: boolean;
  projectSectionStartsOnNewPage: boolean;
}

export interface ArtifactSpec {
  showSummary: boolean;
  showWorkSummaries: boolean;
  showProjectHighlights: boolean;
  maxProjectHighlights: number;
  showProjectStacks: boolean;
  showProjectDates: boolean;
  projectSummaryOnly: boolean;
  skillsColumns: number;
  skillsLayout: "inline";
  docx: DocxArtifactPolicy;
}

export const fullArtifactSpec = {
  showSummary: true,
  showWorkSummaries: true,
  showProjectHighlights: true,
  maxProjectHighlights: 2,
  showProjectStacks: true,
  showProjectDates: true,
  projectSummaryOnly: false,
  skillsColumns: 1,
  skillsLayout: "inline",
  docx: {
    showSummary: true,
    showWorkSummaries: true,
    showProjectHighlights: true,
    showProjectStacks: true,
    projectSectionStartsOnNewPage: true,
  },
} as const satisfies ArtifactSpec;

export const singleArtifactSpec = {
  showSummary: true,
  showWorkSummaries: false,
  showProjectHighlights: true,
  maxProjectHighlights: 2,
  showProjectStacks: false,
  showProjectDates: false,
  projectSummaryOnly: true,
  skillsColumns: 1,
  skillsLayout: "inline",
  docx: {
    showSummary: true,
    showWorkSummaries: true,
    showProjectHighlights: true,
    showProjectStacks: false,
    projectSectionStartsOnNewPage: false,
  },
} as const satisfies ArtifactSpec;

export const artifactSpecs = {
  full: fullArtifactSpec,
  single: singleArtifactSpec,
} as const;
