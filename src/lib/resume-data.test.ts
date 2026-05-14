import fullVariantData from "@assets/data/variants/full.json";
import singleVariantData from "@assets/data/variants/single.json";
import siteVariantData from "@assets/data/variants/site.json";
import resumeData from "@assets/data/resume.json";
import { describe, expect, it } from "vitest";
import { getResumeVariant, type ResumeVariantName } from "./resume-data";
import { getSkillDetail, getSkillDetails } from "./skill-details";

interface WorkSelection {
  name: string;
  summary?: string | null;
  highlightIndexes?: number[];
}

interface BasicsSelection {
  summary?: string | null;
  label?: string | null;
  image?: string | null;
}

interface ProjectSelection {
  name: string;
  description?: string;
  highlightIndexes?: number[];
}

interface SkillSelection {
  name: string;
  keywords?: string[];
}

function pickByIndexes<T>(values: T[], indexes?: number[]) {
  return indexes ? indexes.map((index) => values[index]) : values;
}

function pickByValues<T extends string>(
  values: T[],
  selectedValues?: string[],
) {
  return selectedValues ? selectedValues.map((value) => value as T) : values;
}

function getVariantSkillKeywords(variantName: ResumeVariantName) {
  return (
    getResumeVariant(variantName).skills?.flatMap((skill) => skill.keywords) ??
    []
  );
}

function getBaseWork(name: string) {
  const item = resumeData.work.find((entry) => entry.name === name);

  expect(item).toBeDefined();
  return item!;
}

function getBaseProject(name: string) {
  const item = resumeData.projects?.find((entry) => entry.name === name);

  expect(item).toBeDefined();
  return item!;
}

function getBaseSkill(name: string) {
  const item = resumeData.skills?.find((entry) => entry.name === name);

  expect(item).toBeDefined();
  return item!;
}

function getBaseCertificate(name: string) {
  const item = resumeData.certificates?.find((entry) => entry.name === name);

  expect(item).toBeDefined();
  return item!;
}

function getBasePublication(name: string) {
  const item = resumeData.publications?.find((entry) => entry.name === name);

  expect(item).toBeDefined();
  return item!;
}

function getBaseEducation(institution: string) {
  const item = resumeData.education.find(
    (entry) => entry.institution === institution,
  );

  expect(item).toBeDefined();
  return item!;
}

const allVariantNames: ResumeVariantName[] = ["site", "full", "single"];
const variantDataByName = {
  site: siteVariantData,
  full: fullVariantData,
  single: singleVariantData,
} as const;

