import { useEffect } from 'react';
import { profile, projects, sections } from '../../record/content';
import { OBJECT_VIEWS, VIEW_LABEL, VIEW_SECTION } from '../canvas/views';
import { useWorkshop } from '../store/useWorkshop';

const STEP_MS = 260;
const DWELL_MS = 520;
const FIRST_MS = 220;

const TOTAL = OBJECT_VIEWS.length;

const CV_FILE = profile.resumePdf?.split('/').pop() ?? 'no disponible';

function pieceLabel(view: (typeof OBJECT_VIEWS)[number]): string {
  const section = sections.find((item) => item.id === VIEW_SECTION[view]);
  return `${VIEW_LABEL[view]} · ${section?.label ?? ''}`;
}

const tintOf = (view: (typeof OBJECT_VIEWS)[number]) => sections.find((item) => item.id === VIEW_SECTION[view])?.tint ?? '#8b6f4e';

export function BootScreen({ onDone }: { onDone: () => void }) {
  const placed = useWorkshop((state) => state.placed);
  const setPlaced = useWorkshop((state) => state.setPlaced);
  const mark = useWorkshop((state) => state.mark);

  useEffect(() => {
    if (placed >= TOTAL) return;
    const timer = window.setTimeout(() => setPlaced(placed + 1), placed === 0 ? FIRST_MS : STEP_MS);
    return () => window.clearTimeout(timer);
  }, [placed, setPlaced]);

  useEffect(() => {
    if (placed < TOTAL) return;
    const timer = window.setTimeout(onDone, DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [placed, onDone]);

  const current = placed > 0 ? OBJECT_VIEWS[placed - 1] : null;
  const floating = mark && current && mark.view === current ? mark : null;

  return (
    <div className="fixed inset-0 z-[62] flex flex-col justify-between px-5 pt-6 pb-5 sm:px-8 sm:pb-6">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/75 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />

      <header className="relative flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-porcelain">El taller · montaje de mesa</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-porcelain/60">
          {placed} de {TOTAL}
        </p>
      </header>

      <footer className="relative flex flex-col gap-4">
        <ul aria-hidden className="hidden gap-x-8 gap-y-1 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {OBJECT_VIEWS.map((view, index) => (
            <li key={view} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em]">
              <span
                aria-hidden
                className="inline-block size-2 shrink-0 rounded-full transition-opacity duration-200"
                style={{ backgroundColor: tintOf(view), opacity: placed > index ? 1 : 0.28 }}
              />
              <span className={placed > index ? 'text-porcelain' : 'text-porcelain/45'}>{VIEW_LABEL[view]}</span>
              <span className="text-porcelain/40">{sections.find((item) => item.id === VIEW_SECTION[view])?.label}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p aria-live="polite" className="truncate font-display text-[19px] leading-tight text-porcelain sm:text-[22px]">
              {current ? pieceLabel(current) : 'despejando el tablero…'}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-porcelain/55">
              {sections.length} secciones · {projects.length} proyectos · CV {CV_FILE}
            </p>
            <div aria-hidden className="mt-3 flex gap-1">
              {OBJECT_VIEWS.map((view, index) => (
                <span key={`tramo-${view}`} className="h-1.5 w-7 rounded-full" style={{ backgroundColor: index < placed ? tintOf(view) : '#3a3733' }} />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onDone}
            className="shrink-0 cursor-pointer rounded-full border border-porcelain/40 bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-porcelain transition-colors duration-200 hover:border-porcelain/80 hover:bg-porcelain/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            Saltar arranque
          </button>
        </div>
      </footer>

      {floating ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `clamp(104px, ${floating.x}%, calc(100% - 104px))`, top: `clamp(44px, ${floating.y}%, calc(100% - 214px))` }}
        >
          <span className="piece-label block whitespace-nowrap rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-porcelain shadow-lg" style={{ backgroundColor: tintOf(floating.view) }}>
            {pieceLabel(floating.view)}
          </span>
        </span>
      ) : null}
    </div>
  );
}
