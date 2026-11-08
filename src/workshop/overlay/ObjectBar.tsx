import { ArrowUpLeft, Download, Moon, Sun, Terminal, Volume2, VolumeX, Zap } from 'lucide-react';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { profile, sections } from '../../record/content';
import { PillLink } from '../../shared/ui/Chip';
import { usePrefersReducedMotion } from '../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../store/useLamp';
import { soundEffects } from '../store/useSound';
import { useWorkshop } from '../store/useWorkshop';
import { useNarrow, useOverlayEdge } from '../surfaces/useSurfaceKind';
import { usePublishOverlaySize } from './size';
import { OBJECT_VIEWS, VIEW_LABEL, VIEW_SECTION, type ViewId } from '../canvas/views';

// Carga diferida (code-splitting) del modal de dossier para aligerar el bundle inicial
const SpeedrunDossier = React.lazy(() =>
  import('./SpeedrunDossier').then((m) => ({ default: m.SpeedrunDossier }))
);

const BAR_VIEWS: ViewId[] = ['overview', ...OBJECT_VIEWS];

const tintOf = (id: ViewId) => (id === 'laptop' ? '#529b67' : sections.find((item) => item.id === VIEW_SECTION[id])?.tint);
const iconOf = (id: ViewId) => (id === 'laptop' ? Terminal : sections.find((item) => item.id === VIEW_SECTION[id])?.icon);

const PILL =
  'flex min-h-11 snap-center cursor-pointer items-center justify-center gap-1.5 rounded-full border font-mono text-[10px] tracking-[0.08em] uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-deep';

