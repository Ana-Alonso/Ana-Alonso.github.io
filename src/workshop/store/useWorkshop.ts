import { create } from 'zustand';
import { SHEET_BREAKPOINT } from '../surfaces/layout';
import type { OBJECT_VIEWS, ViewId } from '../canvas/views';
import { soundEffects } from './useSound';

type PieceView = (typeof OBJECT_VIEWS)[number];

interface PieceMark {
  view: PieceView;
  x: number;
  y: number;
}

interface Workshop {
  view: ViewId;
  booted: boolean;
  placed: number;
  mark: PieceMark | null;
  hoveredPiece: ViewId | null;
  go: (view: ViewId) => void;
  overview: () => void;
  setBooted: (booted: boolean) => void;
  setPlaced: (placed: number) => void;
  setMark: (mark: PieceMark) => void;
  setHoveredPiece: (view: ViewId | null) => void;
}

export const useWorkshop = create<Workshop>((set) => ({
  view: window.innerWidth < SHEET_BREAKPOINT ? 'profileCard' : 'overview',
  booted: false,
  placed: 0,
  mark: null,
  hoveredPiece: null,
  go: (view) => {
    soundEffects.whoosh();
    set({ view, hoveredPiece: null });
  },
  overview: () => {
    soundEffects.whoosh();
    set({ view: 'overview', hoveredPiece: null });
  },
  setBooted: (booted) => set({ booted }),
  setPlaced: (placed) => set({ placed }),
  setMark: (mark) => set({ mark }),
  setHoveredPiece: (hoveredPiece) => set({ hoveredPiece }),
}));
