import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useEffect, useMemo, useRef } from 'react';
import { MeshBasicMaterial, Path, Shape } from 'three';
import { PALETTE } from '../../../shared/theme';
import { useLamp } from '../../store/useLamp';
import { MATERIALS } from '../materials';
import { parquetTexture, skyDayTexture, skyNightTexture, wallpaperTexture } from '../textures';

const WALL_W = 5.2;
const WALL_H = 2.7;
const WALL_Z = -1.5;
const SIDE_X = -1.72;
const SIDE_Z = 0.4;
const SIDE_DEPTH = 4.6;
const WINDOW = { x: 0.75, y: 1.32, w: 0.86, h: 1.06 };

export function Room() {
  const night = useLamp((state) => state.night);
  const nightSky = useRef<MeshBasicMaterial>(null);

  const wallpaper = useMemo(() => wallpaperTexture(1.1), []);
  const parquet = useMemo(() => parquetTexture(1.2, 0.6), []);
  const skyDay = useMemo(() => skyDayTexture(), []);
  const skyNight = useMemo(() => skyNightTexture(), []);

  useEffect(
    () => () => {
      for (const tex of [wallpaper, parquet, skyDay, skyNight]) tex.dispose();
    },
    [wallpaper, parquet, skyDay, skyNight],
  );

  const backWall = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-WALL_W / 2, -WALL_H / 2);
    shape.lineTo(WALL_W / 2, -WALL_H / 2);
    shape.lineTo(WALL_W / 2, WALL_H / 2);
    shape.lineTo(-WALL_W / 2, WALL_H / 2);
    shape.closePath();

    const left = WINDOW.x - WINDOW.w / 2;
    const right = WINDOW.x + WINDOW.w / 2;
    const bottom = WINDOW.y - WINDOW.h / 2 - WALL_H / 2;
    const top = WINDOW.y + WINDOW.h / 2 - WALL_H / 2;
    const hole = new Path();
    hole.moveTo(left, bottom);
    hole.lineTo(left, top);
    hole.lineTo(right, top);
    hole.lineTo(right, bottom);
    hole.closePath();
    shape.holes.push(hole);
    return shape;
  }, []);

  useFrame((_, delta) => {
    if (nightSky.current) damp(nightSky.current, 'opacity', night ? 1 : 0, 0.34, delta);
  });

  return (
    <group>
      <mesh position={[0, WALL_H / 2, WALL_Z]} receiveShadow>
        <shapeGeometry args={[backWall]} />
        <meshStandardMaterial map={wallpaper} roughness={0.9} metalness={0} />
      </mesh>

      <mesh position={[SIDE_X, WALL_H / 2, SIDE_Z]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[SIDE_DEPTH, WALL_H]} />
        <meshStandardMaterial color={PALETTE.wallpaperLeft} roughness={0.92} metalness={0} />
      </mesh>

      <mesh position={[0, WALL_H, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WALL_W, SIDE_DEPTH]} />
        <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.95} metalness={0} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} receiveShadow>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial map={parquet} roughness={0.72} metalness={0.04} />
      </mesh>

      <RoundedBox args={[WALL_W, 0.09, 0.024]} radius={0.004} smoothness={2} position={[0, 0.045, WALL_Z + 0.012]} receiveShadow>
        <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.7} metalness={0} />
      </RoundedBox>
      <RoundedBox args={[0.024, 0.09, SIDE_DEPTH]} radius={0.004} smoothness={2} position={[SIDE_X + 0.012, 0.045, SIDE_Z]} receiveShadow>
        <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.7} metalness={0} />
      </RoundedBox>

      <mesh position={[WINDOW.x, WINDOW.y, WALL_Z - 0.007]}>
        <planeGeometry args={[WINDOW.w, WINDOW.h]} />
        <meshBasicMaterial map={skyDay} toneMapped={false} />
      </mesh>
      <mesh position={[WINDOW.x, WINDOW.y, WALL_Z - 0.005]}>
        <planeGeometry args={[WINDOW.w, WINDOW.h]} />
        <meshBasicMaterial ref={nightSky} map={skyNight} color="#ffffff" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      {([
        [0.05, WINDOW.h + 0.1, leftOf(-1), WINDOW.y],
        [0.05, WINDOW.h + 0.1, leftOf(1), WINDOW.y],
        [WINDOW.w + 0.1, 0.05, WINDOW.x, WINDOW.y + (WINDOW.h + 0.05) / 2],
        [WINDOW.w + 0.1, 0.05, WINDOW.x, WINDOW.y - (WINDOW.h + 0.05) / 2],
        [0.022, WINDOW.h, WINDOW.x, WINDOW.y],
        [WINDOW.w, 0.022, WINDOW.x, WINDOW.y],
      ] as const).map(([w, h, x, y], index) => (
        <RoundedBox key={`marco-${index}`} args={[w, h, 0.012]} radius={0.004} smoothness={2} position={[x, y, WALL_Z + 0.004]}>
          <meshStandardMaterial color={MATERIALS.paper} roughness={0.55} metalness={0.05} />
        </RoundedBox>
      ))}

      <RoundedBox args={[WINDOW.w + 0.12, 0.024, 0.04]} radius={0.006} smoothness={2} position={[WINDOW.x, WINDOW.y - WINDOW.h / 2 - 0.012, WALL_Z + 0.021]} receiveShadow>
        <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.6} metalness={0.04} />
      </RoundedBox>
    </group>
  );
}

function leftOf(side: -1 | 1): number {
  return WINDOW.x + side * (WINDOW.w / 2 + 0.025);
}