describe("getResumeVariant", () => {
  describe("memoization", () => {
    it("returns the same reference on repeated calls", () => {
      expect(getResumeVariant("full")).toBe(getResumeVariant("full"));
    });

    it("returns distinct objects for different variant names", () => {
      expect(getResumeVariant("full")).not.toBe(getResumeVariant("single"));
      expect(getResumeVariant("site")).not.toBe(getResumeVariant("full"));
    });
  });

  describe("variant name property", () => {
    it.each(allVariantNames)(
      'sets the name property to "%s"',
      (variantName) => {
        expect(getResumeVariant(variantName).name).toBe(variantName);
      },
    );
  });

  describe("basics", () => {
    it("applies basics overrides by variant config", () => {
      const baseBasics = resumeData.basics as typeof resumeData.basics &
        BasicsSelection;
      const variantBasicsMap = {
        site: siteVariantData.basics as BasicsSelection | undefined,
        full: fullVariantData.basics as BasicsSelection | undefined,
        single: singleVariantData.basics as BasicsSelection | undefined,
      } as const satisfies Record<
        ResumeVariantName,
        BasicsSelection | undefined
      >;

      for (const name of allVariantNames) {
        const resolved = getResumeVariant(name).basics;
        const overrides = variantBasicsMap[name];

        expect(resolved.summary).toBe(
          overrides?.summary === undefined
            ? baseBasics.summary
            : (overrides.summary ?? undefined),
        );
        expect(resolved.label).toBe(
          overrides?.label === undefined
            ? baseBasics.label
            : (overrides.label ?? undefined),
        );
        expect(resolved.image).toBe(
          overrides?.image === undefined
            ? baseBasics.image
            : (overrides.image ?? undefined),
        );
      }
    });

    it("preserves non-curated basics fields across all variants", () => {
      for (const name of allVariantNames) {
        const resolved = getResumeVariant(name);

        expect(resolved.basics.name).toBe(resumeData.basics.name);
        expect(resolved.basics.email).toBe(resumeData.basics.email);
        expect(resolved.basics.phone).toBe(resumeData.basics.phone);
        expect(resolved.basics.url).toBe(resumeData.basics.url);
        expect(resolved.basics.location).toEqual(resumeData.basics.location);
        expect(resolved.basics.profiles).toEqual(resumeData.basics.profiles);
      }
    });
  });

  describe("work selections", () => {
    it("resolves full-artifact work selections in declared order", () => {
      const expectedWork = (
        (fullVariantData.work ?? []) as WorkSelection[]
      ).map((selection) => {
        const baseJob = getBaseWork(selection.name);

        return {
          ...baseJob,
          ...(selection.summary === undefined
            ? {}
            : {
                summary: selection.summary ?? undefined,
              }),
          highlights: pickByIndexes(
            baseJob.highlights,
            selection.highlightIndexes,
          ),
        };
      });

      expect(getResumeVariant("full").work).toEqual(expectedWork);
    });

    it("resolves site work selections with correct highlight filtering", () => {
      const expectedWork = (
        (siteVariantData.work ?? []) as WorkSelection[]
      ).map((selection) => {
        const baseJob = getBaseWork(selection.name);

        return {
          ...baseJob,
          ...(selection.summary === undefined
            ? {}
            : {
                summary: selection.summary ?? undefined,
              }),
          highlights: pickByIndexes(
            baseJob.highlights,
            selection.highlightIndexes,
          ),
        };
      });

      expect(getResumeVariant("site").work).toEqual(expectedWork);
    });

    it("resolves single work selections with fewer employers", () => {
      const single = getResumeVariant("single");
      const singleWorkNames = (
        (singleVariantData.work ?? []) as WorkSelection[]
      ).map((s) => s.name);

      expect(single.work).toHaveLength(singleWorkNames.length);
      expect(single.work.map((w) => w.name)).toEqual(singleWorkNames);
    });

    it("curates highlight counts per work entry rather than passing all", () => {
      const full = getResumeVariant("full");

      for (const selection of (fullVariantData.work ?? []) as WorkSelection[]) {
        const resolved = full.work.find((w) => w.name === selection.name);
        const base = getBaseWork(selection.name);

        expect(resolved).toBeDefined();

        if (selection.highlightIndexes) {
          expect(resolved!.highlights).toHaveLength(
            selection.highlightIndexes.length,
          );
          expect(resolved!.highlights.length).toBeLessThanOrEqual(
            base.highlights.length,
          );
        } else {
          expect(resolved!.highlights).toEqual(base.highlights);
        }
      }
    });
  });

  describe("project selections", () => {
    it("resolves single-artifact projects from configured indexes", () => {
      const single = getResumeVariant("single");
      const expectedProjects = (
        (singleVariantData.projects ?? []) as ProjectSelection[]
      ).map((selection) => {
        const baseProject = getBaseProject(selection.name);

        return {
          ...baseProject,
          description: selection.description ?? baseProject.description,
          highlights: pickByIndexes(
            baseProject.highlights,
            selection.highlightIndexes,
          ),
        };
      });

      expect(single.projects).toEqual(expectedProjects);
    });

    it("resolves full-artifact projects with curated highlights", () => {
      const full = getResumeVariant("full");
      const expectedProjects = (
        (fullVariantData.projects ?? []) as ProjectSelection[]
      ).map((selection) => {
        const baseProject = getBaseProject(selection.name);

        return {
          ...baseProject,
          description: selection.description ?? baseProject.description,
          highlights: pickByIndexes(
            baseProject.highlights,
            selection.highlightIndexes,
          ),
        };
      });

      expect(full.projects).toEqual(expectedProjects);
    });

    it("separates NBA Basketball Database public Kaggle stats from rebuild highlights", () => {
      const full = getResumeVariant("full");
      const nbadb = full.projects?.find(
        (project) => project.name === "NBA Basketball Database",
      );

      expect(nbadb).toBeDefined();
      expect(nbadb!.description).toContain("full-season game and play-by-play history");
      expect(nbadb!.description).not.toMatch(/freez|2023-07-06/i);
      expect(nbadb!.highlights.join(" ")).toContain("broad extractor coverage");
      expect(nbadb!.highlights.join(" ")).toContain(
        "generated public star-schema outputs",
      );
    });

    it("resolves site-artifact projects with curated highlights", () => {
      const site = getResumeVariant("site");
      const expectedProjects = (
        (siteVariantData.projects ?? []) as ProjectSelection[]
      ).map((selection) => {
        const baseProject = getBaseProject(selection.name);

        return {
          ...baseProject,
          description: selection.description ?? baseProject.description,
          highlights: pickByIndexes(
            baseProject.highlights,
            selection.highlightIndexes,
          ),
        };
      });

      expect(site.projects).toEqual(expectedProjects);
    });

    it("resolves empty highlight indexes to no highlights", () => {
      const baseProject = getBaseProject("NBA Basketball Database");

      expect(pickByIndexes(baseProject.highlights, [])).toEqual([]);
      expect(pickByIndexes(baseProject.highlights, undefined)).toEqual(
        baseProject.highlights,
      );
    });
  });

  describe("skill selections", () => {
    it("resolves single-artifact skills from configured keywords", () => {
      const single = getResumeVariant("single");
      const expectedSkills = (
        (singleVariantData.skills ?? []) as SkillSelection[]
      ).map((selection) => {
        const baseSkill = getBaseSkill(selection.name);

        return {
          ...baseSkill,
          keywords: pickByValues(baseSkill.keywords, selection.keywords),
        };
      });

      expect(single.skills).toEqual(expectedSkills);
    });

    it("resolves full-artifact skills with curated keywords", () => {
      const full = getResumeVariant("full");
      const expectedSkills = (
        (fullVariantData.skills ?? []) as SkillSelection[]
      ).map((selection) => {
        const baseSkill = getBaseSkill(selection.name);

        return {
          ...baseSkill,
          keywords: pickByValues(baseSkill.keywords, selection.keywords),
        };
      });

      expect(full.skills).toEqual(expectedSkills);
    });

    it("resolves site-artifact skills with curated keywords", () => {
      const site = getResumeVariant("site");
      const expectedSkills = (
        (siteVariantData.skills ?? []) as SkillSelection[]
      ).map((selection) => {
        const baseSkill = getBaseSkill(selection.name);

        return {
          ...baseSkill,
          keywords: pickByValues(baseSkill.keywords, selection.keywords),
        };
      });

      expect(site.skills).toEqual(expectedSkills);
    });

    it("curates keyword counts per skill rather than passing all", () => {
      const full = getResumeVariant("full");

      for (const selection of (fullVariantData.skills ??
        []) as SkillSelection[]) {
        const resolved = full.skills?.find((s) => s.name === selection.name);
        const base = getBaseSkill(selection.name);

        expect(resolved).toBeDefined();

        if (selection.keywords) {
          expect(resolved!.keywords).toHaveLength(selection.keywords.length);
          expect(resolved!.keywords.length).toBeLessThanOrEqual(
            base.keywords.length,
          );
        } else {
          expect(resolved!.keywords).toEqual(base.keywords);
        }
      }
    });

    it.each(allVariantNames)(
      'does not duplicate skill keywords in "%s" skills section',
      (variantName) => {
        const keywords = getVariantSkillKeywords(variantName);
        const duplicateKeywords = keywords.filter(
          (keyword, index) => keywords.indexOf(keyword) !== index,
        );

        expect(duplicateKeywords).toEqual([]);
      },
    );
  });

  describe("skill metadata", () => {
    it("resolves metadata for high-signal web skill popovers", () => {
      expect(getSkillDetail("AMPS")).toMatchObject({
        name: "AMPS",
      });
      expect(getSkillDetail("AMPS")?.links).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ href: "https://crankuptheamps.com/" }),
          expect.objectContaining({ href: "https://github.com/60East" }),
        ]),
      );
      expect(getSkillDetail("AI Agent Skills")).toMatchObject({
        name: "AI Agent Skills",
      });
      expect(getSkillDetail("AI Agent Skills")?.links).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            href: "https://agentskills.io/specification",
          }),
          expect.objectContaining({
            href: "https://github.com/anthropics/skills",
          }),
        ]),
      );
    });

    it("generates safe fallback metadata for skills without curated copy", () => {
      expect(
        getSkillDetail("Deliberately Missing Skill", "Other"),
      ).toMatchObject({
        desc: expect.stringContaining(
          "Deliberately Missing Skill is part of Wyatt's other toolkit across",
        ),
        links: [],
        name: "Deliberately Missing Skill",
      });
    });

    it("keeps metadata scoped to skills in the master taxonomy", () => {
      const allKeywords = new Set(
        resumeData.skills?.flatMap((skill) => skill.keywords) ?? [],
      );

      for (const keyword of Object.keys(getSkillDetails())) {
        expect(allKeywords).toContain(keyword);
      }
    });
  });

  describe("selection metadata passthrough", () => {
    it("preserves work selection hints on curated entries", () => {
      const full = getResumeVariant("full");
      const frame = full.work.find((job) => job.name === "Frame Payments");
      const baseFrame = getBaseWork("Frame Payments");

      expect(frame?.selectionHints).toEqual(baseFrame.selectionHints);
    });

    it("preserves project selection hints on curated entries", () => {
      const full = getResumeVariant("full");
      const project = full.projects?.find(
        (entry) => entry.name === "AI Agent Harness Configs",
      );
      const baseProject = getBaseProject("AI Agent Harness Configs");

      expect(project?.selectionHints).toEqual(baseProject.selectionHints);
    });

    it("preserves skill selection hints on curated entries", () => {
      const full = getResumeVariant("full");
      const skill = full.skills?.find(
        (entry) => entry.name === "AI, LLM & Agent Engineering",
      );
      const baseSkill = getBaseSkill("AI, LLM & Agent Engineering");

      expect(skill?.selectionHints).toEqual(baseSkill.selectionHints);
    });
  });

  describe("education selections", () => {
    it("preserves single-artifact education order from the variant file", () => {
      const expectedEducation = (singleVariantData.education ?? []).map(
        (institution) => getBaseEducation(institution),
      );

      expect(getResumeVariant("single").education).toEqual(expectedEducation);
    });

    it("resolves full-artifact education in declared order", () => {
      const expectedEducation = (fullVariantData.education ?? []).map(
        (institution) => getBaseEducation(institution),
      );

      expect(getResumeVariant("full").education).toEqual(expectedEducation);
    });

    it("resolves site education in declared order", () => {
      const expectedEducation = (siteVariantData.education ?? []).map(
        (institution) => getBaseEducation(institution),
      );

      expect(getResumeVariant("site").education).toEqual(expectedEducation);
    });
  });

  describe("certificate selections", () => {
    it("resolves full-artifact certificates by name", () => {
      const full = getResumeVariant("full");
      const expectedCertificates = (fullVariantData.certificates ?? []).map(
        (name) => getBaseCertificate(name),
      );

      expect(full.certificates).toEqual(expectedCertificates);
    });

    it("resolves site certificates by name", () => {
      const site = getResumeVariant("site");
      const expectedCertificates = (siteVariantData.certificates ?? []).map(
        (name) => getBaseCertificate(name),
      );

      expect(site.certificates).toEqual(expectedCertificates);
    });

    it("resolves single-artifact certificates by name", () => {
      const single = getResumeVariant("single");
      const expectedCertificates = (singleVariantData.certificates ?? []).map(
        (name) => getBaseCertificate(name),
      );

      expect(single.certificates).toEqual(expectedCertificates);
    });

    it("preserves certificate ordering from the full variant config", () => {
      const full = getResumeVariant("full");
      const baseCertCount = resumeData.certificates?.length ?? 0;
      const fullCertificateNames = (fullVariantData.certificates ??
        []) as string[];

      expect(full.certificates!.length).toBeLessThanOrEqual(baseCertCount);
      expect(full.certificates!.map((certificate) => certificate.name)).toEqual(
        fullCertificateNames,
      );
    });
  });

  describe("publication selections", () => {
    it("resolves full-artifact publications by name", () => {
      const full = getResumeVariant("full");
      const expectedPublications = (fullVariantData.publications ?? []).map(
        (name) => getBasePublication(name),
      );

      expect(full.publications).toEqual(expectedPublications);
    });

    it("resolves site publications by name including all three articles", () => {
      const site = getResumeVariant("site");
      const expectedPublications = (siteVariantData.publications ?? []).map(
        (name) => getBasePublication(name),
      );

      expect(site.publications).toEqual(expectedPublications);
      // site selects all 3 publications
      expect(site.publications).toHaveLength(3);
    });

    it("resolves to empty array when variant selects no publications", () => {
      // single.json has publications: []
      expect(singleVariantData.publications).toEqual([]);
      expect(getResumeVariant("single").publications).toEqual([]);
    });

    it("preserves publication ordering from the variant config", () => {
      const full = getResumeVariant("full");
      const fullPubNames = (fullVariantData.publications ?? []) as string[];

      expect(full.publications!.map((p) => p.name)).toEqual(fullPubNames);
    });
  });

  describe("SEO pass-through", () => {
    it("passes through SEO description for site variant", () => {
      const site = getResumeVariant("site");

      expect(site.seo).toBeDefined();
      expect(site.seo!.description).toBe(siteVariantData.seo?.description);
    });

    it("does not include SEO when variant config omits it", () => {
      expect(fullVariantData).not.toHaveProperty("seo");
      expect(getResumeVariant("full").seo).toBeUndefined();

      expect(singleVariantData).not.toHaveProperty("seo");
      expect(getResumeVariant("single").seo).toBeUndefined();
    });
  });

  describe("variant referential integrity", () => {
    it("every work name in each variant config exists in the base resume", () => {
      const baseWorkNames = new Set(resumeData.work.map((w) => w.name));

      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const selection of (variant.work ?? []) as WorkSelection[]) {
          expect(baseWorkNames).toContain(selection.name);
        }
      }
    });

    it("every project name in each variant config exists in the base resume", () => {
      const baseProjectNames = new Set(
        resumeData.projects?.map((p) => p.name) ?? [],
      );

      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const selection of ((variant as Record<string, unknown>)
          .projects ?? []) as ProjectSelection[]) {
          expect(baseProjectNames).toContain(selection.name);
        }
      }
    });

    it("every skill name in each variant config exists in the base resume", () => {
      const baseSkillNames = new Set(
        resumeData.skills?.map((s) => s.name) ?? [],
      );

      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const selection of ((variant as Record<string, unknown>).skills ??
          []) as SkillSelection[]) {
          expect(baseSkillNames).toContain(selection.name);
        }
      }
    });

    it("every education institution in each variant config exists in the base resume", () => {
      const baseInstitutions = new Set(
        resumeData.education.map((e) => e.institution),
      );

      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const institution of (variant.education ?? []) as string[]) {
          expect(baseInstitutions).toContain(institution);
        }
      }
    });

    it("every certificate name in each variant config exists in the base resume", () => {
      const baseCertNames = new Set(
        resumeData.certificates?.map((c) => c.name) ?? [],
      );

      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const certName of (variant.certificates ?? []) as string[]) {
          expect(baseCertNames).toContain(certName);
        }
      }
    });

    it("every publication name in each variant config exists in the base resume", () => {
      const basePubNames = new Set(
        resumeData.publications?.map((p) => p.name) ?? [],
      );

      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const pubName of (variant.publications ?? []) as string[]) {
          expect(basePubNames).toContain(pubName);
        }
      }
    });

    it("every highlightIndex in work selections is within bounds", () => {
      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const selection of (variant.work ?? []) as WorkSelection[]) {
          if (selection.highlightIndexes) {
            const base = getBaseWork(selection.name);

            for (const index of selection.highlightIndexes) {
              expect(index).toBeLessThan(base.highlights.length);
              expect(index).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    });

    it("every highlightIndex in project selections is within bounds", () => {
      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const selection of ((variant as Record<string, unknown>)
          .projects ?? []) as ProjectSelection[]) {
          if (selection.highlightIndexes) {
            const base = getBaseProject(selection.name);

            for (const index of selection.highlightIndexes) {
              expect(index).toBeLessThan(base.highlights.length);
              expect(index).toBeGreaterThanOrEqual(0);
            }
          }
        }
      }
    });

    it("keeps project highlight prose in canonical resume data", () => {
      for (const [variantName, variant] of Object.entries(variantDataByName)) {
        for (const selection of ((variant as Record<string, unknown>)
          .projects ?? []) as Array<Record<string, unknown>>) {
          expect(
            selection.highlights,
            `${variantName}:${selection.name}`,
          ).toBeUndefined();
        }
      }
    });

    it("every selected skill keyword exists in its base skill category", () => {
      for (const variant of [
        fullVariantData,
        siteVariantData,
        singleVariantData,
      ]) {
        for (const selection of ((variant as Record<string, unknown>).skills ??
          []) as SkillSelection[]) {
          if (selection.keywords) {
            const base = getBaseSkill(selection.name);

            for (const keyword of selection.keywords) {
              expect(base.keywords).toContain(keyword);
            }
          }
        }
      }
    });
  });

  describe("all variants resolve without error", () => {
    it.each(allVariantNames)(
      'resolves "%s" variant without throwing',
      (variantName) => {
        expect(() => getResumeVariant(variantName)).not.toThrow();
      },
    );

    it.each(allVariantNames)(
      '"%s" variant includes all required top-level sections',
      (variantName) => {
        const resolved = getResumeVariant(variantName);

        expect(resolved).toHaveProperty("basics");
        expect(resolved).toHaveProperty("work");
        expect(resolved).toHaveProperty("education");
        expect(resolved).toHaveProperty("projects");
        expect(resolved).toHaveProperty("skills");
        expect(resolved).toHaveProperty("certificates");
        expect(resolved).toHaveProperty("publications");
        expect(resolved).toHaveProperty("name");
      },
    );
  });
});
