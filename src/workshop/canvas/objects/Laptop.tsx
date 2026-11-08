import { Instance, Instances, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Group, MeshBasicMaterial, MeshStandardMaterial, PointLight } from 'three';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import {
  executeCommand,
  LAPTOP_TEX,
  paintLaptopScreen,
  type LaptopAction,
  type TerminalEntry,
} from '../../surfaces/paint/laptopReadme';
import type { Region } from '../../surfaces/regions';
import { useSurfaceActions } from '../../surfaces/useSurfaceActions';
import { useSurfaceScroll } from '../../surfaces/useSurfaceScroll';
import { useSurfaceTexture } from '../../surfaces/useSurfaceTexture';
import { Hoverable } from '../furniture/Hoverable';
import { KEY_FIELD, KEYCAPS } from '../furniture/laptopKeys';
import { MATERIALS } from '../materials';

const CLOSED = Math.PI / 2;
const OPEN = -0.14;

const INITIAL_HISTORY: TerminalEntry[] = [
  {
    input: 'whoami',
    lines: [
      { text: 'Ana Alonso — Frontend & Software Engineer', bold: true, color: '#8fd0a8' },
      { text: 'Escribe "help" o pulsa en los botones superiores para ejecutar comandos.', color: '#8f97a3' },
    ],
  },
];

export function Laptop({ position }: { position: [number, number, number] }) {
  const lid = useRef<Group>(null);
  const screen = useRef<MeshBasicMaterial>(null);
  const led = useRef<MeshStandardMaterial>(null);
  const glow = useRef<PointLight>(null);
  const keys = useRef<Group>(null);
  const level = useRef({ v: 0 });
  const reduce = usePrefersReducedMotion();
  const open = useWorkshop((state) => state.view === 'laptop');
  const night = useLamp((state) => state.night);

  const [history, setHistory] = useState<TerminalEntry[]>(INITIAL_HISTORY);
  const [currentInput, setCurrentInput] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const regions = useRef<Region<LaptopAction>[] | null>(null);

  // Parpadeo del cursor en la terminal
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, [open]);

  // Ejecución de comando (desde click o teclado)
  const runCmd = useCallback((cmdName: string) => {
    const entry = executeCommand(cmdName);
    if (cmdName.trim().toLowerCase() === 'clear') {
      setHistory([]);
    } else {
      setHistory((prev) => [...prev, entry]);
    }
    setCurrentInput('');
  }, []);

  const onAction = useCallback(
    (action: LaptopAction) => {
      if (action.kind === 'cmd') {
        runCmd(action.cmd);
      }
    },
    [runCmd],
  );

  // Captura de teclado cuando el portátil está abierto
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Ignorar combinaciones del sistema o cuando el foco está en un input externo
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentInput.trim()) {
          runCmd(currentInput);
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        // Carácter imprimible
        setCurrentInput((prev) => (prev.length < 32 ? prev + e.key : prev));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, currentInput, runCmd]);

  const { map, markDirty } = useSurfaceTexture({
    tex: LAPTOP_TEX,
    active: open,
    paint: (ctx) => {
      const painted = paintLaptopScreen(ctx, {
        night,
        history,
        currentInput,
        cursorVisible,
      });
      regions.current = painted.regions;
      useSurfaceScroll.getState().setExtent('laptop', 0, 1);
    },
  });

  useEffect(() => {
    markDirty();
  }, [night, open, history, currentInput, cursorVisible, markDirty]);

  const actions = useSurfaceActions({
    view: 'laptop',
    tex: LAPTOP_TEX,
    active: open,
    regionsRef: regions,
    onAction,
  });

  useFrame((state, delta) => {
    if (lid.current) damp(lid.current.rotation, 'x', open ? OPEN : CLOSED, 0.3, delta);
    if (keys.current && lid.current) keys.current.visible = lid.current.rotation.x < 1.22;
    const brightness = open ? (night ? 0.82 : 0.9) : 0;
    if (screen.current) {
      if (reduce) level.current.v = brightness;
      else damp(level.current, 'v', brightness, 0.22, delta);
      screen.current.color.setScalar(level.current.v);
    }
    if (led.current) {
      const pulse = open ? 0.06 : 0.3 + 0.26 * Math.sin(state.clock.elapsedTime * 2.2);
      damp(led.current, 'emissiveIntensity', pulse, 0.05, delta);
    }
    if (glow.current) damp(glow.current, 'intensity', open && night ? 1.6 : 0, 0.22, delta);
  });

  return (
    <Hoverable view="laptop" position={position}>
      <RoundedBox args={[0.44, 0.016, 0.31]} radius={0.006} smoothness={4} position={[0, 0.008, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={MATERIALS.aluminium} roughness={0.34} metalness={0.42} />
      </RoundedBox>

      <RoundedBox args={[KEY_FIELD.w, 0.0035, KEY_FIELD.d]} radius={0.002} smoothness={3} position={[0, 0.0165, KEY_FIELD.z]}>
        <meshStandardMaterial color="#1a1c20" roughness={0.7} metalness={0.25} />
      </RoundedBox>
      <group ref={keys}>
        <Instances limit={KEYCAPS.length} range={KEYCAPS.length}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#111215" roughness={0.42} metalness={0.3} />
          {KEYCAPS.map((cap, index) => (
            <Instance key={index} position={cap.position} scale={cap.scale} />
          ))}
        </Instances>
      </group>
      {/* Trackpad con sutil borde y acabado táctil tipo satinado */}
      <group position={[0, 0.017, 0.088]}>
        <RoundedBox args={[0.134, 0.002, 0.089]} radius={0.002} smoothness={3} position={[0, 0, 0]}>
          <meshStandardMaterial color="#2d3139" roughness={0.4} metalness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.13, 0.003, 0.085]} radius={0.0016} smoothness={3} position={[0, 0.0006, 0]}>
          <meshStandardMaterial color={MATERIALS.aluminiumDeep} roughness={0.28} metalness={0.52} />
        </RoundedBox>
      </group>

      <mesh position={[0, 0.01, 0.157]}>
        <boxGeometry args={[0.014, 0.004, 0.004]} />
        <meshStandardMaterial ref={led} color={MATERIALS.glassDark} emissive={MATERIALS.led} emissiveIntensity={0.3} />
      </mesh>

      <group ref={lid} position={[0, 0.02, -0.152]} rotation={[CLOSED, 0, 0]}>
        <RoundedBox args={[0.44, 0.31, 0.012]} radius={0.006} smoothness={4} position={[0, 0.155, 0]} castShadow>
          <meshStandardMaterial color={MATERIALS.aluminium} roughness={0.34} metalness={0.42} />
        </RoundedBox>
        <mesh position={[0, 0.155, 0.0065]} {...actions}>
          <planeGeometry args={[0.4, 0.27]} />
          <meshBasicMaterial ref={screen} map={map} color="#ffffff" toneMapped={false} />
        </mesh>
      </group>

      {/* Reflejo difuso de pantalla sobre la mesa (Ground Bounce Specular Glow) */}
      <mesh position={[0, 0.0005, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.14]} />
        <meshBasicMaterial
          color="#dbeafe"
          transparent
          opacity={open ? (night ? 0.075 : 0.035) : 0}
          depthWrite={false}
        />
      </mesh>

      <pointLight ref={glow} position={[0, 0.16, -0.05]} color="#ffffff" distance={0.6} intensity={0} />
    </Hoverable>
  );
}
