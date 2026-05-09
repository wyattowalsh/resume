import skillIcons from "@assets/data/skill-icons.json";
import skillDetailsData from "@assets/data/skill-details.json";
import resumeData from "@assets/data/resume.json";
import skillSectionIcons from "@assets/data/skill-section-icons.json";
import siteVariant from "@assets/data/variants/site.json";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
  "\\badv" + "anced\\b",
  "\\bnov" + "ice\\b",
  "\\bmas" + "tery\\b",
  "\\bscore\\b",
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

const visibleSkillGroups = siteVariant.skills;
const visibleSkills = visibleSkillGroups.flatMap((group) => group.keywords);
const visibleSkillCategories = new Map(
  visibleSkillGroups.flatMap((group) =>
    group.keywords.map((skillName) => [skillName, group.name] as const),
  ),
);
const firstPartyLabels = new Set(visibleSkillGroups.map((group) => group.name));
const evidenceLabelsByKind = {
  work: new Set(resumeData.work.map((entry) => entry.name)),
  project: new Set(resumeData.projects.map((entry) => entry.name)),
  credential: new Set(resumeData.certificates.map((entry) => entry.name)),
  publication: new Set(resumeData.publications.map((entry) => entry.name)),
  "first-party": firstPartyLabels,
};
const sectionIconNames = new Set([
  "bot",
  "brain-circuit",
  "chart-line",
  "cloud",
  "code-xml",
  "database",
  "languages",
  "monitor",
  "radio-tower",
  "server",
  "shield-check",
]);

describe("skill details", () => {
  it("keeps curated interactive skills scoped to visible site skills", () => {
    const visibleSkillSet = new Set(visibleSkills);

    for (const skillName of Object.keys(getSkillDetails())) {
      expect(visibleSkillSet).toContain(skillName);
    }
  });

  it("keeps curated categories and evidence aligned with resume data", () => {
    for (const [skillName, detail] of Object.entries(getSkillDetails())) {
      expect(detail.category, skillName).toBe(
        visibleSkillCategories.get(skillName),
      );

      for (const evidence of detail.evidence) {
        expect(
          evidenceLabelsByKind[evidence.kind],
          `${skillName}: ${evidence.label}`,
        ).toContain(evidence.label);
      }
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

  it("resolves aligned popover detail for every visible skill", () => {
    for (const group of visibleSkillGroups) {
      for (const skillName of group.keywords) {
        const detail = getSkillDetail(skillName, group.name);

        expect(detail, skillName).toBeDefined();
        expect(detail?.category, skillName).toBe(group.name);
        expect(detail?.summary.length, skillName).toBeGreaterThanOrEqual(45);
        expect(detail?.resumeContext.length, skillName).toBeGreaterThanOrEqual(
          45,
        );
        expect(detail?.evidence.length, skillName).toBeGreaterThanOrEqual(1);
        expect(detail?.links.length, skillName).toBeGreaterThanOrEqual(1);
        expect(detail?.icon?.path, skillName).toMatch(/^\/skill-icons\//);
      }
    }
  });

  it("preserves curated references for known high-signal skills", () => {
    expect(getSkillDetail("AMPS", "Streaming")).toMatchObject({
      links: [{ href: "https://crankuptheamps.com/" }],
    });
    expect(getSkillDetail("C++", "Languages & Authoring")).toMatchObject({
      category: "Languages & Authoring",
      links: [{ href: "https://isocpp.org/" }],
    });
    expect(
      getSkillDetail("Deliberately Missing Skill", "Other"),
    ).toBeUndefined();
  });

  it("uses transparent synthetic copy and useful reference links", () => {
    const curatedSkillNames = new Set(Object.keys(getSkillDetails()));

    for (const group of visibleSkillGroups) {
      for (const skillName of group.keywords) {
        if (curatedSkillNames.has(skillName)) continue;

        const detail = getSkillDetail(skillName, group.name);

        expect(detail?.summary, skillName).toBe(
          `${skillName} is listed under ${group.name} on the public resume.`,
        );
        expect(detail?.resumeContext, skillName).toMatch(
          /^This category covers|^This popup has/,
        );
        expect(detail?.resumeContext, skillName).not.toMatch(
          blockedUserFacingPattern,
        );
        expect(detail?.evidence, skillName).toEqual([
          { label: group.name, kind: "first-party" },
        ]);

        for (const link of detail?.links ?? []) {
          expect(link.href, skillName).not.toMatch(
            /^https:\/\/w4w\.dev\/resume#/,
          );
          expect(link.href, skillName).not.toMatch(
            /^https:\/\/www\.w4w\.dev\/resume#/,
          );
          expect(link.label, skillName).not.toBe("Reference");
        }
      }
    }
  });

  it("preserves evidence-sensitive curated entries", () => {
    expect(
      getSkillDetail("Amazon Bedrock", "AI, LLM & Agent Engineering"),
    ).toMatchObject({
      resumeContext:
        "Wyatt used Amazon Bedrock AgentCore in Frame Payments LLM document-intelligence work.",
      evidence: [{ label: "Frame Payments", kind: "work" }],
    });
    expect(
      getSkillDetail("Docker", "Cloud, DevOps & Observability"),
    ).toMatchObject({
      evidence: [{ label: "MCP-Crawl4AI", kind: "project" }],
    });
    expect(
      getSkillDetail("FastAPI", "Backend, APIs & Distributed Systems"),
    ).toMatchObject({
      evidence: [
        { label: "Backend, APIs & Distributed Systems", kind: "first-party" },
      ],
    });
    expect(
      getSkillDetail("Vercel AI SDK", "AI, LLM & Agent Engineering"),
    ).toMatchObject({
      evidence: [{ label: "MDXPad", kind: "project" }],
      links: [{ href: "https://ai-sdk.dev/docs/introduction" }],
    });
    expect(getSkillDetail("SPARQL", "Languages & Authoring")).toMatchObject({
      evidence: [{ label: "Languages & Authoring", kind: "first-party" }],
    });
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

  it("keeps every visible site skill covered by the icon manifest", () => {
    for (const skillName of visibleSkills) {
      expect(skillIcons).toHaveProperty(skillName);
      expect(skillIcons[skillName as keyof typeof skillIcons].iconPath).toMatch(
        /^\/skill-icons\//,
      );
    }
  });

  it("keeps visible skill icon files and hashes in sync", () => {
    for (const skillName of visibleSkills) {
      const icon = skillIcons[skillName as keyof typeof skillIcons];
      const iconPath = join(
        process.cwd(),
        "public",
        icon.iconPath.replace(/^\//, ""),
      );

      expect(existsSync(iconPath), `${skillName}: ${icon.iconPath}`).toBe(true);

      const sha256 = createHash("sha256")
        .update(readFileSync(iconPath))
        .digest("hex");

      expect(sha256, skillName).toBe(icon.sha256);
    }
  });

  it("keeps section icon manifest aligned with visible skill sections", () => {
    expect(Object.keys(skillSectionIcons).sort()).toEqual(
      visibleSkillGroups.map((group) => group.name).sort(),
    );

    for (const [sectionName, iconName] of Object.entries(skillSectionIcons)) {
      expect(sectionIconNames, sectionName).toContain(iconName);
    }
  });
});
