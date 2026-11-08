import { sections } from '../../record/content';
import { VIEW_LABEL, VIEW_SECTION, type ViewId } from '../canvas/views';
import { useWorkshop } from '../store/useWorkshop';

const HINTS: Partial<Record<ViewId, string>> = {
  profileCard: 'Sobre mí · Perfil y enfoque técnico',
  laptop: 'Terminal interactiva · CLI & Stack',
  blueprint: 'Proyectos destacados · 6 casos reales',
  diploma: 'Titulación académica · UPNA e internacional',
  stack: 'Competencias técnicas y metodologías',
  logbook: 'Experiencia laboral y trayectoria',
  dictionary: 'Idiomas y certificaciones',
  phone: 'Contacto directo y redes profesionales',
};

export function HoverTooltip() {
  const hovered = useWorkshop((state) => state.hoveredPiece);
  const currentView = useWorkshop((state) => state.view);
  const booted = useWorkshop((state) => state.booted);

  // Solo mostrar el tooltip si el taller está listo, hay un objeto sobrevolado y estamos en vista panorámica o no es el objeto ya enfocado
  if (!booted || !hovered || hovered === currentView) return null;

  const label = VIEW_LABEL[hovered];
  const sectionId = VIEW_SECTION[hovered];
  const section = sections.find((s) => s.id === sectionId);
  const hint = HINTS[hovered];
  const tint = hovered === 'laptop' ? '#529b67' : section?.tint ?? '#8b6f4e';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2 rounded-full bg-paper/95 border border-acorn/40 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
    >
      <span
        className="size-2 rounded-full shrink-0 shadow-xs"
        style={{ backgroundColor: tint }}
      />
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-ink">{label}</span>
        {hint ? <span className="text-muted hidden sm:inline">· {hint}</span> : null}
      </div>
      <span className="text-[10px] uppercase font-mono tracking-wider text-acorn-deep bg-oat/70 px-2 py-0.5 rounded-full border border-acorn/20">
        Clic para abrir
      </span>
    </div>
  );
}
