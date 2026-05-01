import { getResumeVariant } from "@/lib/resume-data";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkExperience } from "./WorkExperience";

describe("WorkExperience", () => {
  it("renders experience content without role popover triggers", () => {
    const work = getResumeVariant("site").work;
    const markup = renderToStaticMarkup(<WorkExperience work={work} />);

    expect(markup).toContain("Senior AI/ML Engineer");
    expect(markup).toContain("Frame Payments");
    expect(markup).not.toContain("Role evidence");
    expect(markup).not.toContain("aria-haspopup=\"dialog\"");
    expect(markup).not.toContain("tooltip-only");
  });
});
