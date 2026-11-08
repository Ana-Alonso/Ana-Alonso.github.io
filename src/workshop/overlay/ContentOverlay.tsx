import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { countLabel, profile, sections } from '../../record/content';
import { About } from '../../record/sections/About';
import { Contact } from '../../record/sections/Contact';
import { Education } from '../../record/sections/Education';
import { Experience } from '../../record/sections/Experience';
import { Languages } from '../../record/sections/Languages';
import { Projects } from '../../record/sections/Projects';
import { Skills } from '../../record/sections/Skills';
import { PillButton, PillLink } from '../../shared/ui/Chip';
import { useWorkshop } from '../store/useWorkshop';
import { useSurfaceFocus } from '../surfaces/useSurfaceFocus';
import { usePublishOverlaySize } from './size';
import { useOverlayEdge, useSurfaceKind } from '../surfaces/useSurfaceKind';
import { surfacePortrait } from '../surfaces/layout';
import { useSurfaceScroll } from '../surfaces/useSurfaceScroll';
import { OBJECT_VIEWS, VIEWS, VIEW_LABEL, VIEW_SECTION, type ViewId } from '../canvas/views';
import type { ComponentType } from 'react';
import type { SectionId } from '../../shared/types';

const CONTENT: Record<SectionId, ComponentType> = {
  about: About,
  experience: Experience,
  education: Education,
  skills: Skills,
  projects: Projects,
  languages: Languages,
  contact: Contact,
};

const STRIP_BUTTON =
  'inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-acorn/45 bg-paper px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-acorn-deep transition-colors duration-200 hover:bg-moss/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-deep';

const SURFACE_LINKS: Partial<Record<SectionId, { href: string; label: string }[]>> = {
  about: profile.resumePdf ? [{ href: profile.resumePdf, label: 'Descargar CV' }] : undefined,
};

function SurfaceCopy({ sectionId }: { sectionId: SectionId }) {
  const Content = CONTENT[sectionId];
  const setFocusedHref = useSurfaceFocus((state) => state.set);
  const links = SURFACE_LINKS[sectionId];

  return (
    <div
      className="sr-only"
      onFocusCapture={(event) => {
        const anchor = (event.target as HTMLElement).closest?.('a[href]');
        setFocusedHref(anchor ? anchor.getAttribute('href') : null);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusedHref(null);
      }}
    >
      <h2>{sections.find((item) => item.id === sectionId)?.label}</h2>
      <Content />
      {links?.map((link) => (
        <PillLink key={link.href} href={link.href} download={link.href.endsWith('.pdf') ? link.label : undefined} target="_blank" rel="noreferrer">
          {link.label}
        </PillLink>
      ))}
    </div>
  );
}

export function ViewAnnouncement() {
  const view = useWorkshop((state) => state.view);
  const label = sections.find((item) => item.id === VIEW_SECTION[view])?.label;
  return <p aria-live="polite" className="sr-only">{label ? `${VIEW_LABEL[view]} — ${label}` : VIEW_LABEL[view]}</p>;
}

const PAGE_UNIT: Partial<Record<ViewId, string>> = { blueprint: 'Plano', logbook: 'Pág.' };

function SheetPager({ view }: { view: ViewId }) {
  const tex = VIEWS[view].screen?.tex[1] ?? 0;
  const owns = useSurfaceScroll((state) => state.view === view);
  const offset = useSurfaceScroll((state) => state.offset);
  const max = useSurfaceScroll((state) => state.max);
  const pages = owns && tex > 0 ? Math.round(max / tex) + 1 : 0;
  const page = owns ? Math.round(offset / tex) : 0;
  if (pages < 2) return null;

  const turn = (dir: 1 | -1) => {
    const scroll = useSurfaceScroll.getState();
    scroll.scrollBy(view, (dir * tex) / scroll.scale);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => turn(-1)}
        disabled={page <= 0}
        aria-label={`Hoja anterior de ${PAGE_UNIT[view] ?? 'la superficie'}`}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-acorn/40 bg-paper text-muted transition-colors duration-200 hover:bg-moss/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-deep disabled:pointer-events-none disabled:opacity-35"
      >
        <ChevronLeft size={17} aria-hidden />
      </button>
      <span className="min-w-[86px] text-center font-mono text-[11px] tracking-[0.1em] text-acorn-deep uppercase">
        {(PAGE_UNIT[view] ?? 'Hoja') + ' ' + (page + 1) + ' / ' + pages}
      </span>
      <button
        type="button"
        onClick={() => turn(1)}
        disabled={page >= pages - 1}
        aria-label={`Hoja siguiente de ${PAGE_UNIT[view] ?? 'la superficie'}`}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-acorn/40 bg-paper text-muted transition-colors duration-200 hover:bg-moss/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-deep disabled:pointer-events-none disabled:opacity-35"
      >
        <ChevronRight size={17} aria-hidden />
      </button>
    </div>
  );
}

