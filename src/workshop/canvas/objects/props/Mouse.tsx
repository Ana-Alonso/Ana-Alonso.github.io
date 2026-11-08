import { DESK_TOP } from '../../furniture/Desk';
import { RoundedBox } from '@react-three/drei';
import { MATERIALS } from '../../materials';

const PAD: [number, number, number] = [0.24, 0.003, 0.2];

export function Mouse({ at, yaw }: { at: readonly [number, number]; yaw: number }) {
  return (
    <group position={[at[0], DESK_TOP, at[1]]} rotation={[0, yaw, 0]}>
      {/* Alfombrilla de ratón con bordes redondeados y textura mate oscura */}
      <RoundedBox args={PAD} radius={0.003} smoothness={3} position={[0, 0.0015, 0]} receiveShadow>
        <meshStandardMaterial color="#181a1f" roughness={0.88} metalness={0.08} />
      </RoundedBox>

      {/* Ratón elegante estilo Magic Mouse / ergonómico de precisión */}
      <group position={[0.02, 0.003, 0]}>
        {/* Base metálica / deslizadores inferiores */}
        <RoundedBox args={[0.064, 0.008, 0.114]} radius={0.004} smoothness={4} position={[0, 0.004, 0]} castShadow>
          <meshStandardMaterial color={MATERIALS.aluminiumDeep} roughness={0.32} metalness={0.65} />
        </RoundedBox>

        {/* Superficie satinada / cúpula táctil superior */}
        <mesh position={[0, 0.013, -0.002]} scale={[0.033, 0.012, 0.057]} castShadow>
          <sphereGeometry args={[1, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshPhysicalMaterial
            color="#f3f4f6"
            roughness={0.18}
            metalness={0.2}
            clearcoat={0.9}
            clearcoatRoughness={0.12}
          />
        </mesh>

        {/* Rueda / acento scroll sutil */}
        <mesh position={[0, 0.0185, -0.018]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.009, 16]} />
          <meshStandardMaterial color="#2d3139" roughness={0.4} metalness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
