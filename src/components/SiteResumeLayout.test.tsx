import { getResumeVariant } from "@/lib/resume-data";
import { resumeDownloadGroups } from "@/lib/resume-downloads";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteResumeLayout } from "./SiteResumeLayout";

describe("SiteResumeLayout", () => {
  it("renders web-only section navigation without summary cards", () => {
    const resume = getResumeVariant("site");
    const markup = renderToStaticMarkup(
      <SiteResumeLayout
        basics={resume.basics}
        work={resume.work}
        skills={resume.skills}
        education={resume.education}
        projects={resume.projects}
        certificates={resume.certificates}
        publications={resume.publications}
      />,
    );

    expect(markup).toContain("Scroll progress");
    expect(markup).toContain("Resume scroll progress");
    expect(markup).not.toContain('href="#work-experience"');
    expect(markup).not.toContain('href="#projects"');
    expect(markup).not.toContain('href="#skills"');
    expect(markup).not.toContain('href="#education"');
    expect(markup).not.toContain('href="#credentials"');
    expect(markup).not.toContain(
      "Evidence-first roles: start with production AI",
    );
    expect(markup).not.toContain("Selected builds: scan live systems");
    expect(markup).not.toContain("Broad ATS taxonomy: skills stay grouped");
    expect(markup).not.toContain("Education anchors the applied systems work");
    expect(markup).not.toContain("Selected builds");
    for (const group of resumeDownloadGroups) {
      expect(markup).toContain(group.label);
      for (const link of group.links) {
        expect(markup).toContain(`href="${link.href}"`);
        expect(markup).toContain(`aria-label="${link.ariaLabel}"`);
      }
    }
  });
});
