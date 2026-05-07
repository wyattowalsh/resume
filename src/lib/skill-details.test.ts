import skillIcons from "@assets/data/skill-icons.json";
import skillDetailsData from "@assets/data/skill-details.json";
import siteVariant from "@assets/data/variants/site.json";
import { describe, expect, it } from "vitest";
import { getSkillDetail, getSkillDetails } from "./skill-details";

const blockedUserFacingFragments = [
  "\\bconfiden" + "ce\\b",
  "\\bdir" + "ect\\b",
  "\\binfer" + "red\\b",
  "\\badj" + "acent\\b",
  "\\bresume sig" + "nal\\b",
  "\\bprofici" + "ency\\b",
  "\\brat" + "ing\\b",
  "\\bexp" + "ert\\b",
  "\\bbegin" + "ner\\b",
  "\\bstrong sig" + "nal\\b",
  "\\bweak sig" + "nal\\b",
  "\\brelevant to\\b",
  "\\bsignals\\b",
  "\\bsupports\\b",
  "\\bconnects\\b",
] as const;

const blockedUserFacingPattern = new RegExp(
  blockedUserFacingFragments.join("|"),
  "i",
);

describe("skill details", () => {
  it("keeps curated interactive skills scoped to visible site skills", () => {
    const visibleSkills = new Set(
      siteVariant.skills.flatMap((group) => group.keywords),
    );

    for (const skillName of Object.keys(getSkillDetails())) {
      expect(visibleSkills).toContain(skillName);
    }
  });

  it("keeps curated popover copy compact and evidence-backed", () => {
    for (const [skillName, detail] of Object.entries(getSkillDetails())) {
      expect(detail.summary).not.toMatch(/part of this resume/i);
      expect(detail.summary).not.toContain(detail.category);
      expect(detail.summary.length).toBeGreaterThanOrEqual(45);
      expect(detail.summary.length).toBeLessThanOrEqual(140);
      expect(detail.resumeContext.length).toBeGreaterThanOrEqual(45);
      expect(detail.resumeContext.length).toBeLessThanOrEqual(170);
      expect(detail.evidence.length).toBeGreaterThanOrEqual(1);
      expect(detail.links.length).toBeGreaterThanOrEqual(1);
      expect(detail.verification.lastCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(detail.summary).not.toMatch(blockedUserFacingPattern);
      expect(detail.resumeContext).not.toMatch(blockedUserFacingPattern);

      const resolved = getSkillDetail(skillName, detail.category);

      expect(resolved?.icon?.path).toMatch(/^\/skill-icons\//);
    }
  });

  it("uses neutral source evidence without relative-quality fields", () => {
    const serializedDetails = JSON.stringify(skillDetailsData);

    expect(serializedDetails).not.toMatch(blockedUserFacingPattern);

    for (const detail of Object.values(getSkillDetails())) {
      expect(detail).toHaveProperty("resumeContext");
      expect(detail).not.toHaveProperty("resume" + "Relevance");

      for (const evidence of detail.evidence) {
        expect(Object.keys(evidence).sort()).toEqual(["kind", "label"]);
      }
    }
  });

  it("only makes curated skills interactive", () => {
    expect(getSkillDetail("AMPS", "Streaming")).toMatchObject({
      links: [{ href: "https://crankuptheamps.com/" }],
    });
    expect(getSkillDetail("R", "Languages & Authoring")).toBeUndefined();
  });

  it("uses non-generic web-sourced skill icons", () => {
    for (const entry of Object.values(skillIcons)) {
      expect(entry.source).not.toBe("font-awesome");
      expect(entry.source).not.toBe("simple-icons");
    }

    expect(skillIcons.Python.source).toBe("official");
    expect(skillIcons.Python.sourceUrl).toContain("python.org");
    expect(skillIcons.React.sourceUrl).toContain("react-original.svg");
    expect(skillIcons.AWS.sourceUrl).toMatch(/^https:\/\//);
  });
});
