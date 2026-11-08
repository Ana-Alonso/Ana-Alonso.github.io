import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { SURFACE_FONTS } from './paint/toolkit';

export function useSurfaceTexture({
  tex,
  paint,
  active,
}: {
  tex: [number, number];
  paint: (ctx: CanvasRenderingContext2D) => void;
  active: boolean;
}): { map: CanvasTexture; markDirty: () => void } {
  const gl = useThree((state) => state.gl);
  const [width, height] = tex;

  const canvas = useMemo(() => {
    const node = document.createElement('canvas');
    node.width = width;
    node.height = height;
    return node;
  }, [width, height]);

  const map = useMemo(() => {
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    return texture;
  }, [canvas, gl]);

  useEffect(() => () => map.dispose(), [map]);

  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all(SURFACE_FONTS.map((font) => document.fonts.load(font)))
      .then(() => document.fonts.ready)
      .catch(() => undefined)
      .then(() => {
        if (alive) setFontsReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const dirty = useRef(true);
  const painted = useRef(false);
  const paintRef = useRef(paint);
  useEffect(() => {
    paintRef.current = paint;
  }, [paint]);

  const markDirty = useCallback(() => {
    dirty.current = true;
  }, []);

  useFrame(() => {
    if (!fontsReady || !dirty.current) return;
    if (painted.current && !active) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    paintRef.current(ctx);
    // Three.js CanvasTexture requires setting needsUpdate = true to signal the GPU upload
    // oxlint-disable-next-line react/immutability
    map.needsUpdate = true;
    painted.current = true;
    dirty.current = false;
  });

  return { map, markDirty };
}
