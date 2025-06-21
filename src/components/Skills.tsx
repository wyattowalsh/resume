import { Skill } from '@/lib/schema';
import { Section } from './Section';

type SkillsProps = {
  skills: Skill[];
};

export function Skills({ skills }: SkillsProps) {
  return (
    <Section title="Skills" className="break-inside-avoid">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="border rounded-md p-3"
          >
            <h4 className="font-semibold mb-2 text-sm">{skill.name}</h4>
            <div className="flex flex-wrap gap-1">
              {skill.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-md border"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
