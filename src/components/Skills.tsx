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
          const emphasisLabel = isPrimary
            ? "Primary focus"
            : isCore
              ? "Core capability"
              : null;

          return (
            <div
              key={skill.name}
              className={cn(
                "rounded-xl border border-border/70 bg-card/80 p-3.5 shadow-sm",
                isPrimary && "border-primary/25 bg-primary/5",
                isCore && "border-primary/15",
              )}
            >
              {emphasisLabel && (
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {emphasisLabel}
                </p>
              )}
              <h3 className="mb-2 text-sm font-semibold leading-5">
                {skill.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                {skill.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-border/60 bg-secondary/80 px-2 py-0.5 text-[11px] leading-4 text-secondary-foreground"
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
