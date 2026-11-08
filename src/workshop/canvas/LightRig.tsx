import { useFrame, useThree } from '@react-three/fiber';
import { damp, dampC } from 'maath/easing';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Color,
  DirectionalLight,
  HemisphereLight,
  Object3D,
  PMREMGenerator,
  SpotLight,
  type Texture,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LAMP_BULB, LAMP_POOL } from './furniture/deskLampGeometry';

const DAY = {
  background: '#f4f5f7',
  environment: 0.52,
  keyColor: '#fff8ed',
  keyIntensity: 1.45,
  skyColor: '#b8d6f8',
  groundColor: '#d6cfc4',
  hemi: 0.38,
  lamp: 0,
};

const NIGHT = {
  background: '#0d1017',
  environment: 0.16,
  keyColor: '#709fd6',
  keyIntensity: 0.42,
  skyColor: '#1a2334',
  groundColor: '#12141a',
  hemi: 0.14,
  lamp: 4.8,
};

const CROSSFADE = 0.3;

function StudioProbe() {
  const gl = useThree((state) => state.gl);
  const [probe, setProbe] = useState<Texture | null>(null);

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const baked = pmrem.fromScene(room, 0.04);
    pmrem.dispose();
    room.dispose();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProbe(baked.texture);
    return () => baked.dispose();
  }, [gl]);

  if (!probe) return null;
  return <primitive object={probe} attach="environment" />;
}

export function LightRig({ lit }: { lit: boolean }) {
  const key = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const bulb = useRef<SpotLight>(null);
  const background = useMemo(() => new Color(DAY.background), []);
  const pool = useMemo(() => new Object3D(), []);

  useFrame((state, delta) => {
    const goal = lit ? DAY : NIGHT;
    dampC(background, goal.background, CROSSFADE, delta);
    damp(state.scene, 'environmentIntensity', goal.environment, CROSSFADE, delta);
    if (key.current) {
      damp(key.current, 'intensity', goal.keyIntensity, CROSSFADE, delta);
      dampC(key.current.color, goal.keyColor, CROSSFADE, delta);
      key.current.castShadow = lit;
    }
    if (bulb.current) {
      damp(bulb.current, 'intensity', goal.lamp, CROSSFADE, delta);
      bulb.current.castShadow = !lit;
    }
    if (hemi.current) {
      damp(hemi.current, 'intensity', goal.hemi, CROSSFADE, delta);
      dampC(hemi.current.color, goal.skyColor, CROSSFADE, delta);
      dampC(hemi.current.groundColor, goal.groundColor, CROSSFADE, delta);
    }
  });

  return (
    <>
      <StudioProbe />
      <primitive object={background} attach="background" />
      <directionalLight
        ref={key}
        position={[2.6, 4.2, 2.4]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-3.2, 3.2, 2.6, -2.6, 0.5, 14]} />
      </directionalLight>
      <hemisphereLight ref={hemi} position={[-1.5, 3, 2]} />
      <primitive object={pool} position={LAMP_POOL} />
      <spotLight
        ref={bulb}
        position={LAMP_BULB}
        target={pool}
        color="#ffe2b3"
        angle={0.64}
        penumbra={0.85}
        distance={3.2}
        decay={1.8}
        intensity={0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={0.1}
        shadow-camera-far={2.8}
      />
    </>
  );
}
