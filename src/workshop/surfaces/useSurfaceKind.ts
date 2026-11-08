import { useSyncExternalStore } from 'react';
import type { ViewId } from '../canvas/views';
import { VIEW_SECTION } from '../canvas/views';
import { SHEET_BREAKPOINT, surfaceLayoutFor, type SurfaceKind } from './layout';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

export function useSurfaceKind(view: ViewId): SurfaceKind {
  return useSyncExternalStore(
    subscribe,
    () => surfaceLayoutFor(view, window.innerWidth, window.innerHeight).kind,
    () => 'sheet',
  );
}

export function useNarrow(): boolean {
  return useSyncExternalStore(subscribe, () => window.innerWidth < SHEET_BREAKPOINT, () => true);
}

export function useOverlayEdge(view: ViewId): 'none' | 'rail' | 'sheet' {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!VIEW_SECTION[view]) return 'none';
      const width = window.innerWidth;
      if (surfaceLayoutFor(view, width, window.innerHeight).kind === 'full') return 'none';
      return width >= SHEET_BREAKPOINT ? 'rail' : 'sheet';
    },
    () => 'sheet',
  );
}
