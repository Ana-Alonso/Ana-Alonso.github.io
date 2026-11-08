import { useEffect } from 'react';
import { useWorkshop } from '../store/useWorkshop';
import { VIEWS } from '../canvas/views';
import { surfaceLayoutFor } from './layout';
import { useSurfaceScroll } from './useSurfaceScroll';
import { useSurfaceKind } from './useSurfaceKind';

const LINE_PX = 24;
const PAGE_FRACTION = 0.8;

export function useSurfaceKeys(): void {
  const view = useWorkshop((state) => state.view);
  const kind = useSurfaceKind(view);
  const screen = VIEWS[view].screen;
  const active = kind === 'full' && screen !== undefined;

  useEffect(() => {
    if (!active || !screen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const { texPerPx } = surfaceLayoutFor(view, window.innerWidth, window.innerHeight);
      const scroll = useSurfaceScroll.getState();
      if (scroll.view !== view || scroll.max === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          scroll.scrollBy(view, (screen.paged ? screen.tex[1] : LINE_PX) / texPerPx);
          break;
        case 'ArrowUp':
          scroll.scrollBy(view, -(screen.paged ? screen.tex[1] : LINE_PX) / texPerPx);
          break;
        case 'PageDown':
          scroll.scrollBy(view, (screen.paged ? screen.tex[1] : screen.tex[1] * PAGE_FRACTION) / texPerPx);
          break;
        case 'PageUp':
          scroll.scrollBy(view, -(screen.paged ? screen.tex[1] : screen.tex[1] * PAGE_FRACTION) / texPerPx);
          break;
        case 'Home':
          scroll.scrollTo(view, 0);
          break;
        case 'End':
          scroll.scrollTo(view, 1);
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, screen, view]);
}
