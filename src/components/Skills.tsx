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
            className="border rounded-md p-1.5"
          >
            <h4 className="font-semibold mb-1 text-sm">{skill.name}</h4>
            <div className="flex flex-wrap gap-0.5">
              {skill.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-1.5 py-0.25 bg-secondary text-secondary-foreground rounded-md border skill"
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
