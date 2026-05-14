import skillDetailsData from "@assets/data/skill-details.json";
import skillIcons from "@assets/data/skill-icons.json";
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
] as const;

const blockedUserFacingPattern = new RegExp(
  blockedUserFacingFragments.join("|"),
  "i",
);

const blockedResumeContextFragments = [
  "\\bWyatt\\b",
  "\\bJPMorgan\\b",
  "\\bFrame Payments\\b",
  "\\bGap forecasting\\b",
  "\\bListentropy\\b",
  "\\bSandLabs\\b",
  "\\bMCP-Crawl4AI\\b",
  "\\bAI Agent Harness Configs\\b",
  "\\bNBA Basketball Database\\b",
  "\\bbasketball database\\b",
  "\\bPersonal Website\\b",
  "\\bpersonal-site\\b",
  "\\bportfolio\\b",
  "\\bresume\\b",
  "\\bon this page\\b",
  "\\broles and projects\\b",
  "\\bmerchant\\b",
  "\\banalyst\\b",
  "\\btrader\\b",
  "\\bpublished\\b",
  "\\bopen-sourced\\b",
  "\\bAWS Certified\\b",
  "\\bdocument-intelligence\\b",
  "\\bconfidential\\b",
  "\\bPII\\b",
  "\\bStealth Web3\\b",
  "\\bMDXPad\\b",
  "\\bProxyWhirl\\b",
  "\\bIINA\\b",
  "\\bFL Studio\\b",
  "\\bAI/ML Web Feeds\\b",
] as const;

const blockedResumeContextPattern = new RegExp(
  blockedResumeContextFragments.join("|"),
  "i",
);

const repeatedSmallWordPattern = /\b(a|an|and|for|in|of|the|to|with) \1\b/i;

const blockedWordmarkIconSources = [
  "python-logo-master-v3-TM.png",
  "Tableau_Logo.png",
  "Logo-white.png",
  "pandera-banner.png",
  "xgboost-logo-trimmed.png",
  "go-logo-blue.svg",
  "Gnu-bash-logo.svg",
] as const;

const expectSkillLink = (skillName: string, href: string) => {
  expect(getSkillDetail(skillName)?.links, skillName).toEqual(
    expect.arrayContaining([expect.objectContaining({ href })]),
  );
};

const getReferenceDomain = (href: string) => {
  const hostname = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
  const parts = hostname.split(".");

  if (parts.length <= 2) {
    return hostname;
  }

  const suffix = parts.slice(-2).join(".");

  if (suffix === "github.io" || suffix === "readthedocs.io") {
    return parts.slice(-3).join(".");
  }

  return suffix;
};

const visibleSkillGroups = siteVariant.skills;
const visibleSkills = visibleSkillGroups.flatMap((group) => group.keywords);
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
  it("keeps the simplified display manifest scoped to visible site skills", () => {
    expect(Object.keys(getSkillDetails()).sort()).toEqual(
      [...visibleSkills].sort(),
    );

    for (const [skillName, detail] of Object.entries(getSkillDetails())) {
      expect(detail.name).toBe(skillName);
    }
  });

  it("uses only the display fields needed by skill popovers", () => {
    const serializedDetails = JSON.stringify(skillDetailsData);

    expect(serializedDetails).not.toMatch(
      /"summary"|"resumeContext"|"evidence"|"verification"|"kind"/,
    );

    for (const [skillName, detail] of Object.entries(skillDetailsData)) {
      expect(Object.keys(detail).sort(), skillName).toEqual([
        "desc",
        "icon",
        "links",
        "name",
      ]);
      expect(detail.name, skillName).toBe(skillName);
      expect(detail.icon, skillName).toBe(
        skillIcons[skillName as keyof typeof skillIcons].iconPath,
      );
      expect(detail.links.length, skillName).toBeGreaterThanOrEqual(1);
    }

    for (const [skillName, detail] of Object.entries(getSkillDetails())) {
      expect(Object.keys(detail).sort(), skillName).toEqual([
        "desc",
        "icon",
        "links",
        "name",
      ]);
      expect(detail.desc.length, skillName).toBeGreaterThanOrEqual(60);
      expect(detail.desc.length, skillName).toBeLessThanOrEqual(320);
      expect(detail.desc, skillName).not.toMatch(blockedUserFacingPattern);
      expect(detail.desc, skillName).not.toMatch(blockedResumeContextPattern);
      expect(detail.desc, skillName).not.toMatch(repeatedSmallWordPattern);
      expect(detail.icon?.path, skillName).toMatch(/^\/skill-icons\//);
      expect(detail.links.length, skillName).toBeGreaterThanOrEqual(1);
      expect(
        new Set(detail.links.map((link) => getReferenceDomain(link.href))).size,
        skillName,
      ).toBe(detail.links.length);

      for (const link of detail.links) {
        expect(Object.keys(link).sort(), skillName).toEqual(["href", "label"]);
        expect(link.href, skillName).toMatch(/^https:\/\//);
        expect(link.label, skillName).not.toBe("");
        expect(link.label.length, skillName).toBeLessThanOrEqual(40);
      }
    }
  });

  it("resolves one popover detail shape for every visible skill", () => {
    for (const skillName of visibleSkills) {
      const detail = getSkillDetail(skillName);

      expect(detail, skillName).toBeDefined();
      expect(detail?.name, skillName).toBe(skillName);
      expect(detail?.desc.length, skillName).toBeGreaterThanOrEqual(60);
      expect(detail?.links.length, skillName).toBeGreaterThanOrEqual(1);
      expect(detail?.icon?.path, skillName).toBe(
        skillIcons[skillName as keyof typeof skillIcons].iconPath,
      );
    }
  });

  it("preserves curated references for known high-signal skills", () => {
    expectSkillLink("AMPS", "https://crankuptheamps.com/");
    expectSkillLink("AMPS", "https://github.com/60East");
    expect(getSkillDetail("C++")).toMatchObject({
      name: "C++",
    });
    expectSkillLink("C++", "https://isocpp.org/");
    expectSkillLink(
      "Google Gemini API",
      "https://ai.google.dev/gemini-api/docs",
    );
    expectSkillLink(
      "OpenAI API",
      "https://developers.openai.com/api/docs/overview",
    );
    expectSkillLink("NotebookLM", "https://notebooklm.google/");
    expectSkillLink(
      "Statistical Modeling",
      "https://www.nist.gov/publications/handbook-151-nistsematech-e-handbook-statistical-methods",
    );
    expect(getSkillDetail("Deliberately Missing Skill", "Other")).toMatchObject(
      {
        desc: expect.stringContaining(
          "Deliberately Missing Skill is part of Wyatt's other toolkit across",
        ),
        links: [],
        name: "Deliberately Missing Skill",
      },
    );
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
