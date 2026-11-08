import { skillCategories } from '../content';
import { Chip } from '../../shared/ui/Chip';
import { PaperCard } from '../../shared/ui/PaperCard';

export function Skills() {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {skillCategories.map((category) => (
        <PaperCard key={category.label} as="article">
          <h3 className="text-[12.5px] font-bold tracking-[0.04em] text-acorn-deep">{category.label}</h3>
          <div className="dotted-leader mt-1.5 mb-3 h-[3px]" aria-hidden />
          <ul className="flex flex-wrap gap-1.5">
            {category.skills.map((skill) => (
              <li key={skill}>
                <Chip>{skill}</Chip>
              </li>
            ))}
          </ul>
        </PaperCard>
      ))}
    </div>
  );
}
