export const fullArtifactSpec = {
  showSummary: true,
  showWorkSummaries: true,
  showProjectHighlights: true,
  maxProjectHighlights: 2,
  showProjectStacks: false,
  showProjectDates: false,
  projectSummaryOnly: false,
  skillsColumns: 1,
  skillsLayout: "inline",
} as const;

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
} as const;
