import { getResumeVariant } from "@/lib/resume-data";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Projects } from "./Projects";

describe("Projects", () => {
  it("renders a flat curated project list with metadata", () => {
    const siteProjects = getResumeVariant("site").projects;

    expect(siteProjects).toBeDefined();

    const markup = renderToStaticMarkup(
      <Projects projects={siteProjects ?? []} />,
    );

    expect(markup).not.toContain("Featured Projects");
    expect(markup).not.toContain("More Selected Builds");
    expect(markup).toContain('<time dateTime="2026-01-01">Jan 2026</time>');
    expect(markup).toContain("Present");
    expect(markup).not.toContain("Project proof");
    expect(markup).not.toContain("Stack evidence");
    expect(markup).not.toContain('aria-haspopup="dialog"');
    expect(markup).toContain("GitHub");
    expect(markup).not.toContain("View 2 proof points + 5 stack items");
    expect(markup).not.toContain("FL Studio MCP Server");
    expect(markup).not.toContain("Listentropy");
    expect(markup).toContain("425K+ views and 60K+ downloads");
    expect(markup).toContain("2023-07-06");
    expect(markup).toContain("Live site for Personal Website: w4w.dev");
    expect(markup).not.toContain("Live site for AI Agent Harness Configs");
    expect(markup).not.toContain("Live site for MCP-Crawl4AI");
    expect(markup).not.toContain("Live site for ProxyWhirl");
    expect(markup).toContain("Docs for AI Agent Harness Configs");
    expect(markup).toContain("Docs for MCP-Crawl4AI");
    expect(markup).toContain("Docs for ProxyWhirl");
    expect(markup).toContain("Docs");
    expect(markup).toContain("Kaggle");
    expect(markup).toContain(
      "https://www.kaggle.com/datasets/wyattowalsh/basketball",
    );
    expect(markup).toContain("https://mcp-crawl4ai.w4w.dev/");
    expect(markup.match(/https:\/\/nbadb\.w4w\.dev/g)).toHaveLength(1);
  });

  it("keeps a simple layout when there are only a few projects", () => {
    const siteProjects = getResumeVariant("site").projects?.slice(0, 2) ?? [];
    const markup = renderToStaticMarkup(<Projects projects={siteProjects} />);

    expect(markup).not.toContain("Featured Projects");
    expect(markup).not.toContain("More Selected Builds");
    expect(markup).toContain('<time dateTime="2026-01-01">Jan 2026</time>');
    expect(markup).toContain("Present");
  });
});
