import { RoundedBox } from '@react-three/drei';
import { useMemo, useEffect } from 'react';
import { MATERIALS } from '../materials';
import { deskWoodTexture } from '../textures';

export const DESK_TOP = 0.74;
const DESK_WIDTH = 2.6;
const DESK_DEPTH = 1.3;

export function Desk() {
  const woodMap = useMemo(() => deskWoodTexture(1.3, 0.65), []);

  useEffect(() => () => woodMap.dispose(), [woodMap]);

  return (
    <group>
      <RoundedBox args={[DESK_WIDTH, 0.06, DESK_DEPTH]} radius={0.02} smoothness={4} position={[0, DESK_TOP - 0.03, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={woodMap} roughness={0.48} metalness={0.04} />
      </RoundedBox>

      {(
        [
          [-DESK_WIDTH / 2 + 0.12, -DESK_DEPTH / 2 + 0.1],
          [DESK_WIDTH / 2 - 0.12, -DESK_DEPTH / 2 + 0.1],
          [-DESK_WIDTH / 2 + 0.12, DESK_DEPTH / 2 - 0.1],
          [DESK_WIDTH / 2 - 0.12, DESK_DEPTH / 2 - 0.1],
        ] as const
      ).map(([x, z], index) => (
        <RoundedBox
          key={`pata-${index}`}
          args={[0.07, DESK_TOP - 0.06, 0.07]}
          radius={0.018}
          smoothness={3}
          position={[x, (DESK_TOP - 0.06) / 2, z]}
          castShadow
        >
          <meshStandardMaterial color={MATERIALS.woodDeep} roughness={0.5} metalness={0.06} />
        </RoundedBox>
      ))}
    </group>
  );
}
