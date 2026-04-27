import fullVariantData from "@assets/data/variants/full.json";
import singleVariantData from "@assets/data/variants/single.json";
import siteVariantData from "@assets/data/variants/site.json";
import resumeData from "@assets/data/resume.json";
import { z } from "zod";
import {
  imageSchema,
  resumeSchema,
  type Basics,
  type Certificate,
  type Education,
  type Project,
  type Publication,
  type Resume,
  type Skill,
  type Work,
} from "./schema";

const indexSchema = z.number().int().nonnegative();

const basicsOverridesSchema = z.object({
  summary: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  image: imageSchema.nullable().optional(),
});

const namedSelectionSchema = z.object({
  name: z.string(),
});

const workSelectionSchema = namedSelectionSchema.extend({
  summary: z.string().nullable().optional(),
  highlightIndexes: z.array(indexSchema).optional(),
});

const projectSelectionSchema = namedSelectionSchema.extend({
  description: z.string().optional(),
  highlightIndexes: z.array(indexSchema).optional(),
  highlights: z.array(z.string()).optional(),
});

const skillSelectionSchema = namedSelectionSchema.extend({
  keywordIndexes: z.array(indexSchema).optional(),
});

const variantSeoSchema = z.object({
  description: z.string().optional(),
});

const resumeVariantSchema = z.object({
  basics: basicsOverridesSchema.optional(),
  work: z.array(workSelectionSchema).optional(),
  education: z.array(z.string()).optional(),
  projects: z.array(projectSelectionSchema).optional(),
  skills: z.array(skillSelectionSchema).optional(),
  certificates: z.array(z.string()).optional(),
  publications: z.array(z.string()).optional(),
  seo: variantSeoSchema.optional(),
});

const baseResume = resumeSchema.parse(resumeData);

const variantConfigs = {
  site: resumeVariantSchema.parse(siteVariantData),
  full: resumeVariantSchema.parse(fullVariantData),
  single: resumeVariantSchema.parse(singleVariantData),
} as const;

type ResumeVariantConfig = z.infer<typeof resumeVariantSchema>;

export type ResumeVariantName = keyof typeof variantConfigs;
export type ResumeVariantSeo = z.infer<typeof variantSeoSchema>;

export type ResolvedResumeVariant = Pick<
  Resume,
  | "basics"
  | "work"
  | "education"
  | "projects"
  | "skills"
  | "certificates"
  | "publications"
> & {
  name: ResumeVariantName;
  seo?: ResumeVariantSeo;
};

const resolvedVariantCache = new Map<
  ResumeVariantName,
  ResolvedResumeVariant
>();

function pickByIndexes<T>(
  values: T[],
  indexes: number[] | undefined,
  sectionLabel: string,
) {
  if (!indexes) {
    return values;
  }

  return indexes.map((index) => {
    const value = values[index];

    if (value === undefined) {
      throw new Error(`Invalid ${sectionLabel} index "${index}".`);
    }

    return value;
  });
}

function getItemByKey<T>(
  items: T[],
  expectedKey: string,
  keySelector: (item: T) => string,
  sectionLabel: string,
) {
  const match = items.find((item) => keySelector(item) === expectedKey);

  if (!match) {
    throw new Error(`Unknown ${sectionLabel} entry "${expectedKey}".`);
  }

  return match;
}

function resolveBasics(
  basics: Basics,
  overrides: ResumeVariantConfig["basics"],
): Basics {
  if (!overrides) {
    return basics;
  }

  const resolvedBasics: Basics = {
    ...basics,
  };

  if (overrides.summary !== undefined) {
    resolvedBasics.summary = overrides.summary ?? undefined;
  }

  if (overrides.label !== undefined) {
    resolvedBasics.label = overrides.label ?? undefined;
  }

  if (overrides.image !== undefined) {
    resolvedBasics.image = overrides.image ?? undefined;
  }

  return resolvedBasics;
}

function resolveWork(
  work: Work[],
  selections: ResumeVariantConfig["work"],
): Work[] {
  if (!selections) {
    return work;
  }

  return selections.map((selection) => {
    const baseJob = getItemByKey(
      work,
      selection.name,
      (item) => item.name,
      "work",
    );

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
        `work highlight for ${baseJob.name}`,
      ),
    };
  });
}

function resolveProjects(
  projects: Project[] | undefined,
  selections: ResumeVariantConfig["projects"],
): Project[] | undefined {
  if (!projects) {
    return undefined;
  }

  if (!selections) {
    return projects;
  }

  return selections.map((selection) => {
    const baseProject = getItemByKey(
      projects,
      selection.name,
      (item) => item.name,
      "project",
    );

    return {
      ...baseProject,
      description: selection.description ?? baseProject.description,
      highlights:
        selection.highlights ??
        pickByIndexes(
          baseProject.highlights,
          selection.highlightIndexes,
          `project highlight for ${baseProject.name}`,
        ),
    };
  });
}

function resolveSkills(
  skills: Skill[] | undefined,
  selections: ResumeVariantConfig["skills"],
): Skill[] | undefined {
  if (!skills) {
    return undefined;
  }

  if (!selections) {
    return skills;
  }

  return selections.map((selection) => {
    const baseSkill = getItemByKey(
      skills,
      selection.name,
      (item) => item.name,
      "skill",
    );

    return {
      ...baseSkill,
      keywords: pickByIndexes(
        baseSkill.keywords,
        selection.keywordIndexes,
        `skill keyword for ${baseSkill.name}`,
      ),
    };
  });
}

function resolveEducation(
  education: Education[],
  selectedInstitutions: string[] | undefined,
): Education[] {
  if (!selectedInstitutions) {
    return education;
  }

  return selectedInstitutions.map((institution) =>
    getItemByKey(
      education,
      institution,
      (item) => item.institution,
      "education",
    ),
  );
}

function resolveCertificates(
  certificates: Certificate[] | undefined,
  selectedNames: string[] | undefined,
): Certificate[] | undefined {
  if (!certificates) {
    return undefined;
  }

  if (!selectedNames) {
    return certificates;
  }

  return selectedNames.map((name) =>
    getItemByKey(certificates, name, (item) => item.name, "certificate"),
  );
}

function resolvePublications(
  publications: Publication[] | undefined,
  selectedNames: string[] | undefined,
): Publication[] | undefined {
  if (!publications) {
    return undefined;
  }

  if (!selectedNames) {
    return publications;
  }

  return selectedNames.map((name) =>
    getItemByKey(publications, name, (item) => item.name, "publication"),
  );
}

function buildVariant(name: ResumeVariantName): ResolvedResumeVariant {
  const config = variantConfigs[name];

  return {
    name,
    basics: resolveBasics(baseResume.basics, config.basics),
    work: resolveWork(baseResume.work, config.work),
    education: resolveEducation(baseResume.education, config.education),
    skills: resolveSkills(baseResume.skills, config.skills),
    projects: resolveProjects(baseResume.projects, config.projects),
    certificates: resolveCertificates(
      baseResume.certificates,
      config.certificates,
    ),
    publications: resolvePublications(
      baseResume.publications,
      config.publications,
    ),
    seo: config.seo,
  };
}

export function getResumeVariant(
  name: ResumeVariantName,
): ResolvedResumeVariant {
  const cachedVariant = resolvedVariantCache.get(name);

  if (cachedVariant) {
    return cachedVariant;
  }

  const resolvedVariant = buildVariant(name);
  resolvedVariantCache.set(name, resolvedVariant);
  return resolvedVariant;
}
