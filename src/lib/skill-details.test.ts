import skillIcons from "@assets/data/skill-icons.json";
import skillDetailsData from "@assets/data/skill-details.json";
import resumeData from "@assets/data/resume.json";
import skillSectionIcons from "@assets/data/skill-section-icons.json";
import siteVariant from "@assets/data/variants/site.json";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
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
  "\\bno dedicated implementation\\b",
  "\\bproject-specific\\b",
  "\\bdoes not name\\b",
  "\\bnot named\\b",
  "\\bvisible .* skill group\\b",
  "\\bbroader language toolkit\\b",
] as const;

const blockedUserFacingPattern = new RegExp(
  blockedUserFacingFragments.join("|"),
  "i",
);

const genericContextTemplatePattern = new RegExp(
  [
    "is framed with AI systems work spanning model integration",
    "appears with coding-assistant surfaces",
    "sits in the modeling toolkit around feature work",
    "is positioned with data-platform work across pipelines",
    "belongs to the real-time systems cluster",
    "is part of the backend systems cluster",
    "sits with interface tools for React apps",
    "belongs to the delivery and operations stack",
    "appears with quality and architecture practices",
    "is part of the implementation and authoring set",
  ].join("|"),
  "i",
);

const repeatedSmallWordPattern = /\b(a|an|and|for|in|of|the|to|with) \1\b/i;

const firstPartyOnlyUsagePattern =
  /\b(Wyatt|production|public-site|publishing path|integration)\b/i;

const genericPopoverMetaPattern = new RegExp(
  [
    "\\bthis popup\\b",
    "\\bfor readers\\b",
    "\\bappears here\\b",
    "\\bserves as shorthand\\b",
    "\\bcontext uses\\b",
    "\\bmarks\\b",
    "\\bnames\\b",
    "\\bidentifies\\b",
    "\\brefers to\\b",
    "\\bskill group\\b",
    "\\bfor this popover\\b",
    "\\bread .+ here as\\b",
    "\\bgrouping treats\\b",
  ].join("|"),
  "i",
);

const overlapStopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "part",
  "public",
  "resume",
  "skill",
  "skills",
  "the",
  "to",
  "visible",
  "with",
  "work",
  "works",
  "wyatt",
]);

const meaningfulWords = (copy: string) =>
  copy
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !overlapStopWords.has(word));

const copyOverlapRatio = (left: string, right: string) => {
  const leftWords = new Set(meaningfulWords(left));
  const rightWords = new Set(meaningfulWords(right));
  const unionWords = new Set([...leftWords, ...rightWords]);

  if (unionWords.size === 0) return 0;

  let sharedWords = 0;

  for (const word of leftWords) {
    if (rightWords.has(word)) sharedWords += 1;
  }

  return sharedWords / unionWords.size;
};

const visibleSkillGroups = siteVariant.skills;
const visibleSkills = visibleSkillGroups.flatMap((group) => group.keywords);
const visibleSkillCategories = new Map(
  visibleSkillGroups.flatMap((group) =>
    group.keywords.map((skillName) => [skillName, group.name] as const),
  ),
);
const firstPartyLabels = new Set(visibleSkillGroups.map((group) => group.name));
const resumeClaimLabels = [
  ...resumeData.work.map((entry) => entry.name),
  ...resumeData.projects.map((entry) => entry.name),
  ...resumeData.certificates.map((entry) => entry.name),
  ...resumeData.publications.map((entry) => entry.name),
].filter((label) => label.length >= 6);
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
const blockedWordmarkIconSources = [
  "python-logo-master-v3-TM.png",
  "Tableau_Logo.png",
  "Logo-white.png",
  "pandera-banner.png",
  "xgboost-logo-trimmed.png",
  "go-logo-blue.svg",
  "Gnu-bash-logo.svg",
] as const;

const mentionedResumeEvidenceLabels = (copy: string) =>
  resumeClaimLabels.filter((label) => copy.includes(label));

