import { Canvas } from '@react-three/fiber';
import { usePrefersReducedMotion } from '../shared/hooks/usePrefersReducedMotion';
import { useEffect } from 'react';
import { sections } from '../record/content';
import type { HashLinkProps } from '../shared/hooks/useHashSection';
import type { SectionId } from '../shared/types';
import { BootScreen } from './boot/BootScreen';
import { Scene } from './canvas/Scene';
import { OBJECT_VIEWS, SECTION_VIEW, VIEWS, VIEW_SECTION, type ViewId } from './canvas/views';
import { WebGLErrorBoundary } from './canvas/WebGLErrorBoundary';
import { useWorkshop } from './store/useWorkshop';
import { useSurfaceKeys } from './surfaces/useSurfaceKeys';
import { ContentOverlay, ViewAnnouncement } from './overlay/ContentOverlay';
import { ObjectBar } from './overlay/ObjectBar';
import { HoverTooltip } from './overlay/HoverTooltip';
import { InteractiveGuide } from './overlay/InteractiveGuide';

const isSectionId = (id: string): id is SectionId => sections.some((section) => section.id === id);

const SEQUENTIAL_VIEWS: ViewId[] = ['overview', ...OBJECT_VIEWS];

export default function Workshop({ sectionIdFromUrl, onSectionChange }: HashLinkProps) {
  const reduce = usePrefersReducedMotion();
  const view = useWorkshop((state) => state.view);
  const booted = useWorkshop((state) => state.booted);
  const go = useWorkshop((state) => state.go);
  const overview = useWorkshop((state) => state.overview);
  const setBooted = useWorkshop((state) => state.setBooted);

  useSurfaceKeys();

  useEffect(() => {
    if (reduce) setBooted(true);
  }, [reduce, setBooted]);

  useEffect(() => {
    if (!sectionIdFromUrl || !isSectionId(sectionIdFromUrl)) return;
    go(SECTION_VIEW[sectionIdFromUrl]);
    setBooted(true);
  }, [sectionIdFromUrl, go, setBooted]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (event.key === 'Escape') {
        overview();
        return;
      }

      // Presenter Mode / Navegación secuencial con flechas
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const curIdx = SEQUENTIAL_VIEWS.indexOf(view);
        if (curIdx === -1) return;
        event.preventDefault();
        if (event.key === 'ArrowRight') {
          const nextIdx = (curIdx + 1) % SEQUENTIAL_VIEWS.length;
          go(SEQUENTIAL_VIEWS[nextIdx]);
        } else {
          const prevIdx = (curIdx - 1 + SEQUENTIAL_VIEWS.length) % SEQUENTIAL_VIEWS.length;
          go(SEQUENTIAL_VIEWS[prevIdx]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, go, overview]);

  useEffect(() => {
    if (booted) onSectionChange(VIEW_SECTION[view]);
  }, [view, booted, onSectionChange]);

  return (
    <div className="fixed inset-0">
      <WebGLErrorBoundary>
        <Canvas
          shadows="percentage"
          dpr={[1, 2]}
          camera={{ position: VIEWS.boot.pos.toArray() as [number, number, number], fov: VIEWS.boot.fov }}
          onPointerMissed={() => overview()}
        >
          <Scene reducedMotion={reduce} />
        </Canvas>
      </WebGLErrorBoundary>

      {booted ? <ViewAnnouncement /> : null}

      {booted ? <ContentOverlay key={view} /> : null}

      {booted ? <ObjectBar /> : null}

      {booted ? <HoverTooltip /> : null}

      {booted ? <InteractiveGuide /> : null}

      {!booted && !reduce ? <BootScreen onDone={() => setBooted(true)} /> : null}
    </div>
  );
}
