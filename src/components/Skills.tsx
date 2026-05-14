import skillSectionIcons from "@assets/data/skill-section-icons.json";
import { Skill } from "@/lib/schema";
import { getSkillDetail } from "@/lib/skill-details";
import { Section } from "./Section";
import { SkillPopover } from "./SkillPopover";
import type { IconType } from "react-icons";
import {
  LuBot,
  LuBrainCircuit,
  LuChartLine,
  LuCloud,
  LuCodeXml,
  LuDatabase,
  LuLanguages,
  LuMonitor,
  LuRadioTower,
  LuServer,
  LuShieldCheck,
} from "react-icons/lu";

type SkillsProps = {
  skills: Skill[];
};

const sectionIconRegistry = {
  bot: LuBot,
  "brain-circuit": LuBrainCircuit,
  "chart-line": LuChartLine,
  cloud: LuCloud,
  "code-xml": LuCodeXml,
  database: LuDatabase,
  languages: LuLanguages,
  monitor: LuMonitor,
  "radio-tower": LuRadioTower,
  server: LuServer,
  "shield-check": LuShieldCheck,
} satisfies Record<string, IconType>;

type SectionIconName = keyof typeof sectionIconRegistry;

export function Skills({ skills }: SkillsProps) {
  return (
    <Section title="Skills" className="break-inside-avoid">
      <div className="space-y-3">
        {skills.map((skill) => {
          return (
            <div
              key={skill.name}
              className="group/skill skill-card card-hover interactive-surface flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-start sm:p-5"
            >
              <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
                <SkillSectionIcon sectionName={skill.name} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="relative z-10 mb-2 font-[family:var(--font-site-heading)] text-sm font-semibold leading-5 text-foreground/90 transition-colors duration-200 group-hover/skill:text-foreground">
                  {skill.name}
                </h3>
                <div className="relative z-10 flex flex-wrap gap-1.5">
                  {skill.keywords.map((keyword) => {
                    const detail = getSkillDetail(keyword, skill.name);

                    return (
                      <SkillPopover
                        key={keyword}
                        category={skill.name}
                        detail={detail}
                        iconPath={detail?.icon?.path}
                        skillName={keyword}
                      >
                        {keyword}
                      </SkillPopover>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function SkillSectionIcon({ sectionName }: { sectionName: string }) {
  const iconName = skillSectionIcons[
    sectionName as keyof typeof skillSectionIcons
  ] as SectionIconName | undefined;
  const Icon = sectionIconRegistry[iconName ?? "code-xml"];

  return (
    <Icon
      className="text-primary"
      size={15}
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}