const detectIconExtension = (bytes: Buffer) => {
  const textPrefix = bytes
    .subarray(0, 256)
    .toString("utf8")
    .trimStart()
    .toLowerCase();

  if (textPrefix.startsWith("<svg") || textPrefix.startsWith("<?xml")) {
    return "svg";
  }

  if (
    bytes
      .subarray(0, 8)
      .compare(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ) === 0
  ) {
    return "png";
  }

  if (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }

  if (
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    (bytes[2] === 0x01 || bytes[2] === 0x02) &&
    bytes[3] === 0x00
  ) {
    return "ico";
  }

  return "unknown";
};

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
      expect(detail.summary, skillName).not.toMatch(repeatedSmallWordPattern);
      expect(detail.resumeContext, skillName).not.toMatch(
        repeatedSmallWordPattern,
      );

      const resolved = getSkillDetail(skillName, detail.category);

      expect(resolved?.icon?.path).toMatch(/^\/skill-icons\//);
    }
  });

  it("keeps curated popover copy specific and non-repetitive", () => {
    const resumeContextOwners = new Map<string, string>();

    for (const [skillName, detail] of Object.entries(getSkillDetails())) {
      const isFirstPartyOnly =
        detail.evidence.length === 1 &&
        detail.evidence[0]?.kind === "first-party";

      expect(detail.resumeContext, skillName).not.toMatch(
        genericContextTemplatePattern,
      );
      expect(detail.summary, skillName).not.toMatch(genericPopoverMetaPattern);
      expect(detail.resumeContext, skillName).not.toMatch(
        genericPopoverMetaPattern,
      );

      if (isFirstPartyOnly) {
        expect(detail.resumeContext, skillName).not.toMatch(
          firstPartyOnlyUsagePattern,
        );
      }

      const displayedEvidenceLabels = new Set(
        detail.evidence.map((evidence) => evidence.label),
      );

      for (const mentionedLabel of mentionedResumeEvidenceLabels(
        detail.resumeContext,
      )) {
        expect(
          displayedEvidenceLabels,
          `${skillName} mentions ${mentionedLabel} without visible evidence`,
        ).toContain(mentionedLabel);
      }

      expect(
        copyOverlapRatio(detail.summary, detail.resumeContext),
        skillName,
      ).toBeLessThan(0.52);

      const existingOwner = resumeContextOwners.get(detail.resumeContext);

      expect(
        existingOwner,
        `${skillName} duplicates resumeContext from ${existingOwner}`,
      ).toBeUndefined();

      resumeContextOwners.set(detail.resumeContext, skillName);
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
        "Frame Payments uses Bedrock AgentCore in LLM document-intelligence work for merchant review and confidential uploads.",
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

      for (const blockedSource of blockedWordmarkIconSources) {
        expect(entry.sourceUrl).not.toContain(blockedSource);
      }
    }

    expect(skillIcons.Python.iconPath).toBe("/skill-icons/python.svg");
    expect(skillIcons.Python.sourceUrl).toBe(
      "https://docs.python.org/3/_static/py.svg",
    );
    expect(skillIcons.Python.sourceUrl).not.toContain(
      "python-logo-master-v3-TM.png",
    );
    expect(
      readFileSync(
        join(process.cwd(), "public/skill-icons/python.svg"),
        "utf8",
      ),
    ).toMatch(/<svg[^>]+viewBox="0 0 16 16"/);
    expect(skillIcons.React.sourceUrl).toContain("react-original.svg");
    expect(skillIcons.AWS.sourceUrl).toMatch(/^https:\/\//);
  });

  it("keeps wordmark-prone icons compact and readable", () => {
    expect(skillIcons.AMPS).toMatchObject({
      iconPath: "/skill-icons/amps.ico",
      sourceUrl: "https://crankuptheamps.com/img/favicon.ico",
    });
    expect(skillIcons.Bash.sourceUrl).toContain("cdn.simpleicons.org/gnubash");
    expect(skillIcons.Go.sourceUrl).toContain("/icons/go/go-original.svg");
    expect(skillIcons["Market Data Systems"].sourceUrl).toContain(
      "fixtrading.org",
    );
    expect(skillIcons.Pandera.sourceUrl).toContain("pandera-favicon.png");
    expect(skillIcons.q).toMatchObject({
      iconPath: "/skill-icons/q.png",
      sourceUrl: "https://code.kx.com/q/local/favicon.ico",
    });
    expect(skillIcons.Tableau).toMatchObject({
      iconPath: "/skill-icons/tableau.ico",
      sourceUrl:
        "https://www.tableau.com/themes/custom/tableau_www/favicon.ico",
    });
    expect(skillIcons.XGBoost).toMatchObject({
      iconPath: "/skill-icons/xgboost.png",
      sourceUrl: "https://xgboost.ai/images/logo/dmlc-logo-square.png",
    });
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

  it("keeps visible skill icon file extensions aligned with bytes", () => {
    for (const skillName of visibleSkills) {
      const icon = skillIcons[skillName as keyof typeof skillIcons];
      const iconPath = join(
        process.cwd(),
        "public",
        icon.iconPath.replace(/^\//, ""),
      );
      const bytes = readFileSync(iconPath);
      const extension = extname(icon.iconPath).replace(/^\./, "");

      expect(extension, skillName).toBe(detectIconExtension(bytes));
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
