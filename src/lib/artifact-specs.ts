export const fullArtifactSpec = {
  showSummary: true,
  showWorkSummaries: true,
  showProjectHighlights: true,
  showProjectStacks: false,
  skillsColumns: 1,
  skillsLayout: "inline",
} as const;

export const singleArtifactSpec = {
  showSummary: true,
  showWorkSummaries: false,
  showProjectHighlights: true,
  showProjectStacks: false,
  skillsColumns: 1,
  skillsLayout: "inline",
} as const;
