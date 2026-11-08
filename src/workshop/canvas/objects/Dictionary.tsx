import { RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useEffect, useRef } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { languages } from '../../../record/content';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import { DICTIONARY_TEX, paintDictionaryPage } from '../../surfaces/paint/dictionaryPage';
import { surfaceLayoutFor } from '../../surfaces/layout';
import { useSurfaceTexture } from '../../surfaces/useSurfaceTexture';
import { useSurfaceScroll } from '../../surfaces/useSurfaceScroll';
import { useSurfaceActions } from '../../surfaces/useSurfaceActions';
import { Hoverable } from '../furniture/Hoverable';
import { MATERIALS } from '../materials';

const OPEN = 1.72;

const TAB_TINTS = [MATERIALS.sageDeep, MATERIALS.rainDeep];

export function Dictionary({ position }: { position: [number, number, number] }) {
  const cover = useRef<Group>(null);
  const face = useRef<MeshStandardMaterial>(null);
  const level = useRef({ v: 0.1 });
  const reveal = useRef({ v: 0 });
  const lastReveal = useRef(-1);
  const size = useThree((state) => state.size);
  const reduce = usePrefersReducedMotion();
  const open = useWorkshop((state) => state.view === 'dictionary');
  const night = useLamp((state) => state.night);

  const { map, markDirty } = useSurfaceTexture({
    tex: DICTIONARY_TEX,
    active: open,
    paint: (ctx) => {
      const painted = paintDictionaryPage(ctx, { reveal: reveal.current.v });
      const layout = surfaceLayoutFor('dictionary', size.width, size.height);
      useSurfaceScroll.getState().setExtent('dictionary', painted.contentHeight - painted.viewport, layout.texPerPx);
    },
  });

  useEffect(() => {
    markDirty();
  }, [open, size.width, size.height, markDirty]);

  useFrame((_, delta) => {
    if (cover.current) {
      if (reduce) cover.current.rotation.z = open ? OPEN : 0;
      else damp(cover.current.rotation, 'z', open ? OPEN : 0, 0.3, delta);
    }

    const goal = open ? 1 : 0;
    if (reduce) reveal.current.v = goal;
    else {
      damp(reveal.current, 'v', goal, 0.22, delta);
      if (Math.abs(reveal.current.v - goal) < 1e-3) reveal.current.v = goal;
    }
    if (reveal.current.v !== lastReveal.current) {
      lastReveal.current = reveal.current.v;
      markDirty();
    }

    if (face.current) {
      const brightness = open ? (night ? 0.34 : 0.14) : night ? 0.2 : 0.1;
      if (reduce) level.current.v = brightness;
      else damp(level.current, 'v', brightness, 0.25, delta);
      face.current.emissiveIntensity = level.current.v;
    }
  });

  const actions = useSurfaceActions({ view: 'dictionary', tex: DICTIONARY_TEX, active: open });

  return (
    <Hoverable view="dictionary" position={position} rotation={[0, -0.18, 0]}>
      <RoundedBox args={[0.215, 0.012, 0.275]} radius={0.006} smoothness={4} position={[0, 0.006, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={MATERIALS.blushDeep} roughness={0.55} metalness={0.08} />
      </RoundedBox>

      <RoundedBox args={[0.2, 0.018, 0.26]} radius={0.004} smoothness={3} position={[0, 0.021, 0]} castShadow>
        <meshStandardMaterial color={MATERIALS.paper} roughness={0.78} metalness={0} />
      </RoundedBox>

      <mesh position={[0, 0.0315, 0]} rotation={[-Math.PI / 2, 0, 0]} {...actions}>
        <planeGeometry args={[0.19, 0.25]} />
        <meshStandardMaterial
          ref={face}
          map={map}
          emissiveMap={map}
          emissive="#ffffff"
          emissiveIntensity={0.1}
          roughness={0.62}
          metalness={0}
        />
      </mesh>

      {languages.map((item, index) => (
        <RoundedBox
          key={`pestana-${item.name}`}
          args={[0.03, 0.009, 0.062]}
          radius={0.003}
          smoothness={3}
          position={[0.117, 0.024, index === 0 ? -0.062 : 0.052]}
          castShadow
        >
          <meshStandardMaterial color={TAB_TINTS[index % TAB_TINTS.length]} roughness={0.4} metalness={0.12} />
        </RoundedBox>
      ))}

      <RoundedBox args={[0.028, 0.0022, 0.011]} radius={0.001} smoothness={2} position={[0.108, 0.0295, -0.004]}>
        <meshStandardMaterial color={MATERIALS.blushDeep} roughness={0.45} metalness={0.05} />
      </RoundedBox>

      <group ref={cover} position={[-0.1075, 0.037, 0]}>
        <RoundedBox args={[0.215, 0.01, 0.275]} radius={0.005} smoothness={4} position={[0.1075, 0, 0]} castShadow>
          <meshStandardMaterial color={MATERIALS.blushDeep} roughness={0.55} metalness={0.08} />
        </RoundedBox>
        <RoundedBox args={[0.018, 0.014, 0.278]} radius={0.005} smoothness={3} position={[0.012, 0.008, 0]} castShadow>
          <meshStandardMaterial color={MATERIALS.blushDeep} roughness={0.5} metalness={0.1} />
        </RoundedBox>
        <RoundedBox args={[0.1, 0.002, 0.058]} radius={0.002} smoothness={2} position={[0.112, 0.006, 0]}>
          <meshStandardMaterial color={MATERIALS.brass} roughness={0.32} metalness={0.7} />
        </RoundedBox>
      </group>
    </Hoverable>
  );
}
