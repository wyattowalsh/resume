import skillDetailsData from "@assets/data/skill-details.json";
import { z } from "zod";

const skillLinkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  href: z.string().url().startsWith("https://"),
});

const skillDetailDataSchema = z.object({
  name: z.string().trim().min(1).max(80),
  desc: z.string().trim().min(60).max(320),
  icon: z.string().startsWith("/skill-icons/"),
  links: z.array(skillLinkSchema).min(1),
});

const skillDetailsDataSchema = z.record(z.string(), skillDetailDataSchema);

export type SkillLink = z.infer<typeof skillLinkSchema>;
type SkillDetailData = z.infer<typeof skillDetailDataSchema>;

export type SkillDetail = {
  name: string;
  desc: string;
  icon: {
    path: string;
  };
  links: SkillLink[];
};

const parsedSkillDetails = skillDetailsDataSchema.parse(skillDetailsData);
const skillDetails = resolveSkillDetails(parsedSkillDetails);

export function getSkillDetail(
  skillName: string,
  fallbackCategory?: string,
): SkillDetail | undefined {
  return (
    skillDetails[skillName] ?? getFallbackSkillDetail(skillName, fallbackCategory)
  );
}

export function getSkillDetails(): Record<string, SkillDetail> {
  return skillDetails;
}

function resolveSkillDetails(
  details: Record<string, SkillDetailData>,
): Record<string, SkillDetail> {
  return Object.fromEntries(
    Object.entries(details).map(([skillName, detail]) => {
      if (detail.name !== skillName) {
        throw new Error(
          `Skill detail key "${skillName}" must match its name "${detail.name}".`,
        );
      }

      return [
        skillName,
        {
          desc: detail.desc,
          icon: { path: detail.icon },
          links: detail.links,
          name: detail.name,
        },
      ];
    }),
  );
}

function getFallbackSkillDetail(
  skillName: string,
  fallbackCategory?: string,
): SkillDetail | undefined {
  if (!fallbackCategory) {
    return undefined;
  }

  return {
    desc: `${skillName} is part of Wyatt's ${fallbackCategory.toLowerCase()} toolkit across the roles and projects represented on this page.`,
    icon: { path: "" },
    links: [],
    name: skillName,
  };
}
