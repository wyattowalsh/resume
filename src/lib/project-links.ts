export type ProjectLink = {
  label: string;
  url: string;
};

type ProjectLinkSource = {
  url?: string;
  githubUrl: string;
  links?: ProjectLink[];
};

export function getProjectUrlLabel(url: string) {
  return getNormalizedHostname(url) === "w4w.dev" ? "Live site" : "Docs";
}

export function getProjectLinks(project: ProjectLinkSource) {
  const explicitLinks = (project.links ?? []).map((link) => ({
    ...link,
    label:
      project.url && link.url === project.url
        ? getProjectUrlLabel(project.url)
        : link.label,
  }));
  const links = [
    ...explicitLinks,
    ...(project.url
      ? [{ label: getProjectUrlLabel(project.url), url: project.url }]
      : []),
    { label: "GitHub", url: project.githubUrl },
  ];

  return links.filter(
    (link, index) =>
      links.findIndex((candidate) => candidate.url === link.url) === index,
  );
}

function getNormalizedHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