export function ObjectBar() {
  const view = useWorkshop((state) => state.view);
  const go = useWorkshop((state) => state.go);
  const night = useLamp((state) => state.night);
  const toggleNight = useLamp((state) => state.toggleNight);
  const edge = useOverlayEdge(view);
  const reduce = usePrefersReducedMotion();
  const bar = usePublishOverlaySize('bar');
  const [speedrunOpen, setSpeedrunOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(soundEffects.enabled);
  const pills = useRef<(HTMLButtonElement | null)[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  const rail = edge === 'rail';
  const top = edge === 'sheet';
  const narrow = useNarrow();
  const iconOnly = rail || narrow;
  const lampLabel = night ? 'Lámpara: noche' : 'Lámpara: día';

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setFade((prev) => {
      const next = { left: el.scrollLeft > 2, right: el.scrollLeft < max - 2 };
      return prev.left === next.left && prev.right === next.right ? prev : next;
    });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el || rail) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, rail, view]);

  useEffect(() => {
    const el = scroller.current;
    const pill = pills.current[BAR_VIEWS.indexOf(view)];
    if (rail || !el || !pill) return;
    const inner = el.getBoundingClientRect();
    const own = pill.getBoundingClientRect();
    el.scrollTo({
      left: Math.max(0, el.scrollLeft + own.left - inner.left - (inner.width - own.width) / 2),
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [view, rail, reduce]);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = pills.current[(index + step + BAR_VIEWS.length) % BAR_VIEWS.length];
    next?.focus();
    next?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div
      ref={bar}
      className={`fixed z-40 flex rounded-[14px] border border-acorn/30 bg-paper/92 p-1.5 backdrop-blur-[2px] ${
        rail ? 'left-2 top-1/2 -translate-y-1/2 flex-col' : `inset-x-2 items-center gap-1 ${top ? 'top-2' : 'bottom-2'}`
      }`}
    >
      <div
        ref={scroller}
        className={
          rail
            ? 'flex flex-col items-center gap-1'
            : 'relative flex min-w-0 flex-1 snap-x items-center gap-1 overflow-x-auto sm:contents'
        }
        style={{
          scrollbarWidth: 'none',
          maskImage: rail
            ? undefined
            : `linear-gradient(to right, transparent 0, #000 ${fade.left ? 14 : 0}px, #000 calc(100% - ${fade.right ? 14 : 0}px), transparent 100%)`,
        }}
      >
        <nav aria-label="Objetos del taller" className={`flex gap-1 ${rail ? 'flex-col' : 'max-sm:shrink-0 sm:flex-wrap sm:justify-center'}`}>
          {BAR_VIEWS.map((id, index) => {
            const Icon = id === 'overview' ? ArrowUpLeft : iconOf(id);
            const active = view === id;
            const label = VIEW_LABEL[id];
            return (
              <button
                key={id}
                ref={(node) => {
                  pills.current[index] = node;
                }}
                type="button"
                onClick={() => go(id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                aria-label={rail ? label : undefined}
                aria-current={active ? 'true' : undefined}
                tabIndex={active ? 0 : -1}
                className={`${PILL} ${rail ? 'size-11 shrink-0 px-0' : 'min-h-11 shrink-0 px-2.5'} ${
                  active ? 'border-acorn-deep bg-moss text-ink' : 'border-acorn/30 text-acorn-deep hover:bg-moss/60'
                }`}
              >
                {Icon ? <Icon size={15} strokeWidth={1.75} aria-hidden style={{ color: id === 'overview' ? undefined : tintOf(id) }} /> : null}
                <span className={rail ? 'sr-only' : 'truncate'}>{label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {narrow ? <span aria-hidden className="h-8 w-px shrink-0 bg-acorn/25" /> : null}

      <button
        type="button"
        onClick={toggleNight}
        aria-pressed={night}
        aria-label={lampLabel}
        className={`${PILL} border-acorn/30 text-acorn-deep hover:bg-moss/60 ${iconOnly ? 'size-11 shrink-0 px-0' : 'shrink-0 whitespace-nowrap px-2.5'}`}
      >
        {night ? <Moon size={15} aria-hidden /> : <Sun size={15} aria-hidden />}
        <span className={iconOnly ? 'sr-only' : ''}>{iconOnly ? lampLabel : `lámpara · ${night ? 'noche' : 'día'}`}</span>
      </button>

      {/* Control de Audio Táctil Inmersivo */}
      <button
        type="button"
        onClick={() => {
          const next = soundEffects.toggle();
          setAudioEnabled(next);
          if (next) soundEffects.click();
        }}
        aria-pressed={audioEnabled}
        aria-label={audioEnabled ? 'Efectos de sonido: activados' : 'Efectos de sonido: silenciados'}
        title={audioEnabled ? 'Silenciar audio táctil' : 'Activar audio táctil interactivo'}
        className={`${PILL} border-acorn/30 text-acorn-deep hover:bg-moss/60 ${iconOnly ? 'size-11 shrink-0 px-0' : 'shrink-0 whitespace-nowrap px-2.5'}`}
      >
        {audioEnabled ? <Volume2 size={15} aria-hidden /> : <VolumeX size={15} aria-hidden />}
        <span className={iconOnly ? 'sr-only' : ''}>{iconOnly ? (audioEnabled ? 'Sonido ON' : 'Sonido OFF') : `audio · ${audioEnabled ? 'on' : 'off'}`}</span>
      </button>

      {rail ? (
        profile.resumePdf ? (
          <button
            type="button"
            onClick={() => setSpeedrunOpen(true)}
            className={`${PILL} size-11 shrink-0 px-0 border-sageDeep/50 bg-sage/40 text-ink hover:bg-sage transition-all shadow-sm`}
            title="Resumen Rápido · Dossier Ejecutivo"
            aria-label="Resumen Rápido"
          >
            <Zap size={14} className="text-sageDeep fill-sageDeep/30" />
            <span className="sr-only">Resumen Rápido</span>
          </button>
        ) : null
      ) : profile.resumePdf ? (
        <>
          <span aria-hidden className="h-8 w-px shrink-0 bg-acorn/25" />
          <button
            type="button"
            onClick={() => setSpeedrunOpen(true)}
            className={`${PILL} border-sageDeep/50 bg-sage/40 text-ink hover:bg-sage transition-all shadow-sm ${iconOnly ? 'size-11 shrink-0 px-0' : 'shrink-0 whitespace-nowrap px-3'}`}
            title="Dossier ejecutivo para lectura rápida sin 3D"
          >
            <Zap size={14} className="text-sageDeep fill-sageDeep/30" />
            <span className={iconOnly ? 'sr-only' : 'font-semibold'}>Resumen Rápido</span>
          </button>
          <span aria-hidden className="h-8 w-px shrink-0 bg-acorn/25" />
          {/* Badge de Disponibilidad Laboral en Vivo */}
          <button
            type="button"
            onClick={() => go('phone')}
            title="Estado actual: Disponible para nuevas oportunidades"
            className={`${PILL} border-emerald-500/40 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 transition-all shadow-xs ${
              iconOnly ? 'size-11 shrink-0 px-0' : 'shrink-0 whitespace-nowrap px-3'
            }`}
          >
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className={iconOnly ? 'sr-only' : 'text-[10px] font-bold tracking-tight text-emerald-800'}>
              Disponible
            </span>
          </button>
          <span aria-hidden className="h-8 w-px shrink-0 bg-acorn/25" />
          <PillLink
            href={profile.resumePdf}
            download="Ana_Alonso_resume.pdf"
            target="_blank"
            rel="noreferrer"
            icon={Download}
            compact
            className="min-h-11 shrink-0 justify-center whitespace-nowrap"
          >
            {narrow ? 'CV' : 'Descargar CV'}
          </PillLink>
        </>
      ) : null}

      {speedrunOpen ? (
        <Suspense fallback={null}>
          <SpeedrunDossier onClose={() => setSpeedrunOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  );
}
