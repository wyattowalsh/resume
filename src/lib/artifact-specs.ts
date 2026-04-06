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
  showProjectStacks: true,
  skillsColumns: 2,
} as const;

export const singleArtifactSpec = {
  showSummary: false,
  showWorkSummaries: false,
  showProjectHighlights: false,
  showProjectStacks: true,
  skillsColumns: 2,
} as const;