function Drawer({ sectionId }: { sectionId: SectionId }) {
  const view = useWorkshop((state) => state.view);
  const overview = useWorkshop((state) => state.overview);
  const edge = useOverlayEdge(view);
  const caption = usePublishOverlaySize('caption');
  const drawer = useRef<HTMLDivElement>(null);
  const expand = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const [choice, setChoice] = useState<{ view: ViewId; open: boolean } | null>(null);
  const section = sections.find((item) => item.id === sectionId);

  useEffect(() => {
    drawer.current?.focus();
  }, []);

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    expand.current?.focus();
  }, [choice]);

  if (!section) return null;

  const Content = CONTENT[sectionId];
  const folded = edge === 'sheet' && !(choice?.view === view ? choice.open : !surfacePortrait(view));

  return (
    <div ref={caption} className="pointer-events-none fixed inset-x-2 bottom-2 z-50 flex items-end sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-4 sm:items-start">
      <div
        ref={drawer}
        tabIndex={-1}
        role="region"
        aria-labelledby="workshop-drawer-title"
        className={`pointer-events-auto relative flex w-auto flex-col overflow-hidden rounded-[18px] border bg-paper outline-none transition-[max-height] duration-300 ease-out ${
          folded ? 'max-h-[32dvh]' : 'max-h-[78dvh]'
        } sm:max-h-full sm:w-[min(460px,44vw)]`}
        style={{
          borderColor: `${section.tint}66`,
          boxShadow: '0 22px 46px -18px rgba(15,16,20,0.55)',
        }}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: section.tint, opacity: 0.9 }} />

        {/* Barra táctil de arrastre / Handle para móvil */}
        <div
          aria-hidden="true"
          onClick={() => setChoice((prev) => ({ view, open: !(prev?.view === view ? prev.open : false) }))}
          className="sm:hidden flex items-center justify-center pt-2 pb-1 cursor-pointer"
        >
          <span className="w-10 h-1 rounded-full bg-acorn/35" />
        </div>

        <header className="flex items-center gap-3 px-4 sm:px-5 pt-2 sm:pt-4 pb-3">
          <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${section.tint}66`, backgroundColor: section.wash, color: section.tint }}>
            <section.icon size={17} strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="workshop-drawer-title" className="font-display text-[19px] leading-tight text-acorn-deep">
              {section.label}
            </h2>
            <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
              {VIEW_LABEL[view]} · pieza {String(OBJECT_VIEWS.indexOf(view as (typeof OBJECT_VIEWS)[number]) + 1).padStart(2, '0')} de{' '}
              {String(OBJECT_VIEWS.length).padStart(2, '0')}
            </p>
          </div>
          <button
            type="button"
            onClick={overview}
            aria-label="Volver a la vista general del taller"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-acorn/40 bg-paper text-muted transition-colors duration-200 max-sm:size-11 hover:bg-moss/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-deep"
          >
            <X size={15} aria-hidden />
          </button>
        </header>

        <div className="dotted-leader mx-5 h-[3px] shrink-0" aria-hidden />

        {folded ? (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-3">
            <p className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">
              {countLabel(sectionId)}
            </p>
            {VIEWS[view].screen?.paged ? <SheetPager view={view} /> : null}
            <button type="button" ref={expand} onClick={() => setChoice({ view, open: true })} className={STRIP_BUTTON}>
              Texto completo
            </button>
          </div>
        ) : (
          <>
            <div className="scroll-area overflow-y-auto px-5 py-4 text-ink">
              <Content />
            </div>

            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-acorn/25 bg-oat/40 px-5 py-3">
              {profile.resumePdf ? (
                <PillLink href={profile.resumePdf} download="Ana_Alonso_resume.pdf" target="_blank" rel="noreferrer" icon={Download} variant="solid" compact>
                  Descargar CV
                </PillLink>
              ) : (
                <span />
              )}
              {edge === 'sheet' ? (
                <button
                  type="button"
                  onClick={() => {
                    refocus.current = true;
                    setChoice({ view, open: false });
                  }}
                  className={STRIP_BUTTON}
                >
                  Ocultar
                </button>
              ) : null}
              <PillButton compact onClick={overview}>
                Vista general
              </PillButton>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

export function ContentOverlay() {
  const view = useWorkshop((state) => state.view);
  const sectionId = VIEW_SECTION[view];
  const kind = useSurfaceKind(view);

  if (!sectionId) return null;

  return kind === 'full' ? <SurfaceCopy sectionId={sectionId} /> : <Drawer sectionId={sectionId} />;
}
