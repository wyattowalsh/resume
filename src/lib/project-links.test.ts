import { describe, expect, it } from "vitest";
import { getProjectLinks, getProjectUrlLabel } from "@/lib/project-links";

describe("project links", () => {
  it("labels only the canonical personal site host as live", () => {
    expect(getProjectUrlLabel("https://w4w.dev")).toBe("Live site");
    expect(getProjectUrlLabel("https://www.w4w.dev")).toBe("Live site");
    expect(getProjectUrlLabel("https://agents.w4w.dev")).toBe("Docs");
    expect(getProjectUrlLabel("https://proxywhirl.com")).toBe("Docs");
    expect(getProjectUrlLabel("not a url")).toBe("Docs");
  });

  it("preserves explicit links before generated docs and GitHub links", () => {
    expect(
      getProjectLinks({
        url: "https://agents.w4w.dev",
        githubUrl: "https://github.com/wyattowalsh/agents",
        links: [
          {
            label: "Reference",
            url: "https://example.com/reference",
          },
        ],
      }),
    ).toEqual([
      {
        label: "Reference",
        url: "https://example.com/reference",
      },
      {
        label: "Docs",
        url: "https://agents.w4w.dev",
      },
      {
        label: "GitHub",
        url: "https://github.com/wyattowalsh/agents",
      },
    ]);
  });

  it("uses the canonical generated label when exact URLs are duplicated", () => {
    expect(
      getProjectLinks({
        url: "https://agents.w4w.dev",
        githubUrl: "https://github.com/wyattowalsh/agents",
        links: [
          {
            label: "Docs portal",
            url: "https://agents.w4w.dev",
          },
        ],
      }),
    ).toEqual([
      {
        label: "Docs",
        url: "https://agents.w4w.dev",
      },
      {
        label: "GitHub",
        url: "https://github.com/wyattowalsh/agents",
      },
    ]);
  });
});
