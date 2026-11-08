import { languages, sections } from '../content';
import { PALETTE } from '../../shared/theme';
import { PaperCard } from '../../shared/ui/PaperCard';

const LANG = sections.find((section) => section.id === 'languages');
const TINT = LANG?.tint ?? PALETTE.blushDeep;
const WASH = LANG?.wash ?? PALETTE.blush;

const BEADS = 10;

export function Languages() {
  return (
    <div className="space-y-3.5">
      {languages.map((language) => {
        const filled = Math.round((language.proficiency / 100) * BEADS);
        return (
          <PaperCard key={language.name} as="article" tint={TINT}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[15.5px] font-bold text-ink">{language.name}</h3>
              <span className="text-[12px] font-bold tracking-[0.06em] uppercase" style={{ color: TINT }}>
                {language.level}
                {language.cefr ? ` · ${language.cefr}` : ''}
              </span>
            </div>
            <div
              className="mt-3 flex items-center gap-1.5"
              role="img"
              aria-label={`${language.name}: ${language.level}, ${filled} de ${BEADS}`}
            >
              {Array.from({ length: BEADS }).map((_, i) => (
                <span
                  key={i}
                  className="size-3.5 rounded-full border"
                  style={{
                    borderColor: i < filled ? TINT : `${PALETTE.acorn}59`,
                    backgroundColor: i < filled ? TINT : WASH,
                  }}
                  aria-hidden
                />
              ))}
            </div>
          </PaperCard>
        );
      })}
    </div>
  );
}
