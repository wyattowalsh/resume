import skillDetailsData from "@assets/data/skill-details.json";
import skillIconsData from "@assets/data/skill-icons.json";
import { z } from "zod";

const skillDetailSchema = z.object({
  category: z.string(),
  summary: z.string(),
  resumeContext: z.string(),
  evidence: z.array(
    z.object({
      label: z.string(),
      kind: z.enum(["work", "project", "credential", "publication", "first-party"]),
    }),
  ),
  links: z.array(
    z.object({
      label: z.string(),
      href: z.string().url(),
      kind: z.enum(["official", "docs", "source", "reference", "first-party"]),
    }),
  ),
  verification: z.object({
    status: z.enum(["verified", "needs-review", "unverified"]),
    lastCheckedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const skillIconSchema = z.object({
  category: z.string(),
  iconPath: z.string(),
  sha256: z.string(),
  source: z.enum(["official", "favicon", "legacy", "web-sourced", "custom", "devicon"]),
  sourceUrl: z.string().url(),
  sourceNote: z.string().optional(),
  licenseNote: z.string().optional(),
});

const skillDetailsSchema = z.record(z.string(), skillDetailSchema);
const skillIconsSchema = z.record(z.string(), skillIconSchema);

export type SkillEvidence = z.infer<typeof skillDetailSchema>["evidence"][number];
export type SkillLink = z.infer<typeof skillDetailSchema>["links"][number];
export type SkillIconDetail = {
    path: string;
    source: z.infer<typeof skillIconSchema>["source"];
    sourceUrl: string;
    sha256: string;
    semanticFit: "brand" | "ecosystem" | "conceptual" | "fallback";
};
export type SkillDetail = z.infer<typeof skillDetailSchema> & {
  icon?: SkillIconDetail;
};

const skillDetails = skillDetailsSchema.parse(skillDetailsData);
const skillIcons = skillIconsSchema.parse(skillIconsData);

function getIconSemanticFit(source: z.infer<typeof skillIconSchema>["source"]) {
  if (source === "official") return "brand";
  if (source === "favicon" || source === "legacy") return "brand";
  if (source === "devicon" || source === "web-sourced") return "ecosystem";
  if (source === "custom") return "conceptual";
  return "conceptual";
}

export function getSkillDetail(
  skillName: string,
  category: string,
): SkillDetail | undefined {
  const detail = skillDetails[skillName];

  if (!detail) {
    return undefined;
  }

  return {
    ...detail,
    category: detail.category || category,
    icon: getSkillIcon(skillName),
  };
}

export function getSkillIcon(skillName: string): SkillIconDetail | undefined {
  const icon = skillIcons[skillName];

  if (!icon) {
    return undefined;
  }

  return {
    path: icon.iconPath,
    source: icon.source,
    sourceUrl: icon.sourceUrl,
    sha256: icon.sha256,
    semanticFit: getIconSemanticFit(icon.source),
  };
}

export function getSkillDetails() {
  return skillDetails;
}
