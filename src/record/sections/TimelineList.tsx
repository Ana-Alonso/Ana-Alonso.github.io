import type { InfoBlock } from '../../shared/types';
import { TONE_COLOR, splitBody } from './timelineModel';

export function TimelineList({ blocks }: { blocks: InfoBlock[] }) {
  return (
    <ol className="relative space-y-6 pl-6">
      <span aria-hidden className="dotted-column absolute top-1 bottom-1 left-0 w-[2px]" />
      {blocks.map((block) => {
        const color = TONE_COLOR[block.tone ?? 'primary'];
        const { prose, items } = splitBody(block.body);
        return (
          <li key={`${block.title}-${block.period ?? ''}`} className="relative">
            <span
              aria-hidden
              className="absolute top-[6px] -left-6 size-2.5 rounded-full border border-paper"
              style={{ backgroundColor: color }}
            />
            {block.period && (
              <p className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">{block.period}</p>
            )}
            <h3 className="mt-1 text-[16px] leading-snug font-bold text-ink">{block.title}</h3>
            {block.subtitle && (
              <p className="text-[13px] font-semibold" style={{ color }}>
                {block.subtitle}
              </p>
            )}
            {prose && <p className="mt-2 text-[13.5px] leading-relaxed text-ink/85">{prose}</p>}
            {items.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {items.map((item) => (
                  <li key={item} className="flex gap-2 text-[13.5px] leading-relaxed text-ink/85">
                    <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
