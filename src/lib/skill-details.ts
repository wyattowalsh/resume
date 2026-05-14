import skillDetailsData from "@assets/data/skill-details.json";
import { z } from "zod";

const skillLinkSchema = z.object({
  label: z.string(),
  href: z.string().url(),
});

const skillDetailSchema = z.object({
  name: z.string(),
  desc: z.string(),
  icon: z.string().startsWith("/skill-icons/"),
  links: z.array(skillLinkSchema),
});

const skillDetailsSchema = z.record(z.string(), skillDetailSchema);

export type SkillLink = z.infer<typeof skillLinkSchema>;
export type SkillIconDetail = {
  path: string;
};
export type SkillDetail = Omit<z.infer<typeof skillDetailSchema>, "icon"> & {
  icon: SkillIconDetail;
};

const skillDetails = skillDetailsSchema.parse(skillDetailsData);

export function getSkillDetail(
  skillName: string,
  fallbackCategory?: string,
): SkillDetail | undefined {
  const detail = skillDetails[skillName];

  if (!detail) {
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

  return {
    desc: detail.desc,
    icon: { path: detail.icon },
    links: detail.links,
    name: detail.name,
  };
}

export function getSkillIcon(skillName: string): SkillIconDetail | undefined {
  const detail = skillDetails[skillName];

  if (!detail) {
    return undefined;
  }

  return {
    path: detail.icon,
  };
}

export function getSkillDetails(): Record<string, SkillDetail> {
  return Object.fromEntries(
    Object.entries(skillDetails).map(([skillName, detail]) => [
      skillName,
      {
        desc: detail.desc,
        icon: { path: detail.icon },
        links: detail.links,
        name: detail.name,
      },
    ]),
  );
}
