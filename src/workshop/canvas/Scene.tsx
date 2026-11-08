import { Preload } from '@react-three/drei';
import { CameraRig } from './CameraRig';
import { Placed } from './Placed';
import { Desk, DESK_TOP } from './furniture/Desk';
import { DeskLamp } from './furniture/DeskLamp';
import { Props } from './furniture/Props';
import { Room } from './furniture/Room';
import { LightRig } from './LightRig';
import { Blueprint } from './objects/Blueprint';
import { ProfileCard } from './objects/ProfileCard';
import { Laptop } from './objects/Laptop';
import { Dictionary } from './objects/Dictionary';
import { Logbook } from './objects/Logbook';
import { Phone } from './objects/Phone';
import { Whiteboard } from './objects/Whiteboard';
import { Diploma } from './objects/Diploma';
import { useLamp } from '../store/useLamp';

export function Scene({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const night = useLamp((state) => state.night);

  return (
    <>
      <LightRig lit={!night} />
      <CameraRig reducedMotion={reducedMotion} />

      <Preload all />

      <Room />
      <Desk />
      <DeskLamp />
      <Props />

      <Placed view="laptop">
        <Laptop position={[0.0, DESK_TOP, -0.15]} />
      </Placed>
      <Placed view="profileCard">
        <ProfileCard position={[-0.62, DESK_TOP, 0.4]} />
      </Placed>
      <Placed view="stack">
        <Whiteboard position={[-0.5, 1.32, -1.494]} />
      </Placed>
      <Placed view="logbook">
        <Logbook position={[-0.72, DESK_TOP, -0.05]} />
      </Placed>
      <Placed view="blueprint">
        <Blueprint position={[0.82, DESK_TOP, -0.48]} />
      </Placed>
      <Placed view="dictionary">
        <Dictionary position={[1.02, DESK_TOP, -0.06]} />
      </Placed>
      <Placed view="phone">
        <Phone position={[0.82, DESK_TOP, 0.32]} />
      </Placed>
      <Placed view="diploma">
        <Diploma />
      </Placed>
    </>
  );
}
