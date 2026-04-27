import { Skill } from "@/lib/schema";
import { Section } from "./Section";
import { cn } from "@/lib/utils";

type SkillsProps = {
  skills: Skill[];
};

export function Skills({ skills }: SkillsProps) {
  return (
    <Section title="Skills" className="break-inside-avoid">
      <div className="space-y-3">
        {skills.map((skill, index) => {
          const isPrimary = index === 0;
          const isCore = index > 0 && index < 3;

          return (
            <div
              key={skill.name}
              className={cn(
                "group/skill skill-card interactive-surface card-hover rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5",
                isPrimary && "border-primary/30 bg-card",
                isCore && "bg-background/80",
              )}
            >
              <h3 className="relative z-10 mb-2 font-[family:var(--font-site-heading)] text-sm font-semibold leading-5 text-foreground/90 transition-colors duration-200 group-hover/skill:text-foreground">
                {skill.name}
              </h3>
              <div className="relative z-10 flex flex-wrap gap-1.5">
                {skill.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="interactive-pill skill-pill rounded-full border border-border bg-background px-2.5 py-1 font-[family:var(--font-site-label)] text-[11px] leading-4 text-secondary-foreground group-hover/skill:border-primary/20 group-hover/skill:text-foreground/80"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
