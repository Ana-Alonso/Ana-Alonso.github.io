import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import type { ViewId } from '../canvas/views';
import { VIEWS } from '../canvas/views';
import { hitRegion, type Region } from './regions';
import { useSurfaceScroll } from './useSurfaceScroll';

const TURN_COOLDOWN = 240;

export function openHref(href: string): void {
  if (/^(mailto:|tel:)/i.test(href)) window.location.href = href;
  else window.open(href, '_blank', 'noreferrer');
}

export function useSurfaceActions<A = never>({
  view,
  tex,
  active,
  regionsRef,
  onAction,
  enabledRef,
}: {
  view: ViewId;
  tex: [number, number];
  active: boolean;
  regionsRef?: { current: Region<A>[] | null };
  onAction?: (action: A) => void;
  enabledRef?: { current: boolean };
}) {
  const last = useRef<number | null>(null);
  const lastTurn = useRef(0);
  const paged = VIEWS[view].screen?.paged ?? false;
  const [hoveredAction, setHoveredAction] = useState(false);
  const overAction = active && hoveredAction;
  useCursor(overAction);

  const regionUnder = useCallback(
    (event: ThreeEvent<PointerEvent | MouseEvent>): A | null => {
      if (!regionsRef || !onAction || !event.uv) return null;
      if (enabledRef && !enabledRef.current) return null;
      const state = useSurfaceScroll.getState();
      return hitRegion(regionsRef.current ?? [], event.uv, tex, state.view === view ? state.offset : 0);
    },
    [enabledRef, onAction, regionsRef, tex, view],
  );

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!active) return;
      event.stopPropagation();
      last.current = event.clientY;
    },
    [active],
  );

  const onPointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!active) return;
      setHoveredAction(regionUnder(event) !== null);
      if (last.current === null) return;
      event.stopPropagation();
      if (paged) return;
      const dy = event.clientY - last.current;
      last.current = event.clientY;
      if (dy) useSurfaceScroll.getState().scrollBy(view, -dy);
    },
    [active, paged, regionUnder, view],
  );

  const onPointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!active) return;
      event.stopPropagation();
      last.current = null;
    },
    [active],
  );

  const onPointerOut = useCallback(() => setHoveredAction(false), []);

  const onWheel = useCallback(
    (event: ThreeEvent<WheelEvent>) => {
      if (!active) return;
      event.stopPropagation();
      const scroll = useSurfaceScroll.getState();
      if (paged) {
        const now = event.nativeEvent.timeStamp;
        if (now - lastTurn.current < TURN_COOLDOWN) return;
        lastTurn.current = now;
        scroll.scrollBy(view, Math.sign(event.deltaY) * tex[1] / scroll.scale);
        return;
      }
      scroll.scrollBy(view, event.deltaY * (event.deltaMode === 1 ? 16 : 1));
    },
    [active, paged, tex, view],
  );

  const onClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!active) return;
      event.stopPropagation();
      if (event.delta > 6) return;
      const action = regionUnder(event);
      if (action && onAction) onAction(action);
    },
    [active, onAction, regionUnder],
  );

  return { onClick, onWheel, onPointerDown, onPointerMove, onPointerUp, onPointerOut };
}
