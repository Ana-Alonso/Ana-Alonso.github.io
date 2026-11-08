import { useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useRef, useState } from 'react';
import { DoubleSide, MeshStandardMaterial } from 'three';
import { PALETTE } from '../../../shared/theme';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { MATERIALS } from '../materials';
import { LAMP_ARMS, LAMP_BASE, LAMP_JOINTS, LAMP_SHADE, LAMP_SHADE_L } from './deskLampGeometry';

export function DeskLamp() {
  const mouth = useRef<MeshStandardMaterial>(null);
  const shade = useRef<MeshStandardMaterial>(null);
  const bulb = useRef<MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const night = useLamp((state) => state.night);
  const toggleNight = useLamp((state) => state.toggleNight);
  const reduce = usePrefersReducedMotion();
  useCursor(hovered);

  useFrame((_, delta) => {
    const goals = night ? { mouth: 2.4, shade: 0.5, bulb: 3.2 } : { mouth: 0.12, shade: 0.04, bulb: 0.2 };
    if (mouth.current) {
      if (reduce) mouth.current.emissiveIntensity = goals.mouth;
      else damp(mouth.current, 'emissiveIntensity', goals.mouth, 0.3, delta);
    }
    if (shade.current) {
      if (reduce) shade.current.emissiveIntensity = goals.shade;
      else damp(shade.current, 'emissiveIntensity', goals.shade, 0.3, delta);
    }
    if (bulb.current) {
      if (reduce) bulb.current.emissiveIntensity = goals.bulb;
      else damp(bulb.current, 'emissiveIntensity', goals.bulb, 0.3, delta);
    }
  });

  return (
    <group
      position={LAMP_BASE}
      onClick={(event) => {
        event.stopPropagation();
        toggleNight();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base con bisel y acabado metálico anodizado */}
      <mesh position={[0, 0.011, 0]} receiveShadow>
        <cylinderGeometry args={[0.052, 0.056, 0.022, 32]} />
        <meshStandardMaterial color={MATERIALS.aluminiumDeep} roughness={0.32} metalness={0.65} />
      </mesh>

      {/* Pulsador de encendido táctil en la base */}
      <mesh position={[0.024, 0.023, 0.024]}>
        <cylinderGeometry args={[0.007, 0.007, 0.004, 20]} />
        <meshStandardMaterial color={night ? '#ffe2b3' : MATERIALS.brass} roughness={0.2} metalness={0.8} />
      </mesh>

      {LAMP_JOINTS.map((joint, index) => (
        <mesh key={`junta-${index}`} position={joint}>
          <sphereGeometry args={[0.011, 16, 12]} />
          <meshStandardMaterial color={MATERIALS.brass} roughness={0.3} metalness={0.7} />
        </mesh>
      ))}

      {LAMP_ARMS.map((arm, index) => (
        <mesh key={`brazo-${index}`} position={arm.mid} quaternion={arm.quat} castShadow={arm.castShadow}>
          <cylinderGeometry args={[arm.radius, arm.radius, arm.length, 12]} />
          <meshStandardMaterial color={MATERIALS.aluminiumDeep} roughness={0.4} metalness={0.55} />
        </mesh>
      ))}

      <mesh position={LAMP_SHADE.mid} quaternion={LAMP_SHADE.quat} castShadow={!night}>
        <cylinderGeometry args={[0.035, 0.085, LAMP_SHADE_L, 24, 1, true]} />
        <meshStandardMaterial
          ref={shade}
          color={night ? PALETTE.lampShadeOff : PALETTE.lampShadeOn}
          emissive={PALETTE.lampWash}
          emissiveIntensity={0.04}
          roughness={0.42}
          metalness={0.3}
          side={DoubleSide}
        />
      </mesh>

      <mesh position={LAMP_SHADE.end} quaternion={LAMP_SHADE.facing}>
        <circleGeometry args={[0.084, 24]} />
        <meshStandardMaterial
          ref={mouth}
          color={night ? PALETTE.lampMouthOn : PALETTE.lampMouthOff}
          emissive={PALETTE.lampWash}
          emissiveIntensity={0.12}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={LAMP_SHADE.end}>
        <sphereGeometry args={[0.019, 14, 10]} />
        <meshStandardMaterial ref={bulb} color={PALETTE.lampMouthOn} emissive={PALETTE.lampWash} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
