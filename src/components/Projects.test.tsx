import { getResumeVariant } from "@/lib/resume-data";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Projects } from "./Projects";

describe("Projects", () => {
  it("renders featured and additional project groupings with metadata", () => {
    const siteProjects = getResumeVariant("site").projects;

    expect(siteProjects).toBeDefined();

    const markup = renderToStaticMarkup(<Projects projects={siteProjects ?? []} />);

    expect(markup).toContain("Featured Projects");
    expect(markup).toContain("More Selected Builds");
    expect(markup).toContain("9 selected AI, data, and product builds.");
    expect(markup).toContain("Jan 2026 - Present");
    expect(markup).toContain("Developer Tooling");
    expect(markup).toContain("GitHub");
    expect(markup).toContain("View 2 proof points + 5 stack items");
    expect(markup).toContain("https://mcp-crawl4ai.w4w.dev/");
  });

  it("keeps a simple layout when there are only a few projects", () => {
    const siteProjects = getResumeVariant("site").projects?.slice(0, 2) ?? [];
    const markup = renderToStaticMarkup(<Projects projects={siteProjects} />);

    expect(markup).not.toContain("Featured Projects");
    expect(markup).not.toContain("More Selected Builds");
    expect(markup).toContain("Jan 2026 - Present");
  });
});
