export const siteArtifactSpec = {
  jumpLinks: [
    { id: "work-experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Education" },
    { id: "credentials", label: "Credentials" },
  ],
} as const;

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
