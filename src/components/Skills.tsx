import { Skill } from "@/lib/schema";
import { getSkillDetail } from "@/lib/skill-details";
import { Section } from "./Section";
import { SkillPopover } from "./SkillPopover";
import { FaCode } from "react-icons/fa";

type SkillsProps = {
  skills: Skill[];
};

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
                <FaCode className="text-primary" size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="relative z-10 mb-2 font-[family:var(--font-site-heading)] text-sm font-semibold leading-5 text-foreground/90 transition-colors duration-200 group-hover/skill:text-foreground">
                  {skill.name}
                </h3>
                <div className="relative z-10 flex flex-wrap gap-1.5">
                  {skill.keywords.map((keyword) => {
                    const detail = getSkillDetail(keyword, skill.name);

                    return detail ? (
                      <SkillPopover
                        key={keyword}
                        detail={detail}
                        skillName={keyword}
                      >
                        {keyword}
                      </SkillPopover>
                    ) : (
                      <StaticSkillChip key={keyword}>{keyword}</StaticSkillChip>
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

function StaticSkillChip({ children }: { children: string }) {
  return (
    <span className="skill-pill inline-flex min-h-11 items-center rounded-full border border-border bg-background px-3 py-1.5 font-[family:var(--font-site-label)] text-[11px] leading-4 text-secondary-foreground sm:min-h-0 sm:px-2.5 sm:py-1">
      {children}
    </span>
  );
}
