import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DESK_TOP } from '../../furniture/Desk';
import { PALETTE } from '../../../../shared/theme';
import { MATERIALS } from '../../materials';
import { Mesh, MeshBasicMaterial } from 'three';

export function Mug({ at, yaw }: { at: readonly [number, number]; yaw: number }) {
  const steam1 = useRef<Mesh>(null);
  const steam2 = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (steam1.current) {
      const cycle1 = (t * 0.45) % 1;
      steam1.current.position.y = 0.095 + cycle1 * 0.055;
      steam1.current.position.x = Math.sin(t * 1.5) * 0.005;
      steam1.current.scale.setScalar(0.7 + cycle1 * 0.8);
      (steam1.current.material as MeshBasicMaterial).opacity = Math.sin(cycle1 * Math.PI) * 0.18;
    }
    if (steam2.current) {
      const cycle2 = (t * 0.45 + 0.5) % 1;
      steam2.current.position.y = 0.095 + cycle2 * 0.055;
      steam2.current.position.x = Math.cos(t * 1.3) * 0.006;
      steam2.current.scale.setScalar(0.7 + cycle2 * 0.8);
      (steam2.current.material as MeshBasicMaterial).opacity = Math.sin(cycle2 * Math.PI) * 0.15;
    }
  });

  return (
    <group position={[at[0], DESK_TOP, at[1]]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.0485, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.036, 0.095, 20, 1, false]} />
        <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.28} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.082, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.033, 20]} />
        <meshStandardMaterial color={PALETTE.acornDeep} roughness={0.12} metalness={0.2} />
      </mesh>
      <mesh position={[0.042, 0.052, 0]}>
        <torusGeometry args={[0.022, 0.005, 8, 18]} />
        <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.28} metalness={0.05} />
      </mesh>

      {/* Volutas de vapor sutil */}
      <mesh ref={steam1} position={[0, 0.098, 0]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#f0eee9" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh ref={steam2} position={[0.004, 0.11, 0]}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshBasicMaterial color="#f0eee9" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
}
