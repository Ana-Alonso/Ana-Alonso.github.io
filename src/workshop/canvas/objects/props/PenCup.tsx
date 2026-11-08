import { DESK_TOP } from '../../furniture/Desk';
import { DoubleSide } from 'three';
import { MATERIALS } from '../../materials';

const PENCILS = [
  { color: MATERIALS.sageDeep, x: 0.016, z: 0.008, tilt: 0.12 },
  { color: MATERIALS.blushDeep, x: -0.015, z: 0.012, tilt: -0.15 },
  { color: MATERIALS.rainDeep, x: 0.004, z: -0.019, tilt: 0.07 },
];

const PENCIL_SHAFT: [number, number, number] = [0.005, 0.005, 0.14];

export function PenCup({ at, yaw }: { at: readonly [number, number]; yaw: number }) {
  return (
    <group position={[at[0], DESK_TOP, at[1]]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.042, 0.04, 0.1, 20, 1, true]} />
        <meshStandardMaterial color={MATERIALS.aluminium} roughness={0.42} metalness={0.5} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 20]} />
        <meshStandardMaterial color={MATERIALS.glassDark} roughness={0.6} />
      </mesh>
      {PENCILS.map((pencil, index) => (
        <group
          key={`lapiz-${index}`}
          position={[pencil.x, 0.085, pencil.z]}
          rotation={[pencil.tilt, 0, -pencil.x * 2.2]}
        >
          <mesh>
            <cylinderGeometry args={PENCIL_SHAFT} />
            <meshStandardMaterial color={pencil.color} roughness={0.55} metalness={0} />
          </mesh>
          <mesh position={[0, 0.076, 0]}>
            <coneGeometry args={[0.005, 0.012, 8]} />
            <meshStandardMaterial color={MATERIALS.glassDark} roughness={0.75} metalness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
