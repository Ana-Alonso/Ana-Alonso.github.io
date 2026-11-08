import { CatmullRomCurve3, Vector3 } from 'three';
import { PALETTE } from '../../../shared/theme';
import { DESK_TOP } from './Desk';
import { MATERIALS } from '../materials';
import { SCENE_LAYOUT } from '../config/layout';
import {
  Mug,
  Mouse,
  PenCup,
  WaterGlass,
  Spectacles,
  BusinessCard,
  Notebook,
  Sticky,
} from '../objects/props';

const CABLE_R = 0.003;

const CABLE = new CatmullRomCurve3([
  new Vector3(-0.278, DESK_TOP + 0.008, -0.26),
  new Vector3(-0.325, DESK_TOP + CABLE_R, -0.36),
  new Vector3(-0.36, DESK_TOP + CABLE_R, -0.5),
  new Vector3(-0.415, DESK_TOP + CABLE_R, -0.64),
]);

export function Props() {
  return (
    <>
      <Notebook
        at={[SCENE_LAYOUT.notebook.position[0], SCENE_LAYOUT.notebook.position[1]]}
        yaw={SCENE_LAYOUT.notebook.rotation[0]}
        color={PALETTE.rainDeep}
      />

      {/* Zona centro: ratón y gafas */}
      <Mouse at={[SCENE_LAYOUT.mouse.position[0], SCENE_LAYOUT.mouse.position[1]]} yaw={SCENE_LAYOUT.mouse.rotation[1]} />
      <Spectacles
        at={[SCENE_LAYOUT.spectacles.position[0], SCENE_LAYOUT.spectacles.position[1]]}
        yaw={SCENE_LAYOUT.spectacles.rotation[0]}
      />

      {/* Zona derecha: portapapeles, notas, taza, vaso, tarjeta de visita */}
      <PenCup at={[SCENE_LAYOUT.penCup.position[0], SCENE_LAYOUT.penCup.position[1]]} yaw={0} />
      <Sticky at={[SCENE_LAYOUT.sticky[0].position[0], SCENE_LAYOUT.sticky[0].position[1]]} yaw={SCENE_LAYOUT.sticky[0].rotation[0]} />
      <Sticky at={[SCENE_LAYOUT.sticky[1].position[0], SCENE_LAYOUT.sticky[1].position[1]]} yaw={SCENE_LAYOUT.sticky[1].rotation[0]} />
      <Mug at={[SCENE_LAYOUT.mug.position[0], SCENE_LAYOUT.mug.position[1]]} yaw={SCENE_LAYOUT.mug.rotation[1]} />
      <BusinessCard
        at={[SCENE_LAYOUT.businessCard.position[0], SCENE_LAYOUT.businessCard.position[1]]}
        yaw={SCENE_LAYOUT.businessCard.rotation[0]}
      />
      <WaterGlass at={[SCENE_LAYOUT.waterGlass.position[0], SCENE_LAYOUT.waterGlass.position[1]]} />

      {/* Cable que recorre el borde izquierdo del escritorio */}
      <mesh>
        <tubeGeometry args={[CABLE, 24, CABLE_R, 6, false]} />
        <meshStandardMaterial color={MATERIALS.glassDark} roughness={0.6} metalness={0.1} />
      </mesh>
    </>
  );
}
