import { useEffect, useRef, type RefObject } from 'react';

export const overlaySize = { bar: 58, barWidth: 0, caption: 0 };

export function usePublishOverlaySize(key: 'bar' | 'caption'): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const read = () => {
      const box = node.getBoundingClientRect();
      if (key === 'caption') overlaySize.caption = Math.round(box.height);
      else {
        overlaySize.bar = Math.round(box.height);
        overlaySize.barWidth = Math.round(box.width);
      }
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (key === 'caption') overlaySize.caption = 0;
    };
  }, [key]);

  return ref;
}
