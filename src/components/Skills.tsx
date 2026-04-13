import { Skill } from "@/lib/schema";
import { Section } from "./Section";
import { cn } from "@/lib/utils";

type SkillsProps = {
  skills: Skill[];
};

export function Skills({ skills }: SkillsProps) {
  return (
    <Section title="Skills" className="break-inside-avoid">
      <div className="space-y-2.5">
        {skills.map((skill, index) => {
          const isPrimary = index === 0;
          const isCore = index > 0 && index < 3;

          return (
            <div
              key={skill.name}
              className={cn(
                "card-hover rounded-[1.25rem] border border-border/65 bg-card/80 p-3.5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] ring-1 ring-white/30",
                isPrimary && "border-primary/20 bg-primary/[0.06] shadow-[0_22px_44px_-30px_rgba(15,23,42,0.4)] ring-primary/10",
                isCore && "border-primary/10 bg-background/80",
              )}
            >
              <h3 className="mb-2 text-sm font-semibold leading-5 text-foreground/90">
                {skill.name}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skill.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-border/55 bg-background/85 px-2.5 py-1 text-[11px] leading-4 text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
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
