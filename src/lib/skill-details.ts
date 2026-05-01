import skillDetailsData from "@assets/data/skill-details.json";
import { z } from "zod";

const skillDetailSchema = z.object({
  category: z.string(),
  description: z.string(),
  officialUrl: z.string().url(),
  referenceUrl: z.string().url().optional(),
  evidence: z.array(z.string()).optional(),
});

const skillDetailsSchema = z.record(skillDetailSchema);

export type SkillDetail = z.infer<typeof skillDetailSchema>;

const skillDetails = skillDetailsSchema.parse(skillDetailsData);

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
  };
}

export function getSkillDetails() {
  return skillDetails;
}
