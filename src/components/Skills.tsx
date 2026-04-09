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
						className="border rounded-md p-2.5 bg-card transition-all duration-200 hover:bg-card/80 hover:shadow-md hover:border-primary/20"
					>
						<h3 className="mb-1 text-sm font-semibold">{skill.name}</h3>
						<div className="flex flex-wrap gap-0.5">
							{skill.keywords.map((keyword) => (
								<span
									key={keyword}
									className="rounded-md border bg-secondary px-1.5 py-0.25 text-[11px] leading-4 text-secondary-foreground transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
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
