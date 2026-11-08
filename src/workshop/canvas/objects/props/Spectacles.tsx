import { DESK_TOP } from '../../furniture/Desk';

export function Spectacles({ at, yaw }: { at: readonly [number, number]; yaw: number }) {
  return (
    <group position={[at[0], DESK_TOP + 0.004, at[1]]} rotation={[0, yaw, 0]} castShadow receiveShadow>
      {/* Montura aro izquierdo */}
      <mesh position={[-0.015, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.011, 0.0014, 12, 32]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Cristal izquierdo con transmisión física */}
      <mesh position={[-0.015, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.01, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          opacity={1}
          transparent
          roughness={0.05}
          ior={1.5}
          reflectivity={0.6}
        />
      </mesh>

      {/* Montura aro derecho */}
      <mesh position={[0.015, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.011, 0.0014, 12, 32]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Cristal derecho con transmisión física */}
      <mesh position={[0.015, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.01, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          opacity={1}
          transparent
          roughness={0.05}
          ior={1.5}
          reflectivity={0.6}
        />
      </mesh>

      {/* Puente nasal curvado / refinado */}
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.01, 0.0016, 0.002]} />
        <meshStandardMaterial color="#374151" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Patilla izquierda apoyada en ángulo */}
      <mesh position={[-0.026, 0.005, -0.02]} rotation={[0.15, 0.06, 0]}>
        <cylinderGeometry args={[0.001, 0.001, 0.044, 10]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Patilla derecha apoyada en ángulo */}
      <mesh position={[0.026, 0.005, -0.02]} rotation={[0.15, -0.06, 0]}>
        <cylinderGeometry args={[0.001, 0.001, 0.044, 10]} />
        <meshStandardMaterial color="#1f2937" roughness={0.35} metalness={0.7} />
      </mesh>
    </group>
  );
}
