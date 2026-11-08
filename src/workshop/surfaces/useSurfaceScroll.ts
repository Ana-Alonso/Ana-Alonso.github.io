import { create } from 'zustand';
import type { ViewId } from '../canvas/views';

interface SurfaceScroll {
  view: ViewId;
  offset: number;
  max: number;
  scale: number;
  setExtent: (view: ViewId, max: number, scale: number) => void;
  scrollBy: (view: ViewId, surfacePx: number) => void;
  scrollTo: (view: ViewId, fraction: number) => void;
}

export const useSurfaceScroll = create<SurfaceScroll>((set, get) => {
  const clamp = (value: number) => Math.max(0, Math.min(value, get().max));

  return {
    view: 'overview',
    offset: 0,
    max: 0,
    scale: 1,

    setExtent: (view, max, scale) => {
      const state = get();
      if (state.view !== view) {
        set({ view, max, scale, offset: 0 });
        return;
      }
      const next = Math.max(0, max);
      if (next === state.max && scale === state.scale && state.offset === clamp(state.offset)) return;
      set({ max: next, scale, offset: clamp(state.offset) });
    },

    scrollBy: (view, surfacePx) => {
      const state = get();
      if (state.view !== view) return;
      const next = clamp(state.offset + surfacePx * state.scale);
      if (next !== state.offset) set({ offset: next });
    },

    scrollTo: (view, fraction) => {
      const state = get();
      if (state.view !== view) return;
      const next = clamp(Math.round(state.max * Math.max(0, Math.min(1, fraction))));
      if (next !== state.offset) set({ offset: next });
    },
  };
});
