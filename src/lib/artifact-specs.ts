export const fullArtifactSpec = {
  showSummary: true,
  showWorkSummaries: true,
  showProjectHighlights: true,
  maxProjectHighlights: 1,
  showProjectStacks: false,
  showProjectDates: true,
  projectSummaryOnly: false,
  skillsColumns: 1,
  skillsLayout: "inline",
} as const;

export const singleArtifactSpec = {
  showSummary: true,
  showWorkSummaries: false,
  showProjectHighlights: false,
  maxProjectHighlights: 0,
  showProjectStacks: false,
  showProjectDates: false,
  projectSummaryOnly: true,
  skillsColumns: 1,
  skillsLayout: "inline",
} as const;
