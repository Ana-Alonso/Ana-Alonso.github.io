import { create } from 'zustand';

interface SurfaceFocus {
  href: string | null;
  set: (href: string | null) => void;
}

export const useSurfaceFocus = create<SurfaceFocus>((set) => ({
  href: null,
  set: (href) => set((state) => (state.href === href ? state : { href })),
}));
